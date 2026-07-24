import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { getProfile } from "@/lib/services/users";
import {
  ChangePasswordForm,
  ProfileCard,
  SocialsForm,
} from "@/components/dashboard/settings-forms";

export const metadata: Metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/settings");

  if (!isDbConfigured()) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Mode demo — database belum dikonfigurasi.
      </p>
    );
  }

  const profile = await getProfile(user.id);
  if (!profile) notFound();

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Settings
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola profil, kontak, dan keamanan akunmu.
      </p>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <div className="space-y-5">
          <SocialsForm profile={profile} />
          <ChangePasswordForm hasPassword={profile.hasPassword} />
        </div>
      </div>
    </>
  );
}
