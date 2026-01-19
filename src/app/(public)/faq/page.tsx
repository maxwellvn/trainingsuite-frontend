"use client";

import { useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  User,
  Award,
  Video,
  MessageSquare,
  BarChart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "account", label: "Account & Profile", icon: User },
  { id: "courses", label: "Courses & Learning", icon: Video },
  { id: "progress", label: "Progress & Tracking", icon: BarChart },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "technical", label: "Technical Issues", icon: HelpCircle },
];

const faqs = [
  {
    category: "getting-started",
    question: "How do I create an account?",
    answer: "Creating an account is easy! Click the 'Sign Up' button at the top of the page, enter your email address and create a password. You can also sign up using your Google account for faster registration.",
  },
  {
    category: "getting-started",
    question: "Is Training Suite free to use?",
    answer: "Yes! All training materials on our platform are completely free. Simply create an account and start learning immediately.",
  },
  {
    category: "getting-started",
    question: "How do I enroll in a course?",
    answer: "To enroll in a course, navigate to the course page and click the 'Start Training' button. You'll have immediate access to all course materials once enrolled.",
  },
  {
    category: "getting-started",
    question: "Do I need any special software to take courses?",
    answer: "No special software is required. All you need is a modern web browser (Chrome, Firefox, Safari, or Edge) and an internet connection. Our platform works on desktop, tablet, and mobile devices.",
  },
  {
    category: "account",
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page and enter your email address. We'll send you a password reset link that's valid for 24 hours. Follow the link to create a new password.",
  },
  {
    category: "account",
    question: "Can I change my email address?",
    answer: "Yes, you can change your email address in your account settings. Go to Settings > Profile and update your email. You'll need to verify your new email address before the change takes effect.",
  },
  {
    category: "account",
    question: "How do I update my profile information?",
    answer: "Go to Settings > Profile to update your name, avatar, and other profile information. Changes are saved automatically.",
  },
  {
    category: "account",
    question: "How do I delete my account?",
    answer: "To delete your account, go to Settings > Account and scroll to the bottom to find the 'Delete Account' option. Please note that this action is irreversible and you'll lose access to all your progress and certificates.",
  },
  {
    category: "courses",
    question: "How long do I have access to a course?",
    answer: "Once you enroll in a course, you have lifetime access to all course materials. You can learn at your own pace without any time limits.",
  },
  {
    category: "courses",
    question: "Can I download course materials?",
    answer: "Yes, you can download supplementary materials like PDFs, worksheets, and documents if provided by the instructor. Video content is available for streaming only.",
  },
  {
    category: "courses",
    question: "Can I access courses on mobile devices?",
    answer: "Yes! Training Suite is fully responsive and works on all devices. You can access your courses from your smartphone, tablet, or computer.",
  },
  {
    category: "courses",
    question: "How do I leave a review for a course?",
    answer: "You must be enrolled in a course to leave a review. Go to the course page, navigate to the Reviews tab, and submit your rating and feedback. Your review helps other learners make informed decisions.",
  },
  {
    category: "progress",
    question: "How is my progress tracked?",
    answer: "Your progress is automatically tracked as you complete lessons. Each lesson you finish contributes to your overall course completion percentage, which is displayed on your dashboard and course page.",
  },
  {
    category: "progress",
    question: "Can I resume where I left off?",
    answer: "Yes! Your progress is saved automatically. When you return to a course, you can continue from exactly where you left off. Use the 'Continue Learning' button to jump back in.",
  },
  {
    category: "progress",
    question: "How do I mark a lesson as complete?",
    answer: "Lessons are marked as complete when you finish watching the video or reading the content. Click the 'Mark as Complete' button at the end of each lesson to track your progress.",
  },
  {
    category: "progress",
    question: "Where can I see all my enrolled courses?",
    answer: "You can view all your enrolled courses on your Dashboard. It shows your active courses, progress, and recently accessed materials.",
  },
  {
    category: "certificates",
    question: "How do I earn a certificate?",
    answer: "To earn a certificate, you must complete all lessons in a course (100% progress). Once completed, your certificate will be automatically generated and available for download.",
  },
  {
    category: "certificates",
    question: "How do I download my certificate?",
    answer: "Go to your Certificates page from the dashboard. Find the certificate you want and click the 'Download' button to get a PDF copy of your certificate.",
  },
  {
    category: "certificates",
    question: "Can I share my certificates on social media?",
    answer: "Yes! Each certificate has sharing options for LinkedIn, Twitter, and Facebook. You can also copy the certificate link to share anywhere.",
  },
  {
    category: "certificates",
    question: "Do certificates expire?",
    answer: "No, our certificates do not expire. Once earned, your certificate is yours forever and can be accessed from your profile at any time.",
  },
  {
    category: "certificates",
    question: "Can I verify a certificate?",
    answer: "Yes, each certificate has a unique certificate number that can be verified. Share your certificate link or number with anyone who needs to verify your completion.",
  },
  {
    category: "technical",
    question: "Why can't I play videos?",
    answer: "If you're having trouble playing videos, try clearing your browser cache, disabling browser extensions, or using a different browser. Make sure your internet connection is stable. If the issue persists, contact our support team.",
  },
  {
    category: "technical",
    question: "The website is loading slowly. What should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection speed. If the problem continues, it might be a temporary server issue - please try again in a few minutes.",
  },
  {
    category: "technical",
    question: "My progress isn't saving. What should I do?",
    answer: "Make sure you're logged in and have a stable internet connection. Try refreshing the page. If the issue persists, try logging out and back in, or contact our support team.",
  },
  {
    category: "technical",
    question: "How do I report a bug or issue?",
    answer: "You can report bugs through our contact form or by emailing support. Please include details about the issue, your browser/device, and screenshots if possible to help us resolve it quickly.",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about Training Suite. Can't find what
            you're looking for? Contact our support team.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
            >
              All Topics
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-4 w-4 mr-2" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or browse all categories
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
              <CardDescription>
                Can't find the answer you're looking for? Our support team is here
                to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
