"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Clock,
  Plus,
  TrendingUp,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { T, useT } from "@/components/t";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { forumsApi } from "@/lib/api/forums";
import { getInitials } from "@/lib/utils";
import type { Forum, ForumPost, User } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

type SortOption = "recent" | "popular" | "unanswered";

export default function CommunityPage() {
  const { t } = useT();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForum, setSelectedForum] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", forumId: "" });

  // Fetch all forums
  const { data: forumsData, isLoading: forumsLoading } = useQuery({
    queryKey: ["forums"],
    queryFn: () => forumsApi.getAll(1, 50),
  });

  const forums = forumsData?.data || [];

  // Fetch posts from all forums
  const { data: allPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ["all-forum-posts", selectedForum],
    queryFn: async () => {
      if (selectedForum !== "all") {
        const response = await forumsApi.getPosts(selectedForum, 1, 50);
        return response.data || [];
      }
      // Fetch posts from all forums
      const allPosts: ForumPost[] = [];
      for (const forum of forums) {
        try {
          const response = await forumsApi.getPosts(forum._id, 1, 20);
          const posts = response.data || [];
          allPosts.push(...posts.map(p => ({ ...p, forum })));
        } catch (e) {
          // Skip failed forums
        }
      }
      return allPosts;
    },
    enabled: forums.length > 0 || selectedForum !== "all",
  });

  const allPosts = allPostsData || [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string; forumId: string }) =>
      forumsApi.createPost(data.forumId, { title: data.title, content: data.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-forum-posts"] });
      setDialogOpen(false);
      setNewPost({ title: "", content: "", forumId: "" });
      toast({ title: t("Question posted successfully!") });
    },
    onError: () => {
      toast({ title: t("Failed to post question"), variant: "destructive" });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.forumId) {
      toast({ title: t("Please fill in all fields"), variant: "destructive" });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  // Filter and sort posts
  const filteredPosts = allPosts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return ((b as any).likes || 0) - ((a as any).likes || 0);
      }
      if (sortBy === "unanswered") {
        // Posts with no comments first
        if ((a.commentCount || 0) === 0 && (b.commentCount || 0) > 0) return -1;
        if ((b.commentCount || 0) === 0 && (a.commentCount || 0) > 0) return 1;
      }
      // Default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const isLoading = forumsLoading || postsLoading;

  const PostCard = ({ post }: { post: ForumPost & { forum?: Forum } }) => {
    const author = post.user as User;
    const forumInfo = post.forum || forums.find(f => f._id === (post as any).forumId);
    
    return (
      <Card className="hover:shadow-md transition-all border-border bg-card">
        <CardContent className="p-0">
          <div className="flex">
            {/* Vote Section */}
            <div className="flex flex-col items-center py-4 px-3 bg-muted/30 border-r border-border">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className="text-sm font-semibold py-1">{(post as any).likes || 0}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <Link href={`/forums/${(post as any).forumId || forumInfo?._id}/posts/${post._id}`}>
                <h3 className="font-semibold text-base hover:text-primary transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.content}
              </p>

              {/* Meta info */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(author?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{author?.name || "Anonymous"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {forumInfo && (
                    <Badge variant="outline" className="text-xs">
                      {forumInfo.title}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{post.commentCount || 0} <T>answers</T></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight"><T>Community</T></h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            <T>Ask questions, share knowledge, and connect with others.</T>
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          <T>Ask Question</T>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search questions...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Topic Filter */}
        <Select value={selectedForum} onValueChange={setSelectedForum}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("All Topics")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all"><T>All Topics</T></SelectItem>
            {forums.map((forum) => (
              <SelectItem key={forum._id} value={forum._id}>
                {forum.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent"><T>Most Recent</T></SelectItem>
            <SelectItem value="popular"><T>Most Popular</T></SelectItem>
            <SelectItem value="unanswered"><T>Unanswered</T></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter badge */}
      {selectedForum !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground"><T>Filtering by:</T></span>
          <Badge variant="secondary" className="gap-1">
            {forums.find(f => f._id === selectedForum)?.title}
            <button onClick={() => setSelectedForum("all")} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-14 py-4 px-3 bg-muted/30 border-r">
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? <T>No questions found</T> : <T>No questions yet</T>}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery 
                ? <T>Try adjusting your search or filters.</T>
                : <T>Be the first to ask a question!</T>
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <T>Ask Question</T>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!isLoading && filteredPosts.length > 0 && (
        <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{filteredPosts.length} <T>questions</T></span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{forums.length} <T>topics</T></span>
          </div>
        </div>
      )}

      {/* Ask Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle><T>Ask a Question</T></DialogTitle>
            <DialogDescription>
              <T>Share your question with the community.</T>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPost}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forum"><T>Topic</T></Label>
                <Select value={newPost.forumId} onValueChange={(v) => setNewPost({ ...newPost, forumId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a topic")} />
                  </SelectTrigger>
                  <SelectContent>
                    {forums.map((forum) => (
                      <SelectItem key={forum._id} value={forum._id}>
                        {forum.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title"><T>Question</T></Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder={t("What would you like to know?")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content"><T>Details</T></Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder={t("Provide more context or details...")}
                  rows={5}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                <T>Cancel</T>
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <T>Posting...</T>
                  </>
                ) : (
                  <T>Post Question</T>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
