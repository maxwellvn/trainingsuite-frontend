"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Archive,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { useCourses } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CourseStatus } from "@/types";

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  archived: "bg-red-100 text-red-800",
};

const levelColors: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-800",
  intermediate: "bg-purple-100 text-purple-800",
  advanced: "bg-orange-100 text-orange-800",
};

export default function CoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: coursesResponse, isLoading } = useCourses({
    page,
    limit: 10,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? (statusFilter as CourseStatus) : undefined,
  });

  const courses = (coursesResponse?.data || []) as Course[];
  const pagination = coursesResponse?.pagination;

  // Mutations
  const publishMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course published successfully" });
    },
    onError: () => {
      toast({ title: "Failed to publish course", variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminApi.archiveCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course archived successfully" });
    },
    onError: () => {
      toast({ title: "Failed to archive course", variant: "destructive" });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      adminApi.featureCourse(id, featured),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: variables.featured
          ? "Course featured successfully"
          : "Course unfeatured successfully",
      });
    },
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course deleted successfully" });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: () => {
      toast({ title: "Failed to delete course", variant: "destructive" });
    },
  });

  const filteredCourses = courses.filter((course) => {
    if (categoryFilter === "all") return true;
    const categoryId = typeof course.category === "object" ? course.category._id : course.category;
    return categoryId === categoryFilter;
  });

  const toggleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map((c) => c._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete._id);
    }
  };

  // Bulk actions
  const handleBulkPublish = () => {
    selectedCourses.forEach((id) => publishMutation.mutate(id));
    setSelectedCourses([]);
  };

  const handleBulkArchive = () => {
    selectedCourses.forEach((id) => archiveMutation.mutate(id));
    setSelectedCourses([]);
  };

  const handleBulkFeature = () => {
    selectedCourses.forEach((id) => featureMutation.mutate({ id, featured: true }));
    setSelectedCourses([]);
  };

  // Calculate stats
  const totalCourses = pagination?.total || courses.length;
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const draftCount = courses.filter((c) => c.status === "draft").length;
  const pendingCount = courses.filter((c) => c.status === "pending").length;

  if (isLoading) {
    return <CoursesTableSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{totalCourses}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-green-200 bg-green-50 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{publishedCount}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-600">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{draftCount}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-yellow-200 bg-yellow-50 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{pendingCount}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] rounded-none border-border bg-muted/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" className="rounded-none border-border">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Bulk Actions */}
          {selectedCourses.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-primary/5 border border-primary/20 rounded-none">
              <span className="text-sm font-medium px-2">
                {selectedCourses.length} selected
              </span>
              <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkPublish}
                disabled={publishMutation.isPending}
                className="rounded-none h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkFeature}
                disabled={featureMutation.isPending}
                className="rounded-none h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                {featureMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Feature
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleBulkArchive}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Archive
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="border border-border rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="w-[50px] pl-6">
                      <Checkbox
                        checked={
                          selectedCourses.length === filteredCourses.length &&
                          filteredCourses.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded-none border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Course</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Level</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Price</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider text-right">Enrollments</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider text-right">Rating</TableHead>
                    <TableHead className="w-[50px] pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground font-medium">No courses found matching your criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course._id} className="border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selectedCourses.includes(course._id)}
                            onCheckedChange={() => toggleSelect(course._id)}
                            className="rounded-none border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-16 border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                {course.title}
                              </p>
                              {course.isFeatured && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Featured</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-none uppercase text-[10px] tracking-wide font-bold h-6 ${course.status === 'published' ? 'border-green-200 bg-green-50 text-green-700' :
                                course.status === 'draft' ? 'border-border bg-muted text-muted-foreground' :
                                  course.status === 'pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                    'border-red-200 bg-red-50 text-red-700'
                              }`}
                          >
                            {course.status || "draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-none font-normal text-muted-foreground bg-transparent border border-border"
                          >
                            {course.level || "beginner"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">
                          {course.price === 0
                            ? <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                            : formatCurrency(course.price || 0, course.currency || "USD")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono text-sm">{course.enrollmentCount || 0}</span>
                            <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono text-sm">{course.averageRating?.toFixed(1) || "N/A"}</span>
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          </div>
                        </TableCell>
                        <TableCell className="pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-border">
                              <DropdownMenuLabel className="font-heading font-bold text-xs uppercase tracking-wider">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                                <Link href={`/courses/${course.slug || course._id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Course
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                                <Link href={`/admin/courses/${course._id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit / Manage
                                </Link>
                              </DropdownMenuItem>
                              {course.status !== "published" && (
                                <DropdownMenuItem
                                  onClick={() => publishMutation.mutate(course._id)}
                                  className="rounded-none cursor-pointer"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {course.isFeatured ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    featureMutation.mutate({ id: course._id, featured: false })
                                  }
                                  className="rounded-none cursor-pointer"
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Unfeature
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    featureMutation.mutate({ id: course._id, featured: true })
                                  }
                                  className="rounded-none cursor-pointer"
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Feature
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {course.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => archiveMutation.mutate(course._id)}
                                  className="rounded-none cursor-pointer"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                                onClick={() => handleDelete(course)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Showing <span className="text-foreground">{filteredCourses.length}</span> of <span className="text-foreground">{pagination.total}</span> courses
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-none h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={`rounded-none h-8 w-8 p-0 ${page === i + 1 ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-none h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{courseToDelete?.title}"</span>?
              <br /><br />
              This action cannot be undone. It will permanently remove all associated material, including enrollments and student progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
function CoursesTableSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted/10 border border-border p-6">
            <Skeleton className="h-8 w-12 mb-2 rounded-none" />
            <Skeleton className="h-4 w-24 rounded-none" />
          </div>
        ))}
      </div>
      <div className="border border-border bg-background">
        <div className="p-6 border-b border-border">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 max-w-sm rounded-none" />
            <Skeleton className="h-10 w-[130px] rounded-none" />
          </div>
        </div>
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-12 w-16 rounded-none" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[40%] rounded-none" />
                <Skeleton className="h-3 w-[20%] rounded-none" />
              </div>
              <Skeleton className="h-4 w-20 rounded-none hidden sm:block" />
              <Skeleton className="h-8 w-8 rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
