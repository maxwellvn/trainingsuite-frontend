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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences.
          </p>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {siteConfig.maintenanceMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            Your site is currently in maintenance mode. Only admins can access the platform.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic site information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteConfig.siteName || ""}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, siteName: e.target.value })
                    }
                    placeholder="My Learning Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteConfig.contactEmail || ""}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, contactEmail: e.target.value })
                    }
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteConfig.siteDescription || ""}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, siteDescription: e.target.value })
                  }
                  placeholder="A brief description of your platform..."
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Social Links</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
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
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
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
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      value={siteConfig.logo || ""}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, logo: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {siteConfig.logo && (
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <img
                        src={siteConfig.logo}
                        alt="Logo preview"
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="favicon"
                      value={siteConfig.favicon || ""}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, favicon: e.target.value })
                      }
                      placeholder="https://example.com/favicon.ico"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Brand Colors</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={siteConfig.primaryColor || "#7c3aed"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, primaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={siteConfig.primaryColor || "#7c3aed"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, primaryColor: e.target.value })
                        }
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={siteConfig.secondaryColor || "#f59e0b"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={siteConfig.secondaryColor || "#f59e0b"}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })
                        }
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
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
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enablePayments" className="text-base font-medium">
                      Enable Payments
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableLiveStreaming" className="text-base font-medium">
                      Enable Live Streaming
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableForums" className="text-base font-medium">
                      Enable Forums
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableComments" className="text-base font-medium">
                      Enable Comments
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableRatings" className="text-base font-medium">
                      Enable Ratings
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableCertificates" className="text-base font-medium">
                      Enable Certificates
                    </Label>
                    <p className="text-sm text-muted-foreground">
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

                <Separator />

                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-lg">
                  <div>
                    <Label htmlFor="maintenanceMode" className="text-base font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
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
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultStreamProvider">Default Stream Provider</Label>
                  <Select
                    value={siteConfig.defaultStreamProvider || "youtube"}
                    onValueChange={(value: StreamProvider) =>
                      setSiteConfig({ ...siteConfig, defaultStreamProvider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSiteConfig}
                  disabled={updateConfigMutation.isPending}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Provider</CardTitle>
                    <CardDescription>
                      Select your default payment provider.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="defaultPaymentProvider">Default Provider</Label>
                  <Select
                    value={siteConfig.defaultPaymentProvider || "stripe"}
                    onValueChange={(value: PaymentProvider) =>
                      setSiteConfig({ ...siteConfig, defaultPaymentProvider: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paystack">Paystack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Stripe Configuration
                      {siteConfig.defaultPaymentProvider === "stripe" && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Configure your Stripe API keys.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey">Publishable Key</Label>
                  <Input
                    id="stripePublicKey"
                    type="password"
                    value={paymentConfig.stripePublicKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, stripePublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={paymentConfig.stripeSecretKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, stripeSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Paystack Configuration
                      {siteConfig.defaultPaymentProvider === "paystack" && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Configure your Paystack API keys.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paystackPublicKey">Public Key</Label>
                  <Input
                    id="paystackPublicKey"
                    type="password"
                    value={paymentConfig.paystackPublicKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, paystackPublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paystackSecretKey">Secret Key</Label>
                  <Input
                    id="paystackSecretKey"
                    type="password"
                    value={paymentConfig.paystackSecretKey}
                    onChange={(e) =>
                      setPaymentConfig({ ...paymentConfig, paystackSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSaveSiteConfig}
                variant="outline"
                disabled={updateConfigMutation.isPending}
              >
                Save Provider Settings
              </Button>
              <Button
                onClick={handleSavePaymentConfig}
                disabled={updatePaymentConfigMutation.isPending}
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
