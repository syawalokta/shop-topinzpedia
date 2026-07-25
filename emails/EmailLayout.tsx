import * as React from "react";

/**
 * Layout dasar seluruh email TopinzPedia (reusable).
 * Warna utama brand: #2563EB. Styling inline agar kompatibel
 * dengan semua email client.
 */

export const BRAND = "#2563EB";
export const BRAND_DARK = "#1E40AF";

export const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: "24px 12px",
    backgroundColor: "#f8fafc",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#0f172a",
  },
  card: {
    maxWidth: 520,
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    background: `linear-gradient(120deg, ${BRAND}, ${BRAND_DARK})`,
    padding: "20px 28px",
  },
  logo: { margin: 0, color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  content: { padding: 28 },
  h1: { margin: "0 0 12px", fontSize: 18, color: "#0f172a" },
  text: { fontSize: 14, lineHeight: 1.6, color: "#334155", margin: "0 0 12px" },
  button: {
    display: "inline-block",
    backgroundColor: BRAND,
    color: "#ffffff",
    textDecoration: "none",
    padding: "12px 28px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonWrap: { margin: "20px 0" },
  linkFallback: {
    fontSize: 12,
    color: "#64748b",
    wordBreak: "break-all" as const,
    margin: "0 0 12px",
  },
  table: { width: "100%", borderCollapse: "collapse" as const, margin: "16px 0" },
  tdLabel: {
    padding: "8px 0",
    fontSize: 13,
    color: "#64748b",
    borderBottom: "1px solid #f1f5f9",
  },
  tdValue: {
    padding: "8px 0",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "bold",
    textAlign: "right" as const,
    borderBottom: "1px solid #f1f5f9",
  },
  muted: { fontSize: 12, color: "#64748b", margin: "20px 0 0", lineHeight: 1.6 },
};

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={styles.tdLabel}>{label}</td>
      <td style={styles.tdValue}>{value}</td>
    </tr>
  );
}

export function EmailLayout({
  title,
  supportEmail,
  children,
}: {
  title: string;
  supportEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.logo}>⚡ TopinzPedia</p>
        </div>
        <div style={styles.content}>
          <h1 style={styles.h1}>{title}</h1>
          {children}
          <p style={styles.muted}>
            Butuh bantuan? Hubungi kami di{" "}
            <a href={`mailto:${supportEmail}`} style={{ color: BRAND }}>
              {supportEmail}
            </a>
            . Email ini dikirim otomatis oleh TopinzPedia — bila kamu tidak
            merasa melakukan permintaan ini, abaikan saja.
          </p>
        </div>
      </div>
    </div>
  );
}
