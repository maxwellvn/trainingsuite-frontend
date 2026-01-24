"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  Clock,
  Reply,
  MoreVertical,
  Trash2,
  Edit,
  Loader2,
  Send,
  ThumbsUp,
  Heart,
} from "lucide-react";
import { T, useT } from "@/components/t";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { forumsApi } from "@/lib/api/forums";
import { getInitials } from "@/lib/utils";
import type { ForumPost, Comment, User } from "@/types";
import { format, parseISO, formatDistanceToNow } from "date-fns";

export default function PostDetailPage() {
  const params = useParams();
  const forumId = params.id as string;
  const postId = params.postId as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => forumsApi.getPost(postId),
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => forumsApi.getComments(postId, 1, 100),
  });

  // Initialize liked state from server response
  useEffect(() => {
    const post = postData?.data;
    if (post?.isLiked) {
      setLikedPosts((prev) => new Set([...prev, post._id]));
    }
  }, [postData]);

  useEffect(() => {
    if (commentsData?.data) {
      const likedIds = new Set<string>();
      commentsData.data.forEach((comment: any) => {
        if (comment.isLiked) likedIds.add(comment._id);
        comment.replies?.forEach((reply: any) => {
          if (reply.isLiked) likedIds.add(reply._id);
        });
      });
      if (likedIds.size > 0) {
        setLikedComments(likedIds);
      }
    }
  }, [commentsData]);

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      forumsApi.createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      setNewComment("");
      setReplyTo(null);
      toast({ title: t("Comment added!") });
    },
    onError: () => {
      toast({ title: t("Failed to add comment"), variant: "destructive" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const isLiked = likedPosts.has(id);
      if (isLiked) {
        return forumsApi.unlikePost(id);
      }
      return forumsApi.likePost(id);
    },
    onMutate: async (id) => {
      // Optimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (_, id) => {
      // Revert on error
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
      toast({ title: t("Failed to update like"), variant: "destructive" });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const isLiked = likedComments.has(commentId);
      if (isLiked) {
        return forumsApi.unlikeComment(commentId);
      }
      return forumsApi.likeComment(commentId);
    },
    onMutate: async (commentId) => {
      // Optimistic update
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
    onError: (_, commentId) => {
      // Revert on error
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
      toast({ title: t("Failed to update like"), variant: "destructive" });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({ title: t("Please enter a comment"), variant: "destructive" });
      return;
    }
    createCommentMutation.mutate({
      content: newComment,
      parentId: replyTo?._id,
    });
  };

  const post = postData?.data;
  const comments = commentsData?.data || [];

  // Helper to get parent ID (handles both object and string)
  const getParentId = (comment: Comment): string | null => {
    if (!comment.parent) return null;
    if (typeof comment.parent === 'string') return comment.parent;
    if (typeof comment.parent === 'object' && comment.parent !== null) {
      return (comment.parent as any)._id || null;
    }
    return null;
  };

  // Organize comments into threads
  const rootComments = comments.filter((c) => !getParentId(c));
  const childComments = comments.filter((c) => getParentId(c));

  const getChildComments = (parentId: string): Comment[] =>
    childComments.filter((c) => getParentId(c) === parentId);

  const isLoading = postLoading || commentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium"><T>Post not found</T></h2>
        <p className="text-muted-foreground mt-1">
          <T>This post may have been removed or doesn&apos;t exist.</T>
        </p>
        <Button asChild className="mt-4">
          <Link href={`/forums/${forumId}`}><T>Back to Forum</T></Link>
        </Button>
      </div>
    );
  }

  const CommentCard = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const isOwner = user?._id === (comment.user as User)?._id;
    const replies = getChildComments(comment._id);

    return (
      <div className={depth > 0 ? "ml-8 border-l-2 border-muted pl-4" : ""}>
        <div className="py-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(comment.user?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.user?.name || "Anonymous"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">(<T>edited</T>)</span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-xs ${likedComments.has(comment._id) ? "text-red-500" : ""}`}
                  onClick={() => likeCommentMutation.mutate(comment._id)}
                >
                  <Heart className={`h-3 w-3 mr-1 ${likedComments.has(comment._id) ? "fill-red-500" : ""}`} />
                  {comment.likes || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setReplyTo(comment)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  <T>Reply</T>
                </Button>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        <T>Edit</T>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        <T>Delete</T>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
        {replies.length > 0 && (
          <div className="space-y-0">
            {replies.map((reply) => (
              <CommentCard key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/forums/${forumId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isPinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
            {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            <h1 className="text-2xl font-bold">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(post.user?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{post.user?.name || "Anonymous"}</span>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 ${likedPosts.has(post._id) ? "text-red-500" : "text-muted-foreground"}`}
                  onClick={() => likePostMutation.mutate(post._id)}
                >
                  <Heart className={`h-4 w-4 mr-1 ${likedPosts.has(post._id) ? "fill-red-500" : ""}`} />
                  <span>{post.likes || 0} <T>likes</T></span>
                </Button>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount || 0} <T>views</T></span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} <T>comments</T></span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {replyTo ? <><T>Reply to</T> {replyTo.user?.name}</> : <T>Add a Comment</T>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {post.isLocked ? (
            <div className="text-center py-4 text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p><T>This discussion is locked and no longer accepting comments.</T></p>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              {replyTo && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                  <span><T>Replying to:</T> &quot;{replyTo.content.substring(0, 50)}...&quot;</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                  >
                    <T>Cancel</T>
                  </Button>
                </div>
              )}
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("Write your comment...")}
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={createCommentMutation.isPending}>
                  {createCommentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <T>Posting...</T>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <T>Post Comment</T>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <T>Comments</T> ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p><T>No comments yet. Be the first to comment!</T></p>
            </div>
          ) : (
            <div className="divide-y">
              {rootComments.map((comment) => (
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
