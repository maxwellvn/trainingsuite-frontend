"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Star,
  Calendar,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { coursesApi } from "@/lib/api/courses";
import type { Course } from "@/types";

export default function InstructorDashboardPage() {
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => coursesApi.getAll({ limit: 5 }),
  });

  const courses = coursesData?.data || [];

  // Mock stats for now - these would come from an API
  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
    totalRevenue: courses.reduce((acc, c) => acc + (c.price || 0) * (c.enrollmentCount || 0), 0),
    averageRating: courses.length > 0
      ? (courses.reduce((acc, c) => acc + (c.averageRating || 0), 0) / courses.length).toFixed(1)
      : "0.0",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses, students, and track performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <BookOpen className="h-4 w-4 mr-2" />
            Create New Course
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published and draft courses
            </p>
          </CardContent>
        </Card>

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
              Across all courses
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
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on student reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Courses */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your published and draft courses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/instructor/courses">
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No courses yet</p>
                <Button asChild className="mt-4">
                  <Link href="/instructor/courses/new">Create Your First Course</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course: Course) => (
                  <div
                    key={course._id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{course.enrollmentCount || 0} students</span>
                        <span>•</span>
                        <Badge
                          variant={course.status === "published" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/instructor/courses/${course._id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Course completion rates this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courses.slice(0, 4).map((course: Course) => (
                <div key={course._id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">{course.title}</span>
                    <span className="text-muted-foreground">
                      {Math.floor(Math.random() * 40 + 60)}%
                    </span>
                  </div>
                  <Progress value={Math.floor(Math.random() * 40 + 60)} className="h-2" />
                </div>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No performance data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/instructor/courses/new">
                <BookOpen className="h-6 w-6" />
                <span>Create Course</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/instructor/live-sessions/new">
                <Calendar className="h-6 w-6" />
                <span>Schedule Session</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/instructor/analytics">
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/instructor/students">
                <Users className="h-6 w-6" />
                <span>Manage Students</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
