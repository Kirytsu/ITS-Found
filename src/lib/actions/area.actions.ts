"use server";
/**
 * src/lib/actions/area.actions.ts
 */
import { db } from "@/lib/db";
import type { SelectOption } from "@/types";

export async function getAllAreas(): Promise<SelectOption[]> {
  const areas = await db.area.findMany({ orderBy: { name: "asc" } });
  return areas.map((a) => ({ value: a.id, label: a.name }));
}

export async function getAllCategories(): Promise<SelectOption[]> {
  const cats = await db.category.findMany({ orderBy: { name: "asc" } });
  return cats.map((c) => ({ value: c.id, label: c.name }));
}

export async function getFacilitiesByArea(areaId: string): Promise<SelectOption[]> {
  if (!areaId) return [];
  const facilities = await db.facility.findMany({ where: { areaId }, orderBy: { name: "asc" } });
  return facilities.map((f) => ({ value: f.id, label: f.name }));
}
