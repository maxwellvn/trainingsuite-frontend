"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  BookOpen,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categoriesResponse, isLoading } = useCategories();
  const categories = (categoriesResponse?.data || []) as Category[];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted successfully" });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoriesApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditCategory(null);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete._id);
    }
  };

  const handleToggleActive = (category: Category) => {
    toggleActiveMutation.mutate({
      id: category._id,
      isActive: category.isActive === false,
    });
  };

  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // Calculate stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive !== false).length;
  const totalCourses = categories.reduce((acc, c) => acc + (c.courseCount || 0), 0);

  if (isLoading) {
    return <CategoriesTableSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-violet-200 bg-violet-50 text-violet-600">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{totalCategories}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Categories</p>
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
                <div className="text-3xl font-light text-foreground">{activeCategories}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Active Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-foreground">{totalCourses}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle className="font-heading font-bold uppercase tracking-wide text-lg">Categories</CardTitle>
              <CardDescription>Manage course categories structure</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
                />
              </div>
              <Button onClick={handleAdd} className="rounded-none">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                  <TableHead className="w-[50px] pl-6"></TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider">Category</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider">Description</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider">Courses</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="w-[50px] pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FolderTree className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">
                          {searchQuery
                            ? "No categories match your search"
                            : "No categories found"}
                        </p>
                        {!searchQuery && (
                          <Button className="mt-4 rounded-none" onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Category
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category._id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6">
                        <button className="cursor-grab hover:bg-muted p-1 rounded-sm opacity-50 hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 border border-border flex items-center justify-center bg-muted/30"
                          >
                            {category.icon ? (
                              <span className="text-lg">{category.icon}</span>
                            ) : (
                              <FolderTree
                                className="h-5 w-5 text-muted-foreground"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{category.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                              /{category.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                          {category.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-medium">{category.courseCount || 0}</span>
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.isActive !== false ? (
                          <Badge variant="outline" className="rounded-none border-green-200 bg-green-50 text-green-700 uppercase text-[10px] font-bold tracking-wide">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none border-muted bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wide">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-border">
                            <DropdownMenuLabel className="font-heading font-bold text-xs uppercase tracking-wider">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(category)} className="rounded-none cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(category)} className="rounded-none cursor-pointer">
                              {category.isActive !== false ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Show
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <CategoryDialog
        category={editCategory}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{categoryToDelete?.name}"</span>?
              <br />This action cannot be undone.
              {(categoryToDelete?.courseCount || 0) > 0 && (
                <div className="mt-4 p-3 border border-amber-200 bg-amber-50 text-amber-800 text-xs font-medium uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Warning: This category has {categoryToDelete?.courseCount} courses associated with it.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function CategoriesTableSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-border p-6 bg-card">
            <Skeleton className="h-8 w-12 mb-2 rounded-none" />
            <Skeleton className="h-4 w-24 rounded-none" />
          </div>
        ))}
      </div>
      <div className="border border-border bg-background">
        <div className="p-6 border-b border-border flex justify-between">
          <div>
            <Skeleton className="h-6 w-40 rounded-none" />
            <Skeleton className="h-4 w-60 mt-2 rounded-none" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[200px] rounded-none" />
            <Skeleton className="h-10 w-32 rounded-none" />
          </div>
        </div>
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-4 rounded-none" />
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-none" />
                  <Skeleton className="h-3 w-24 rounded-none" />
                </div>
              </div>
              <Skeleton className="h-4 w-48 rounded-none hidden sm:block" />
              <Skeleton className="h-4 w-12 rounded-none" />
              <Skeleton className="h-6 w-16 rounded-none" />
              <Skeleton className="h-8 w-8 rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: {
  category?: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setDescription(category?.description || "");
      setIcon(category?.icon || "");
      setIsActive(category?.isActive !== false);
    }
  }, [open, category]);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; icon?: string }) =>
      categoriesApi.create(data),
    onSuccess: () => {
      toast({ title: "Category created successfully" });
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      toast({ title: "Category updated successfully" });
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }

    if (isEdit && category) {
      updateMutation.mutate({
        id: category._id,
        data: { name, description, icon, isActive },
      });
    } else {
      createMutation.mutate({ name, description, icon });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-wide">{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category details below."
              : "Create a new category to organize courses."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Web Development"
              className="rounded-none border-border"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the category"
              rows={3}
              className="rounded-none border-border resize-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Icon (emoji)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g., 💻"
              maxLength={4}
              className="rounded-none border-border"
            />
          </div>
          <div className="flex items-center justify-between p-4 border border-border bg-muted/5">
            <div>
              <Label htmlFor="active" className="text-xs font-bold uppercase tracking-wider">Active Status</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Show this category on the website
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-none border-border">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="rounded-none">
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
