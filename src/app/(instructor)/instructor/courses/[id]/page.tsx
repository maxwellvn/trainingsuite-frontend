"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  BookOpen,
  Settings,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { coursesApi, UpdateCourseData } from "@/lib/api/courses";
import { modulesApi, lessonsApi, CreateModuleData, CreateLessonData } from "@/lib/api/lessons";
import { categoriesApi } from "@/lib/api/categories";
import type { Course, Module, Lesson, CourseLevel } from "@/types";

export default function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [moduleForm, setModuleForm] = useState<CreateModuleData>({
    title: "",
    description: "",
  });

  const [lessonForm, setLessonForm] = useState<CreateLessonData>({
    title: "",
    description: "",
    content: "",
    type: "video",
    videoUrl: "",
    videoDuration: 0,
    isFree: false,
  });

  // Queries
  const { data: courseResponse, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesApi.getById(courseId),
  });

  const { data: curriculumResponse, isLoading: curriculumLoading } = useQuery({
    queryKey: ["course-curriculum", courseId],
    queryFn: () => coursesApi.getCurriculum(courseId),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  // Mutations
  const updateCourseMutation = useMutation({
    mutationFn: (data: UpdateCourseData) => coursesApi.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast({ title: "Course updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: CreateModuleData) => modulesApi.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      setModuleDialogOpen(false);
      setModuleForm({ title: "", description: "" });
      toast({ title: "Module created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create module", variant: "destructive" });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateModuleData }) =>
      modulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      setModuleDialogOpen(false);
      setEditingModule(null);
      setModuleForm({ title: "", description: "" });
      toast({ title: "Module updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update module", variant: "destructive" });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => modulesApi.delete(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      toast({ title: "Module deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete module", variant: "destructive" });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: CreateLessonData }) =>
      lessonsApi.create(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      setLessonDialogOpen(false);
      setSelectedModuleId(null);
      setLessonForm({
        title: "",
        description: "",
        content: "",
        type: "video",
        videoUrl: "",
        videoDuration: 0,
        isFree: false,
      });
      toast({ title: "Lesson created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create lesson", variant: "destructive" });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLessonData }) =>
      lessonsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setLessonForm({
        title: "",
        description: "",
        content: "",
        type: "video",
        videoUrl: "",
        videoDuration: 0,
        isFree: false,
      });
      toast({ title: "Lesson updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update lesson", variant: "destructive" });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsApi.delete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-curriculum", courseId] });
      toast({ title: "Lesson deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete lesson", variant: "destructive" });
    },
  });

  const course = courseResponse?.data;
  const curriculumData = curriculumResponse?.data as { curriculum?: Module[] } | undefined;
  const modules = (curriculumData?.curriculum || []) as Module[];
  const categories = categoriesData?.data || [];

  const isLoading = courseLoading || curriculumLoading;

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleOpenModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description || "" });
    } else {
      setEditingModule(null);
      setModuleForm({ title: "", description: "" });
    }
    setModuleDialogOpen(true);
  };

  const handleOpenLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        type: lesson.type || "video",
        videoUrl: lesson.videoUrl || "",
        videoDuration: lesson.videoDuration || 0,
        isFree: lesson.isFree || false,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: "",
        description: "",
        content: "",
        type: "video",
        videoUrl: "",
        videoDuration: 0,
        isFree: false,
      });
    }
    setLessonDialogOpen(true);
  };

  const handleModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      toast({ title: "Module title is required", variant: "destructive" });
      return;
    }
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule._id, data: moduleForm });
    } else {
      createModuleMutation.mutate(moduleForm);
    }
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      toast({ title: "Lesson title is required", variant: "destructive" });
      return;
    }
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson._id, data: lessonForm });
    } else if (selectedModuleId) {
      createLessonMutation.mutate({ moduleId: selectedModuleId, data: lessonForm });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Course not found</h2>
        <Button asChild className="mt-4">
          <Link href="/instructor/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/instructor/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={course.status === "published" ? "default" : "secondary"}
              >
                {course.status}
              </Badge>
              {course.isFree ? (
                <Badge variant="outline">Free</Badge>
              ) : (
                <Badge variant="outline">${course.price}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${course.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList>
          <TabsTrigger value="curriculum">
            <BookOpen className="h-4 w-4 mr-2" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    Organize your course content into modules and lessons.
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenModuleDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No modules yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Start building your course by adding a module.
                  </p>
                  <Button onClick={() => handleOpenModuleDialog()} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Module
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => {
                    const lessons = (module.lessons || []) as Lesson[];
                    const isExpanded = expandedModules.includes(module._id);

                    return (
                      <Collapsible
                        key={module._id}
                        open={isExpanded}
                        onOpenChange={() => toggleModule(module._id)}
                      >
                        <div className="border rounded-lg">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                  {moduleIndex + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{module.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModuleDialog(module);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Module
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenLessonDialog(module._id);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Lesson
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this module?")) {
                                          deleteModuleMutation.mutate(module._id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Module
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t px-4 pb-4">
                              {lessons.length === 0 ? (
                                <div className="text-center py-6">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    No lessons in this module
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenLessonDialog(module._id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Lesson
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2 mt-4">
                                  {lessons.map((lesson, lessonIndex) => (
                                    <div
                                      key={lesson._id}
                                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                        <div className="text-muted-foreground">
                                          {getLessonIcon(lesson.type || "text")}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-xs">
                                              {lesson.type || "text"}
                                            </Badge>
                                            {lesson.duration && (
                                              <span className="text-xs text-muted-foreground">
                                                {lesson.duration} min
                                              </span>
                                            )}
                                            {lesson.isFree && (
                                              <Badge variant="secondary" className="text-xs">
                                                Free Preview
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleOpenLessonDialog(module._id, lesson)
                                            }
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Lesson
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => {
                                              if (
                                                confirm("Are you sure you want to delete this lesson?")
                                              ) {
                                                deleteLessonMutation.mutate(lesson._id);
                                              }
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Lesson
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleOpenLessonDialog(module._id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Lesson
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Update your course details and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={course.status}
                    onValueChange={(value) =>
                      updateCourseMutation.mutate({ status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={typeof course.category === "object" ? course.category._id : course.category}
                    onValueChange={(value) =>
                      updateCourseMutation.mutate({ category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select
                    value={course.level}
                    onValueChange={(value: CourseLevel) =>
                      updateCourseMutation.mutate({ level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={course.isFree}
                      onCheckedChange={(checked) =>
                        updateCourseMutation.mutate({
                          isFree: checked,
                          price: checked ? 0 : course.price,
                        })
                      }
                    />
                    <span className="text-sm">Free Course</span>
                  </div>
                  {!course.isFree && (
                    <Input
                      type="number"
                      value={course.price}
                      onChange={(e) =>
                        updateCourseMutation.mutate({
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Edit Module" : "Add New Module"}
            </DialogTitle>
            <DialogDescription>
              {editingModule
                ? "Update the module details."
                : "Create a new module for your course."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleModuleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="moduleTitle">Title *</Label>
                <Input
                  id="moduleTitle"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, title: e.target.value })
                  }
                  placeholder="Enter module title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleDescription">Description</Label>
                <Textarea
                  id="moduleDescription"
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, description: e.target.value })
                  }
                  placeholder="Enter module description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModuleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createModuleMutation.isPending || updateModuleMutation.isPending
                }
              >
                {(createModuleMutation.isPending || updateModuleMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson details."
                : "Create a new lesson for this module."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLessonSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lessonTitle">Title *</Label>
                  <Input
                    id="lessonTitle"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonType">Type</Label>
                  <Select
                    value={lessonForm.type}
                    onValueChange={(value: "video" | "text" | "quiz") =>
                      setLessonForm({ ...lessonForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text/Article</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonDescription">Description</Label>
                <Textarea
                  id="lessonDescription"
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, description: e.target.value })
                  }
                  placeholder="Brief description of the lesson"
                  rows={2}
                />
              </div>

              {lessonForm.type === "video" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={lessonForm.videoUrl}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={lessonForm.videoDuration}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          videoDuration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {lessonForm.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="lessonContent">Content</Label>
                  <Textarea
                    id="lessonContent"
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, content: e.target.value })
                    }
                    placeholder="Write your lesson content here..."
                    rows={8}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="isFree"
                  checked={lessonForm.isFree}
                  onCheckedChange={(checked) =>
                    setLessonForm({ ...lessonForm, isFree: checked })
                  }
                />
                <Label htmlFor="isFree">Free Preview</Label>
                <span className="text-sm text-muted-foreground">
                  (Allow non-enrolled users to access this lesson)
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLessonDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createLessonMutation.isPending || updateLessonMutation.isPending
                }
              >
                {(createLessonMutation.isPending || updateLessonMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingLesson ? "Update Lesson" : "Create Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
