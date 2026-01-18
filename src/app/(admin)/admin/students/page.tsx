"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import { coursesApi } from "@/lib/api/courses";
import { getInitials } from "@/lib/utils";
import type { EnrollmentWithCourse, Course, User } from "@/types";
import { format, parseISO } from "date-fns";

export default function AdminStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: () => adminApi.getEnrollments(1, 100),
  });

  const courses = coursesData?.data || [];
  const enrollments = (enrollmentsData?.data || []) as EnrollmentWithCourse[];

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment: EnrollmentWithCourse) => {
    const user = enrollment.user as User;
    const course = enrollment.course as Course;

    const matchesSearch =
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = courseFilter === "all" || course?._id === courseFilter;
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const stats = {
    totalStudents: new Set(enrollments.map((e) => (e.user as User)?._id)).size,
    activeEnrollments: enrollments.filter((e) => e.status === "active").length,
    completedEnrollments: enrollments.filter((e) => e.status === "completed").length,
    averageProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
      : 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="rounded-none bg-blue-600 font-bold uppercase text-[10px] tracking-wide border-0">Active</Badge>;
      case "completed":
        return <Badge className="rounded-none bg-green-600 font-bold uppercase text-[10px] tracking-wide border-0">Completed</Badge>;
      case "expired":
        return <Badge variant="secondary" className="rounded-none font-bold uppercase text-[10px] tracking-wide border-border border">Expired</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-none border-border font-bold uppercase text-[10px] tracking-wide">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all enrolled students across the platform.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.totalStudents}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.activeEnrollments}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Active Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-green-200 bg-green-50 text-green-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.completedEnrollments}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-yellow-200 bg-yellow-50 text-yellow-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.averageProgress}%</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-heading font-bold uppercase tracking-wide text-lg">All Enrollments</CardTitle>
              <CardDescription>
                {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-48 rounded-none border-border">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 rounded-none border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-none" />
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || courseFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Students will appear here once they enroll in courses"}
              </p>
            </div>
          ) : (
            <div className="border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="font-bold uppercase text-xs tracking-wider pl-6">Student</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Course</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Progress</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => {
                    const user = enrollment.user as User;
                    const course = enrollment.course as Course;

                    return (
                      <TableRow key={enrollment._id} className="border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-none border border-border">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {getInitials(user?.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{user?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {course?.title || "Unknown Course"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={enrollment.progress || 0} className="w-24 h-1.5 rounded-none bg-muted" />
                            <span className="text-xs font-mono text-muted-foreground">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {enrollment.startedAt
                            ? format(parseISO(enrollment.startedAt), "MMM d, yyyy")
                            : format(parseISO(enrollment.createdAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
