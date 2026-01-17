"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Plus,
  Search,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { forumsApi } from "@/lib/api/forums";
import { getInitials } from "@/lib/utils";
import type { Forum, ForumPost, User } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function ForumDetailPage() {
  const params = useParams();
  const forumId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  const { data: forumData, isLoading: forumLoading } = useQuery({
    queryKey: ["forum", forumId],
    queryFn: () => forumsApi.getById(forumId),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["forum-posts", forumId],
    queryFn: () => forumsApi.getPosts(forumId, 1, 50),
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      forumsApi.createPost(forumId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts", forumId] });
      setDialogOpen(false);
      setNewPost({ title: "", content: "" });
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const forum = forumData?.data;
  const posts = postsData?.data || [];

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort posts: pinned first, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const isLoading = forumLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Forum not found</h2>
        <p className="text-muted-foreground mt-1">
          This forum may have been removed or doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/forums">Back to Forums</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/forums">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{forum.title}</h1>
            {forum.isGeneral && <Badge variant="secondary">General</Badge>}
          </div>
          {forum.description && (
            <p className="text-muted-foreground">{forum.description}</p>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {sortedPosts.length} discussion{sortedPosts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Posts */}
      {sortedPosts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No discussions yet</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "No discussions match your search"
                : "Be the first to start a discussion!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setDialogOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Start a Discussion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <Link key={post._id} href={`/forums/${forumId}/posts/${post._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(post.user?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.isPinned && (
                          <Pin className="h-4 w-4 text-primary fill-primary" />
                        )}
                        {post.isLocked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold truncate">{post.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.user?.name || "Anonymous"}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* New Post Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
            <DialogDescription>
              Create a new discussion topic in {forum.title}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPost}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Discussion title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Discussion"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
