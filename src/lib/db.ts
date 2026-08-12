import "server-only";
import fs from "fs";
import path from "path";
import type {
  CourseBooking,
  ContactInquiry,
  SubmissionStatus,
  SubmissionListParams,
  SubmissionListResult,
  DashboardCounts,
} from "./db-schema";

// ============================================
// JSON-File Persistent Database
// ============================================

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "submissions.json");

interface DbData {
  courseBookings: CourseBooking[];
  contactInquiries: ContactInquiry[];
  nextCourseId: number;
  nextContactId: number;
}

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DbData {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial: DbData = {
      courseBookings: [],
      contactInquiries: [],
      nextCourseId: 1,
      nextContactId: 1,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw) as DbData;
}

function writeDb(data: DbData): void {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ============================================
// Course Bookings CRUD
// ============================================

export function insertCourseBooking(input: {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  message: string;
}): CourseBooking {
  const db = readDb();
  const booking: CourseBooking = {
    id: db.nextCourseId++,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    course: input.course,
    message: input.message,
    status: "New",
    createdAt: new Date().toISOString(),
  };
  db.courseBookings.push(booking);
  writeDb(db);
  return booking;
}

export function getCourseBookingById(id: number): CourseBooking | null {
  const db = readDb();
  return db.courseBookings.find((b) => b.id === id) ?? null;
}

// ============================================
// Contact Inquiries CRUD
// ============================================

export function insertContactInquiry(input: {
  name: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate: string;
  budgetRange: string;
  message: string;
}): ContactInquiry {
  const db = readDb();
  const inquiry: ContactInquiry = {
    id: db.nextContactId++,
    name: input.name,
    email: input.email,
    phone: input.phone,
    shootType: input.shootType,
    preferredDate: input.preferredDate,
    budgetRange: input.budgetRange,
    message: input.message,
    status: "New",
    createdAt: new Date().toISOString(),
  };
  db.contactInquiries.push(inquiry);
  writeDb(db);
  return inquiry;
}

export function getContactInquiryById(id: number): ContactInquiry | null {
  const db = readDb();
  return db.contactInquiries.find((i) => i.id === id) ?? null;
}

// ============================================
// List with Filter/Search/Pagination
// ============================================

export function listCourseBookings(
  params: SubmissionListParams
): SubmissionListResult<CourseBooking> {
  const db = readDb();
  let items = [...db.courseBookings];

  if (params.status) {
    items = items.filter((i) => i.status === params.status);
  }

  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.fullName.toLowerCase().includes(s) ||
        i.email.toLowerCase().includes(s) ||
        i.phone.toLowerCase().includes(s) ||
        i.course.toLowerCase().includes(s) ||
        i.message.toLowerCase().includes(s)
    );
  }

  // Sort newest first
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    submissions: items.slice(offset, offset + limit),
    total,
    page,
    totalPages,
  };
}

export function listContactInquiries(
  params: SubmissionListParams
): SubmissionListResult<ContactInquiry> {
  const db = readDb();
  let items = [...db.contactInquiries];

  if (params.status) {
    items = items.filter((i) => i.status === params.status);
  }

  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(s) ||
        i.email.toLowerCase().includes(s) ||
        i.phone.toLowerCase().includes(s) ||
        i.shootType.toLowerCase().includes(s) ||
        i.message.toLowerCase().includes(s) ||
        i.budgetRange.toLowerCase().includes(s)
    );
  }

  // Sort newest first
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    submissions: items.slice(offset, offset + limit),
    total,
    page,
    totalPages,
  };
}

// ============================================
// Update Status
// ============================================

export function updateSubmissionStatus(
  type: "course" | "contact",
  id: number,
  status: SubmissionStatus
): boolean {
  const db = readDb();

  if (type === "course") {
    const item = db.courseBookings.find((b) => b.id === id);
    if (!item) return false;
    item.status = status;
  } else {
    const item = db.contactInquiries.find((i) => i.id === id);
    if (!item) return false;
    item.status = status;
  }

  writeDb(db);
  return true;
}

export function getSubmissionById(
  type: "course" | "contact",
  id: number
): CourseBooking | ContactInquiry | null {
  if (type === "course") return getCourseBookingById(id);
  return getContactInquiryById(id);
}

// ============================================
// Dashboard Counts
// ============================================

export function getDashboardCounts(): DashboardCounts {
  const db = readDb();

  return {
    totalCourseBookings: db.courseBookings.length,
    newCourseBookings: db.courseBookings.filter((b) => b.status === "New")
      .length,
    contactedCourseBookings: db.courseBookings.filter(
      (b) => b.status === "Contacted"
    ).length,
    totalContactInquiries: db.contactInquiries.length,
    newContactInquiries: db.contactInquiries.filter((i) => i.status === "New")
      .length,
    contactedContactInquiries: db.contactInquiries.filter(
      (i) => i.status === "Contacted"
    ).length,
  };
}
