/**
 * src/app/api/upload/route.ts
 * Handles multipart image uploads — saves to public/uploads/.
 * Returns { url: "/uploads/<filename>" }.
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";

// Max 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  // Auth guard
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    // Determine file extension
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${randomUUID()}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.error("[Upload Error]", err);
    return NextResponse.json({ error: "Upload gagal." }, { status: 500 });
  }
}
