"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  Video,
  FileText,
  Menu,
  Clock,
  BookOpen,
  MessageSquare,
  Download,
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
import { LessonComments } from "@/components/lessons/lesson-comments";
import { RichContentRenderer } from "@/components/lessons/rich-content-renderer";
import { CourseCompletionDialog } from "@/components/courses/course-completion-dialog";
import { useToast } from "@/hooks/use-toast";
import { lessonsApi } from "@/lib/api/lessons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Module, Lesson, Course } from "@/types";

function getVideoEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | 'unknown'; embedUrl: string } {
  if (!url) return { type: 'unknown', embedUrl: '' };

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Direct video files
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: 'direct', embedUrl: url };
  }

  // Google Drive
  const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch) {
    return {
      type: 'direct',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // Loom
  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      type: 'direct',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Default: try as direct URL
  return { type: 'direct', embedUrl: url };
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          events?: {
            onStateChange?: (event: { data: number }) => void;
            onReady?: () => void;
          };
          playerVars?: Record<string, number | string>;
        }
      ) => unknown;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function VideoPlayer({
  lesson,
  onVideoEnd,
  lessonId,
}: {
  lesson: Lesson | null;
  onVideoEnd?: () => void;
  lessonId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<unknown>(null);
  const [ytApiLoaded, setYtApiLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load YouTube API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setYtApiLoaded(true);
      };
    } else if (window.YT) {
      setYtApiLoaded(true);
    }
  }, []);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!lesson?.videoUrl || !ytApiLoaded) return;

    const { type, embedUrl } = getVideoEmbedUrl(lesson.videoUrl);
    if (type !== 'youtube') return;

    // Extract video ID from embed URL
    const videoIdMatch = embedUrl.match(/embed\/([^?]+)/);
    if (!videoIdMatch) return;
    const videoId = videoIdMatch[1];

    // Clean up previous player
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current = null;
    }

    // Create unique container ID
    const containerId = `youtube-player-${lessonId || 'default'}`;

    // Wait for container to be ready
    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container || !window.YT?.Player) return;

      youtubePlayerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event: { data: number }) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0 && onVideoEnd) {
              onVideoEnd();
            }
          },
        },
      });
    }, 100);

    return () => {
      youtubePlayerRef.current = null;
    };
  }, [lesson?.videoUrl, ytApiLoaded, onVideoEnd, lessonId]);

  // Handle HTML5 video end
  const handleVideoEnd = useCallback(() => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  }, [onVideoEnd]);

  if (!lesson) {
    return (
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Select a lesson to start learning</p>
      </div>
    );
  }

  if (!lesson.videoUrl) {
    return (
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Video className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No video for this lesson</p>
          {lesson.type === 'text' && (
            <p className="text-slate-500 text-sm mt-2">This is a text-based lesson. See content below.</p>
          )}
        </div>
      </div>
    );
  }

  const { type, embedUrl } = getVideoEmbedUrl(lesson.videoUrl);

  // YouTube - use YouTube IFrame API for end detection
  if (type === 'youtube') {
    const containerId = `youtube-player-${lessonId || 'default'}`;
    return (
      <div className="aspect-video bg-slate-900" ref={containerRef}>
        <div id={containerId} className="w-full h-full" />
      </div>
    );
  }

  // Vimeo - use iframe with postMessage API
  if (type === 'vimeo') {
    return (
      <div className="aspect-video bg-slate-900">
        <iframe
          src={`${embedUrl}?api=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={lesson.title}
        />
        <p className="text-xs text-slate-500 text-center py-1">
          Click "Mark as Complete" when you finish watching
        </p>
      </div>
    );
  }

  // Google Drive or Loom - use iframe (can't detect end)
  if (embedUrl.includes('drive.google.com') || embedUrl.includes('loom.com')) {
    return (
      <div className="aspect-video bg-slate-900">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }

  // Direct video file - use HTML5 video with onEnded
  return (
    <div className="aspect-video bg-slate-900">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        playsInline
        onEnded={handleVideoEnd}
        poster="/video-placeholder.jpg"
      >
        <source src={embedUrl} type="video/mp4" />
        <source src={embedUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
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
      className={`w-full text-left p-3 rounded-lg transition-colors ${isActive
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
        <RichContentRenderer content={lesson.content} />
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  const { data: courseResponse, isLoading: courseLoading } = useCourse(resolvedParams.slug);
  const { data: curriculumResponse, isLoading: curriculumLoading } = useCourseCurriculum(resolvedParams.slug);
  const { data: enrollmentResponse } = useEnrollment(resolvedParams.slug);

  // Initialize completed lessons from enrollment data
  useEffect(() => {
    if (enrollmentResponse?.data?.completedLessons) {
      const completed = enrollmentResponse.data.completedLessons as string[];
      setCompletedLessonIds(new Set(completed));
    }
  }, [enrollmentResponse?.data?.completedLessons]);

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return lessonsApi.markComplete(lessonId);
    },
    onSuccess: (response, lessonId) => {
      setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
      queryClient.invalidateQueries({ queryKey: ["enrollment", resolvedParams.slug] });
      toast({ title: "Lesson completed!" });

      // Check if course is completed (certificate issued means course completed)
      if (response?.data?.certificateIssued) {
        setCompletionDialogOpen(true);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string }; status?: number } }) => {
      const message = error.response?.data?.message || "Failed to mark lesson as complete";
      const status = error.response?.status;

      if (status === 403) {
        toast({
          title: "Not enrolled",
          description: "You must be enrolled in this course to track progress.",
          variant: "destructive"
        });
      } else {
        toast({ title: message, variant: "destructive" });
      }
    },
  });

  // Get active lesson (needs to be before handleVideoEnd)
  const curriculumData = curriculumResponse?.data as { curriculum?: Module[] } | undefined;
  const modules = (curriculumData?.curriculum || []) as Module[];
  const firstLesson = modules[0]?.lessons?.[0] as Lesson | undefined;
  const activeLesson = currentLesson || firstLesson || null;

  // Handle video end - auto mark as complete
  const handleVideoEnd = useCallback(() => {
    if (activeLesson && !completedLessonIds.has(activeLesson._id) && !markCompleteMutation.isPending) {
      markCompleteMutation.mutate(activeLesson._id);
    }
  }, [activeLesson, completedLessonIds, markCompleteMutation]);

  const isLoading = courseLoading || curriculumLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const course = courseResponse?.data as Course | undefined;
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
          <VideoPlayer
            lesson={activeLesson}
            onVideoEnd={handleVideoEnd}
            lessonId={activeLesson?._id}
          />

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

            <Button
              variant="default"
              size="sm"
              disabled={!activeLesson || completedLessonIds.has(activeLesson._id) || markCompleteMutation.isPending}
              onClick={() => activeLesson && markCompleteMutation.mutate(activeLesson._id)}
            >
              {completedLessonIds.has(activeLesson?._id || "") ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Completed
                </>
              ) : markCompleteMutation.isPending ? (
                "Marking..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </>
              )}
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

            <TabsContent value="discussion" className="mt-0">
              <LessonComments lessonId={activeLesson?._id || ""} />
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

      {/* Course Completion Dialog */}
      <CourseCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        course={course}
        onCertificateGenerated={(cert) => {
          queryClient.invalidateQueries({ queryKey: ["certificates"] });
        }}
      />
    </div>
  );
}
