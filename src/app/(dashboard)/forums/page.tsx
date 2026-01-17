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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                {forum.isGeneral ? (
                  <Users className="h-6 w-6 text-primary" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{forum.title}</h3>
                  {forum.isGeneral && (
                    <Badge variant="secondary" className="text-xs">General</Badge>
                  )}
                </div>
                {forum.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {forum.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{forum.postCount || 0} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community Forums</h1>
          <p className="text-muted-foreground">
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
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forums.length}</p>
                <p className="text-sm text-muted-foreground">Total Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {forums.reduce((acc, f) => acc + (f.postCount || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forums.filter((f) => f.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      ) : forums.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No forums available</h3>
            <p className="text-muted-foreground mt-1">
              Forums will appear here once they are created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* General Forums */}
          {filteredGeneralForums.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                General Forums
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGeneralForums.map((forum) => (
                  <ForumCard key={forum._id} forum={forum} />
                ))}
              </div>
            </section>
          )}

          {/* Course Forums */}
          {filteredCourseForums.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Forums
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCourseForums.map((forum) => (
                  <ForumCard key={forum._id} forum={forum} />
                ))}
              </div>
            </section>
          )}

          {filteredGeneralForums.length === 0 && filteredCourseForums.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No forums found</h3>
                <p className="text-muted-foreground mt-1">
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
