import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create a unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.name) || ".png";
        const filename = `${uniqueSuffix}${extension}`;

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore if directory exists
        }

        // Write file to public/uploads
        await writeFile(path.join(uploadDir, filename), buffer);

        // Return the URL relative to the public directory
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
