"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle,
  Search,
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

const cardColors = [
  "bg-violet-500/10 border-violet-500/20 text-violet-600",
  "bg-amber-500/10 border-amber-500/20 text-amber-600",
  "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  "bg-blue-500/10 border-blue-500/20 text-blue-600",
  "bg-pink-500/10 border-pink-500/20 text-pink-600",
  "bg-cyan-500/10 border-cyan-500/20 text-cyan-600",
];

function CourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;
  const colorClass = cardColors[index % cardColors.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-none border-border group cursor-pointer h-full hover:border-primary/50 transition-colors bg-card">
        <div className={`h-32 ${colorClass} border-b relative flex items-center justify-center overflow-hidden`}>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <PlayCircle className="h-10 w-10 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all" />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="rounded-none text-[10px] font-bold uppercase tracking-wider border-0 bg-background/80 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3">
              <Badge className="rounded-none bg-green-600 hover:bg-green-600 text-[10px] font-bold uppercase tracking-wider border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-heading font-bold uppercase text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Progress</span>
              <span className="font-mono text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 rounded-none bg-muted" />
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-mono font-bold">{course.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <Button size="sm" className="h-8 rounded-none text-xs font-bold uppercase tracking-wider">
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
  const colorClass = cardColors[index % cardColors.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-none border-border group hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <div className={`h-32 sm:h-24 w-full sm:w-36 ${colorClass} border border-border/50 relative shrink-0 flex items-center justify-center overflow-hidden`}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <PlayCircle className="h-8 w-8 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all" />
              )}
              {isCompleted && (
                <div className="absolute top-1 right-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="rounded-none text-[10px] font-bold uppercase tracking-wider border-border">
                      {course.level}
                    </Badge>
                    {isCompleted && (
                      <Badge className="rounded-none bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider border-0">Completed</Badge>
                    )}
                  </div>
                  <h3 className="font-heading font-bold uppercase text-base line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                </div>
                <Button size="sm" className="rounded-none uppercase text-xs font-bold tracking-wider h-8 w-full sm:w-auto">
                  {isCompleted ? "Review" : "Continue"}
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={progress} className="h-1.5 rounded-none bg-muted" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
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
    <Card className="rounded-none border-border overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full rounded-none" />
        <Skeleton className="h-4 w-3/4 rounded-none" />
        <Skeleton className="h-2 w-full mt-2 rounded-none" />
        <div className="flex justify-between pt-4 border-t border-border">
          <Skeleton className="h-4 w-12 rounded-none" />
          <Skeleton className="h-8 w-20 rounded-none" />
        </div>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Track your enrolled courses and continue learning
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
          />
        </div>
        <div className="flex border border-border bg-background">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none border-r border-border h-10 w-10 hover:bg-muted/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            onClick={() => setViewMode("grid")}
            data-state={viewMode === "grid" ? "active" : ""}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none h-10 w-10 hover:bg-muted/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            onClick={() => setViewMode("list")}
            data-state={viewMode === "list" ? "active" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4 sm:gap-6 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider shrink-0"
          >
            All <Badge variant="secondary" className="ml-2 rounded-none text-[10px] bg-muted text-muted-foreground">{filteredEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider shrink-0"
          >
            In Progress <Badge variant="secondary" className="ml-2 rounded-none text-[10px] bg-muted text-muted-foreground">{activeEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider shrink-0"
          >
            Completed <Badge variant="secondary" className="ml-2 rounded-none text-[10px] bg-muted text-muted-foreground">{completedEnrollments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-20 border border-dashed border-border bg-muted/5">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold uppercase tracking-wide">No courses found</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "You haven't enrolled in any courses yet"}
              </p>
              <Button className="mt-6 rounded-none font-bold uppercase tracking-wider" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : activeEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-20 border border-dashed border-border bg-muted/5">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold uppercase tracking-wide">No courses in progress</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Start a new course or resume a completed one
              </p>
              <Button className="mt-6 rounded-none font-bold uppercase tracking-wider" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : completedEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-20 border border-dashed border-border bg-muted/5">
              <CheckCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold uppercase tracking-wide">No completed courses</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Keep learning and complete your first course!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
