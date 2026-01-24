"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Video,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Square,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Radio,
  Info,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { coursesApi } from "@/lib/api/courses";
import { uploadApi } from "@/lib/api/upload";
import { detectStreamType } from "@/components/livestream";
import type { LiveSession, LiveSessionStatus, StreamProvider } from "@/types";
import { format, parseISO } from "date-fns";

// Stream provider configuration for user guidance
const STREAM_PROVIDER_CONFIG: Record<StreamProvider, { 
  label: string; 
  placeholder: string; 
  description: string;
  examples: string[];
}> = {
  youtube: {
    label: "YouTube Live",
    placeholder: "https://youtube.com/watch?v=... or https://youtu.be/...",
    description: "Paste a YouTube video or live stream URL. Supports regular videos, live streams, and YouTube Live.",
    examples: [
      "https://youtube.com/watch?v=abc123",
      "https://youtu.be/abc123",
      "https://youtube.com/live/abc123",
    ],
  },
  vimeo: {
    label: "Vimeo",
    placeholder: "https://vimeo.com/123456789",
    description: "Paste a Vimeo video URL. Supports standard videos and Vimeo Live events.",
    examples: [
      "https://vimeo.com/123456789",
      "https://vimeo.com/event/1234567",
    ],
  },
  hls: {
    label: "HLS Stream (M3U8)",
    placeholder: "https://stream.example.com/live/stream.m3u8",
    description: "Paste an HLS manifest URL (.m3u8). Used for self-hosted streams, CDN streams, or RTMP re-streams.",
    examples: [
      "https://cdn.example.com/live/stream.m3u8",
      "https://stream.example.com/hls/live.m3u8",
    ],
  },
  custom: {
    label: "Custom/Direct URL",
    placeholder: "https://example.com/video.mp4",
    description: "Paste any video URL. Supports MP4, WebM, and other direct video files. For RTMP, use a media server to convert to HLS first.",
    examples: [
      "https://example.com/video.mp4",
      "https://cdn.example.com/video.webm",
    ],
  },
};

