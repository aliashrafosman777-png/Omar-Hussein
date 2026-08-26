import "server-only";
import fs from "fs";
import os from "os";
import path from "path";
import type {
  CourseBooking,
  ContactInquiry,
  SubmissionStatus,
  SubmissionListParams,
  SubmissionListResult,
  DashboardCounts,
  WorkItem,
  WorkCategory,
  WorkListParams,
  WorkListResult,
  SubmissionReply,
} from "./db-schema";
import { WORK_CATEGORIES } from "./db-schema";

// ============================================
// JSON-File Persistent Database
// ============================================

const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "omar-hussein-website")
  : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "submissions.json");

interface DbData {
  courseBookings: CourseBooking[];
  contactInquiries: ContactInquiry[];
  nextCourseId: number;
  nextContactId: number;
  workItems: WorkItem[];
  nextWorkId: number;
}

const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "New",
  "Read",
  "Contacted",
  "Archived",
];

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
      workItems: [],
      nextWorkId: 1,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Database file contains invalid JSON: ${DB_FILE}`, {
      cause: error,
    });
  }

  if (!isDbData(parsed)) {
    throw new Error(`Database file has an invalid schema: ${DB_FILE}`);
  }
  normalizeSubmissionReplies(parsed);
  return parsed;
}

function writeDb(data: DbData): void {
  ensureDir();
  const temporaryFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(temporaryFile, DB_FILE);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    SUBMISSION_STATUSES.includes(value as SubmissionStatus)
  );
}

function hasBaseSubmissionFields(value: Record<string, unknown>): boolean {
  return (
    Number.isSafeInteger(value.id) &&
    Number(value.id) > 0 &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    typeof value.message === "string" &&
    isStatus(value.status) &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    (value.replies === undefined ||
      (Array.isArray(value.replies) && value.replies.every(isSubmissionReply)))
  );
}

function isSubmissionReply(value: unknown): value is SubmissionReply {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.subject === "string" &&
    typeof value.message === "string" &&
    typeof value.sentAt === "string" &&
    !Number.isNaN(Date.parse(value.sentAt)) &&
    typeof value.providerEmailId === "string"
  );
}

function isCourseBooking(value: unknown): value is CourseBooking {
  return (
    isRecord(value) &&
    hasBaseSubmissionFields(value) &&
    typeof value.fullName === "string" &&
    typeof value.course === "string"
  );
}

function isContactInquiry(value: unknown): value is ContactInquiry {
  return (
    isRecord(value) &&
    hasBaseSubmissionFields(value) &&
    typeof value.name === "string" &&
    typeof value.shootType === "string" &&
    typeof value.preferredDate === "string" &&
    typeof value.budgetRange === "string"
  );
}

function isWorkItem(value: unknown): value is WorkItem {
  if (!isRecord(value)) return false;
  return (
    Number.isSafeInteger(value.id) &&
    Number(value.id) > 0 &&
    typeof value.title === "string" &&
    typeof value.imageUrl === "string" &&
    typeof value.fullImageUrl === "string" &&
    typeof value.category === "string" &&
    WORK_CATEGORIES.includes(value.category as WorkCategory) &&
    typeof value.altText === "string" &&
    typeof value.displayOrder === "number" &&
    typeof value.isPublished === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isDbData(value: unknown): value is DbData {
  if (!isRecord(value)) return false;
  const hasBase =
    Array.isArray(value.courseBookings) &&
    value.courseBookings.every(isCourseBooking) &&
    Array.isArray(value.contactInquiries) &&
    value.contactInquiries.every(isContactInquiry) &&
    Number.isSafeInteger(value.nextCourseId) &&
    Number(value.nextCourseId) > 0 &&
    Number.isSafeInteger(value.nextContactId) &&
    Number(value.nextContactId) > 0;
  if (!hasBase) return false;

  // Backward-compatible: migrate old DB files without workItems
  if (!Array.isArray(value.workItems)) {
    (value as Record<string, unknown>).workItems = [];
    (value as Record<string, unknown>).nextWorkId = 1;
  }
  if (!Number.isSafeInteger(value.nextWorkId)) {
    (value as Record<string, unknown>).nextWorkId = 1;
  }

  return (
    Array.isArray(value.workItems) &&
    value.workItems.every(isWorkItem)
  );
}

function normalizeSubmissionReplies(db: DbData): void {
  for (const submission of [
    ...db.courseBookings,
    ...db.contactInquiries,
  ]) {
    if (!Array.isArray(submission.replies)) {
      submission.replies = [];
    }
  }
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
    replies: [],
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
    replies: [],
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

export function addSubmissionReply(
  type: "course" | "contact",
  id: number,
  reply: SubmissionReply
): CourseBooking | ContactInquiry | null {
  const db = readDb();
  const submission =
    type === "course"
      ? db.courseBookings.find((booking) => booking.id === id)
      : db.contactInquiries.find((inquiry) => inquiry.id === id);

  if (!submission) return null;

  const existingReply = submission.replies.find(
    (existing) => existing.id === reply.id
  );
  if (!existingReply) {
    submission.replies.push(reply);
  }
  submission.status = "Contacted";
  writeDb(db);
  return submission;
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

// ============================================
// Work Items CRUD
// ============================================

export function insertWorkItem(input: {
  title: string;
  imageUrl: string;
  fullImageUrl: string;
  category: WorkCategory;
  altText: string;
  displayOrder?: number;
  isPublished?: boolean;
  blurDataURL?: string;
  cardWidth?: number;
  cardHeight?: number;
  sourceFile?: string;
}): WorkItem {
  const db = readDb();
  const now = new Date().toISOString();
  const item: WorkItem = {
    id: db.nextWorkId++,
    title: input.title,
    imageUrl: input.imageUrl,
    fullImageUrl: input.fullImageUrl,
    category: input.category,
    altText: input.altText,
    displayOrder: input.displayOrder ?? db.workItems.length + 1,
    isPublished: input.isPublished ?? true,
    blurDataURL: input.blurDataURL,
    cardWidth: input.cardWidth,
    cardHeight: input.cardHeight,
    sourceFile: input.sourceFile,
    createdAt: now,
    updatedAt: now,
  };
  db.workItems.push(item);
  writeDb(db);
  return item;
}

export function getWorkItemById(id: number): WorkItem | null {
  const db = readDb();
  return db.workItems.find((w) => w.id === id) ?? null;
}

export function listWorkItems(params: WorkListParams): WorkListResult {
  const db = readDb();
  let items = [...db.workItems];

  if (params.category) {
    items = items.filter((w) => w.category === params.category);
  }

  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(
      (w) =>
        w.title.toLowerCase().includes(s) ||
        w.altText.toLowerCase().includes(s) ||
        w.category.toLowerCase().includes(s)
    );
  }

  // Sort by displayOrder ascending, then newest first
  items.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  return {
    items: items.slice(offset, offset + limit),
    total,
    page,
    totalPages,
  };
}

export function getPublishedWorkItems(): WorkItem[] {
  const db = readDb();
  return db.workItems
    .filter((w) => w.isPublished)
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function updateWorkItem(
  id: number,
  updates: Partial<Omit<WorkItem, "id" | "createdAt">>
): WorkItem | null {
  const db = readDb();
  const item = db.workItems.find((w) => w.id === id);
  if (!item) return null;

  if (updates.title !== undefined) item.title = updates.title;
  if (updates.imageUrl !== undefined) item.imageUrl = updates.imageUrl;
  if (updates.fullImageUrl !== undefined) item.fullImageUrl = updates.fullImageUrl;
  if (updates.category !== undefined) item.category = updates.category;
  if (updates.altText !== undefined) item.altText = updates.altText;
  if (updates.displayOrder !== undefined) item.displayOrder = updates.displayOrder;
  if (updates.isPublished !== undefined) item.isPublished = updates.isPublished;
  if (updates.blurDataURL !== undefined) item.blurDataURL = updates.blurDataURL;
  if (updates.cardWidth !== undefined) item.cardWidth = updates.cardWidth;
  if (updates.cardHeight !== undefined) item.cardHeight = updates.cardHeight;
  item.updatedAt = new Date().toISOString();

  writeDb(db);
  return item;
}

export function deleteWorkItem(id: number): boolean {
  const db = readDb();
  const index = db.workItems.findIndex((w) => w.id === id);
  if (index === -1) return false;
  db.workItems.splice(index, 1);
  writeDb(db);
  return true;
}

export function getWorkItemBySourceFile(sourceFile: string): WorkItem | null {
  const db = readDb();
  return db.workItems.find((w) => w.sourceFile === sourceFile) ?? null;
}

export function getWorkCounts(): { total: number; published: number; draft: number } {
  const db = readDb();
  const total = db.workItems.length;
  const published = db.workItems.filter((w) => w.isPublished).length;
  return { total, published, draft: total - published };
}
