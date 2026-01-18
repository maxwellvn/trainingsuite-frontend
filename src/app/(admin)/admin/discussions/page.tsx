"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  MessagesSquare,
  Globe,
  BookOpen,
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { forumsApi } from "@/lib/api/forums";
import { coursesApi } from "@/lib/api/courses";
import type { Forum } from "@/types";
import { format, parseISO } from "date-fns";

export default function AdminDiscussionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    isGeneral: true,
  });

  const { data: forumsData, isLoading } = useQuery({
    queryKey: ["admin-forums"],
    queryFn: () => forumsApi.getAll(1, 100),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-select"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => forumsApi.create({
      title: data.title,
      description: data.description || undefined,
      course: data.isGeneral ? undefined : data.course || undefined,
      isGeneral: data.isGeneral,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forums"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Forum created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create forum", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Forum> }) =>
      forumsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forums"] });
      setDialogOpen(false);
      setSelectedForum(null);
      resetForm();
      toast({ title: "Forum updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update forum", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      isGeneral: true,
    });
  };

  const handleEdit = (forum: Forum) => {
    setSelectedForum(forum);
    setFormData({
      title: forum.title,
      description: forum.description || "",
      course: forum.course || "",
      isGeneral: forum.isGeneral || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedForum) {
      updateMutation.mutate({
        id: selectedForum._id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const forums = forumsData?.data || [];
  const courses = coursesData?.data || [];

  const filteredForums = forums.filter((forum) => {
    const matchesSearch = forum.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" ||
      (typeFilter === "general" && forum.isGeneral) ||
      (typeFilter === "course" && !forum.isGeneral);
    return matchesSearch && matchesType;
  });

  const stats = {
    total: forums.length,
    general: forums.filter((f) => f.isGeneral).length,
    courseSpecific: forums.filter((f) => !f.isGeneral).length,
    totalPosts: forums.reduce((acc, f) => acc + (f.postCount || 0), 0),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Discussions</h1>
          <p className="text-muted-foreground mt-1">
            Manage discussion forums across the platform.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedForum(null); setDialogOpen(true); }} className="rounded-none">
          <Plus className="h-4 w-4 mr-2" />
          Create Forum
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.total}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.general}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">General Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-green-200 bg-green-50 text-green-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.courseSpecific}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Course Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{stats.totalPosts}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forums Table */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-heading font-bold uppercase tracking-wide text-lg">All Forums</CardTitle>
              <CardDescription>
                {filteredForums.length} forum{filteredForums.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 rounded-none border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
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
          ) : filteredForums.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No forums found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first discussion forum"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 rounded-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forum
                </Button>
              )}
            </div>
          ) : (
            <div className="border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="font-bold uppercase text-xs tracking-wider pl-6">Forum</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Type</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Posts</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Members</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Created</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForums.map((forum) => (
                    <TableRow key={forum._id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-semibold text-sm">{forum.title}</p>
                          {forum.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[300px] font-mono mt-0.5">
                              {forum.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {forum.isGeneral ? (
                          <Badge variant="outline" className="rounded-none border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase text-[10px] tracking-wide">General</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none border-green-200 bg-green-50 text-green-700 font-bold uppercase text-[10px] tracking-wide">Course</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-sm">
                          <MessagesSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          {forum.postCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {(forum as unknown as { memberCount?: number }).memberCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {forum.createdAt && format(parseISO(forum.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-border">
                            <DropdownMenuItem onClick={() => handleEdit(forum)} className="rounded-none cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedForum(forum);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              {selectedForum ? "Edit Forum" : "Create Forum"}
            </DialogTitle>
            <DialogDescription>
              {selectedForum
                ? "Update the forum details."
                : "Create a new discussion forum."}
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
                  placeholder="Forum title"
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
                  placeholder="Forum description..."
                  rows={3}
                  className="rounded-none border-border resize-none"
                />
              </div>
              {!selectedForum && (
                <>
                  <div className="flex items-center justify-between p-4 border border-border bg-muted/5">
                    <div>
                      <Label htmlFor="isGeneral" className="text-xs font-bold uppercase tracking-wider">General Forum</Label>
                      <p className="text-xs text-muted-foreground mt-1">Platform-wide discussion topic</p>
                    </div>
                    <Switch
                      id="isGeneral"
                      checked={formData.isGeneral}
                      onCheckedChange={(checked) => setFormData({ ...formData, isGeneral: checked })}
                    />
                  </div>
                  {!formData.isGeneral && (
                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Course</Label>
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
                  )}
                </>
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
                  : selectedForum
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
            <DialogTitle className="font-heading uppercase tracking-wide">Delete Forum</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{selectedForum?.title}&quot;</span>?
              <br />This will also delete all posts and comments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-none border-border">
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedForum(null);
                toast({ title: "Forum deleted successfully" });
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
