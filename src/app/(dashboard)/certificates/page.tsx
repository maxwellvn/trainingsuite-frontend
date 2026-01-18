"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCertificates } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import { format } from "date-fns";
import type { Certificate, Course } from "@/types";

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const course = typeof certificate.course === "object" ? certificate.course : null;

  const certificateUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certificates/${certificate._id}`
    : `/certificates/${certificate._id}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Try to get from certificateUrl first if available
      if (certificate.certificateUrl) {
        const link = document.createElement("a");
        link.href = certificate.certificateUrl;
        link.download = `certificate-${certificate.certificateNumber || certificate._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Certificate downloaded!" });
      } else {
        // Fallback to API download
        const blob = await certificatesApi.download(certificate._id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate-${certificate.certificateNumber || certificate._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({ title: "Certificate downloaded!" });
      }
    } catch (error) {
      toast({ title: "Failed to download certificate", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleShareSocial = (platform: "twitter" | "linkedin" | "facebook") => {
    const text = `I just earned a certificate for completing "${course?.title || "a course"}"! Check it out:`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certificateUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
    setShareDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden rounded-none border-border group hover:border-primary/50 transition-colors">
        <div className="bg-amber-50/50 p-6 border-b border-border text-center relative">
          <Badge className="absolute top-3 left-3 rounded-none bg-amber-600 hover:bg-amber-600 border-0 uppercase text-[10px] tracking-widest font-bold">Verified</Badge>
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <div className="h-20 w-20 border-2 border-amber-200 bg-amber-100/50 flex items-center justify-center">
                <Award className="h-10 w-10 text-amber-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-600 flex items-center justify-center border-2 border-background">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-heading font-bold uppercase text-center text-sm line-clamp-2 min-h-[40px] mb-4">
            {course?.title || "Course Certificate"}
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Issued</span>
              <span className="font-mono text-muted-foreground">{format(new Date(certificate.issuedAt || certificate.createdAt), "MMM d, yyyy")}</span>
            </div>
            {(certificate.certificateId || certificate.certificateNumber) && (
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-bold uppercase tracking-wider">ID</span>
                <span className="font-mono text-muted-foreground truncate max-w-[150px]">{certificate.certificateId || certificate.certificateNumber}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-none border-border uppercase text-xs font-bold tracking-wider h-9"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-2" />
              )}
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-none border-border uppercase text-xs font-bold tracking-wider h-9"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-3 w-3 mr-2" />
              Share
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-2 rounded-none uppercase text-xs font-bold tracking-wider h-9 hover:bg-transparent hover:text-primary" asChild>
            <Link href={`/certificates/${certificate._id}`}>
              View Certificate <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold uppercase tracking-wide">Share Certificate</DialogTitle>
            <DialogDescription>
              Share your achievement with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-2">
              <Input
                value={certificateUrl}
                readOnly
                className="flex-1 rounded-none border-border font-mono text-xs"
              />
              <Button size="sm" onClick={handleCopyLink} className="rounded-none h-10 w-10 p-0">
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-none border-border uppercase text-xs font-bold tracking-wider"
                onClick={() => handleShareSocial("twitter")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-none border-border uppercase text-xs font-bold tracking-wider"
                onClick={() => handleShareSocial("linkedin")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-none border-border uppercase text-xs font-bold tracking-wider"
                onClick={() => handleShareSocial("facebook")}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CertificateCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-none border-border">
      <div className="bg-muted/10 p-6 border-b border-border">
        <div className="flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-none" />
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full rounded-none" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 rounded-none" />
            <Skeleton className="h-3 w-20 rounded-none" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-8 rounded-none" />
            <Skeleton className="h-3 w-24 rounded-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-none" />
          <Skeleton className="h-9 flex-1 rounded-none" />
        </div>
        <Skeleton className="h-8 w-full mt-2 rounded-none" />
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const { data: certificatesResponse, isLoading } = useCertificates();

  const certificates = certificatesResponse?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          View and download your earned certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">{certificates.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-green-200 bg-green-50 text-green-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">{certificates.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Courses Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-light text-foreground">0</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Shared Certificates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CertificateCardSkeleton key={i} />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate._id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <Card className="rounded-none border-border bg-muted/5 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="h-16 w-16 mx-auto mb-6 border border-border bg-background flex items-center justify-center text-muted-foreground">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-heading font-bold uppercase tracking-wide">No certificates yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
              Complete courses to earn certificates that showcase your achievements.
            </p>
            <Button className="mt-8 rounded-none font-bold uppercase tracking-wider" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
