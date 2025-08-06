"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockAuth } from "./mock-auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu, MessageSquare, Settings, BarChart3, LogOut, User } from "lucide-react";

interface NavbarProps {
  // İsteğe bağlı özellikler ekleyebilirsiniz
}

export function Navbar({}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userRole, loading: isLoading, signOut } = useMockAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  // Ana navigasyon linkleri - temiz ve düzenli
  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pipeline", href: "/pipelines" },
    { name: "Müşteri Adayları", href: "/leads" },
    { name: "Mesajlaşma", href: "/messaging", icon: MessageSquare },
  ];

  // Admin menü öğeleri
  const adminNavItems = userRole === "superuser" ? [
    { name: "Yönetim", href: "/admin/agencies" },
    { name: "Ayarlar", href: "/admin/messaging-settings", icon: Settings },
  ] : [];

  // Mobil navigasyon linkleri
  const mobileNavItems = [
    ...mainNavItems,
    ...adminNavItems,
    { name: "Profil", href: "/profile" },
    { name: "Bildirim Ayarları", href: "/notification-settings" },
  ];

  // Demo mode indicator
  const isDemoMode = true;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Happy CRM</span>
            {isDemoMode && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                DEMO
              </span>
            )}
          </Link>
          {!isLoading && user && (
            <nav className="hidden md:flex gap-6 items-center">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Dropdown */}
              {adminNavItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                      <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                        {userRole}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminNavItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {!isLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {userRole}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isLoading ? (
            <Button asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
          ) : null}

          {/* Mobile menu */}
          {!isLoading && user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                    </Link>
                  ))}
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 mt-4"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
} 