// ============================================
// Database Schema Types
// ============================================

export type SubmissionStatus = "New" | "Read" | "Contacted" | "Archived";

export interface CourseBooking {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: SubmissionStatus;
  createdAt: string; // ISO 8601
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
