"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { coursesApi } from "@/lib/api/courses";
import { enrollmentsApi } from "@/lib/api/enrollments";
import type { Course, EnrollmentWithCourse, User } from "@/types";

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function InstructorAnalyticsPage() {
  const [dateRange, setDateRange] = useState("6m");

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses-analytics"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["instructor-enrollments-analytics"],
    queryFn: () => enrollmentsApi.getAll(1, 1000),
  });

  const courses = coursesData?.data || [];
  const enrollments = enrollmentsData?.data || [];

  const isLoading = coursesLoading || enrollmentsLoading;

  // Calculate stats
  const stats = {
    totalStudents: new Set(enrollments.map((e) => (e.user as User)?._id)).size,
    totalEnrollments: enrollments.length,
    totalRevenue: courses.reduce((acc, c) => acc + (c.price || 0) * (c.enrollmentCount || 0), 0),
    completionRate: enrollments.length > 0
      ? Math.round(
        (enrollments.filter((e) => e.status === "completed").length / enrollments.length) * 100
      )
      : 0,
    averageProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
      : 0,
  };

  // Course performance data
  const coursePerformance = courses.map((course) => ({
    name: course.title.substring(0, 20) + (course.title.length > 20 ? "..." : ""),
    students: course.enrollmentCount || 0,
    rating: course.averageRating || 0,
    revenue: (course.price || 0) * (course.enrollmentCount || 0),
  })).sort((a, b) => b.students - a.students).slice(0, 5);

  // Course distribution by status
  const statusDistribution = [
    { name: "Published", value: courses.filter((c) => c.status === "published").length },
    { name: "Draft", value: courses.filter((c) => c.status === "draft").length },
    { name: "Pending", value: courses.filter((c) => c.status === "pending").length },
    { name: "Archived", value: courses.filter((c) => c.status === "archived").length },
  ].filter((item) => item.value > 0);

  // Generate enrollment data from actual courses
  const enrollmentData = courses.slice(0, 6).map((course, i) => ({
    name: course.title.substring(0, 10) + (course.title.length > 10 ? '...' : ''),
    enrollments: course.enrollmentCount || 0,
    completions: Math.round((course.enrollmentCount || 0) * (stats.completionRate / 100)),
  }));

  // Generate revenue data from actual courses
  const revenueData = courses.slice(0, 6).map((course) => ({
    name: course.title.substring(0, 10) + (course.title.length > 10 ? '...' : ''),
    revenue: (course.price || 0) * (course.enrollmentCount || 0),
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your course performance and student engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique students enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Course completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Monthly enrollments and completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                    name="Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Completions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses by enrollment count</CardDescription>
          </CardHeader>
          <CardContent>
            {coursePerformance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No course data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coursePerformance.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-muted-foreground">{course.students} students</span>
                    </div>
                    <Progress
                      value={(course.students / (coursePerformance[0]?.students || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No courses yet</p>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {statusDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
          <CardDescription>
            Average progress across all courses: {stats.averageProgress}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={stats.averageProgress} className="h-3" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold">
                  {enrollments.filter((e) => (e.progress || 0) === 0).length}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {enrollments.filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {enrollments.filter((e) => e.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
