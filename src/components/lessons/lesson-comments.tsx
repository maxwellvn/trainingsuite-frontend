"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare,
    Send,
    Reply,
    Trash2,
    Edit2,
    MoreVertical,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";
import { getInitials } from "@/lib/utils";
import { T, useT } from "@/components/t";

interface Comment {
    _id: string;
    content: string;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
    replies?: Comment[];
}

interface LessonCommentsProps {
    lessonId: string;
}

export function LessonComments({ lessonId }: LessonCommentsProps) {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { t } = useT();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    // Fetch comments
    const { data: commentsResponse, isLoading } = useQuery({
        queryKey: ["lesson-comments", lessonId],
        queryFn: async () => {
            const response = await apiClient.get<{
                success: boolean;
                data: Comment[];
            }>(`/lessons/${lessonId}/comments`);
            return response.data;
        },
        enabled: !!lessonId,
    });

    const comments = commentsResponse?.data || [];

    // Create comment mutation
    const createMutation = useMutation({
        mutationFn: async ({ content, parent }: { content: string; parent?: string }) => {
            const response = await apiClient.post(`/lessons/${lessonId}/comments`, {
                content,
                parent,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            setNewComment("");
            setReplyContent("");
            setReplyingTo(null);
            toast({ title: t("Comment added!") });
        },
        onError: () => {
            toast({ title: t("Failed to add comment"), variant: "destructive" });
        },
    });

    // Delete comment mutation
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await apiClient.delete(`/comments/${commentId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            toast({ title: t("Comment deleted") });
        },
        onError: () => {
            toast({ title: t("Failed to delete comment"), variant: "destructive" });
        },
    });

    // Edit comment mutation
    const editMutation = useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
            const response = await apiClient.put(`/comments/${commentId}`, { content });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            setEditingId(null);
            setEditContent("");
            toast({ title: t("Comment updated!") });
        },
        onError: () => {
            toast({ title: t("Failed to update comment"), variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        createMutation.mutate({ content: newComment });
    };

    const handleReply = (parentId: string) => {
        if (!replyContent.trim()) return;
        createMutation.mutate({ content: replyContent, parent: parentId });
    };

    const handleEdit = (commentId: string) => {
        if (!editContent.trim()) return;
        editMutation.mutate({ commentId, content: editContent });
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t("Just now");
        if (diffMins < 60) return `${diffMins}${t("m ago")}`;
        if (diffHours < 24) return `${diffHours}${t("h ago")}`;
        if (diffDays < 7) return `${diffDays}${t("d ago")}`;
        return d.toLocaleDateString();
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
        const isOwner = user?._id === comment.user?._id;
        const isEditing = editingId === comment._id;

        return (
            <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback className="text-xs">
                        {getInitials(comment.user?.name || "U")}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                        </span>
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                                        <MoreVertical className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingId(comment._id);
                                                setEditContent(comment.content);
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            <T>Edit</T>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => deleteMutation.mutate(comment._id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            <T>Delete</T>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mt-2 space-y-2">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={2}
                                className="text-sm"
                            />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleEdit(comment._id)}
                                        disabled={editMutation.isPending}
                                    >
                                        {editMutation.isPending && (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        )}
                                        <T>Save</T>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditContent("");
                                        }}
                                    >
                                        <T>Cancel</T>
                                    </Button>
                                </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm mt-1">{comment.content}</p>
                            {!isReply && isAuthenticated && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 mt-1 text-xs"
                                    onClick={() => {
                                        setReplyingTo(replyingTo === comment._id ? null : comment._id);
                                        setReplyContent("");
                                    }}
                                >
                                    <Reply className="h-3 w-3 mr-1" />
                                    <T>Reply</T>
                                </Button>
                            )}
                        </>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment._id && (
                        <div className="mt-3 flex gap-2">
                            <Textarea
                                placeholder={t("Write a reply...")}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={2}
                                className="text-sm"
                            />
                            <div className="flex flex-col gap-1">
                                <Button
                                    size="sm"
                                    onClick={() => handleReply(comment._id)}
                                    disabled={createMutation.isPending || !replyContent.trim()}
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    <T>Cancel</T>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply._id} comment={reply} isReply />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="text-xs">
                                {getInitials(user?.name || "U")}
                            </AvatarFallback>
                        </Avatar>
                        <Textarea
                            placeholder={t("Ask a question or share your thoughts...")}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !newComment.trim()}
                        >
                            {createMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            <T>Post Comment</T>
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                        <T>Sign in to join the discussion</T>
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/login"><T>Sign In</T></a>
                    </Button>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <T>Comments</T> ({comments.length})
                </h3>

                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            <T>No comments yet. Be the first to start the discussion!</T>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <CommentItem key={comment._id} comment={comment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
