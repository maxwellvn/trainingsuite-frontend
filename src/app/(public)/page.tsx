"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, useAuth } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/types";

const features = [
  {
    icon: BookOpen,
    title: "Quality Courses",
    description: "Access a growing library of courses across various domains and skill levels.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from industry professionals with real-world experience.",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn recognized certificates upon completing courses.",
  },
  {
    icon: Play,
    title: "Live Sessions",
    description: "Join interactive live sessions and workshops with instructors.",
  },
];


// Course card color gradients based on index
const cardGradients = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
];

function CourseCard({ course, index }: { course: Course; index: number }) {
  const gradient = cardGradients[index % cardGradients.length];

  return (
    <Link href={`/courses/${course.slug || course._id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-shadow">
        <div className={`h-36 ${gradient} relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs capitalize">
              {course.level}
            </Badge>
          </div>
          {course.isFree && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 hover:bg-green-600 text-xs">Free</Badge>
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
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-medium">{course.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({(course.enrollmentCount || 0).toLocaleString()} students)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-bold">
              {course.isFree ? "Free" : formatCurrency(course.price, course.currency)}
            </span>
            <Button size="sm" className="h-7 text-xs">Enroll Now</Button>
          </div>
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

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: coursesResponse, isLoading } = useCourses({
    status: "published",
    limit: 4,
    sort: "enrollmentCount",
    order: "desc",
  });

  const courses = coursesResponse?.data || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/50 to-white py-16 lg:py-24">
        <div className="container max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 text-xs">
              New courses added weekly
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Unlock Your Potential with{" "}
              <span className="text-primary">Expert-Led Courses</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners advancing their careers with our comprehensive
              online courses. Learn from industry experts and earn certificates that matter.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
            {!isAuthenticated && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Why Choose Training Suite?</h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to accelerate your learning journey
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border bg-background">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Popular Courses</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start learning from our most popular courses
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/courses">
                View All Courses
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No courses available yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/courses">Browse All Courses</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/courses">
                View All Courses
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {isAuthenticated ? "Continue Your Learning Journey" : "Ready to Start Learning?"}
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              {isAuthenticated
                ? "Pick up where you left off or explore new courses to expand your skills."
                : "Start your learning journey today. Get access to quality courses and earn certificates."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/my-courses">
                    My Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
