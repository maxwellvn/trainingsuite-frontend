"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Bell,
  Settings,
  Calendar,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  Megaphone,
  Home,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/components/t";

const sidebarItems = [
  {
    title: "Navigation",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Training",
    items: [
      { label: "My Training", href: "/my-courses", icon: BookOpen },
      { label: "Certificates", href: "/certificates", icon: Award },
      { label: "Live Sessions", href: "/live-sessions", icon: Calendar },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Community", href: "/forums", icon: MessageSquare },
      { label: "Announcements", href: "/announcements", icon: Megaphone },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help", href: "/help", icon: HelpCircle },
    ],
  },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function DashboardSidebar({ collapsed = false, onCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useT();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between border-b border-border",
          collapsed ? "h-16 px-4" : "h-[72px] px-5"
        )}>
          <Logo iconOnly={collapsed} />
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none hidden lg:flex shrink-0 ml-2"
              onClick={() => onCollapse(!collapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-8">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <p className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t(section.title)}
                  </p>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors border-l-2 border-transparent hover:bg-muted/50",
                            isActive
                              ? "border-primary text-foreground font-semibold bg-muted/30"
                              : "text-muted-foreground hover:text-foreground",
                            collapsed && "justify-center px-2 border-l-0"
                          )}
                          title={collapsed ? t(item.label) : undefined}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                          {!collapsed && <span>{t(item.label)}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* User Info */}
        {user && !collapsed && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-9 w-9 rounded-full border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-muted text-foreground font-medium text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
