"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Share2, Download, ArrowRight, PartyPopper, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Confetti } from "@/components/ui/confetti";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import type { Course, Certificate, CertificateWithDetails } from "@/types";
import { T, useT } from "@/components/t";

interface CourseCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onCertificateGenerated?: (certificate: Certificate) => void;
}

export function CourseCompletionDialog({
  open,
  onOpenChange,
  course,
  onCertificateGenerated,
}: CourseCompletionDialogProps) {
  const { toast } = useToast();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch certificates when dialog opens to find the one for this course
  const { data: certificatesResponse, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificatesApi.getAll(1, 50),
    enabled: open && !!course,
  });

  // Find the certificate for this specific course
  const certificate = certificatesResponse?.data?.find(
    (cert: CertificateWithDetails) => {
      const certCourseId = typeof cert.course === "object" ? cert.course._id : cert.course;
      return certCourseId === course?._id;
    }
  ) || null;

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Invalidate certificates query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    }
  }, [open, queryClient]);

  useEffect(() => {
    if (certificate && onCertificateGenerated) {
      onCertificateGenerated(certificate);
    }
  }, [certificate, onCertificateGenerated]);

  const handleShare = async () => {
    const shareText = `I just completed "${course?.title}" on Training Suite! 🎉`;
    const shareUrl = certificate
      ? `${window.location.origin}/certificates/${certificate._id}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Course Completed!",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: t("Link copied to clipboard!") });
    }
  };

  return (
    <>
      <Confetti active={showConfetti} duration={4000} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl flex items-center justify-center gap-2">
                <PartyPopper className="h-6 w-6 text-amber-500" />
                <T>Congratulations!</T>
                <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                <T>You&apos;ve successfully completed</T>
              </DialogDescription>
              <p className="font-semibold text-foreground mt-1">
                {course?.title}
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {isLoadingCertificates ? (
              <Button size="lg" className="w-full" disabled>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <T>Loading Certificate...</T>
              </Button>
            ) : certificate ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    <T>Certificate Ready!</T>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    ID: {certificate.certificateNumber || certificate._id}
                  </p>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/certificates/${certificate._id}`}>
                    <Award className="h-5 w-5 mr-2" />
                    <T>View Certificate</T>
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    <T>Share</T>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  <T>Certificate is being generated...</T>
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  <T>Please check your certificates page in a moment.</T>
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/courses">
                  <T>Continue Learning</T>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
