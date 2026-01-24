"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  Award,
  MessageSquare,
  Calendar,
  Info,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";
import { T, useT } from "@/components/t";

const notificationIcons: Record<string, React.ElementType> = {
  course: BookOpen,
  certificate: Award,
  message: MessageSquare,
  session: Calendar,
  info: Info,
  warning: AlertCircle,
};

const notificationColors: Record<string, { bg: string; text: string; border: string }> = {
  course: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  certificate: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  message: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  session: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  info: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  warning: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

function NotificationCard({
  notification,
  onMarkAsRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (notification: Notification) => void;
}) {
  const { t } = useT();
  const type = notification.type || "info";
  const Icon = notificationIcons[type] || Info;
  const colors = notificationColors[type] || notificationColors.info;

  const handleClick = () => {
    onNavigate(notification);
  };

  return (
    <Card
      className={`rounded-none border-border transition-all cursor-pointer hover:border-primary/50 group ${!notification.isRead ? "bg-muted/20 border-l-4 border-l-primary" : "bg-card"}`}
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex gap-5">
          <div className={`h-10 w-10 shrink-0 border ${colors.border} ${colors.bg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-heading font-bold uppercase text-sm ${!notification.isRead ? "text-primary" : "text-foreground"}`}>
                    <T>{notification.title}</T>
                  </h4>
                  {!notification.isRead && (
                    <Badge className="rounded-none h-4 px-1 text-[10px] font-bold uppercase tracking-wider bg-primary border-0"><T>New</T></Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  <T>{notification.message}</T>
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                  {notification.link && (
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 group-hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      <T>View Details</T>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification._id);
                    }}
                    className="shrink-0 h-8 w-8 rounded-none hover:bg-background border border-transparent hover:border-border"
                    title={t("Mark as read")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSkeleton() {
  return (
    <Card className="rounded-none border-border">
      <CardContent className="p-5">
        <div className="flex gap-5">
          <Skeleton className="h-10 w-10 rounded-none shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40 rounded-none" />
              <Skeleton className="h-8 w-8 rounded-none" />
            </div>
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-3 w-24 rounded-none" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notificationsResponse, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsResponse?.data || [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNavigate = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight"><T>Notifications</T></h1>
          <p className="text-muted-foreground mt-1">
            <T>Stay updated with your learning journey</T>
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="rounded-none border-primary/20 hover:bg-primary/5 hover:text-primary uppercase text-xs font-bold tracking-wider w-full sm:w-auto"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-2" />
            <T>Mark all as read</T>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">{notifications.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1"><T>Total</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">{unreadNotifications.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1"><T>Unread</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-green-200 bg-green-50 flex items-center justify-center text-green-600">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">{readNotifications.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1"><T>Read</T></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4 sm:gap-8 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <T>All</T> <Badge className="ml-2 rounded-none bg-muted text-muted-foreground border-0 text-[10px]">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <T>Unread</T> <Badge className="ml-2 rounded-none bg-muted text-muted-foreground border-0 text-[10px]">{unreadNotifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <T>Read</T> <Badge className="ml-2 rounded-none bg-muted text-muted-foreground border-0 text-[10px]">{readNotifications.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-none border-border bg-muted/5 border-dashed">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-muted-foreground">
                  <BellOff className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-wide"><T>No notifications</T></h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  <T>You're all caught up! Check back later for updates.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-none border-border bg-muted/5 border-dashed">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-green-600/50">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-wide"><T>All caught up!</T></h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  <T>You have no unread notifications.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : readNotifications.length > 0 ? (
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-none border-border bg-muted/5 border-dashed">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-muted-foreground">
                  <Bell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-wide"><T>No read notifications</T></h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  <T>Notifications you've read will appear here.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
