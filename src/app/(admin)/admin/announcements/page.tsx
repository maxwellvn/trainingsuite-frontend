"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api/admin";
import type { Announcement, AnnouncementPriority } from "@/types";
import { format, parseISO, isAfter, isBefore } from "date-fns";

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium" as AnnouncementPriority,
    startsAt: "",
    expiresAt: "",
    isActive: true,
  });

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => adminApi.getAnnouncements(1, 50),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createAnnouncement({
      title: data.title,
      content: data.content,
      priority: data.priority,
      startsAt: data.startsAt || undefined,
      expiresAt: data.expiresAt || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Announcement created and sent to all users!" });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to create announcement";
      toast({ title: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      adminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDialogOpen(false);
      setSelectedAnnouncement(null);
      resetForm();
      toast({ title: "Announcement updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update announcement", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      toast({ title: "Announcement deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete announcement", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "medium",
      startsAt: "",
      expiresAt: "",
      isActive: true,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      startsAt: announcement.startsAt ? format(parseISO(announcement.startsAt), "yyyy-MM-dd'T'HH:mm") : "",
      expiresAt: announcement.expiresAt ? format(parseISO(announcement.expiresAt), "yyyy-MM-dd'T'HH:mm") : "",
      isActive: announcement.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnnouncement) {
      updateMutation.mutate({
        id: selectedAnnouncement._id,
        data: {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          startsAt: formData.startsAt || undefined,
          expiresAt: formData.expiresAt || undefined,
          isActive: formData.isActive,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedAnnouncement) {
      deleteMutation.mutate(selectedAnnouncement._id);
    }
  };

  const toggleActive = (announcement: Announcement) => {
    updateMutation.mutate({
      id: announcement._id,
      data: { isActive: !announcement.isActive },
    });
  };

  const announcements = announcementsData?.data || [];
  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    const startsAt = announcement.startsAt ? parseISO(announcement.startsAt) : null;
    const expiresAt = announcement.expiresAt ? parseISO(announcement.expiresAt) : null;

    if (!announcement.isActive) {
      return <Badge variant="secondary" className="rounded-none font-bold uppercase text-[10px] tracking-wide border-border border">Inactive</Badge>;
    }
    if (startsAt && isAfter(startsAt, now)) {
      return <Badge variant="outline" className="rounded-none border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase text-[10px] tracking-wide">Scheduled</Badge>;
    }
    if (expiresAt && isBefore(expiresAt, now)) {
      return <Badge variant="secondary" className="rounded-none font-bold uppercase text-[10px] tracking-wide border-border border">Expired</Badge>;
    }
    return <Badge className="rounded-none bg-green-100 text-green-700 border-green-200 border font-bold uppercase text-[10px] tracking-wide hover:bg-green-100">Active</Badge>;
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="rounded-none font-bold uppercase text-[10px] tracking-wide">High</Badge>;
      case "medium":
        return <Badge className="rounded-none bg-amber-100 text-amber-700 border-amber-200 border font-bold uppercase text-[10px] tracking-wide hover:bg-amber-100">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="rounded-none border-border font-bold uppercase text-[10px] tracking-wide">Low</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-none border-border font-bold uppercase text-[10px] tracking-wide">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform announcements and notifications.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedAnnouncement(null); setDialogOpen(true); }} className="rounded-none">
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{announcements.length}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-green-200 bg-green-50 text-green-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">
                  {announcements.filter((a) => a.isActive).length}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Active</p>
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
                <div className="text-3xl font-light text-foreground">
                  {announcements.filter((a) => {
                    const startsAt = a.startsAt ? parseISO(a.startsAt) : null;
                    return startsAt && isAfter(startsAt, new Date());
                  }).length}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-red-200 bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">
                  {announcements.filter((a) => a.priority === "high").length}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-heading font-bold uppercase tracking-wide text-lg">All Announcements</CardTitle>
              <CardDescription>
                {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
              />
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
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No announcements</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "No announcements match your search" : "Create your first announcement"}
              </p>
              {!searchQuery && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 rounded-none">
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              )}
            </div>
          ) : (
            <div className="border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="font-bold uppercase text-xs tracking-wider pl-6">Title</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Priority</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Schedule</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Created</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement._id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6">
                        <div className="max-w-[300px]">
                          <p className="font-semibold text-sm truncate">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                            {announcement.content.substring(0, 60)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                      <TableCell>{getStatusBadge(announcement)}</TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          {announcement.startsAt && (
                            <p className="text-foreground">Starts: {format(parseISO(announcement.startsAt), "MMM d, yyyy")}</p>
                          )}
                          {announcement.expiresAt && (
                            <p className="text-muted-foreground">
                              Expires: {format(parseISO(announcement.expiresAt), "MMM d, yyyy")}
                            </p>
                          )}
                          {!announcement.startsAt && !announcement.expiresAt && (
                            <span className="text-muted-foreground/50 italic">No schedule</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {format(parseISO(announcement.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={announcement.isActive}
                            onCheckedChange={() => toggleActive(announcement)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-border">
                              <DropdownMenuItem onClick={() => handleEdit(announcement)} className="rounded-none cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAnnouncement(announcement);
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
        <DialogContent className="max-w-lg rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-wide">
              {selectedAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {selectedAnnouncement
                ? "Update the announcement details."
                : "Create a new announcement for platform users."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  required
                  className="rounded-none border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content..."
                  rows={4}
                  required
                  className="rounded-none border-border resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: AnnouncementPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="rounded-none border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starts At (Optional)</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>
              </div>
              {selectedAnnouncement && (
                <div className="flex items-center justify-between p-4 border border-border bg-muted/5 mt-2">
                  <Label htmlFor="isActive" className="text-xs font-bold uppercase tracking-wider">Active Status</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none border-border">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-none"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : selectedAnnouncement
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-wide">Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedAnnouncement?.title}"</span>?
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-none border-border">
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground"
              onClick={handleDelete}
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
