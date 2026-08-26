// ============================================
// Database Schema Types
// ============================================

export type SubmissionStatus = "New" | "Read" | "Contacted" | "Archived";

export interface SubmissionReply {
  id: string;
  subject: string;
  message: string;
  sentAt: string; // ISO 8601
  providerEmailId: string;
}

export interface CourseBooking {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: SubmissionStatus;
  createdAt: string; // ISO 8601
  replies: SubmissionReply[];
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate: string;
  budgetRange: string;
  message: string;
  status: SubmissionStatus;
  createdAt: string; // ISO 8601
  replies: SubmissionReply[];
}

export type SubmissionType = "course" | "contact";

export interface SubmissionListParams {
  type: SubmissionType;
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubmissionListResult<T> {
  submissions: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardCounts {
  totalCourseBookings: number;
  newCourseBookings: number;
  contactedCourseBookings: number;
  totalContactInquiries: number;
  newContactInquiries: number;
  contactedContactInquiries: number;
}

// ============================================
// Work / Portfolio Types
// ============================================

export type WorkCategory = "ARTISTIC" | "BRIDAL" | "FASHION" | "PRODUCTS";

export const WORK_CATEGORIES: WorkCategory[] = [
  "ARTISTIC",
  "BRIDAL",
  "FASHION",
  "PRODUCTS",
];

export interface WorkItem {
  id: number;
  title: string;
  imageUrl: string;        // card-sized thumbnail path
  fullImageUrl: string;    // full-res lightbox path
  category: WorkCategory;
  altText: string;
  displayOrder: number;
  isPublished: boolean;
  blurDataURL?: string;
  cardWidth?: number;
  cardHeight?: number;
  sourceFile?: string;     // original filename (for seed idempotency)
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

export interface WorkListParams {
  category?: WorkCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkListResult {
  items: WorkItem[];
  total: number;
  page: number;
  totalPages: number;
}
