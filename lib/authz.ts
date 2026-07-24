import { auth } from "@/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string;
  image?: string | null;
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Ambil user dari sesi aktif (null bila belum login).
 * Sesi dengan id yang bukan ObjectId (mis. cookie lama/rusak)
 * diperlakukan sebagai belum login agar tidak membuat query crash.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !OBJECT_ID_RE.test(user.id)) return null;

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "user",
    username: user.username ?? "",
    image: user.image,
  };
}

/** User login dengan role admin — null bila bukan admin. */
export async function getAdminSession(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.role === "admin" ? user : null;
}
