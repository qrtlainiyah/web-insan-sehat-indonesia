import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json(
                { error: "Public ID required" },
                { status: 400 }
            );
        }

        // Construct file path
        const filepath = join(process.cwd(), 'public', 'images', 'products', publicId);

        // Check if file exists and delete it
        if (existsSync(filepath)) {
            await unlink(filepath);
            return NextResponse.json({
                success: true,
                result: "ok"
            });
        }

        // File not found, but still return success
        return NextResponse.json({
            success: true,
            result: "not found"
        });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: error.message || "Delete failed" },
            { status: 500 }
        );
    }
}
