import "server-only";
import fs from "fs";
import path from "path";
import {
  BlobPreconditionFailedError,
  get,
  put,
} from "@vercel/blob";
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
import { DEFAULT_WORK_ITEMS } from "./default-work";

// ============================================
// Persistent database (private Vercel Blob in production, JSON file locally)
// ============================================

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "submissions.json");
const DB_BLOB_PATH = "private/omar-hussein/submissions.json";
const MAX_WRITE_ATTEMPTS = 3;

interface DbData {
  courseBookings: CourseBooking[];
  contactInquiries: ContactInquiry[];
  nextCourseId: number;
  nextContactId: number;
  workItems: WorkItem[];
  nextWorkId: number;
}

interface DbSnapshot {
  data: DbData;
  etag?: string;
  remote: boolean;
}

const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "New",
  "Read",
  "Contacted",
  "Archived",
];

function createInitialData(): DbData {
  return {
    courseBookings: [],
    contactInquiries: [],
    nextCourseId: 1,
    nextContactId: 1,
    workItems: DEFAULT_WORK_ITEMS.map((item) => ({ ...item })),
    nextWorkId: DEFAULT_WORK_ITEMS.length + 1,
  };
}

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function parseDb(raw: string, source: string): DbData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Database contains invalid JSON: ${source}`, {
      cause: error,
    });
  }

  if (!isDbData(parsed)) {
    throw new Error(`Database has an invalid schema: ${source}`);
  }
  normalizeSubmissionReplies(parsed);
  return parsed;
}

async function readDb(): Promise<DbSnapshot> {
  if (hasBlobStorage()) {
    const result = await get(DB_BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result) {
      return { data: createInitialData(), remote: true };
    }
    if (result.statusCode !== 200) {
      throw new Error("Persistent database returned an unexpected response.");
    }
    const raw = await new Response(result.stream).text();
    return {
      data: parseDb(raw, DB_BLOB_PATH),
      etag: result.blob.etag,
      remote: true,
    };
  }

  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return { data: initial, remote: false };
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return { data: parseDb(raw, DB_FILE), remote: false };
}

async function writeDb(snapshot: DbSnapshot): Promise<void> {
  if (snapshot.remote) {
    await put(DB_BLOB_PATH, JSON.stringify(snapshot.data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: Boolean(snapshot.etag),
      ifMatch: snapshot.etag,
      contentType: "application/json",
    });
    return;
  }

  ensureDir();
  const temporaryFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(snapshot.data, null, 2),
    "utf-8"
  );
  fs.renameSync(temporaryFile, DB_FILE);
}

async function mutateDb<T>(mutator: (data: DbData) => T): Promise<T> {
  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
    const snapshot = await readDb();
    const result = mutator(snapshot.data);
    try {
      await writeDb(snapshot);
      return result;
    } catch (error) {
      if (
        snapshot.remote &&
        attempt < MAX_WRITE_ATTEMPTS &&
        error instanceof BlobPreconditionFailedError
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Database update failed after multiple attempts.");
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
    typeof value.updatedAt === "string" &&
    (value.cardBlobPath === undefined ||
      typeof value.cardBlobPath === "string") &&
    (value.fullBlobPath === undefined ||
      typeof value.fullBlobPath === "string")
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

  // Auto-populate default portfolio catalog when workItems is empty.
  // This handles the case where a Blob DB was created before the seeding
  // logic was added, or when the DB was reset.
  if (
    Array.isArray(value.workItems) &&
    value.workItems.length === 0 &&
    DEFAULT_WORK_ITEMS.length > 0
  ) {
    (value as Record<string, unknown>).workItems = DEFAULT_WORK_ITEMS.map(
      (item) => ({ ...item })
    );
    (value as Record<string, unknown>).nextWorkId =
      DEFAULT_WORK_ITEMS.length + 1;
    console.info(
      `Database migration: populated ${DEFAULT_WORK_ITEMS.length} default work items.`
    );
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

export async function insertCourseBooking(input: {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  message: string;
}): Promise<CourseBooking> {
  return mutateDb((db) => {
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
    return booking;
  });
}

export async function getCourseBookingById(
  id: number
): Promise<CourseBooking | null> {
  const { data } = await readDb();
  return data.courseBookings.find((b) => b.id === id) ?? null;
}

// ============================================
// Contact Inquiries CRUD
// ============================================

export async function insertContactInquiry(input: {
  name: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate: string;
  budgetRange: string;
  message: string;
}): Promise<ContactInquiry> {
  return mutateDb((db) => {
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
    return inquiry;
  });
}

export async function getContactInquiryById(
  id: number
): Promise<ContactInquiry | null> {
  const { data } = await readDb();
  return data.contactInquiries.find((i) => i.id === id) ?? null;
}

// ============================================
// List with Filter/Search/Pagination
// ============================================

export async function listCourseBookings(
  params: SubmissionListParams
): Promise<SubmissionListResult<CourseBooking>> {
  const { data } = await readDb();
  let items = [...data.courseBookings];

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

export async function listContactInquiries(
  params: SubmissionListParams
): Promise<SubmissionListResult<ContactInquiry>> {
  const { data } = await readDb();
  let items = [...data.contactInquiries];

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

export async function updateSubmissionStatus(
  type: "course" | "contact",
  id: number,
  status: SubmissionStatus
): Promise<boolean> {
  return mutateDb((db) => {
    if (type === "course") {
      const item = db.courseBookings.find((b) => b.id === id);
      if (!item) return false;
      item.status = status;
    } else {
      const item = db.contactInquiries.find((i) => i.id === id);
      if (!item) return false;
      item.status = status;
    }
    return true;
  });
}

export async function getSubmissionById(
  type: "course" | "contact",
  id: number
): Promise<CourseBooking | ContactInquiry | null> {
  if (type === "course") return await getCourseBookingById(id);
  return await getContactInquiryById(id);
}

export async function addSubmissionReply(
  type: "course" | "contact",
  id: number,
  reply: SubmissionReply
): Promise<CourseBooking | ContactInquiry | null> {
  return mutateDb((db) => {
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
    return submission;
  });
}

// ============================================
// Dashboard Counts
// ============================================

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const { data } = await readDb();

  return {
    totalCourseBookings: data.courseBookings.length,
    newCourseBookings: data.courseBookings.filter((b) => b.status === "New")
      .length,
    contactedCourseBookings: data.courseBookings.filter(
      (b) => b.status === "Contacted"
    ).length,
    totalContactInquiries: data.contactInquiries.length,
    newContactInquiries: data.contactInquiries.filter((i) => i.status === "New")
      .length,
    contactedContactInquiries: data.contactInquiries.filter(
      (i) => i.status === "Contacted"
    ).length,
  };
}

// ============================================
// Work Items CRUD
// ============================================

export async function insertWorkItem(input: {
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
  cardBlobPath?: string;
  fullBlobPath?: string;
  sourceFile?: string;
}): Promise<WorkItem> {
  return mutateDb((db) => {
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
      cardBlobPath: input.cardBlobPath,
      fullBlobPath: input.fullBlobPath,
      sourceFile: input.sourceFile,
      createdAt: now,
      updatedAt: now,
    };
    db.workItems.push(item);
    return item;
  });
}

export async function getWorkItemById(id: number): Promise<WorkItem | null> {
  const { data } = await readDb();
  return data.workItems.find((w) => w.id === id) ?? null;
}

export async function listWorkItems(
  params: WorkListParams
): Promise<WorkListResult> {
  const { data } = await readDb();
  let items = [...data.workItems];

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

export async function getPublishedWorkItems(): Promise<WorkItem[]> {
  const { data } = await readDb();
  return data.workItems
    .filter((w) => w.isPublished)
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function updateWorkItem(
  id: number,
  updates: Partial<Omit<WorkItem, "id" | "createdAt">>
): Promise<WorkItem | null> {
  return mutateDb((db) => {
    const item = db.workItems.find((w) => w.id === id);
    if (!item) return null;

    if (updates.title !== undefined) item.title = updates.title;
    if (updates.imageUrl !== undefined) item.imageUrl = updates.imageUrl;
    if (updates.fullImageUrl !== undefined)
      item.fullImageUrl = updates.fullImageUrl;
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.altText !== undefined) item.altText = updates.altText;
    if (updates.displayOrder !== undefined)
      item.displayOrder = updates.displayOrder;
    if (updates.isPublished !== undefined)
      item.isPublished = updates.isPublished;
    if (updates.blurDataURL !== undefined)
      item.blurDataURL = updates.blurDataURL;
    if (updates.cardWidth !== undefined) item.cardWidth = updates.cardWidth;
    if (updates.cardHeight !== undefined) item.cardHeight = updates.cardHeight;
    if (updates.cardBlobPath !== undefined)
      item.cardBlobPath = updates.cardBlobPath;
    if (updates.fullBlobPath !== undefined)
      item.fullBlobPath = updates.fullBlobPath;
    item.updatedAt = new Date().toISOString();
    return item;
  });
}

export async function deleteWorkItem(id: number): Promise<boolean> {
  return mutateDb((db) => {
    const index = db.workItems.findIndex((w) => w.id === id);
    if (index === -1) return false;
    db.workItems.splice(index, 1);
    return true;
  });
}

export async function getWorkItemBySourceFile(
  sourceFile: string
): Promise<WorkItem | null> {
  const { data } = await readDb();
  return data.workItems.find((w) => w.sourceFile === sourceFile) ?? null;
}

export async function getWorkCounts(): Promise<{
  total: number;
  published: number;
  draft: number;
}> {
  const { data } = await readDb();
  const total = data.workItems.length;
  const published = data.workItems.filter((w) => w.isPublished).length;
  return { total, published, draft: total - published };
}
