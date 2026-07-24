"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShoppingBag,
  Wallet,
  Zap,
} from "lucide-react";

import { signOutAction } from "@/lib/actions/auth-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, exact: false },
  { href: "/dashboard/topup", label: "Topup Saldo", icon: HandCoins, exact: false },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: ReceiptText,
    exact: false,
  },
];

interface UserInfo {
  name: string;
  role: string;
}

function DashboardLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Zap className="size-4" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="font-heading text-base font-bold tracking-tight">
        Topinz<span className="text-primary">Pedia</span>
      </span>
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
      <Link
        href="/products"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ShoppingBag className="size-4" aria-hidden />
        Belanja Produk
      </Link>
      <div className="flex items-center justify-between gap-2 px-1">
        <form action={signOutAction} className="flex-1">
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

function UserCard({ user }: { user: UserInfo }) {
  return (
    <div className="mt-6 flex items-center gap-2.5 rounded-xl border bg-muted/40 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <StatusBadge status={user.role} className="mt-0.5 text-[10px]" />
      </div>
    </div>
  );
}

export function UserSidebar({ user }: { user: UserInfo }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card px-4 py-5 lg:flex">
      <DashboardLogo />
      <UserCard user={user} />
      <nav aria-label="Navigasi dashboard" className="mt-6 flex-1">
        <NavLinks />
      </nav>
      <Separator className="mb-3" />
      <SidebarFooter />
    </aside>
  );
}

export function UserTopbar({ user }: { user: UserInfo }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:hidden">
      <DashboardLogo />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Buka menu dashboard">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="pb-0">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <UserCard user={user} />
              <div className="mt-4">
                <NavLinks />
              </div>
              <Separator className="my-4" />
              <SidebarFooter />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
