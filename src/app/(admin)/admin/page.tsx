"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApi } from "@/lib/api/admin";
import { coursesApi } from "@/lib/api/courses";
import { formatCurrency, getInitials, formatDate } from "@/lib/utils";
import type { OverviewAnalytics, Course } from "@/types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  // Fetch overview analytics
  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminApi.getOverview(),
  });

  // Fetch top courses
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-top-courses"],
    queryFn: () => coursesApi.getAll({ limit: 5, sort: "enrollmentCount", order: "desc" }),
  });

  const analytics: OverviewAnalytics | undefined = analyticsResponse?.data;
  const topCourses = coursesResponse?.data || [];

  const stats = [
    {
      title: "Total Users",
      value: analytics?.users?.total?.toLocaleString() || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Courses",
      value: analytics?.courses?.total?.toString() || "0",
      icon: BookOpen,
      color: "bg-violet-500",
    },
    {
      title: "Revenue",
      value: formatCurrency(analytics?.revenue?.total || 0, "USD"),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Enrollments",
      value: analytics?.enrollments?.total?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={analyticsLoading}
          />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Users</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold text-blue-600">
                {analytics?.users?.newThisMonth || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Enrollments</CardTitle>
            <CardDescription>Currently learning</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {analytics?.enrollments?.active || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold text-amber-600">
                {formatCurrency(analytics?.revenue?.thisMonth || 0, "USD")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Published Courses</span>
                  <span className="font-semibold">{analytics?.courses?.published || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Completed Enrollments</span>
                  <span className="font-semibold">{analytics?.enrollments?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Upcoming Sessions</span>
                  <span className="font-semibold">{analytics?.liveSessions?.upcoming || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Live Sessions Now</span>
                  <Badge variant={analytics?.liveSessions?.live ? "default" : "secondary"}>
                    {analytics?.liveSessions?.live || 0}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/admin/courses">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Manage Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/admin/categories">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Categories</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/admin/analytics">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses with highest enrollments</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">Manage Courses</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : topCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No courses yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Enrollments</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.map((course: Course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <Badge variant={course.status === "published" ? "default" : "secondary"} className="text-xs">
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {(course.enrollmentCount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.isFree ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        formatCurrency(course.price, course.currency || "USD")
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {course.averageRating?.toFixed(1) || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/courses/${course.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
