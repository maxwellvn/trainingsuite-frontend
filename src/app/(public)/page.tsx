"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Play,
  Star,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, useAuth, useEnrollments } from "@/hooks";
import type { Course, Enrollment } from "@/types";
import { cn, normalizeUploadUrl } from "@/lib/utils";

function CourseCard({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;

  return (
    <Link href={`/courses/${course.slug || course._id}`} className="block h-full group">
      <div className="h-full flex flex-col border border-border bg-card transition-colors hover:border-foreground/50">
        {/* Minimal Course Header */}
        <div className="relative aspect-video bg-muted border-b border-border flex items-center justify-center overflow-hidden">
          {/* Thumbnail or placeholder */}
          {normalizeUploadUrl(course.thumbnail) ? (
            <img
              src={normalizeUploadUrl(course.thumbnail)}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800" />
          )}
          <Play className="h-8 w-8 text-white/60 group-hover:text-white transition-colors relative z-10 drop-shadow-lg" />

          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-background text-foreground font-medium rounded-none border-foreground/10 capitalize text-xs tracking-wide">
              {course.level}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-foreground" />
                <span className="text-xs font-semibold">{course.rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Video Course</span>
          </div>

          <h3 className="text-xl font-heading font-bold text-foreground mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4">
            {course.title}
          </h3>

          <div className="mt-auto pt-6">
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 w-full bg-secondary">
                  <div
                    className="h-full bg-foreground"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Button variant="outline" className="w-full rounded-none h-9 text-xs uppercase tracking-wide border-foreground/20 hover:bg-foreground hover:text-background transition-colors">
                  {isCompleted ? "Review" : "Continue"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                <span>Start Learning</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="border border-border h-full bg-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-20 rounded-none" />
        <Skeleton className="h-6 w-full rounded-none" />
        <Skeleton className="h-6 w-3/4 rounded-none" />
        <div className="pt-4 mt-auto">
          <Skeleton className="h-9 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: coursesResponse, isLoading } = useCourses({
    status: "published",
    sort: "enrollmentCount",
    order: "desc",
  });
  const { data: enrollmentsResponse } = useEnrollments();

  const courses = coursesResponse?.data || [];
  const enrollments = enrollmentsResponse?.data || [];
  const enrollmentMap = new Map<string, Enrollment>();

  if (enrollments) {
    enrollments.forEach((enrollment) => {
      if (!enrollment.course) return;
      const courseId = typeof enrollment.course === "object" ? enrollment.course._id : enrollment.course;
      enrollmentMap.set(courseId, enrollment);
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">

      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-40 md:pb-32 border-b border-border">
        <div className="container max-w-7xl px-4 md:px-8">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-foreground/20"></span>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                Rhapsody Global Missionaries
              </p>
            </div>

            <h1 className="font-heading text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground mb-10 leading-[0.95] text-balance">
              Equipping Ministers for <br />
              <span className="text-muted-foreground/40">Global Impact.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-light">
              A professional training portal designed for the rigorous spiritual and practical development of ministers worldwide.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base rounded-none bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-wider font-medium" asChild>
                  <Link href="/dashboard">Access Dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base rounded-none bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-wider font-medium" asChild>
                  <Link href="/register">Begin Training</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-base rounded-none border-border hover:bg-secondary transition-colors uppercase tracking-wider font-medium" asChild>
                <Link href="/courses">View Curriculum</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Grid - Brutalist/Grid Style */}
      <section className="border-b border-border">
        <div className="container max-w-7xl px-0">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              {
                title: "Structured Curriculum",
                desc: "Theological and practical training materials curated for depth.",
              },
              {
                title: "HD Video Lessons",
                desc: "On-demand high-definition content from senior leadership.",
              },
              {
                title: "Live Mentorship",
                desc: "Real-time interactive sessions and spiritual guidance.",
              },
              {
                title: "Official Certification",
                desc: "Recognized validation of completed ministry training.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 md:p-12 hover:bg-secondary/20 transition-colors">
                <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="py-24 md:py-32">
        <div className="container max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Training Programs</h2>
              <p className="text-lg text-muted-foreground font-light">Select a comprehensive module to begin your preparation journey.</p>
            </div>
            <Link href="/courses" className="hidden md:flex items-center text-sm font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
              Full Curriculum <ArrowRight className="ml-3 h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  enrollment={enrollmentMap.get(course._id)}
                />
              ))
            ) : (
              <div className="col-span-full py-32 text-center border border-border bg-muted/10">
                <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">No courses available</p>
              </div>
            )}
          </div>

          <Link href="/courses" className="md:hidden mt-8 flex items-center justify-center h-12 border border-border text-sm font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
            Full Curriculum <ArrowRight className="ml-3 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Statement Section */}
      <section className="py-32 bg-foreground text-background border-t border-border">
        <div className="container max-w-7xl px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-6xl font-bold leading-[1.1] mb-8">
                Ready to answer the call to service?
              </h2>
            </div>
            <div className="space-y-8">
              <p className="text-xl text-background/80 font-light leading-relaxed">
                Join a global network of ministers equipping themselves for the next level of impact through the Rhapsody Global Missionaries Portal.
              </p>
              <ul className="space-y-4 text-background/80">
                {["Global Networking", "Resource Library Access", "Priority Event Registration"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 opacity-50" />
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                {isAuthenticated ? (
                  <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-none bg-background text-foreground hover:bg-background/90 text-sm uppercase tracking-widest font-bold" asChild>
                    <Link href="/dashboard">Continue Learning</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-none bg-background text-foreground hover:bg-background/90 text-sm uppercase tracking-widest font-bold" asChild>
                    <Link href="/register">Register Now</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
