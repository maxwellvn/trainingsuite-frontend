"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { paymentsApi } from "@/lib/api/payments";
import type { Payment, PaymentStatus, Course, User } from "@/types";
import { format, parseISO } from "date-fns";

export default function PaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => paymentsApi.getHistory(1, 100),
  });

  const payments = paymentsData?.data || [];

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const course = payment.course as Course;
    const matchesSearch =
      course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    totalSpent: payments
      .filter((p) => p.status === "completed")
      .reduce((acc, p) => acc + p.amount, 0),
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "stripe":
        return "💳 Stripe";
      case "paystack":
        return "💳 Paystack";
      default:
        return provider;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">
          View and manage your payment transactions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Your payment history will appear here"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const course = payment.course as Course;
                  return (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {course?.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {course?.title || "Unknown Course"}
                            </p>
                            {payment.transactionId && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {payment.transactionId.substring(0, 16)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {payment.currency === "USD" ? "$" : payment.currency}
                          {payment.amount.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm">
                        {getProviderLogo(payment.provider)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(payment.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === "completed" && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          )}
                          {course?.slug && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/courses/${course.slug}`}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            We accept the following payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <span className="text-2xl">💳</span>
              <span>Credit/Debit Cards</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <span className="text-2xl">🏦</span>
              <span>Bank Transfer</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <span className="text-2xl">📱</span>
              <span>Mobile Money</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            All payments are processed securely. If you have any questions about billing,
            please <Link href="/contact" className="text-primary hover:underline">contact support</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
