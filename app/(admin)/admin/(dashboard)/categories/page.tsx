import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";

import { deleteCategory } from "@/lib/actions/categories";
import {
  CATEGORY_ICONS,
  FALLBACK_CATEGORY_ICON,
} from "@/lib/constants";
import { isDbConfigured } from "@/lib/db";
import { adminListCategories } from "@/lib/data/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { DbNotice } from "@/components/admin/db-notice";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Kelola Kategori",
};

export default async function AdminCategoriesPage() {
  const dbReady = isDbConfigured();
  const categories = dbReady ? await adminListCategories() : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Kelola Kategori
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dbReady
              ? `${categories.length} kategori — urutan menentukan posisi tampil.`
              : "Hubungkan database untuk mengelola kategori."}
          </p>
        </div>
        <CategoryDialog
          trigger={
            <Button size="sm" className="rounded-full">
              <Plus className="size-4" />
              Tambah Kategori
            </Button>
          }
        />
      </div>

      <div className="mt-8">
        {!dbReady ? (
          <DbNotice />
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Belum ada kategori
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Buat kategori pertama sebelum menambahkan produk.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">Ikon</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Urutan</TableHead>
                  <TableHead className="text-center">Produk</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const Icon =
                    CATEGORY_ICONS[category.slug] ?? FALLBACK_CATEGORY_ICON;

                  return (
                    <TableRow key={category.id}>
                      <TableCell className="text-center">
                        <span className="inline-grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" aria-hidden />
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        /{category.slug}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {category.order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {category.productCount} produk
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          <CategoryDialog
                            category={category}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit kategori ${category.name}`}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            }
                          />
                          <DeleteButton
                            action={deleteCategory.bind(null, category.id)}
                            title={`Hapus kategori ${category.name}?`}
                            description="Kategori hanya bisa dihapus bila tidak memiliki produk. Tindakan ini tidak bisa dibatalkan."
                            successMessage="Kategori berhasil dihapus."
                            ariaLabel={`Hapus kategori ${category.name}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
