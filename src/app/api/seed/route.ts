import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { adminEmail, adminPassword } = await request.json();

        if (!adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "Admin",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        return NextResponse.json({
            message: "Admin user created successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to create admin user" },
            { status: 500 }
        );
    }
}
