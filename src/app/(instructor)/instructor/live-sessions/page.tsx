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
import { useToast } from "@/hooks/use-toast";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { coursesApi } from "@/lib/api/courses";
import type { LiveSession, LiveSessionStatus, StreamProvider } from "@/types";
import { format, parseISO, isAfter, isBefore, addMinutes } from "date-fns";

export default function InstructorLiveSessionsPage() {
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
  });

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["instructor-live-sessions", statusFilter],
    queryFn: () => liveSessionsApi.getAll(1, 50, statusFilter !== "all" ? statusFilter : undefined),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["instructor-courses-select"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => liveSessionsApi.create({
      title: data.title,
      description: data.description || undefined,
      course: data.course || undefined,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      streamUrl: data.streamUrl || undefined,
      streamProvider: data.streamProvider,
      maxAttendees: data.maxAttendees,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-live-sessions"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Live session created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create session", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LiveSession> }) =>
      liveSessionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-live-sessions"] });
      setDialogOpen(false);
      setSelectedSession(null);
      resetForm();
      toast({ title: "Session updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update session", variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => liveSessionsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-live-sessions"] });
      toast({ title: "Session started" });
    },
    onError: () => {
      toast({ title: "Failed to start session", variant: "destructive" });
    },
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => liveSessionsApi.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-live-sessions"] });
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
    });
  };

  const handleEdit = (session: LiveSession) => {
    setSelectedSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      course: session.course?._id || "",
      scheduledAt: format(parseISO(session.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
      duration: session.duration,
      streamUrl: session.streamUrl || "",
      streamProvider: session.streamProvider,
      maxAttendees: session.maxAttendees || 100,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSession) {
      updateMutation.mutate({
        id: selectedSession._id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          scheduledAt: formData.scheduledAt,
          duration: formData.duration,
          streamUrl: formData.streamUrl || undefined,
          streamProvider: formData.streamProvider,
          maxAttendees: formData.maxAttendees,
        },
      });
    } else {
      createMutation.mutate(formData);
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
        return <Badge className="bg-red-600 animate-pulse">Live</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-600">Scheduled</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    live: sessions.filter((s) => s.status === "live").length,
    ended: sessions.filter((s) => s.status === "ended").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Sessions</h1>
          <p className="text-muted-foreground">
            Schedule and manage live streaming sessions.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedSession(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Play className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.live}</p>
                <p className="text-sm text-muted-foreground">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Square className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ended}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>
                {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
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
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sessions found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Schedule your first live session"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.title}</p>
                        {session.course && (
                          <p className="text-sm text-muted-foreground">
                            {session.course.title}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(session.scheduledAt), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(parseISO(session.scheduledAt), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {session.attendeeCount || 0}
                        {session.maxAttendees && (
                          <span className="text-muted-foreground">
                            /{session.maxAttendees}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {session.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => startMutation.mutate(session._id)}
                            disabled={startMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {session.status === "live" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => endMutation.mutate(session._id)}
                            disabled={endMutation.isPending}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            End
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {session.streamUrl && (
                              <DropdownMenuItem asChild>
                                <a href={session.streamUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open Stream
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(session)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSession(session);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Session title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Session description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Related Course (Optional)</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No course</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streamProvider">Stream Provider</Label>
                  <Select
                    value={formData.streamProvider}
                    onValueChange={(value: StreamProvider) => setFormData({ ...formData, streamProvider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 100 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="streamUrl">Stream URL</Label>
                <Input
                  id="streamUrl"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSession?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Delete mutation would go here
                setDeleteDialogOpen(false);
                setSelectedSession(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
