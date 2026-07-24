import { formatDate } from "@/lib/utils";
import type { PageDTO } from "@/lib/services/pages";

/**
 * Renderer markdown ringan untuk halaman legal:
 * "## " -> sub-judul, "- " -> daftar, paragraf dipisah baris kosong.
 */
export function LegalRenderer({ page }: { page: PageDTO }) {
  const blocks = page.content.split(/\n\s*\n/);

  return (
    <article className="container-page max-w-3xl pb-20 pt-24 md:pt-28">
      <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
        {page.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Terakhir diperbarui: {formatDate(page.updatedAt)}
      </p>

      <div className="mt-8 space-y-5">
        {blocks.map((block, index) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={index}
                className="pt-3 font-heading text-lg font-semibold md:text-xl"
              >
                {trimmed.replace(/^## /, "")}
              </h2>
            );
          }

          const lines = trimmed.split("\n");
          if (lines.every((line) => line.trim().startsWith("- "))) {
            return (
              <ul
                key={index}
                className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                {lines.map((line, i) => (
                  <li key={i}>{line.trim().replace(/^- /, "")}</li>
                ))}
              </ul>
            );
          }

          return (
            <p
              key={index}
              className="text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    </article>
  );
}
