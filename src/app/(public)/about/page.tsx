"use client";

import {
  Users,
  Target,
  Award,
  BookOpen,
  Globe,
  Zap,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks";


const values = [
  {
    icon: Target,
    title: "Quality Education",
    description: "We believe in providing high-quality, accessible education that transforms lives and careers.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously innovate our platform and learning methods to deliver the best experience.",
  },
  {
    icon: Heart,
    title: "Community",
    description: "We foster a supportive community where learners and instructors can connect and grow together.",
  },
  {
    icon: Sparkles,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from course content to platform features.",
  },
];


export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Training Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're on a mission to democratize education and empower learners worldwide
            with accessible, high-quality courses taught by industry experts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p>
                Training Suite was founded with a simple yet powerful vision:
                to make quality education accessible to everyone, everywhere. We are building
                a comprehensive learning platform to serve learners across the globe.
              </p>
              <p>
                Our team of educators and technologists recognized that traditional education
                often fails to keep pace with the rapidly changing demands of the modern
                workforce. We set out to create a platform that bridges this gap by offering
                practical, up-to-date courses taught by industry professionals.
              </p>
              <p>
                Training Suite aims to host courses across various categories, from technology
                and business to creative arts and personal development. We're committed to
                helping learners advance their careers, start new businesses, and achieve
                their personal goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated ? "Continue Your Learning Journey" : "Ready to Start Learning?"}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            {isAuthenticated
              ? "Explore our courses and continue building your skills with Training Suite."
              : "Transform your career with Training Suite. Browse our courses and start your learning journey today."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
