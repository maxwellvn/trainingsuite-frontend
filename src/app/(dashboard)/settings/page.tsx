"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Lock,
  Bell,
  Globe,
  Camera,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { getInitials, getErrorMessage } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      setProfileForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const uploadResponse = await apiClient.post<{
        success: boolean;
        data: { fileUrl: string };
      }>("/upload", formData);

      if (!uploadResponse.data.success) {
        throw new Error("Upload failed");
      }

      // Update user profile with new avatar URL
      await authApi.updateProfile({ avatar: uploadResponse.data.data.fileUrl });

      return uploadResponse.data.data.fileUrl;
    },
    onSuccess: (fileUrl) => {
      console.log("[Settings] Avatar uploaded, fileUrl:", fileUrl);

      const updateState = () => {
        if (user) {
          setUser({ ...user, avatar: fileUrl });
        }
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        setAvatarPreview(null);
      };

      // Preload the new image before clearing preview with retry logic
      const preloadImage = (retriesLeft: number) => {
        const img = new Image();
        img.onload = () => {
          console.log("[Settings] New avatar image loaded successfully");
          updateState();
          toast({ title: "Avatar updated successfully!" });
        };
        img.onerror = () => {
          if (retriesLeft > 0) {
            // Retry after a short delay to handle timing issues
            setTimeout(() => preloadImage(retriesLeft - 1), 500);
          } else {
            // Still update state even if preload fails - the image should load eventually
            console.warn("[Settings] Image preload failed, updating state anyway");
            updateState();
            toast({ title: "Avatar updated successfully!" });
          }
        };
        img.src = fileUrl;
      };

      // Start preloading with 2 retries
      preloadImage(2);
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error), variant: "destructive" });
      setAvatarPreview(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File size must be less than 2MB", variant: "destructive" });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatarMutation.mutate(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      const response = await authApi.updateProfile({
        name: fullName,
        bio: profileForm.bio,
        phone: profileForm.phone,
      });

      if (response.success && response.data) {
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        toast({ title: "Profile updated successfully!" });
      }
    } catch (error) {
      toast({ title: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4 sm:gap-8 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold uppercase text-xs tracking-wider text-muted-foreground data-[state=active]:text-foreground transition-none shrink-0"
          >
            <Globe className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-8 space-y-8">
          <div className="grid gap-8">
            {/* Avatar Section */}
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Profile Picture</CardTitle>
                <CardDescription>
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 rounded-none border border-border">
                      <AvatarImage src={avatarPreview || user?.avatar} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold rounded-none">
                        {getInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    {uploadAvatarMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                      className="rounded-none border-border uppercase text-xs font-bold tracking-wider"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadAvatarMutation.isPending ? "Uploading..." : "Change Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    placeholder="Enter your email"
                    className="rounded-none border-border bg-muted opacity-100 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide pt-1">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-none font-bold uppercase tracking-wider">
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-8 space-y-8">
          <div className="grid gap-8">
            {/* Change Password */}
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="rounded-none border-border bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <Button className="rounded-none font-bold uppercase tracking-wider">Update Password</Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with two-factor authentication
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Sessions */}
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Active Sessions</CardTitle>
                <CardDescription>
                  Manage devices where you&apos;re currently logged in
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border bg-muted/20">
                    <div>
                      <p className="font-bold text-sm">Current Device</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chrome on macOS • Last active now
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary border-0 font-bold uppercase text-[10px] tracking-wider">Current</Badge>
                  </div>
                </div>
                <Button variant="outline" className="mt-6 rounded-none border-border uppercase text-xs font-bold tracking-wider">
                  Sign out of all other devices
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-8">
          <Card className="rounded-none border-border">
            <CardHeader className="bg-muted/5 border-b border-border">
              <CardTitle className="font-heading font-bold uppercase tracking-wide">Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <h4 className="font-heading font-bold uppercase text-sm tracking-widest text-muted-foreground border-b border-border pb-2">Email Notifications</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Course Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your enrolled courses
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">New Courses</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new courses are available
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Promotions</p>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and discounts
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Weekly Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Get a weekly summary of your learning progress
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-heading font-bold uppercase text-sm tracking-widest text-muted-foreground border-b border-border pb-2">Push Notifications</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Live Session Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded before live sessions start
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Certificate Earned</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you earn a certificate
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="rounded-none font-bold uppercase tracking-wider">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-8 space-y-8">
          <div className="grid gap-8">
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Language & Region</CardTitle>
                <CardDescription>
                  Set your preferred language and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="rounded-none border-border">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="rounded-none border-border">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                        <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                        <SelectItem value="ist">India Standard Time (GMT+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger className="w-[200px] rounded-none border-border">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <CardTitle className="font-heading font-bold uppercase tracking-wide">Learning Preferences</CardTitle>
                <CardDescription>
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Autoplay Videos</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically play the next video in a lesson
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Show Subtitles</p>
                    <p className="text-sm text-muted-foreground">
                      Display subtitles when available
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border" />
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Video Quality</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-[200px] rounded-none border-border">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p (HD)</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="mt-4 rounded-none font-bold uppercase tracking-wider">
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
