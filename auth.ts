import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { verifyCaptchaFromSettings } from "@/lib/captcha";
import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/lib/services/settings";
import { User, Wallet } from "@/models";

/**
 * Error login dengan kode spesifik agar UI bisa menampilkan pesan
 * yang tepat: captcha salah, akun terkunci, atau belum verifikasi.
 */
class LoginError extends CredentialsSignin {
  constructor(code: "captcha" | "locked" | "unverified" | "invalid") {
    super();
    this.code = code;
  }
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 menit

/**
 * Konfigurasi Auth.js (NextAuth v5).
 * - Credentials: login email/username + password (bcrypt)
 * - Google: aktif bila env GOOGLE_CLIENT_ID/SECRET terpasang DAN
 *   toggle "Login Google" dinyalakan dari panel admin (SiteSetting)
 * - Session: JWT — role user (admin/buyer/user) ikut tersimpan di token
 */

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email atau Username" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha Token" },
        captchaAnswer: { label: "Captcha Answer" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");

        // 1. Captcha — tolak lebih awal sebelum menyentuh database (anti-spam)
        const captchaOk = await verifyCaptchaFromSettings(
          String(credentials?.captchaToken ?? ""),
          String(credentials?.captchaAnswer ?? "")
        );
        if (!captchaOk) {
          throw new LoginError("captcha");
        }

        if (!identifier || !password) throw new LoginError("invalid");

        await connectDB();
        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user?.passwordHash) throw new LoginError("invalid");

        // 2. Rate limit: terkunci 5 menit setelah 5x salah
        if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
          throw new LoginError("locked");
        }

        // 3. Cek password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const attempts = (user.loginAttempts ?? 0) + 1;
          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            await User.updateOne(
              { _id: user._id },
              {
                loginAttempts: 0,
                lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
              }
            );
            throw new LoginError("locked");
          }
          await User.updateOne(
            { _id: user._id },
            { loginAttempts: attempts }
          );
          throw new LoginError("invalid");
        }

        // 4. Verifikasi email — HANYA bila fitur aktif di pengaturan admin
        //    dan SMTP terpasang. Admin selalu dikecualikan agar tidak
        //    pernah terkunci dari panelnya sendiri.
        //    (Dicek SETELAH password valid agar tidak membocorkan status
        //    akun ke penebak password.)
        if (user.role !== "admin" && !user.emailVerified) {
          const settings = await getSiteSettings();
          if (settings.emailVerificationEnabled && settings.mailConfigured) {
            throw new LoginError("unverified");
          }
        }

        // 5. Sukses — reset counter
        if (user.loginAttempts || user.lockUntil) {
          await User.updateOne(
            { _id: user._id },
            { loginAttempts: 0, lockUntil: null }
          );
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          username: user.username,
        };
      },
    }),
    ...(googleConfigured ? [Google] : []),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") return true;

      try {
        const settings = await getSiteSettings();
        if (!settings.googleAuthEnabled) return false;

        await connectDB();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existing = await User.findOne({ email });
        if (!existing) {
          const base =
            email
              .split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 16) || "user";
          let username = base;
          let suffix = 0;
          while (await User.exists({ username })) {
            suffix += 1;
            username = `${base}${suffix}`;
          }
          const created = await User.create({
            name: user.name ?? base,
            username,
            email,
            passwordHash: null,
            provider: "google",
            image: user.image ?? "",
            role: "user",
            // Email dari Google sudah terverifikasi oleh Google
            emailVerified: new Date(),
          });
          await Wallet.updateOne(
            { userId: created._id },
            { $setOnInsert: { balance: 0 } },
            { upsert: true }
          );
        }
        return true;
      } catch (error) {
        console.error("[auth] google signIn gagal:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Saat baru login
      if (user) {
        if (account?.provider === "google") {
          try {
            await connectDB();
            const dbUser = await User.findOne({
              email: user.email?.toLowerCase(),
            })
              .select("role username")
              .lean();
            if (dbUser) {
              token.sub = String(dbUser._id);
              token.role = dbUser.role;
              token.username = dbUser.username;
            }
          } catch (error) {
            console.error("[auth] jwt google lookup gagal:", error);
          }
        } else {
          token.sub = user.id;
          token.role = user.role ?? "user";
          token.username = user.username ?? "";
        }
        return token;
      }

      // Permintaan berikutnya: segarkan role dari DB
      // (agar promosi user -> buyer/admin langsung terasa tanpa relogin)
      if (token.sub) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.sub)
            .select("role username name")
            .lean();
          if (dbUser) {
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.name = dbUser.name;
          }
        } catch {
          // biarkan nilai token lama saat DB tidak terjangkau
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "user";
        session.user.username = (token.username as string) ?? "";
      }
      return session;
    },
  },
});
