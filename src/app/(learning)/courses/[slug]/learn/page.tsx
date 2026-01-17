"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  Video,
  FileText,
  Menu,
  X,
  Clock,
  BookOpen,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronUp,
  Maximize,
  Volume2,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCourse, useCourseCurriculum, useEnrollment } from "@/hooks";
import type { Module, Lesson, Course } from "@/types";

function VideoPlayer({ lesson }: { lesson: Lesson | null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!lesson) {
    return (
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Select a lesson to start learning</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-slate-900 group">
      {/* Video placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {lesson.videoUrl ? (
          <video
            className="w-full h-full object-contain"
            poster="/video-placeholder.jpg"
          >
            <source src={lesson.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="text-center">
            <Video className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Video content</p>
          </div>
        )}
      </div>

      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={() => setIsPlaying(true)}
            className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="h-10 w-10 text-white fill-white ml-1" />
          </button>
        </div>
      )}

      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div className="mb-3">
          <Progress value={progress} className="h-1 bg-white/20" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <span className="text-sm text-white ml-2">
              0:00 / {lesson.duration || 0}:00
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonItem({
  lesson,
  isActive,
  isCompleted,
  isLocked,
  onClick,
}: {
  lesson: Lesson;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  const getIcon = () => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isLocked) return <Lock className="h-4 w-4 text-muted-foreground" />;
    if (lesson.type === "video") return <Video className="h-4 w-4" />;
    if (lesson.type === "quiz") return <FileText className="h-4 w-4" />;
    return <Circle className="h-4 w-4" />;
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-primary/10 border border-primary/30"
          : isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium line-clamp-2 ${isActive ? "text-primary" : ""}`}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {lesson.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.duration} min
              </span>
            )}
            {lesson.isFree && !isLocked && (
              <Badge variant="outline" className="text-xs h-5">
                Preview
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function CurriculumSidebar({
  modules,
  currentLessonId,
  onSelectLesson,
  courseProgress,
}: {
  modules: Module[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  courseProgress: number;
}) {
  const defaultOpenModules = modules.map((m) => m._id);

  return (
    <div className="h-full flex flex-col">
      {/* Progress header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Course Progress</span>
          <span className="text-sm text-muted-foreground">{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
      </div>

      {/* Curriculum */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={defaultOpenModules} className="space-y-2">
            {modules.map((module, moduleIndex) => {
              const lessons = (module.lessons || []) as Lesson[];
              const completedLessons = 0; // TODO: Get from enrollment data

              return (
                <AccordionItem
                  key={module._id}
                  value={module._id}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{module.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedLessons}/{lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-1 ml-10">
                      {lessons.map((lesson, lessonIndex) => (
                        <LessonItem
                          key={lesson._id}
                          lesson={lesson}
                          isActive={currentLessonId === lesson._id}
                          isCompleted={false}
                          isLocked={false}
                          onClick={() => onSelectLesson(lesson)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: Lesson | null }) {
  if (!lesson) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Select a lesson to view its content
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{lesson.title}</h2>

      {lesson.content ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      ) : (
        <p className="text-muted-foreground">
          Watch the video above to complete this lesson.
        </p>
      )}

      {/* Materials */}
      {lesson.materials && lesson.materials.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Lesson Materials
          </h3>
          <div className="space-y-2">
            {lesson.materials.map((material: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{material.name || `Material ${index + 1}`}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="w-80 border-l hidden lg:block">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CourseLearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: courseResponse, isLoading: courseLoading } = useCourse(resolvedParams.slug);
  const { data: curriculumResponse, isLoading: curriculumLoading } = useCourseCurriculum(resolvedParams.slug);
  const { data: enrollmentResponse } = useEnrollment(resolvedParams.slug);

  const isLoading = courseLoading || curriculumLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const course = courseResponse?.data as Course | undefined;
  const modules = (curriculumResponse?.data || []) as Module[];
  const enrollment = enrollmentResponse?.data;
  const courseProgress = enrollment?.progress || 0;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <p className="text-muted-foreground mt-2">
            The course you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={() => router.push("/courses")}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  // Get first lesson if none selected
  const firstLesson = modules[0]?.lessons?.[0] as Lesson | undefined;
  const activeLesson = currentLesson || firstLesson || null;

  // Get all lessons flat
  const allLessons = modules.flatMap((m) => (m.lessons || []) as Lesson[]);
  const currentIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/courses/${course.slug || course._id}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-sm line-clamp-1">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{courseProgress}% complete</span>
          </div>

          {/* Mobile curriculum toggle */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Menu className="h-4 w-4 mr-2" />
                Curriculum
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <CurriculumSidebar
                modules={modules}
                currentLessonId={activeLesson?._id || null}
                onSelectLesson={(lesson) => {
                  setCurrentLesson(lesson);
                  setSidebarOpen(false);
                }}
                courseProgress={courseProgress}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video & Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <VideoPlayer lesson={activeLesson} />

          {/* Lesson Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button variant="default" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={!nextLesson}
              onClick={() => nextLesson && setCurrentLesson(nextLesson)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Tabs: Content, Discussion, Notes */}
          <Tabs defaultValue="content" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-4">
              <TabsTrigger value="content" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <BookOpen className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="discussion" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 flex-1">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <LessonContent lesson={activeLesson} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="discussion" className="mt-0 p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">Discussion</h3>
                <p className="text-muted-foreground mt-2">
                  Ask questions and discuss this lesson with other learners.
                </p>
                <Button className="mt-4">Start a Discussion</Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">Your Notes</h3>
                <p className="text-muted-foreground mt-2">
                  Take notes while watching the lesson.
                </p>
                <Button className="mt-4">Add Note</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Curriculum Sidebar */}
        <aside className="w-80 border-l hidden lg:block">
          <CurriculumSidebar
            modules={modules}
            currentLessonId={activeLesson?._id || null}
            onSelectLesson={setCurrentLesson}
            courseProgress={courseProgress}
          />
        </aside>
      </div>
    </div>
  );
}
