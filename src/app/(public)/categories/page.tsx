"use client";

import Link from "next/link";
import {
  BookOpen,
  Code,
  Palette,
  TrendingUp,
  Camera,
  Music,
  Briefcase,
  Heart,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks";
import type { Category } from "@/types";

// Default category icons and gradients
const categoryStyles: Record<string, { icon: React.ElementType; gradient: string }> = {
  development: { icon: Code, gradient: "from-blue-500 to-indigo-600" },
  design: { icon: Palette, gradient: "from-pink-500 to-rose-600" },
  business: { icon: Briefcase, gradient: "from-emerald-500 to-teal-600" },
  marketing: { icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
  photography: { icon: Camera, gradient: "from-violet-500 to-purple-600" },
  music: { icon: Music, gradient: "from-red-500 to-pink-600" },
  health: { icon: Heart, gradient: "from-rose-500 to-red-600" },
  lifestyle: { icon: Globe, gradient: "from-cyan-500 to-blue-600" },
  default: { icon: BookOpen, gradient: "from-slate-500 to-slate-600" },
};

function getCategoryStyle(categoryName: string) {
  const key = categoryName.toLowerCase().replace(/[^a-z]/g, "");
  return categoryStyles[key] || categoryStyles.default;
}

function CategoryCard({ category }: { category: Category }) {
  const style = getCategoryStyle(category.name);
  const Icon = style.icon;

  return (
    <Link href={`/courses?category=${category._id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-all hover:-translate-y-1">
        <div className={`h-32 bg-gradient-to-br ${style.gradient} relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-12 w-12 text-white/90" strokeWidth={1.5} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {category.courseCount || 0} courses
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16 mt-1.5" />
      </CardContent>
    </Card>
  );
}


export default function CategoriesPage() {
  const { data: categoriesResponse, isLoading } = useCategories();

  const categories = categoriesResponse?.data || [];

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Course Categories</h1>
        <p className="text-muted-foreground mt-1">
          Explore our wide range of course categories and find the perfect learning path for you
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Categories will appear here once they are added. Check back later for available course categories.
          </p>
        </div>
      )}

    </div>
  );
}
