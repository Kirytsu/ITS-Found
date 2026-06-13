/**
 * src/types/index.ts
 * Shared TypeScript types and interfaces used across the application.
 * Derive from Prisma-generated types where possible for consistency.
 */

import type {
  User,
  Area,
  Facility,
  Category,
  Report,
  Notification,
  ReportType,
  ReportStatus,
  Role,
  Claim,
} from "@/generated/prisma";


// ─── Re-export enums for convenience ─────────────────────────────────────────
export type { ReportType, ReportStatus, Role };

// ─── Session (decoded JWT payload) ───────────────────────────────────────────
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

// ─── Report with relations (used in list and detail views) ───────────────────
export type ReportWithRelations = Report & {
  author: Pick<User, "id" | "name" | "email">;
  category: Category;
  area: Area;            // primary area (FOUND: the area; LOST: first selected)
  areas: Area[];         // all areas this report spans (FOUND: 1; LOST: 1..n)
  facility: Facility | null;
  verifiedBy: { name: string } | null;
  resolvedBy: { name: string } | null;
  claim?: (Claim & {
    user: Pick<User, "id" | "name" | "email">;
  }) | null;
};

// ─── Notification with matched report ────────────────────────────────────────
export type NotificationWithReport = Notification & {
  matchedReport: ReportWithRelations | null;
};

// ─── Filter params for getPublicReports / getMyReports ───────────────────────
export interface ReportFilters {
  areaId?: string;
  categoryId?: string;
  status?: ReportStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;   // matches title | locationDetail | description
  page?: number;
  limit?: number;
}

// ─── Form input types (mirrors what Server Actions receive) ──────────────────
export interface CreateReportInput {
  title: string;
  type: ReportType;
  categoryId: string;
  areaId: string;            // primary area (LOST: first of areaIds)
  areaIds: string[];         // all areas (FOUND: [areaId]; LOST: 1..n)
  facilityId?: string;       // required if type == FOUND
  locationDetail: string;
  description: string;
  incidentDate: Date;
  imageUrl?: string;
}

export interface UpdateReportInput {
  title?: string;
  categoryId?: string;
  areaId?: string;
  areaIds?: string[];
  facilityId?: string;
  locationDetail?: string;
  description?: string;
  incidentDate?: Date;
  imageUrl?: string;
}

// ─── Auth form inputs ─────────────────────────────────────────────────────────
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Server Action response wrapper ──────────────────────────────────────────
export interface ActionResult {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  errors?: Record<string, string>;
}

// ─── Combobox option type (used in Combobox & Select components) ─────────────
export interface SelectOption {
  value: string;
  label: string;
}
