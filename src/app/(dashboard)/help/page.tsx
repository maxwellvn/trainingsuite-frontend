"use client";

import {
  HelpCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Video,
  CreditCard,
  User,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        q: "How do I enroll in a course?",
        a: "Browse our course catalog, select a course you're interested in, and click the 'Enroll' button. If the course is free, you'll have immediate access. For paid courses, complete the payment process to gain access.",
      },
      {
        q: "How do I access my enrolled courses?",
        a: "After enrolling, go to 'My Training' in the sidebar to see all your enrolled courses. Click on any course to continue learning from where you left off.",
      },
      {
        q: "Can I download course materials?",
        a: "Yes, many courses include downloadable resources like PDFs, slides, and code samples. Look for the 'Materials' section within each lesson.",
      },
    ],
  },
  {
    category: "Live Sessions",
    icon: Video,
    questions: [
      {
        q: "How do I join a live session?",
        a: "Go to 'Live Sessions' in the sidebar to see upcoming and ongoing sessions. Click on a session to view details and join when it's live.",
      },
      {
        q: "Can I watch recordings of past live sessions?",
        a: "Yes, if the instructor has made the recording available, you'll find it on the session page after it ends.",
      },
      {
        q: "What if I miss a live session?",
        a: "Don't worry! Most sessions are recorded and made available for later viewing. Check the session page for the recording.",
      },
    ],
  },
  {
    category: "Account & Settings",
    icon: User,
    questions: [
      {
        q: "How do I update my profile?",
        a: "Go to 'Settings' in the sidebar and select the 'Profile' tab. From there, you can update your name, bio, and profile picture.",
      },
      {
        q: "How do I change my password?",
        a: "Navigate to Settings > Security to change your password. You'll need to enter your current password and then your new password.",
      },
      {
        q: "How do I manage notifications?",
        a: "In Settings, go to the 'Alerts' tab to customize which notifications you receive via email and push notifications.",
      },
    ],
  },
  {
    category: "Certificates",
    icon: CreditCard,
    questions: [
      {
        q: "How do I earn a certificate?",
        a: "Complete all lessons in a course to earn your certificate. Once you finish the final lesson, your certificate will be automatically generated.",
      },
      {
        q: "How do I download my certificate?",
        a: "Go to 'Certificates' in the sidebar to view all your earned certificates. Click on any certificate to view and download it.",
      },
      {
        q: "Can I share my certificate?",
        a: "Yes! Each certificate has a unique verification link that you can share with employers or on social media.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions and get support
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:support@rhapsody.org">Contact Support</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Forums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other learners and share experiences.
            </p>
            <Button variant="outline" asChild>
              <a href="/forums">Visit Forums</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update your profile, password, and preferences.
            </p>
            <Button variant="outline" asChild>
              <a href="/settings">Go to Settings</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Still need help?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to assist you
              </p>
            </div>
          </div>
          <Button asChild>
            <a href="mailto:support@rhapsody.org">Contact Us</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
