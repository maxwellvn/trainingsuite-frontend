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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
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
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="relative h-20 w-32 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-black/20" />
        <Play className="h-8 w-8 text-white relative z-10" />
        <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
          {course.level}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <Badge variant="outline" className="mb-1">Course</Badge>
        <h4 className="font-semibold truncate">{course.title}</h4>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </div>
      <Button asChild>
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
    <div className={`p-3 rounded-lg ${isUnread ? "bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
            isUnread ? "bg-primary" : "bg-transparent"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
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
    { label: "Enrolled Courses", value: enrollments.length.toString(), icon: BookOpen, color: "text-blue-600 bg-blue-100" },
    { label: "Hours Learned", value: Math.round(totalLearningMinutes / 60).toString(), icon: Clock, color: "text-green-600 bg-green-100" },
    { label: "Certificates", value: certificates.length.toString(), icon: Award, color: "text-amber-600 bg-amber-100" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "text-violet-600 bg-violet-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Learner"}!
        </h1>
        <p className="text-muted-foreground">
          {activeEnrollments.length > 0
            ? "Continue your learning journey. You're making great progress!"
            : "Start your learning journey today by enrolling in a course."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-courses">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeEnrollments.length > 0 ? (
                activeEnrollments.slice(0, 3).map((enrollment) => (
                  <CourseProgressCard key={enrollment._id} enrollment={enrollment} />
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No courses in progress</p>
                  <Button className="mt-4" asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications / Activity */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-2">
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
                <div className="text-center py-6">
                  <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Certificates</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/certificates">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.slice(0, 3).map((cert: any) => {
                const course = typeof cert.course === "object" ? cert.course : null;
                return (
                  <Card key={cert._id} className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {course?.title || "Course Certificate"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Issued {formatDistanceToNow(new Date(cert.issuedAt || cert.createdAt), { addSuffix: true })}
                          </p>
                          <Button variant="link" className="h-auto p-0 text-xs mt-1" asChild>
                            <Link href={`/certificates/${cert._id}`}>View Certificate</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
