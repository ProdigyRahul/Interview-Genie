import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return new NextResponse(
        JSON.stringify({ error: "No image provided" }), 
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Upload the image to your storage service (e.g., S3, Cloudinary)
    // 2. Get the URL of the uploaded image
    // For this example, we'll assume a mock URL
    const imageUrl = `/uploads/${image.name}`; // Replace with actual upload logic

    // Update user's image in database
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        imageUrl: updatedUser.image 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("[UPLOAD_IMAGE]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to upload image" }), 
      { status: 500 }
    );
  }
} 