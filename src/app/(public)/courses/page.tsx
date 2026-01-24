"use client";

import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  X,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useCourses, useCategories, useEnrollments } from "@/hooks";
import { normalizeUploadUrl } from "@/lib/utils";
import type { Course, CourseFilters, Enrollment } from "@/types";
import { T, useT } from "@/components/t";

// Available course languages
const COURSE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "sw", name: "Swahili" },
];

const getLanguageName = (code: string): string => {
  const lang = COURSE_LANGUAGES.find(l => l.code === code?.toLowerCase());
  return lang?.name || code?.toUpperCase() || "Unknown";
};

const cardGradients = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
];

function CourseCard({ course, index, enrollment, viewMode = "grid" }: { course: Course; index: number; enrollment?: Enrollment; viewMode?: "grid" | "list" }) {
  const { t } = useT();
  const gradient = cardGradients[index % cardGradients.length];
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;
  const isInProgress = isEnrolled && progress > 0 && !isCompleted;

  const getEnrollmentBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-600 hover:bg-green-600 text-xs"><T>Completed</T></Badge>;
    }
    if (isInProgress) {
      return <Badge className="bg-blue-600 hover:bg-blue-600 text-xs"><T>In Progress</T></Badge>;
    }
    if (isEnrolled) {
      return <Badge className="bg-slate-600 hover:bg-slate-600 text-xs"><T>Enrolled</T></Badge>;
    }
    return null;
  };

  // List view layout
  if (viewMode === "list") {
    return (
      <Link href={`/courses/${course.slug || course._id}`}>
        <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow border shadow-sm">
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className={`h-40 sm:h-auto sm:w-48 md:w-56 ${gradient} relative overflow-hidden shrink-0`}>
              {normalizeUploadUrl(course.thumbnail) && (
                <img
                  src={normalizeUploadUrl(course.thumbnail)}
                  alt={t(course.title)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap sm:hidden">
                <Badge variant="secondary" className="text-xs capitalize">
                  {t(course.level || "beginner")}
                </Badge>
                {getEnrollmentBadge()}
              </div>
            </div>
            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <div className="hidden sm:flex gap-2 flex-wrap mb-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {t(course.level || "beginner")}
                  </Badge>
                  {course.language && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {getLanguageName(course.language)}
                    </Badge>
                  )}
                  {getEnrollmentBadge()}
                </div>
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                  {t(course.title)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
                  {course.description ? t(course.description.substring(0, 150)) : ""}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {course.rating && course.rating > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
                    </div>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {(course.enrollmentCount || 0).toLocaleString()} <T>enrolled</T>
                  </span>
                </div>
              </div>
              {/* Progress or CTA */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                {isEnrolled ? (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {isCompleted ? <T>Completed</T> : <>{progress}% <T>complete</T></>}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" className={`h-8 text-xs ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}>
                      {isCompleted ? <T>Review Course</T> : <T>Continue</T>}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="h-8 text-xs w-full sm:w-auto"><T>Start Training</T></Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view layout (default)
  return (
    <Link href={`/courses/${course.slug || course._id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-shadow border shadow-sm">
        <div className={`h-36 ${gradient} relative overflow-hidden`}>
          {normalizeUploadUrl(course.thumbnail) && (
            <img
              src={normalizeUploadUrl(course.thumbnail)}
              alt={t(course.title)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize">
              {t(course.level || "beginner")}
            </Badge>
            {course.language && (
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                <Globe className="h-3 w-3 mr-1" />
                {getLanguageName(course.language)}
              </Badge>
            )}
            {getEnrollmentBadge()}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {t(course.title)}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {course.rating && course.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
              </div>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {(course.enrollmentCount || 0).toLocaleString()} <T>enrolled</T>
            </span>
          </div>
          {isEnrolled ? (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">
                  {isCompleted ? <T>Completed</T> : <>{progress}% <T>complete</T></>}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <Button size="sm" className={`h-7 text-xs w-full mt-2 ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}>
                {isCompleted ? <T>Review Course</T> : <T>Continue</T>}
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button size="sm" className="h-7 text-xs w-full"><T>Start Training</T></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSidebar({
  filters,
  setFilters,
  categories,
}: {
  filters: CourseFilters;
  setFilters: (filters: CourseFilters) => void;
  categories: { _id: string; name: string }[];
}) {
  const { t } = useT();
  
  const levels = [
    { value: "beginner", label: t("Beginner") },
    { value: "intermediate", label: t("Intermediate") },
    { value: "advanced", label: t("Advanced") },
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm mb-3"><T>Category</T></h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.category === category._id}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    category: checked ? category._id : undefined,
                  });
                }}
              />
              <span className="text-sm">{t(category.name)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h4 className="font-semibold text-sm mb-3"><T>Level</T></h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <label
              key={level.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.level === level.value}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    level: checked ? (level.value as CourseFilters["level"]) : undefined,
                  });
                }}
              />
              <span className="text-sm">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <h4 className="font-semibold text-sm mb-3"><T>Language</T></h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {COURSE_LANGUAGES.slice(0, 10).map((lang) => (
            <label
              key={lang.code}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.language === lang.code}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    language: checked ? lang.code : undefined,
                  });
                }}
              />
              <span className="text-sm">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setFilters({ status: "published" })}
      >
        <T>Clear Filters</T>
      </Button>
    </div>
  );
}

