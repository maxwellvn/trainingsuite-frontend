"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api/admin";
import { getInitials, formatDate } from "@/lib/utils";
import type { User, UserRole } from "@/types";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  instructor: "bg-blue-100 text-blue-800",
  user: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users from API
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["admin-users", page, searchQuery, roleFilter],
    queryFn: () => adminApi.getUsers({
      page,
      limit: 10,
      search: searchQuery || undefined,
      role: roleFilter !== "all" ? (roleFilter as UserRole) : undefined,
    }),
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      id: selectedUser._id,
      data: { role: editRole },
    });
  };

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User verified successfully" });
    },
    onError: () => {
      toast({ title: "Failed to verify user", variant: "destructive" });
    },
  });

  const handleVerifyUser = (userId: string) => {
    verifyUserMutation.mutate(userId);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Compute stats from real data
  const totalUsers = pagination?.total || 0;
  const activeUsers = users.filter((u) => u.isVerified).length;
  const instructorCount = users.filter((u) => u.role === "instructor").length;
  const pendingVerification = users.filter((u) => !u.isVerified).length;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted/10 border border-border p-6">
              <Skeleton className="h-8 w-16 mb-2 rounded-none" />
              <Skeleton className="h-4 w-24 rounded-none" />
            </div>
          ))}
        </div>
        <div className="border border-border bg-background">
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-none" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px] rounded-none" />
                    <Skeleton className="h-3 w-[150px] rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="text-3xl font-light text-foreground">{totalUsers}</div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="text-3xl font-light text-green-600">{activeUsers}</div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-1">Verified Users</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="text-3xl font-light text-blue-600">{instructorCount}</div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-1">Instructors</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6">
            <div className="text-3xl font-light text-amber-600">{pendingVerification}</div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-1">Pending Action</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="rounded-none border-border">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <CardTitle className="font-heading text-lg">User Management</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="rounded-none border-border ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 rounded-none border-border bg-muted/20 focus:bg-background"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px] rounded-none border-border bg-muted/20">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 border border-primary/20 rounded-none">
              <span className="text-sm font-medium px-2">
                {selectedUsers.length} users selected
              </span>
              <div className="h-4 w-px bg-border mx-2" />
              <Button variant="ghost" size="sm" className="rounded-none h-8 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="border border-border rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                    <TableHead className="w-[50px] pl-6">
                      <Checkbox
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded-none border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">User</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Role</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="font-bold uppercase text-xs tracking-wider">Joined</TableHead>
                    <TableHead className="w-[50px] pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onCheckedChange={() => toggleSelect(user._id)}
                            className="rounded-none border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-border rounded-none">
                              {user.avatar && <AvatarImage src={user.avatar} className="rounded-none" />}
                              <AvatarFallback className="rounded-none bg-muted font-medium text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-none uppercase text-[10px] tracking-wide font-bold h-6 ${user.role === 'admin' ? 'border-red-200 bg-red-50 text-red-700' :
                              user.role === 'instructor' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                'border-border bg-muted/50 text-muted-foreground'
                            }`}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <div className="flex items-center gap-2 text-green-600 text-xs font-medium uppercase tracking-wide">
                              <ShieldCheck className="h-4 w-4" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 text-xs font-medium uppercase tracking-wide">
                              <Shield className="h-4 w-4" />
                              <span>Pending</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {formatDate(user.createdAt)}
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
                              <DropdownMenuItem onClick={() => handleEditUser(user)} className="rounded-none cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-none cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              {!user.isVerified && (
                                <DropdownMenuItem
                                  onClick={() => handleVerifyUser(user._id)}
                                  disabled={verifyUserMutation.isPending}
                                  className="rounded-none cursor-pointer"
                                >
                                  {verifyUserMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                  )}
                                  Verify User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive rounded-none cursor-pointer"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
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
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Showing <span className="text-foreground">{users.length}</span> of <span className="text-foreground">{pagination.total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-none h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono mx-2">
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasMore}
                  onClick={() => setPage(page + 1)}
                  className="rounded-none h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit User Role</DialogTitle>
            <DialogDescription>
              Change permission level for <span className="font-semibold text-foreground">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide">Role Assignment</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-none border-border">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
              className="rounded-none"
            >
              {updateUserMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{userToDelete?.name}"</span>?
              <br /><br />
              This action cannot be undone. It will permanently remove:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Personal profile and settings</li>
                <li>Course enrollments and progress</li>
                <li>Generated certificates</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive hover:bg-destructive/90 rounded-none text-destructive-foreground"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
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
