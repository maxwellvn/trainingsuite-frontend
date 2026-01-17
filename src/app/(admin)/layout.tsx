"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
  MessageSquare,
  Megaphone,
  LogOut,
  GraduationCap,
  Award,
  Video,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks";
import { getInitials, cn } from "@/lib/utils";

const adminNavSections = [
  {
    title: "Admin",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        label: "Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        label: "My Courses",
        href: "/admin/my-courses",
        icon: GraduationCap,
      },
      {
        label: "Certificates",
        href: "/admin/certificates",
        icon: Award,
      },
      {
        label: "Live Sessions",
        href: "/admin/live-sessions",
        icon: Video,
      },
      {
        label: "Forums",
        href: "/admin/forums",
        icon: MessageSquare,
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        label: "Help",
        href: "/admin/help",
        icon: HelpCircle,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">Admin Panel</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {adminNavSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          {collapsed ? (
            <Avatar className="h-10 w-10 mx-auto">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user?.name || "Admin")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(user?.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        {/* Header */}
        <header className="h-16 bg-background border-b sticky top-0 z-30 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">
              {adminNavSections
                .flatMap((section) => section.items)
                .find((item) =>
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                )?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(user?.name || "Admin")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