function CoursesLoading() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-[200px] shrink-0">
          <Skeleton className="h-96 w-full" />
        </aside>
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const { t } = useT();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [filters, setFilters] = useState<CourseFilters>({
    status: "published",
    sort: "enrollmentCount",
    order: "desc",
    limit: 50,
  });

  const sortOptions = [
    { value: "enrollmentCount", label: t("Most Popular") },
    { value: "rating", label: t("Highest Rated") },
    { value: "createdAt", label: t("Newest") },
    { value: "title", label: t("Title") },
  ];

  const { data: coursesResponse, isLoading } = useCourses({
    ...filters,
    search: searchQuery || undefined,
  });

  const { data: categoriesResponse } = useCategories();
  const { data: enrollmentsResponse } = useEnrollments();

  const rawCourses = coursesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const enrollments = enrollmentsResponse?.data || [];

  // Sort courses to show preferred language first (without filtering out others)
  const courses = useMemo(() => {
    if (!preferredLanguage) return rawCourses;
    
    // Split courses into preferred language and others
    const preferred: Course[] = [];
    const others: Course[] = [];
    
    rawCourses.forEach((course) => {
      if (course.language?.toLowerCase() === preferredLanguage.toLowerCase()) {
        preferred.push(course);
      } else {
        others.push(course);
      }
    });
    
    // Return preferred language courses first, then others
    return [...preferred, ...others];
  }, [rawCourses, preferredLanguage]);

  // Create a map of course ID to enrollment for quick lookup
  const enrollmentMap = new Map<string, Enrollment>();
  enrollments.forEach((enrollment) => {
    const courseId = typeof enrollment.course === "object" && enrollment.course ? enrollment.course._id : enrollment.course;
    enrollmentMap.set(courseId, enrollment);
  });

  const activeFiltersCount = [
    filters.category,
    filters.level,
    filters.language,
  ].filter(Boolean).length;

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight"><T>Training Materials</T></h1>
        <p className="text-muted-foreground mt-1">
          <T>Browse our training resources and start your preparation</T>
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search training materials...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              <T>Filters</T>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle><T>Filters</T></SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                categories={categories}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters({ ...filters, sort: value as CourseFilters["sort"] })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("Sort by")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode */}
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

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[200px] shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold"><T>Filters</T></h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
            />
          </div>
        </aside>

        {/* Courses Grid */}
        <div className="flex-1">
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {isLoading ? (
              <T>Loading...</T>
            ) : (
              <>
                <T>Showing</T>{" "}
                <span className="font-medium text-foreground">
                  {courses.length}
                </span>{" "}
                {coursesResponse?.pagination?.total
                  ? <>{t("of")} {coursesResponse.pagination.total}</>
                  : ""}{" "}
                <T>training materials</T>
              </>
            )}
          </p>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-8"
              }
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  index={index}
                  enrollment={enrollmentMap.get(course._id)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground"><T>No training materials found.</T></p>
              <p className="text-sm text-muted-foreground mt-1">
                <T>Try adjusting your search or filters.</T>
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: "published" });
                }}
              >
                <T>Clear all filters</T>
              </Button>
            </div>
          )}

          {/* Pagination placeholder */}
          {coursesResponse?.pagination && coursesResponse.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <p className="text-sm text-muted-foreground">
                <T>Page</T> {coursesResponse.pagination.page} <T>of</T>{" "}
                {coursesResponse.pagination.totalPages}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent />
    </Suspense>
  );
}
