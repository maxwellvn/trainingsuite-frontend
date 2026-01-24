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

function getVideoEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | 'unknown'; embedUrl: string; videoId?: string } {
  if (!url) return { type: 'unknown', embedUrl: '' };

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
      videoId: youtubeMatch[1],
    };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      videoId: vimeoMatch[1],
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

/**
 * Get video thumbnail URL based on video type
 */
function getVideoThumbnail(url: string): string | undefined {
  if (!url) return undefined;

  // YouTube - use their thumbnail API
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    // Try maxresdefault first, fallback handled by browser
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
  }

  // For direct videos, we'll generate thumbnail from the video itself
  return undefined;
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

// Helper to format time as MM:SS or HH:MM:SS
function formatVideoTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// localStorage key for video progress
const VIDEO_PROGRESS_KEY = "video-progress";

// Save video progress to localStorage
function saveVideoProgress(lessonId: string, currentTime: number, duration: number) {
  if (!lessonId || !isFinite(currentTime) || !isFinite(duration)) return;
  try {
    const stored = localStorage.getItem(VIDEO_PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    // Only save if not at the end (within 5 seconds of end)
    if (duration - currentTime > 5) {
      progress[lessonId] = { currentTime, duration, timestamp: Date.now() };
    } else {
      // Clear progress if video completed
      delete progress[lessonId];
    }
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore localStorage errors
  }
}

// Get saved video progress from localStorage
function getSavedVideoProgress(lessonId: string): number | null {
  if (!lessonId) return null;
  try {
    const stored = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (!stored) return null;
    const progress = JSON.parse(stored);
    const saved = progress[lessonId];
    if (saved && saved.currentTime > 0) {
      // Only restore if saved within last 30 days
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - saved.timestamp < thirtyDays) {
        return saved.currentTime;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPoster, setVideoPoster] = useState<string | undefined>(undefined);
  const lastSaveRef = useRef(0);

  // Reset state when lesson changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    lastSaveRef.current = 0;
    
    // Set poster based on video type
    if (lesson?.videoUrl) {
      const thumbnail = getVideoThumbnail(lesson.videoUrl);
      setVideoPoster(thumbnail);
    } else {
      setVideoPoster(undefined);
    }
  }, [lessonId, lesson?.videoUrl]);

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
          autoplay: 1,
          controls: 1,
          fs: 1, // Allow fullscreen
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
          src={`${embedUrl}?api=1&autoplay=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={lesson.title}
        />
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

  // Direct video file - use HTML5 video with full controls including seeking

  // Handle time update for display and progress saving
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      setCurrentTime(video.currentTime);
      
      // Save progress every 5 seconds
      if (lessonId && video.currentTime - lastSaveRef.current >= 5) {
        lastSaveRef.current = video.currentTime;
        saveVideoProgress(lessonId, video.currentTime, video.duration);
      }
    }
  }, [lessonId]);

  // Handle video loaded - restore position and set duration
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && lessonId) {
      const video = videoRef.current;
      setDuration(video.duration);
      
      // Restore saved position
      const savedPosition = getSavedVideoProgress(lessonId);
      if (savedPosition && savedPosition < video.duration - 5) {
        video.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
    }
  }, [lessonId]);

  // Generate poster from video frame for direct videos (if no poster yet)
  const handleLoadedData = useCallback(() => {
    if (videoRef.current && !videoPoster) {
      const video = videoRef.current;
      // Seek to 1 second or 10% of video to get a good frame
      const seekTime = Math.min(1, video.duration * 0.1);
      
      // Create a temporary video to capture frame without affecting playback
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = video.currentSrc || embedUrl;
      tempVideo.currentTime = seekTime;
      
      tempVideo.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempVideo.videoWidth || 1280;
          canvas.height = tempVideo.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const posterUrl = canvas.toDataURL('image/jpeg', 0.8);
            setVideoPoster(posterUrl);
          }
        } catch {
          // CORS or other error - ignore
        }
        tempVideo.remove();
      }, { once: true });
      
      tempVideo.addEventListener('error', () => {
        tempVideo.remove();
      }, { once: true });
    }
  }, [videoPoster, embedUrl]);

  return (
    <div className="aspect-video bg-slate-900 relative group">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        playsInline
        autoPlay
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          // Save progress when paused
          if (lessonId && videoRef.current) {
            saveVideoProgress(lessonId, videoRef.current.currentTime, videoRef.current.duration);
          }
        }}
        poster={videoPoster}
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
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
    if (isLocked) return <Lock className="h-4 w-4 text-muted-foreground shrink-0" />;
    if (lesson.type === "video") return <Video className="h-4 w-4 shrink-0" />;
    if (lesson.type === "text") return <FileText className="h-4 w-4 shrink-0" />;
    return <Circle className="h-4 w-4 shrink-0" />;
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${isActive
        ? "bg-primary/10 border border-primary/30"
        : isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-muted"
        }`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium line-clamp-2 break-words ${isActive ? "text-primary" : ""}`}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {lesson.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
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
  completedLessonIds,
}: {
  modules: Module[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  courseProgress: number;
  completedLessonIds: Set<string>;
}) {
  const defaultOpenModules = modules.map((m) => m._id);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Progress header - pt-14 on mobile to avoid sheet close button */}
      <div className="p-3 sm:p-4 pt-14 lg:pt-4 border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Course Progress</span>
          <span className="text-sm text-muted-foreground">{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
      </div>

      {/* Curriculum */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          <Accordion type="multiple" defaultValue={defaultOpenModules} className="space-y-2">
            {modules.map((module, moduleIndex) => {
              const lessons = (module.lessons || []) as Lesson[];
              const completedLessonsCount = lessons.filter(l => completedLessonIds.has(l._id)).length;

              return (
                <AccordionItem
                  key={module._id}
                  value={module._id}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-3 sm:px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {moduleIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{module.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedLessonsCount}/{lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 sm:px-4 pb-3">
                    <div className="space-y-1">
                      {lessons.map((lesson) => (
                        <LessonItem
                          key={lesson._id}
                          lesson={lesson}
                          isActive={currentLessonId === lesson._id}
                          isCompleted={completedLessonIds.has(lesson._id)}
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
      </div>
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
                completedLessonIds={completedLessonIds}
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

            {completedLessonIds.has(activeLesson?._id || "") && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </div>
            )}

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
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-4 overflow-x-auto flex-nowrap gap-2">
              <TabsTrigger value="content" className="shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <BookOpen className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="discussion" className="shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="notes" className="shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
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
            completedLessonIds={completedLessonIds}
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
