import { NextRequest, NextResponse } from "next/server";
import { qualityCheck, QualityCheckResult, JobDetails } from "@/components/functions/qualityCheck";
import dbConnect from "@/lib/mongodb";
import WorkSubmission from "@/models/WorkSubmission";
import QualityCheck from "@/models/QualityCheck";
import { isHttpUrl, FileCtor } from "@/components/utils/utils";

interface SubmitWorkRequest {
  jobId: string;
  freelancerAddress: string;
  work: string;
  jobDetails: JobDetails;
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, freelancerAddress, work, jobDetails }: SubmitWorkRequest = await request.json();

    // Prepare work for quality check
    let preparedWork: string | File = work;
    console.log(typeof work);
    console.log(work as any instanceof File);
    console.log(work);

    if (typeof work === "string" && isHttpUrl(work)) {
      console.log("fetching work URL");
      try {
        const response = await fetch(work);
        if (!response.ok) {
          throw new Error(`Failed to fetch work URL: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.startsWith("image/")) {
          const arrayBuffer = await response.arrayBuffer();
          const fileName = work.split("/").pop() || "image";
          preparedWork = new FileCtor([arrayBuffer], fileName, { type: contentType });
        } else {
          preparedWork = await response.text();
        }
      } catch (err) {
        console.error("Error fetching work URL:", err);
        preparedWork = work;
      }
    }

    console.log(preparedWork instanceof File);

    // Perform quality check
    const qualityCheckResult: QualityCheckResult = await qualityCheck(preparedWork, jobDetails);

    await dbConnect();

    // Save quality check result to MongoDB
    await QualityCheck.create({
      jobId,
      result: {
        quality: qualityCheckResult.quality,
        positiveFeedback: qualityCheckResult.positiveFeedback,
        negativeFeedback: qualityCheckResult.negativeFeedback,
        freelancerAddress,
        work: typeof work === 'string' ? work : 'File uploaded',
        timestamp: new Date()
      }
    });

    // Check if quality score is greater than 7
    if (qualityCheckResult.quality <= 7) {
      return NextResponse.json({ 
        success: false, 
        message: "Work quality score is too low. Please improve your work and try again.",
        qualityScore: qualityCheckResult.quality,
        feedback: {
          positive: qualityCheckResult.positiveFeedback,
          negative: qualityCheckResult.negativeFeedback
        }
      }, { status: 400 });
    }

    // Check if there's already a submission for this job by this freelancer
    const existingSubmission = await WorkSubmission.findOne({ 
      jobId: jobId, 
      freelancerAddress: freelancerAddress 
    });

    if (existingSubmission) {
      // Update existing submission (for retries)
      existingSubmission.work = work;
      existingSubmission.qualityScore = qualityCheckResult.quality;
      existingSubmission.status = 'pending';
      existingSubmission.lastUpdated = new Date();
      await existingSubmission.save();
    } else {
      // Create new submission
      await WorkSubmission.create({
        jobId,
        freelancerAddress,
        work,
        qualityScore: qualityCheckResult.quality,
        status: 'pending'
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Work submitted successfully and is pending review!",
      qualityScore: qualityCheckResult.quality,
      feedback: {
        positive: qualityCheckResult.positiveFeedback,
        negative: qualityCheckResult.negativeFeedback
      }
    });

  } catch (error) {
    console.error("Error in work submission:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
} 