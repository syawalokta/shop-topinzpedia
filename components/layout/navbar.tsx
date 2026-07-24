"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";

import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/use-scrolled";
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

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label={`${SITE.name} — kembali ke beranda`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
        <Zap className="size-4" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">
        Topinz<span className="text-primary">Pedia</span>
      </span>
    </Link>
  );
}

interface NavbarProps {
  user: { name: string; role: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className="container-page flex h-16 items-center justify-between gap-4"
        aria-label="Navigasi utama"
      >
        <Logo />

        {/* Navigasi desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <Button
              asChild
              size="sm"
              className="hidden rounded-full px-4 md:inline-flex"
            >
              <Link href={dashboardHref}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden rounded-full px-4 md:inline-flex"
              >
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="pb-0">
                <SheetTitle>
                  <span className="font-heading text-lg font-bold">
                    Topinz<span className="text-primary">Pedia</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Navigasi mobile" className="px-4">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <SheetClose asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive(link.href)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                  {user ? (
                    <SheetClose asChild>
                      <Button asChild className="w-full rounded-full">
                        <Link href={dashboardHref}>Dashboard</Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login">Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="w-full rounded-full">
                          <Link href="/register">Daftar</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
