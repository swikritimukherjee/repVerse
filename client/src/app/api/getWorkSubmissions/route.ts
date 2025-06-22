import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkSubmission from "@/models/WorkSubmission";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const freelancerAddress = searchParams.get('freelancerAddress');

    if (!jobId) {
      return NextResponse.json({ 
        success: false, 
        message: "Job ID is required" 
      }, { status: 400 });
    }

    await dbConnect();

    let query: any = { jobId };
    if (freelancerAddress) {
      query.freelancerAddress = freelancerAddress;
    }

    const submissions = await WorkSubmission.find(query).sort({ submittedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      submissions 
    });

  } catch (error) {
    console.error("Error getting work submissions:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
} 