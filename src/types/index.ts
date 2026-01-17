// User & Authentication Types
export type UserRole = "user" | "instructor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  title?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Course Types
export type CourseStatus = "draft" | "published" | "pending" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  previewVideo?: string;
  instructor: User | string;
  category: Category | string;
  price: number;
  originalPrice?: number;
  isFree?: boolean;
  isFeatured?: boolean;
  currency?: string;
  status?: CourseStatus;
  level?: CourseLevel;
  language?: string;
  duration?: number;
  enrollmentCount?: number;
  rating?: number;
  averageRating?: number;
  ratingCount?: number;
  requirements?: string[];
  objectives?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithModules extends Course {
  modules: ModuleWithLessons[];
}

// Module Types
export interface Module {
  _id: string;
  title: string;
  description?: string;
  course: string;
  order: number;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

// Lesson Types
export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  type?: "video" | "text" | "quiz";
  materials?: unknown[];
  module: string;
  isFree: boolean;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export type EnrollmentStatus = "active" | "completed" | "expired";

export interface Enrollment {
  _id: string;
  user: string | User;
  course: string | Course;
  status: EnrollmentStatus;
  progress: number;
  completedLessons: string[];
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentWithCourse extends Omit<Enrollment, "course"> {
  course: Course;
}

// Quiz Types
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  lesson: string;
  questions?: Question[];
  passingScore: number;
  timeLimit?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number | string;
  points: number;
  explanation?: string;
  order: number;
  quiz: string;
}

export interface QuizAttempt {
  _id: string;
  user: string | User;
  quiz: string | Quiz;
  answers: { question: string; selectedAnswer: number }[];
  score: number;
  totalPoints: number;
  passed: boolean;
  timeTaken: number;
  createdAt: string;
}

// Certificate Types
export interface Certificate {
  _id: string;
  user: string | User;
  course: string | Course;
  certificateNumber: string;
  certificateId?: string;
  certificateUrl: string;
  issuedAt: string;
  createdAt: string;
}

export interface CertificateWithDetails extends Omit<Certificate, "user" | "course"> {
  user: User;
  course: Course;
}

// Forum Types
export interface Forum {
  _id: string;
  title: string;
  description?: string;
  course?: string;
  createdBy: string | User;
  isGeneral: boolean;
  isActive: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  forum: string | Forum;
  user: User;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: User;
  post?: string;
  lesson?: string;
  parent?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Rating Types
export interface Rating {
  _id: string;
  rating: number;
  review?: string;
  user: User;
  course: string;
  createdAt: string;
  updatedAt: string;
}

// Material Types
export interface Material {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  lesson: string;
  createdAt: string;
}

// Payment Types
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentProvider = "stripe" | "paystack";

export interface Payment {
  _id: string;
  user: string | User;
  course: string | Course;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  provider: PaymentProvider;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Live Session Types
export type LiveSessionStatus = "scheduled" | "live" | "ended" | "cancelled";
export type StreamProvider = "youtube" | "vimeo" | "custom";

export interface LiveSession {
  _id: string;
  title: string;
  description?: string;
  instructor: User;
  course?: Course;
  scheduledAt: string;
  duration: number;
  streamUrl?: string;
  streamProvider: StreamProvider;
  status: LiveSessionStatus;
  thumbnail?: string;
  recordingUrl?: string;
  maxAttendees?: number;
  attendeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveAttendance {
  _id: string;
  user: string | User;
  session: string;
  joinedAt: string;
  leftAt?: string;
  duration: number;
}

// Notification Types
export type NotificationType =
  | "course_enrolled"
  | "course_completed"
  | "certificate_issued"
  | "live_session_reminder"
  | "live_session_started"
  | "new_announcement"
  | "payment_success"
  | "forum_reply"
  | "comment_reply";

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  read?: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Announcement Types
export type AnnouncementPriority = "low" | "medium" | "high";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Site Config Types
export interface SiteConfig {
  siteName: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  enablePayments: boolean;
  enableLiveStreaming: boolean;
  enableForums: boolean;
  enableComments: boolean;
  enableRatings: boolean;
  enableCertificates: boolean;
  maintenanceMode: boolean;
  defaultPaymentProvider: PaymentProvider;
  defaultStreamProvider: StreamProvider;
  contactEmail?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Analytics Types
export interface OverviewAnalytics {
  users: {
    total: number;
    newThisMonth: number;
  };
  courses: {
    total: number;
    published: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
  liveSessions: {
    upcoming: number;
    live: number;
  };
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  enrollmentCount: number;
  completionRate: number;
  revenue: number;
  rating: number;
}

// Filter & Query Types
export interface CourseFilters {
  category?: string;
  instructor?: string;
  level?: CourseLevel;
  isFree?: boolean;
  status?: CourseStatus;
  search?: string;
  sort?: "createdAt" | "title" | "price" | "rating" | "enrollmentCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: UserRole;
  isVerified?: boolean;
  search?: string;
  sort?: "createdAt" | "name" | "email";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
