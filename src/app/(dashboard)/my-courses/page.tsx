"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollments } from "@/hooks";
import type { Enrollment, Course } from "@/types";

const cardGradients = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
];

function CourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;
  const gradient = cardGradients[index % cardGradients.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-shadow">
        <div className={`h-32 ${gradient} relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs capitalize">
              {course.level}
            </Badge>
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <div className="h-8 w-8 rounded-full bg-black/30 flex items-center justify-center">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {typeof course.instructor === "object" ? course.instructor.name : "Instructor"}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-medium">{course.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <Button size="sm" className="h-7 text-xs">
              {isCompleted ? "Review" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseListItem({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;
  const gradient = cardGradients[index % cardGradients.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className={`h-20 w-32 rounded-lg ${gradient} relative shrink-0 flex items-center justify-center`}>
              <Play className="h-8 w-8 text-white" />
              {isCompleted && (
                <div className="absolute top-1 right-1">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {course.level}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {typeof course.instructor === "object" ? course.instructor.name : "Instructor"}
                  </p>
                </div>
                <Button size="sm">
                  {isCompleted ? "Review" : "Continue"}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

export default function MyCoursesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: enrollmentsResponse, isLoading } = useEnrollments();

  const enrollments = (enrollmentsResponse?.data || []) as Enrollment[];

  const filteredEnrollments = enrollments.filter((enrollment: Enrollment) => {
    const course = typeof enrollment.course === "object" ? enrollment.course : null;
    if (!course) return false;
    if (!searchQuery) return true;
    return (course as Course).title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeEnrollments = filteredEnrollments.filter(
    (e: Enrollment) => (e.progress || 0) < 100
  );
  const completedEnrollments = filteredEnrollments.filter(
    (e: Enrollment) => (e.progress || 0) >= 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Track your enrolled courses and continue learning
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({activeEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedEnrollments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold">No courses found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "You haven't enrolled in any courses yet"}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : activeEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold">No courses in progress</h3>
              <p className="text-muted-foreground mt-1">
                Start a new course or resume a completed one
              </p>
              <Button className="mt-4" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : completedEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {completedEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold">No completed courses</h3>
              <p className="text-muted-foreground mt-1">
                Keep learning and complete your first course!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
