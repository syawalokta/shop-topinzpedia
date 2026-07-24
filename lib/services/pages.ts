import { connectDB, isDbConfigured } from "../db";
import {
  PRIVACY_CONTENT,
  PRIVACY_SLUG,
  PRIVACY_TITLE,
  TERMS_CONTENT,
  TERMS_SLUG,
  TERMS_TITLE,
} from "../legal-content";
import { Page } from "../../models";

/** Service halaman statis yang bisa diedit (S&K, Kebijakan Privasi). */

export interface PageDTO {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

const DEFAULTS: Record<string, { title: string; content: string }> = {
  [TERMS_SLUG]: { title: TERMS_TITLE, content: TERMS_CONTENT },
  [PRIVACY_SLUG]: { title: PRIVACY_TITLE, content: PRIVACY_CONTENT },
};

export async function getPage(slug: string): Promise<PageDTO | null> {
  const fallback = DEFAULTS[slug];

  if (!isDbConfigured()) {
    return fallback
      ? { slug, ...fallback, updatedAt: new Date().toISOString() }
      : null;
  }

  try {
    await connectDB();
    // Auto-seed konten default saat pertama kali diakses
    const doc = fallback
      ? await Page.findOneAndUpdate(
          { slug },
          { $setOnInsert: { title: fallback.title, content: fallback.content } },
          { upsert: true, new: true }
        ).lean()
      : await Page.findOne({ slug }).lean();

    if (!doc) return null;
    return {
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
      updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
    };
  } catch (error) {
    console.error("[services/pages] fallback konten default:", error);
    return fallback
      ? { slug, ...fallback, updatedAt: new Date().toISOString() }
      : null;
  }
}

export async function listEditablePages(): Promise<PageDTO[]> {
  const pages = await Promise.all(
    Object.keys(DEFAULTS).map((slug) => getPage(slug))
  );
  return pages.filter((p): p is PageDTO => p !== null);
}

export async function updatePage(
  slug: string,
  input: { title: string; content: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!DEFAULTS[slug]) return { ok: false, error: "Halaman tidak dikenal." };
  await connectDB();
  await Page.findOneAndUpdate(
    { slug },
    { title: input.title, content: input.content },
    { upsert: true }
  );
  return { ok: true };
}
