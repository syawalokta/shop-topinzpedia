"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Tags,
  Zap,
} from "lucide-react";

import { logoutAdmin } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produk", icon: Package, exact: false },
  { href: "/admin/categories", label: "Kategori", icon: Tags, exact: false },
];

function AdminLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Zap className="size-4" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="font-heading text-base font-bold tracking-tight">
        Topinz<span className="text-primary">Pedia</span>
      </span>
      <Badge variant="secondary" className="text-[10px]">
        Admin
      </Badge>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-1">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-4" aria-hidden />
        Lihat Situs
      </a>
      <div className="flex items-center justify-between gap-2 px-1">
        <form action={logoutAdmin} className="flex-1">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" aria-hidden />
            Keluar
          </Button>
        </form>
        <ThemeToggle />
      </div>
    </div>
  );
}

/** Sidebar tetap untuk desktop (≥ lg). */
export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card px-4 py-5 lg:flex">
      <AdminLogo />
      <nav aria-label="Navigasi admin" className="mt-8 flex-1">
        <NavLinks />
      </nav>
      <Separator className="mb-3" />
      <SidebarFooter />
    </aside>
  );
}

/** Topbar + menu sheet untuk layar kecil (< lg). */
export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:hidden">
      <AdminLogo />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buka menu admin"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="pb-0">
              <SheetTitle>Menu Admin</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <SheetClose asChild>
                <div>
                  <NavLinks />
                </div>
              </SheetClose>
              <Separator className="my-4" />
              <SidebarFooter />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
