import { NextRequest, NextResponse } from "next/server";
import { genImage } from "@/components/functions/generateImage";

export async function POST(request: NextRequest) {
    const { title, description } = await request.json();
    const imageBlob = await genImage({ title, description });
    return new NextResponse(imageBlob, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}