"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Calendar,
  Bell,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useEnrollments, useCertificates, useNotifications } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { Enrollment, Course } from "@/types";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description?: string;
}) {
  return (
    <Card className="rounded-none border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center border ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-light text-foreground">{value}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseProgressCard({ enrollment }: { enrollment: Enrollment }) {
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;

  if (!course) return null;

  return (
    <div className="group flex items-center gap-4 p-4 border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="relative h-20 w-32 bg-muted flex items-center justify-center overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
        <div className="absolute inset-0 bg-primary/10" />
        <PlayCircle className="h-8 w-8 text-primary relative z-10 group-hover:scale-110 transition-transform" />
        <Badge className="absolute top-2 left-2 rounded-none text-[10px] font-bold uppercase tracking-wider border-0 bg-background/80 text-foreground backdrop-blur-sm" variant="secondary">
          {course.level}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <Badge variant="outline" className="mb-2 rounded-none text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary">Course</Badge>
        <h4 className="font-heading font-bold uppercase text-sm truncate">{course.title}</h4>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progress} className="h-1.5 flex-1 rounded-none bg-muted" />
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </div>
      <Button asChild className="rounded-none uppercase text-xs font-bold tracking-wider h-9">
        <Link href={`/courses/${course.slug || course._id}/learn`}>Continue</Link>
      </Button>
    </div>
  );
}

function NotificationItem({
  title,
  message,
  time,
  isUnread,
}: {
  title: string;
  message: string;
  time: string;
  isUnread?: boolean;
}) {
  return (
    <div className={`p-4 transition-colors hover:bg-muted/30 ${isUnread ? "bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={`h-2 w-2 mt-2 shrink-0 ${isUnread ? "bg-primary" : "bg-transparent"
            }`}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isUnread ? "font-bold" : "font-medium"} uppercase tracking-wide`}>{title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{message}</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <Skeleton className="h-10 w-64 mb-2 rounded-none" />
        <Skeleton className="h-5 w-96 rounded-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-none border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-none" />
                <div>
                  <Skeleton className="h-8 w-12 mb-1 rounded-none" />
                  <Skeleton className="h-3 w-24 rounded-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded-none" />
            <Skeleton className="h-8 w-24 rounded-none" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-none" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 rounded-none" />
          <Skeleton className="h-96 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: enrollmentsResponse, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: certificatesResponse, isLoading: certificatesLoading } = useCertificates();
  const { data: notificationsResponse, isLoading: notificationsLoading } = useNotifications();

  const isLoading = enrollmentsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const enrollments = (enrollmentsResponse?.data || []) as Enrollment[];
  const certificates = certificatesResponse?.data || [];
  const notifications = notificationsResponse?.data || [];

  const activeEnrollments = enrollments.filter(
    (e: Enrollment) => e.status === "active" && (e.progress || 0) < 100
  );
  const completedCourses = enrollments.filter((e: Enrollment) => (e.progress || 0) >= 100).length;

  const totalLearningMinutes = enrollments.reduce((acc: number, e: Enrollment) => {
    const course = typeof e.course === "object" ? e.course : null;
    return acc + ((course as Course)?.duration || 0);
  }, 0);

  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    { label: "Enrolled Courses", value: enrollments.length.toString(), icon: BookOpen, color: "text-blue-600 border-blue-200 bg-blue-50" },
    { label: "Hours Learned", value: Math.round(totalLearningMinutes / 60).toString(), icon: Clock, color: "text-green-600 border-green-200 bg-green-50" },
    { label: "Certificates", value: certificates.length.toString(), icon: Award, color: "text-amber-600 border-amber-200 bg-amber-50" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "text-violet-600 border-violet-200 bg-violet-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">
          Welcome back, <span className="text-primary">{user?.name?.split(" ")[0] || "Learner"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {activeEnrollments.length > 0
            ? "Continue your learning journey. You're making great progress!"
            : "Start your learning journey today by enrolling in a course."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold uppercase tracking-wide">Continue Learning</h2>
              <p className="text-sm text-muted-foreground">Pick up where you left off</p>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-none border-primary/20 hover:bg-primary/5 hover:text-primary uppercase text-xs font-bold tracking-wider">
              <Link href="/my-courses">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {activeEnrollments.length > 0 ? (
              activeEnrollments.slice(0, 3).map((enrollment) => (
                <CourseProgressCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <Card className="rounded-none border-border bg-muted/5 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-none border border-border bg-background flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading font-bold uppercase text-lg mb-1">No courses in progress</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-6">Start your journey by exploring our available courses.</p>
                  <Button className="rounded-none font-bold uppercase tracking-wider" asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Notifications / Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold uppercase tracking-wide flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-primary uppercase text-xs font-bold tracking-wider p-0 h-auto">
              <Link href="/notifications">
                View All
              </Link>
            </Button>
          </div>

          <Card className="rounded-none border-border bg-card h-[calc(100%-3rem)]">
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <NotificationItem
                      key={notification._id}
                      title={notification.title}
                      message={notification.message}
                      time={formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                      isUnread={!notification.isRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full min-h-[300px]">
                  <div className="h-10 w-10 rounded-none border border-border bg-muted/20 flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold uppercase tracking-wide">Recent Certificates</h2>
            <Button variant="outline" size="sm" asChild className="rounded-none border-primary/20 hover:bg-primary/5 hover:text-primary uppercase text-xs font-bold tracking-wider">
              <Link href="/certificates">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, 3).map((cert: any) => {
              const course = typeof cert.course === "object" ? cert.course : null;
              return (
                <Card key={cert._id} className="rounded-none border-amber-200/50 bg-amber-50/30 hover:bg-amber-50/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 border border-amber-200 bg-amber-100/50 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-bold uppercase text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {course?.title || "Course Certificate"}
                        </h4>
                        <p className="text-xs font-mono text-muted-foreground mt-1 uppercase">
                          Issued {formatDistanceToNow(new Date(cert.issuedAt || cert.createdAt), { addSuffix: true })}
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs font-bold uppercase tracking-wider text-amber-600 mt-3 group-hover:translate-x-1 transition-transform" asChild>
                          <Link href={`/certificates/${cert._id}`}>View Certificate <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
