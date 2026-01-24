"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Users,
  Settings,
  LogOut,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkAsRead } from "@/hooks";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LanguageSelector, LanguageSelectorCompact } from "@/components/language-selector";
import { T, useT } from "@/components/t";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useT();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const navItems = [
    { label: t("Curriculum"), href: "/courses", icon: BookOpen },
    { label: t("Mentorship"), href: "/live-sessions", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container max-w-7xl flex h-16 items-center justify-between gap-4 px-4 md:px-8">

        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Logo reload />

          {/* Desktop Nav - Minimal */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search...")}
              className="w-[200px] pl-9 h-9 bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-none border-border">
                  <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2">
                    <span className="font-heading font-bold"><T>Notifications</T></span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} <T>unread</T></span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                          key={notification._id}
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-none focus:bg-muted"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <p className="text-sm font-medium flex-1 line-clamp-1">{notification.title}</p>
                            {!notification.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        <T>No new notifications</T>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-none border-border">
                  <DropdownMenuLabel className="font-normal p-4 pb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                    <Link href="/dashboard"><T>Dashboard</T></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                    <Link href="/settings"><T>Settings</T></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                  >
                    <T>Sign out</T>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <T>Sign in</T>
              </Link>
              <Button asChild className="rounded-none h-9 px-6 text-sm uppercase tracking-wide font-bold">
                <Link href="/register"><T>Get Started</T></Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 -mr-2 text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l border-border bg-background">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <Logo reload />
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  <form onSubmit={handleSearch} className="mb-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("Search curriculum...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 rounded-none bg-muted/40 border-border text-base"
                    />
                  </form>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"><T>Menu</T></div>
                      <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-4 p-3 -mx-3 rounded-none transition-colors border-l-2 border-transparent hover:bg-muted/50",
                              pathname === item.href
                                ? "border-primary font-semibold bg-muted/30"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="text-lg">{item.label}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {!isAuthenticated && (
                      <div className="space-y-3 pt-6 border-t border-border">
                        <Button asChild size="lg" className="w-full rounded-none h-12 text-base uppercase tracking-wider font-bold">
                          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            <T>Start Training</T>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full rounded-none h-12 text-base uppercase tracking-wider font-bold border-border">
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <T>Sign In</T>
                          </Link>
                        </Button>
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="space-y-4 pt-6 border-t border-border">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 p-3 -mx-3 rounded-none hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user?.name}</div>
                            <div className="text-xs text-muted-foreground"><T>My Dashboard</T></div>
                          </div>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full rounded-none justify-start"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <T>Sign Out</T>
                        </Button>
                      </div>
                    )}

                    {/* Language Selector in Mobile */}
                    <div className="pt-6 border-t border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"><T>Language</T></div>
                      <LanguageSelectorCompact />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
