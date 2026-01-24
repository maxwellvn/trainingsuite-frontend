"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Users,
  Star,
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Globe,
  Calendar,
  FileText,
  Video,
  Lock,
  ArrowLeft,
  Loader2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useCourse, useCourseCurriculum, useCourseRatings, useAuth } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { coursesApi } from "@/lib/api/courses";
import { enrollmentsApi } from "@/lib/api/enrollments";
import { normalizeUploadUrl } from "@/lib/utils";
import type { Course, Module, Lesson, Rating } from "@/types";

const levelColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

function CourseDetailSkeleton() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

function LessonItem({ lesson, isLocked }: { lesson: Lesson; isLocked: boolean }) {
  const getIcon = () => {
    if (lesson.type === "video") return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{getIcon()}</div>
        <span className="text-sm">{lesson.title}</span>
        {lesson.isFree && !isLocked && (
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        {lesson.duration && lesson.duration > 0 && (
          <span className="text-xs">{lesson.duration} min</span>
        )}
        {isLocked && !lesson.isFree && <Lock className="h-3.5 w-3.5" />}
      </div>
    </div>
  );
}

function ModuleAccordion({ module, index, isEnrolled }: { module: Module; index: number; isEnrolled: boolean }) {
  const lessons = (module.lessons || []) as Lesson[];
  const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);

  return (
    <AccordionItem value={module._id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-4 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium text-sm">{module.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lessons.length} lessons{totalDuration > 0 ? ` • ${totalDuration} min` : ""}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-1 ml-12">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson._id}
              lesson={lesson}
              isLocked={!isEnrolled}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function RatingBar({ rating, percentage }: { rating: number; percentage: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-12">{rating} star</span>
      <Progress value={percentage} className="h-2 flex-1" />
      <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onMouseEnter={() => setHoverValue(star)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`${sizeClasses[size]} cursor-pointer transition-colors ${star <= (hoverValue || value)
              ? "fill-amber-500 text-amber-500"
              : "text-gray-300 hover:text-amber-300"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
}: {
  courseId: string;
  existingReview?: Rating;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || "");
  const [isEditing, setIsEditing] = useState(!existingReview);

  const submitMutation = useMutation({
    mutationFn: (data: { rating: number; review?: string }) =>
      coursesApi.createRating(courseId, data),
    onSuccess: () => {
      toast({ title: existingReview ? "Review updated!" : "Review submitted!" });
      setIsEditing(false);
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    submitMutation.mutate({ rating, review: review.trim() || undefined });
  };

  if (existingReview && !isEditing) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Your Review</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < existingReview.rating
                ? "fill-amber-500 text-amber-500"
                : "text-gray-300"
                }`}
            />
          ))}
        </div>
        {existingReview.review && (
          <p className="text-sm text-muted-foreground">{existingReview.review}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4">
      <h4 className="font-medium mb-4">
        {existingReview ? "Update your review" : "Leave a review"}
      </h4>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Your rating</p>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Your review (optional)</p>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this course..."
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitMutation.isPending}>
          {submitMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          {existingReview ? "Update Review" : "Submit Review"}
        </Button>
        {existingReview && isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setRating(existingReview.rating);
              setReview(existingReview.review || "");
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: courseResponse, isLoading: courseLoading } = useCourse(resolvedParams.slug);
  const { data: curriculumResponse, isLoading: curriculumLoading } = useCourseCurriculum(resolvedParams.slug);
  const { data: ratingsResponse } = useCourseRatings(resolvedParams.slug);

  // Check enrollment status - need course ID, so wait for course to load
  const courseId = courseResponse?.data?._id;
  const { data: enrollmentResponse } = useQuery({
    queryKey: ["enrollment-check", courseId],
    queryFn: async () => {
      if (!isAuthenticated || !courseId) return null;
      try {
        // Fetch all user enrollments and check if this course is enrolled
        const myEnrollments = await enrollmentsApi.getMyEnrollments(1, 100);
        const enrollment = myEnrollments?.data?.find(
          (e) => {
            const enrolledCourseId = typeof e.course === "object" ? e.course?._id : e.course;
            return enrolledCourseId === courseId;
          }
        );
        return enrollment || null;
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!courseId,
  });

  const isEnrolled = !!enrollmentResponse;
  const enrollmentProgress = enrollmentResponse?.progress || 0;
  const isCompleted = enrollmentResponse?.status === "completed" || enrollmentProgress >= 100;


  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.enroll(courseId),
    onSuccess: () => {
      toast({ title: "Successfully enrolled!" });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-check"] });
      const course = courseResponse?.data;
      if (course) {
        router.push(`/courses/${course.slug}/learn`);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to enroll";
      const status = error?.response?.status;

      // If 400 error with "already enrolled" message, redirect to learn page
      if (status === 400 && message.toLowerCase().includes("already")) {
        toast({ title: "You're already enrolled! Redirecting..." });
        queryClient.invalidateQueries({ queryKey: ["enrollment-check"] });
        const course = courseResponse?.data;
        if (course) {
          router.push(`/courses/${course.slug}/learn`);
        }
      } else {
        toast({ title: message, variant: "destructive" });
      }
    },
  });

  const handleEnroll = () => {
    const course = courseResponse?.data;
    if (!course) return;

    if (!isAuthenticated) {
      toast({ title: "Please login to enroll", variant: "destructive" });
      router.push(`/login?redirect=/courses/${resolvedParams.slug}`);
      return;
    }

    // If already enrolled, go to learn page
    if (isEnrolled) {
      router.push(`/courses/${course.slug}/learn`);
      return;
    }

    // Direct enrollment for all training materials
    enrollMutation.mutate(course._id);
  };

  const handleGoToLearning = () => {
    const course = courseResponse?.data;
    if (course) {
      router.push(`/courses/${course.slug}/learn`);
    }
  };

  if (courseLoading) {
    return <CourseDetailSkeleton />;
  }

  const course = courseResponse?.data;

  if (!course) {
    return (
      <div className="container max-w-6xl py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="text-muted-foreground mt-2">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => router.push("/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const curriculumData = curriculumResponse?.data as { curriculum?: Module[] } | undefined;
  const modules = (curriculumData?.curriculum || []) as Module[];
  const ratings = (ratingsResponse?.data || []) as Rating[];

  // Find user's existing review
  const userReview = user
    ? ratings.find((r) => r.user?._id === user._id)
    : undefined;

  // Calculate rating distribution from actual data
  const ratingCounts = ratings.reduce(
    (acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );
  const totalRatings = ratings.length || 1;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    percentage: Math.round(((ratingCounts[rating] || 0) / totalRatings) * 100),
  }));

  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["course-ratings", resolvedParams.slug] });
    queryClient.invalidateQueries({ queryKey: ["course", resolvedParams.slug] });
  };

  const totalLessons = modules.reduce(
    (acc, module) => acc + ((module.lessons as Lesson[])?.length || 0),
    0
  );
  const totalDuration = modules.reduce(
    (acc, module) =>
      acc +
      ((module.lessons as Lesson[])?.reduce(
        (lessonAcc, lesson) => lessonAcc + (lesson.duration || 0),
        0
      ) || 0),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container max-w-6xl py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => router.push("/courses")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Courses
              </Button>

              <div className="flex items-center gap-2 mb-4">
                <Badge className={levelColors[course.level as keyof typeof levelColors] || "bg-gray-100 text-gray-800"}>
                  {course.level}
                </Badge>
                {course.category && typeof course.category === "object" && (
                  <Badge variant="outline" className="border-slate-500 text-slate-300">
                    {course.category.name}
                  </Badge>
                )}
                {isEnrolled && (
                  <Badge className={isCompleted ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-600"}>
                    {isCompleted ? "Completed" : `${enrollmentProgress}% Complete`}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-4">
                {course.title}
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold">{course.rating?.toFixed(1) || "N/A"}</span>
                  <span className="text-slate-400">({course.ratingCount || 0} ratings)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Users className="h-4 w-4" />
                  <span>{(course.enrollmentCount || 0).toLocaleString()} students</span>
                </div>
                {course.language && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <Globe className="h-4 w-4" />
                    <span>{course.language}</span>
                  </div>
                )}
                {course.updatedAt && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Enrollment Card */}
            <div className="lg:row-span-2">
              <Card className="sticky top-24 shadow-lg">
                {/* Preview Image */}
                <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                  {normalizeUploadUrl(course.thumbnail) && (
                    <img
                      src={normalizeUploadUrl(course.thumbnail)}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  {isEnrolled ? (
                    <div className="space-y-3">
                      {/* Enrollment Status Badge */}
                      <div className="flex items-center justify-between">
                        <Badge className={isCompleted ? "bg-green-600" : "bg-blue-600"}>
                          {isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {enrollmentProgress}% complete
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                        />
                      </div>

                      <Button size="lg" className={`w-full ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`} onClick={handleGoToLearning}>
                        {isCompleted ? "Review Course" : "Continue Learning"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full mb-3"
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Start Training
                    </Button>
                  )}

                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-sm">This course includes:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>{totalDuration > 0 ? `${totalDuration} min of video` : "Video content"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{totalLessons} lessons</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Downloadable resources</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Full lifetime access</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container max-w-6xl py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="mb-6 w-full justify-start overflow-x-auto flex-nowrap gap-2">
                <TabsTrigger value="curriculum" className="shrink-0">Curriculum</TabsTrigger>
                <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
                <TabsTrigger value="reviews" className="shrink-0">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Course Content</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {modules.length} modules &bull; {totalLessons} lessons{totalDuration > 0 ? ` • ${totalDuration} min` : ""}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {curriculumLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : modules.length > 0 ? (
                      <Accordion type="multiple" className="space-y-3">
                        {modules.map((module, index) => (
                          <ModuleAccordion
                            key={module._id}
                            module={module}
                            index={index}
                            isEnrolled={false}
                          />
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        Curriculum coming soon.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.objectives && course.objectives.length > 0 ? (
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {course.objectives.map((outcome: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No course outcomes specified.</p>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                      <div className="mt-8">
                        <h3 className="font-semibold mb-4">Requirements</h3>
                        <ul className="space-y-2">
                          {course.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-[200px,1fr] gap-8">
                      {/* Rating Summary */}
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary">
                          {course.rating?.toFixed(1) || "N/A"}
                        </div>
                        <div className="flex justify-center gap-1 my-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.round(course.rating || 0)
                                ? "fill-amber-500 text-amber-500"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {course.ratingCount || 0} reviews
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {ratingDistribution.map((item) => (
                          <RatingBar key={item.rating} rating={item.rating} percentage={item.percentage} />
                        ))}
                      </div>
                    </div>

                    {/* Review Form */}
                    <div className="mt-8 border-t pt-6">
                      {isEnrolled ? (
                        <ReviewForm
                          courseId={course._id}
                          existingReview={userReview}
                          onSuccess={handleReviewSuccess}
                        />
                      ) : isAuthenticated ? (
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-muted-foreground mb-3">
                            Enroll in this course to leave a review
                          </p>
                          <Button onClick={handleEnroll}>
                            Start Training
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-muted-foreground mb-3">
                            Sign in to leave a review
                          </p>
                          <Button asChild>
                            <Link href="/login">Sign In</Link>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Individual Reviews */}
                    {ratings.length > 0 ? (
                      <div className="mt-8 space-y-6">
                        {ratings
                          .filter((r) => r._id !== userReview?._id)
                          .map((rating) => (
                            <div key={rating._id} className="border-t pt-6">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarFallback>
                                    {rating.user?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{rating.user?.name || "Anonymous"}</h4>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(rating.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex gap-0.5 my-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < rating.rating
                                          ? "fill-amber-500 text-amber-500"
                                          : "text-gray-300"
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  {rating.review && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {rating.review}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : !userReview ? (
                      <p className="text-center py-8 text-muted-foreground mt-6">
                        No reviews yet. Be the first to review this course!
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related Courses Section */}
      <RelatedCourses
        categoryId={course.category && typeof course.category === "object" ? course.category._id : course.category || undefined}
        currentCourseId={course._id}
      />
    </div>
  );
}

// Related Courses Component
function RelatedCourses({
  categoryId,
  currentCourseId
}: {
  categoryId?: string;
  currentCourseId: string;
}) {
  const { data: relatedResponse, isLoading } = useQuery({
    queryKey: ["related-courses", categoryId],
    queryFn: () => coursesApi.getAll({
      category: categoryId,
      limit: 4,
      status: "published" as const
    }),
    enabled: !!categoryId,
  });

  const relatedCourses = (relatedResponse?.data || [])
    .filter((course: Course) => course._id !== currentCourseId)
    .slice(0, 4);

  if (!categoryId || (relatedCourses.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <div className="border-t bg-muted/30">
      <div className="container max-w-6xl py-12">
        <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedCourses.map((course: Course) => (
              <Link key={course._id} href={`/courses/${course.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 relative">
                    {normalizeUploadUrl(course.thumbnail) ? (
                      <img
                        src={normalizeUploadUrl(course.thumbnail)}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white/60" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{course.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                      <span>•</span>
                      <span>{course.enrollmentCount || 0} students</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Training Material
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
