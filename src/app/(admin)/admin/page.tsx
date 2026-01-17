"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, getInitials } from "@/lib/utils";

// Mock data for stats
const stats = [
  {
    title: "Total Users",
    value: "12,543",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Total Courses",
    value: "284",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: BookOpen,
    color: "bg-violet-500",
  },
  {
    title: "Revenue",
    value: "$48,234",
    change: "+23.1%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    title: "Enrollments",
    value: "3,421",
    change: "-2.4%",
    changeType: "negative" as const,
    icon: TrendingUp,
    color: "bg-amber-500",
  },
];

// Mock recent enrollments
const recentEnrollments = [
  { id: 1, user: "John Doe", email: "john@example.com", course: "React Masterclass", price: 99, date: "2 min ago" },
  { id: 2, user: "Jane Smith", email: "jane@example.com", course: "Node.js Advanced", price: 79, date: "15 min ago" },
  { id: 3, user: "Mike Johnson", email: "mike@example.com", course: "TypeScript Basics", price: 49, date: "1 hour ago" },
  { id: 4, user: "Sarah Williams", email: "sarah@example.com", course: "Python for Data Science", price: 129, date: "2 hours ago" },
  { id: 5, user: "Chris Brown", email: "chris@example.com", course: "AWS Fundamentals", price: 89, date: "3 hours ago" },
];

// Mock recent activities
const recentActivities = [
  { id: 1, type: "user", message: "New user registered", user: "Alex Martinez", time: "5 min ago" },
  { id: 2, type: "course", message: "Course published", user: "Sarah Chen", course: "Vue.js 3 Complete Guide", time: "20 min ago" },
  { id: 3, type: "enrollment", message: "New enrollment", user: "David Kim", course: "Docker Mastery", time: "1 hour ago" },
  { id: 4, type: "review", message: "New 5-star review", user: "Emma Wilson", course: "GraphQL Fundamentals", time: "2 hours ago" },
  { id: 5, type: "payment", message: "Payment received", amount: "$129", time: "3 hours ago" },
];

// Mock top courses
const topCourses = [
  { id: 1, title: "React Masterclass", enrollments: 1234, revenue: 12340, rating: 4.9 },
  { id: 2, title: "Node.js Advanced", enrollments: 987, revenue: 9870, rating: 4.8 },
  { id: 3, title: "Python for Beginners", enrollments: 856, revenue: 8560, rating: 4.7 },
  { id: 4, title: "AWS Fundamentals", enrollments: 743, revenue: 7430, rating: 4.9 },
  { id: 5, title: "TypeScript Deep Dive", enrollments: 621, revenue: 6210, rating: 4.6 },
];

function StatCard({ stat }: { stat: typeof stats[0] }) {
  const Icon = stat.icon;
  const isPositive = stat.changeType === "positive";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "user":
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    case "course":
      return <BookOpen className="h-4 w-4 text-violet-600" />;
    case "enrollment":
      return <ShoppingCart className="h-4 w-4 text-green-600" />;
    case "payment":
      return <DollarSign className="h-4 w-4 text-amber-600" />;
    default:
      return <Eye className="h-4 w-4 text-gray-600" />;
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Daily enrollments for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Enrollments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest course enrollments</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/enrollments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(enrollment.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{enrollment.user}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{enrollment.course}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(enrollment.price, "USD")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {enrollment.date}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View User</DropdownMenuItem>
                          <DropdownMenuItem>View Course</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user && <span>{activity.user}</span>}
                      {activity.course && <span> • {activity.course}</span>}
                      {activity.amount && <span> • {activity.amount}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses with highest enrollments this month</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">Manage Courses</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Enrollments</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-right">{course.enrollments.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(course.revenue, "USD")}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{course.rating}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
