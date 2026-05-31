import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admin can update products
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = productSchema.parse(body);

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: validatedData,
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error updating product:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admin can delete products
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        if (product.imageUrl) {
            try {
                const urlParts = product.imageUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');

                if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                    const filename = urlParts[urlParts.length - 1];
                    const folder = urlParts[urlParts.length - 2];
                    const publicId = `${folder}/${filename.split('.')[0]}`;

                    await fetch(`${request.nextUrl.origin}/api/upload/delete`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Cookie": request.headers.get("cookie") || "",
                        },
                        body: JSON.stringify({ publicId }),
                    });
                }
            } catch (deleteError) {
                console.error("Failed to delete product image:", deleteError);
            }
        }

        await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting product:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
