"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Globe,
  Palette,
  CreditCard,
  Shield,
  Save,
  Upload,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api/admin";
import type { SiteConfig, PaymentProvider, StreamProvider } from "@/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configData, isLoading } = useQuery({
    queryKey: ["admin-config"],
    queryFn: adminApi.getConfig,
  });

  const [siteConfig, setSiteConfig] = useState<Partial<SiteConfig>>({
    siteName: "",
    siteDescription: "",
    logo: "",
    favicon: "",
    primaryColor: "#7c3aed",
    secondaryColor: "#f59e0b",
    enablePayments: false,
    enableLiveStreaming: false,
    enableForums: false,
    enableComments: true,
    enableRatings: true,
    enableCertificates: true,
    maintenanceMode: false,
    defaultPaymentProvider: "stripe",
    defaultStreamProvider: "youtube",
    contactEmail: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
  });

  const [paymentConfig, setPaymentConfig] = useState({
    stripePublicKey: "",
    stripeSecretKey: "",
    paystackPublicKey: "",
    paystackSecretKey: "",
  });

  useEffect(() => {
    if (configData?.data) {
      setSiteConfig(configData.data);
    }
  }, [configData]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: Partial<SiteConfig>) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const updatePaymentConfigMutation = useMutation({
    mutationFn: (data: typeof paymentConfig) => adminApi.updatePaymentConfig(data),
    onSuccess: () => {
      toast({ title: "Payment settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save payment settings", variant: "destructive" });
    },
  });

  const handleSaveSiteConfig = () => {
    updateConfigMutation.mutate(siteConfig);
  };

  const handleSavePaymentConfig = () => {
    updatePaymentConfigMutation.mutate(paymentConfig);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-10 w-32 rounded-none" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your platform settings and preferences.
          </p>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {siteConfig.maintenanceMode && (
        <Alert variant="destructive" className="rounded-none border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="uppercase font-bold tracking-wide">Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            Your site is currently in maintenance mode. Only admins can access the platform.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider"
          >
            <Globe className="h-3.5 w-3.5 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider"
          >
            <Palette className="h-3.5 w-3.5 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider"
          >
            <Settings className="h-3.5 w-3.5 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-bold uppercase text-xs tracking-wider"
          >
            <CreditCard className="h-3.5 w-3.5 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="rounded-none border-border">
            <CardHeader className="bg-muted/5 border-b border-border">
              <CardTitle className="font-heading uppercase tracking-wide">General Settings</CardTitle>
              <CardDescription>
                Basic site information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteConfig.siteName || ""}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, siteName: e.target.value })
                    }
                    placeholder="My Learning Platform"
                    className="rounded-none border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteConfig.contactEmail || ""}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, contactEmail: e.target.value })
                    }
                    placeholder="contact@example.com"
                    className="rounded-none border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteConfig.siteDescription || ""}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, siteDescription: e.target.value })
                  }
                  placeholder="A brief description of your platform..."
                  rows={3}
                  className="rounded-none border-border resize-none"
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-heading font-bold uppercase tracking-wide text-sm mb-6">Social Links</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Facebook</Label>
                    <Input
                      id="facebook"
                      value={siteConfig.socialLinks?.facebook || ""}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          socialLinks: { ...siteConfig.socialLinks, facebook: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/..."
                      className="rounded-none border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Twitter</Label>
                    <Input
                      id="twitter"
                      value={siteConfig.socialLinks?.twitter || ""}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          socialLinks: { ...siteConfig.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="https://twitter.com/..."
                      className="rounded-none border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instagram</Label>
                    <Input
                      id="instagram"
                      value={siteConfig.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          socialLinks: { ...siteConfig.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/..."
                      className="rounded-none border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">YouTube</Label>
                    <Input
                      id="youtube"
                      value={siteConfig.socialLinks?.youtube || ""}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          socialLinks: { ...siteConfig.socialLinks, youtube: e.target.value },
                        })
                      }
                      placeholder="https://youtube.com/..."
                      className="rounded-none border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
                  className="rounded-none"
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="rounded-none border-border">
            <CardHeader className="bg-muted/5 border-b border-border">
              <CardTitle className="font-heading uppercase tracking-wide">Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      value={siteConfig.logo || ""}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, logo: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="rounded-none border-border"
                    />
                    <Button variant="outline" size="icon" className="rounded-none border-border aspect-square h-10 w-10">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {siteConfig.logo && (
                    <div className="mt-2 p-4 border border-border bg-muted/20">
                      <img
                        src={siteConfig.logo}
                        alt="Logo preview"
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Favicon URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="favicon"
                      value={siteConfig.favicon || ""}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, favicon: e.target.value })
                      }
                      placeholder="https://example.com/favicon.ico"
                      className="rounded-none border-border"
                    />
                    <Button variant="outline" size="icon" className="rounded-none border-border aspect-square h-10 w-10">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-heading font-bold uppercase tracking-wide text-sm mb-6">Brand Colors</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={siteConfig.primaryColor || "#7c3aed"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, primaryColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 cursor-pointer rounded-none border-border"
                      />
                      <Input
                        value={siteConfig.primaryColor || "#7c3aed"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, primaryColor: e.target.value })
                        }
                        placeholder="#7c3aed"
                        className="rounded-none border-border font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={siteConfig.secondaryColor || "#f59e0b"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 cursor-pointer rounded-none border-border"
                      />
                      <Input
                        value={siteConfig.secondaryColor || "#f59e0b"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })
                        }
                        placeholder="#f59e0b"
                        className="rounded-none border-border font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
                  className="rounded-none"
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features">
          <Card className="rounded-none border-border">
            <CardHeader className="bg-muted/5 border-b border-border">
              <CardTitle className="font-heading uppercase tracking-wide">Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enablePayments" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Payments
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow users to purchase courses.
                    </p>
                  </div>
                  <Switch
                    id="enablePayments"
                    checked={siteConfig.enablePayments || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enablePayments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enableLiveStreaming" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Live Streaming
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow instructors to host live sessions.
                    </p>
                  </div>
                  <Switch
                    id="enableLiveStreaming"
                    checked={siteConfig.enableLiveStreaming || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enableLiveStreaming: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enableForums" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Forums
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable community discussion forums.
                    </p>
                  </div>
                  <Switch
                    id="enableForums"
                    checked={siteConfig.enableForums || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enableForums: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enableComments" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Comments
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow comments on lessons.
                    </p>
                  </div>
                  <Switch
                    id="enableComments"
                    checked={siteConfig.enableComments || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enableComments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enableRatings" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Ratings
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow users to rate and review courses.
                    </p>
                  </div>
                  <Switch
                    id="enableRatings"
                    checked={siteConfig.enableRatings || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enableRatings: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-card">
                  <div>
                    <Label htmlFor="enableCertificates" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Enable Certificates
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Issue certificates on course completion.
                    </p>
                  </div>
                  <Switch
                    id="enableCertificates"
                    checked={siteConfig.enableCertificates || false}
                    onCheckedChange={(checked) =>
                      setSiteConfig({ ...siteConfig, enableCertificates: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
                <div>
                  <Label htmlFor="maintenanceMode" className="text-sm font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Maintenance Mode
                  </Label>
                  <p className="text-xs text-yellow-600/80 dark:text-yellow-500/80 mt-1">
                    Restrict access to admins only.
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={siteConfig.maintenanceMode || false}
                  onCheckedChange={(checked) =>
                    setSiteConfig({ ...siteConfig, maintenanceMode: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultStreamProvider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Stream Provider</Label>
                  <Select
                    value={siteConfig.defaultStreamProvider || "youtube"}
                    onValueChange={(value: StreamProvider) =>
                      setSiteConfig({ ...siteConfig, defaultStreamProvider: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
                  className="rounded-none"
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <div className="space-y-6">
            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading uppercase tracking-wide">Payment Provider</CardTitle>
                    <CardDescription>
                      Select your default payment provider.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultPaymentProvider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Provider</Label>
                  <Select
                    value={siteConfig.defaultPaymentProvider || "stripe"}
                    onValueChange={(value: PaymentProvider) =>
                      setSiteConfig({ ...siteConfig, defaultPaymentProvider: value })
                    }
                  >
                    <SelectTrigger className="w-48 rounded-none border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paystack">Paystack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-heading uppercase tracking-wide">
                      Stripe Configuration
                      {siteConfig.defaultPaymentProvider === "stripe" && (
                        <Badge variant="secondary" className="rounded-none text-[10px] bg-primary/10 text-primary border-0">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Configure your Stripe API keys.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Publishable Key</Label>
                  <Input
                    id="stripePublicKey"
                    type="password"
                    value={paymentConfig.stripePublicKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, stripePublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                    className="rounded-none border-border font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={paymentConfig.stripeSecretKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, stripeSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                    className="rounded-none border-border font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border">
              <CardHeader className="bg-muted/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-heading uppercase tracking-wide">
                      Paystack Configuration
                      {siteConfig.defaultPaymentProvider === "paystack" && (
                        <Badge variant="secondary" className="rounded-none text-[10px] bg-primary/10 text-primary border-0">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Configure your Paystack API keys.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="paystackPublicKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Public Key</Label>
                  <Input
                    id="paystackPublicKey"
                    type="password"
                    value={paymentConfig.paystackPublicKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, paystackPublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                    className="rounded-none border-border font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paystackSecretKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secret Key</Label>
                  <Input
                    id="paystackSecretKey"
                    type="password"
                    value={paymentConfig.paystackSecretKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, paystackSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                    className="rounded-none border-border font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                onClick={handleSaveSiteConfig}
                variant="outline"
                disabled={updateConfigMutation.isPending}
                className="rounded-none border-border"
              >
                Save Provider Settings
              </Button>
              <Button
                onClick={handleSavePaymentConfig}
                disabled={updatePaymentConfigMutation.isPending}
                className="rounded-none"
              >
                {updatePaymentConfigMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save API Keys
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
