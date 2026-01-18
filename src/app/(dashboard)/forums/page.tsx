"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Users,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Clock,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { forumsApi } from "@/lib/api/forums";
import { getInitials } from "@/lib/utils";
import type { Forum, User } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function ForumsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: forumsData, isLoading } = useQuery({
    queryKey: ["forums"],
    queryFn: () => forumsApi.getAll(1, 50),
  });

  const forums = forumsData?.data || [];
  const generalForums = forums.filter((f) => f.isGeneral);
  const courseForums = forums.filter((f) => !f.isGeneral);

  const filteredGeneralForums = generalForums.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourseForums = courseForums.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ForumCard = ({ forum }: { forum: Forum }) => {
    const creator = forum.createdBy as User;
    return (
      <Link href={`/forums/${forum._id}`}>
        <Card className="rounded-none border-border group hover:border-primary/50 transition-colors cursor-pointer h-full bg-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 border border-border bg-muted/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                {forum.isGeneral ? (
                  <Users className="h-6 w-6 text-primary" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-heading font-bold uppercase text-base truncate group-hover:text-primary transition-colors">{forum.title}</h3>
                  {forum.isGeneral && (
                    <Badge variant="secondary" className="rounded-none text-[10px] font-bold uppercase tracking-wider border-0 bg-muted text-muted-foreground">General</Badge>
                  )}
                </div>
                {forum.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {forum.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{forum.postCount || 0} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(parseISO(forum.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Community Forums</h1>
          <p className="text-muted-foreground mt-1">
            Connect with fellow learners and instructors.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-light text-foreground">{forums.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 border border-green-200 bg-green-50 flex items-center justify-center text-green-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-light text-foreground">
                  {forums.reduce((acc, f) => acc + (f.postCount || 0), 0)}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-light text-foreground">{forums.filter((f) => f.isActive).length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Active Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-8 w-48 rounded-none" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-none" />
            ))}
          </div>
        </div>
      ) : forums.length === 0 ? (
        <Card className="rounded-none border-border bg-muted/5 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-heading font-bold uppercase tracking-wide">No forums available</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Forums will appear here once they are created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* General Forums */}
          {filteredGeneralForums.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold uppercase tracking-wide flex items-center gap-2">
                <Users className="h-5 w-5" />
                General Forums
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {filteredGeneralForums.map((forum) => (
                  <ForumCard key={forum._id} forum={forum} />
                ))}
              </div>
            </section>
          )}

          {/* Course Forums */}
          {filteredCourseForums.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Forums
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {filteredCourseForums.map((forum) => (
                  <ForumCard key={forum._id} forum={forum} />
                ))}
              </div>
            </section>
          )}

          {filteredGeneralForums.length === 0 && filteredCourseForums.length === 0 && (
            <Card className="rounded-none border-border bg-muted/5 border-dashed">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-muted-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-wide">No forums found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Try adjusting your search query.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
