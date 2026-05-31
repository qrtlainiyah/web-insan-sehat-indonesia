import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email, newPassword } = await request.json();

        if (!email || !newPassword) {
            return NextResponse.json(
                { error: "Email dan password baru wajib diisi" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Format email tidak valid" },
                { status: 400 }
            );
        }

        // Validate password length
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter" },
                { status: 400 }
            );
        }

        if (newPassword.length > 128) {
            return NextResponse.json(
                { error: "Password maksimal 128 karakter" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User dengan email tersebut tidak ditemukan" },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            message: "Password berhasil direset",
            user: {
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Gagal mereset password" },
            { status: 500 }
        );
    }
}