export default function AdminLiveSessionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    scheduledAt: "",
    duration: 60,
    streamUrl: "",
    streamProvider: "youtube" as StreamProvider,
    maxAttendees: 100,
    thumbnail: "",
    // Toggle states for optional fields
    hasDurationLimit: false,
    hasMaxAttendees: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["admin-live-sessions", statusFilter],
    queryFn: () => liveSessionsApi.getAll(1, 50, statusFilter !== "all" ? statusFilter : undefined),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-select"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData & { thumbnail?: string }) => liveSessionsApi.create({
      title: data.title,
      description: data.description || undefined,
      course: data.course || undefined,
      // Convert datetime-local format to ISO string
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      // Only include duration if toggle is enabled
      duration: data.hasDurationLimit ? data.duration : undefined,
      streamUrl: data.streamUrl || undefined,
      streamProvider: data.streamProvider,
      // Only include maxAttendees if toggle is enabled
      maxAttendees: data.hasMaxAttendees ? data.maxAttendees : undefined,
      thumbnail: data.thumbnail || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Live session created successfully" });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Failed to create session";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LiveSession> }) =>
      liveSessionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      setDialogOpen(false);
      setSelectedSession(null);
      resetForm();
      toast({ title: "Session updated successfully" });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Failed to update session";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => liveSessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      setDeleteDialogOpen(false);
      setSelectedSession(null);
      toast({ title: "Session deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete session", variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => liveSessionsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      toast({ title: "Session started" });
    },
    onError: () => {
      toast({ title: "Failed to start session", variant: "destructive" });
    },
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => liveSessionsApi.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      toast({ title: "Session ended" });
    },
    onError: () => {
      toast({ title: "Failed to end session", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      scheduledAt: "",
      duration: 60,
      streamUrl: "",
      streamProvider: "youtube",
      maxAttendees: 100,
      thumbnail: "",
      hasDurationLimit: false,
      hasMaxAttendees: false,
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File size must be less than 5MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Please select an image file", variant: "destructive" });
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (session: LiveSession) => {
    setSelectedSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      course: session.course?._id || "",
      scheduledAt: format(parseISO(session.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
      duration: session.duration || 60,
      streamUrl: session.streamUrl || "",
      streamProvider: session.streamProvider,
      maxAttendees: session.maxAttendees || 100,
      thumbnail: session.thumbnail || "",
      hasDurationLimit: !!session.duration,
      hasMaxAttendees: !!session.maxAttendees,
    });
    setThumbnailFile(null);
    setThumbnailPreview(session.thumbnail || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let thumbnailUrl = formData.thumbnail;

    // Upload thumbnail if a file was selected
    if (thumbnailFile) {
      try {
        setIsUploadingThumbnail(true);
        const uploadResponse = await uploadApi.uploadThumbnail(thumbnailFile);
        thumbnailUrl = uploadResponse.data?.fileUrl || "";
      } catch {
        toast({ title: "Failed to upload thumbnail", variant: "destructive" });
        setIsUploadingThumbnail(false);
        return;
      }
      setIsUploadingThumbnail(false);
    }

    if (selectedSession) {
      updateMutation.mutate({
        id: selectedSession._id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          // Convert datetime-local format to ISO string
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          // Only include duration if toggle is enabled
          duration: formData.hasDurationLimit ? formData.duration : undefined,
          streamUrl: formData.streamUrl || undefined,
          streamProvider: formData.streamProvider,
          // Only include maxAttendees if toggle is enabled
          maxAttendees: formData.hasMaxAttendees ? formData.maxAttendees : undefined,
          thumbnail: thumbnailUrl || undefined,
        },
      });
    } else {
      createMutation.mutate({ ...formData, thumbnail: thumbnailUrl });
    }
  };

  const sessions = sessionsData?.data || [];
  const courses = coursesData?.data || [];
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: LiveSessionStatus) => {
    switch (status) {
      case "live":
        return <Badge className="rounded-none bg-red-600 animate-pulse font-bold uppercase text-[10px] tracking-wide border-0">Live</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="rounded-none border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase text-[10px] tracking-wide">Scheduled</Badge>;
      case "ended":
        return <Badge variant="secondary" className="rounded-none font-bold uppercase text-[10px] tracking-wide border-border border">Ended</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="rounded-none border-border font-bold uppercase text-[10px] tracking-wide">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-none border-border font-bold uppercase text-[10px] tracking-wide">{status}</Badge>;
    }
  };

  const stats = {
    total: sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    live: sessions.filter((s) => s.status === "live").length,
    ended: sessions.filter((s) => s.status === "ended").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Live Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage live streaming sessions across the platform.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedSession(null); setDialogOpen(true); }} className="rounded-none">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.total}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.scheduled}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-red-200 bg-red-50 text-red-600">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.live}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-600">
                <Square className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.ended}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-heading font-bold uppercase tracking-wide text-lg">All Sessions</CardTitle>
              <CardDescription>
                {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 rounded-none border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-none" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No sessions found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Schedule your first live session"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 rounded-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              )}
            </div>
          ) : (
            <div className="border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="font-bold uppercase text-xs tracking-wider pl-6">Session</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Scheduled</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Duration</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Attendees</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session._id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-semibold text-sm">{session.title}</p>
                          {session.course && (
                            <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                              {session.course.title}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {format(parseISO(session.scheduledAt), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(parseISO(session.scheduledAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {session.duration ? `${session.duration} min` : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {session.attendeeCount || 0}
                          {session.maxAttendees ? (
                            <span className="text-muted-foreground/50">
                              /{session.maxAttendees}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">
                              /∞
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {session.status === "scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => startMutation.mutate(session._id)}
                              disabled={startMutation.isPending}
                              className="rounded-none h-8 text-xs font-bold uppercase tracking-wider"
                            >
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Start
                            </Button>
                          )}
                          {session.status === "live" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => endMutation.mutate(session._id)}
                              disabled={endMutation.isPending}
                              className="rounded-none h-8 text-xs font-bold uppercase tracking-wider"
                            >
                              <Square className="h-3.5 w-3.5 mr-1" />
                              End
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-border">
                              {session.streamUrl && (
                                <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                                  <a href={session.streamUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Stream
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEdit(session)} className="rounded-none cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSession(session);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-none border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-wide">
              {selectedSession ? "Edit Session" : "Schedule Live Session"}
            </DialogTitle>
            <DialogDescription>
              {selectedSession
                ? "Update the session details."
                : "Schedule a new live streaming session."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Session title"
                  required
                  className="rounded-none border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Session description..."
                  rows={3}
                  className="rounded-none border-border resize-none"
                />
              </div>
              
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thumbnail</Label>
                <div className="space-y-3">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full aspect-video object-cover border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-none"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview("");
                          setFormData({ ...formData, thumbnail: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="session-thumbnail-upload"
                      className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                    </label>
                  )}
                  <input
                    id="session-thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                  {!thumbnailPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-none border-border"
                      onClick={() => document.getElementById("session-thumbnail-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Thumbnail
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1280x720px (16:9 ratio)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Course (Optional)</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger className="rounded-none border-border">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date & Time and Stream Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                    className="rounded-none border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streamProvider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stream Provider</Label>
                  <Select
                    value={formData.streamProvider}
                    onValueChange={(value: StreamProvider) => setFormData({ ...formData, streamProvider: value, streamUrl: "" })}
                  >
                    <SelectTrigger className="rounded-none border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5" />
                          YouTube Live
                        </div>
                      </SelectItem>
                      <SelectItem value="vimeo">
                        <div className="flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5" />
                          Vimeo
                        </div>
                      </SelectItem>
                      <SelectItem value="hls">
                        <div className="flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5" />
                          HLS Stream (M3U8)
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5" />
                          Custom/Direct URL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional: Duration Limit Toggle */}
              <div className="space-y-3 p-3 sm:p-4 border border-border rounded-none bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-xs font-bold uppercase tracking-wider">Duration Limit</Label>
                    <p className="text-xs text-muted-foreground">
                      Set a fixed duration for the session. If disabled, the session runs until manually ended.
                    </p>
                  </div>
                  <Switch
                    checked={formData.hasDurationLimit}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDurationLimit: checked })}
                  />
                </div>
                {formData.hasDurationLimit && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                      className="rounded-none border-border"
                    />
                  </div>
                )}
              </div>

              {/* Optional: Max Attendees Toggle */}
              <div className="space-y-3 p-3 sm:p-4 border border-border rounded-none bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-xs font-bold uppercase tracking-wider">Attendee Limit</Label>
                    <p className="text-xs text-muted-foreground">
                      Limit the number of people who can join. If disabled, unlimited attendees can join.
                    </p>
                  </div>
                  <Switch
                    checked={formData.hasMaxAttendees}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMaxAttendees: checked })}
                  />
                </div>
                {formData.hasMaxAttendees && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="maxAttendees" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 100 })}
                      className="rounded-none border-border"
                    />
                  </div>
                )}
              </div>
              
              {/* Stream URL with provider-specific guidance */}
              <div className="space-y-2">
                <Label htmlFor="streamUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stream URL</Label>
                <Input
                  id="streamUrl"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  placeholder={STREAM_PROVIDER_CONFIG[formData.streamProvider].placeholder}
                  className="rounded-none border-border font-mono text-sm"
                />
                <Alert className="rounded-none border-border bg-muted/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <p className="mb-1">{STREAM_PROVIDER_CONFIG[formData.streamProvider].description}</p>
                    <p className="text-muted-foreground">
                      Examples: {STREAM_PROVIDER_CONFIG[formData.streamProvider].examples.slice(0, 2).join(", ")}
                    </p>
                  </AlertDescription>
                </Alert>
                {/* Auto-detect stream type feedback */}
                {formData.streamUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Detected:</span>
                    <Badge variant="outline" className="rounded-none text-[10px] font-mono uppercase">
                      {detectStreamType(formData.streamUrl)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none border-border w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || isUploadingThumbnail}
                className="rounded-none w-full sm:w-auto"
              >
                {isUploadingThumbnail
                  ? "Uploading..."
                  : createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : selectedSession
                      ? "Update"
                      : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-wide">Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{selectedSession?.title}&quot;</span>?
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-none border-border w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground w-full sm:w-auto"
              onClick={() => {
                if (selectedSession) {
                  deleteMutation.mutate(selectedSession._id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
