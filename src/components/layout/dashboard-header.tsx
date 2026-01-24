"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  BookOpen,
  Award,
  Home,
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkAsRead } from "@/hooks";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LanguageSelector } from "@/components/language-selector";
import { T, useT } from "@/components/t";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useT();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search training...")}
            className="w-full pl-9 h-10 rounded-none bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
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
                      <p className="text-sm font-medium flex-1 line-clamp-1"><T>{notification.title}</T></p>
                      {!notification.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <T>{notification.message}</T>
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
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 h-10 rounded-none hover:bg-muted/50">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start gap-0.5 text-sm">
                  <span className="font-semibold leading-none">{user.name.split(" ")[0]}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
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
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  <T>Home</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                <Link href="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  <T>Dashboard</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                <Link href="/my-courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <T>My Courses</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                <Link href="/certificates">
                  <Award className="mr-2 h-4 w-4" />
                  <T>Certificates</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <T>Settings</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive rounded-none cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? <T>Signing out...</T> : <T>Sign out</T>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
