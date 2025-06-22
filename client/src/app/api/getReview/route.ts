import { NextRequest, NextResponse } from "next/server";
import { review, AgentReviewResponse } from "@/components/functions/review";
import dbConnect from "@/lib/mongodb";
import WorkSubmission from "@/models/WorkSubmission";
import QualityCheck from "@/models/QualityCheck";
import { isHttpUrl } from "@/components/utils/utils";
import { FileCtor } from "@/components/utils/utils";
import { JobDetails, QualityCheckResult } from "@/components/functions/qualityCheck";

const getWork = async (jobId: string, freelancerAddress: string) => {
    await dbConnect();
    const submission = await WorkSubmission.findOne({ jobId: jobId, freelancerAddress: freelancerAddress });
    if (!submission) {
        throw new Error("Work submission not found");
    }
    
    let preparedWork: string | File = submission.work;
    if (typeof preparedWork === "string" && isHttpUrl(preparedWork)) {
        try {
          const response = await fetch(preparedWork);
          if (!response.ok) {
            throw new Error(`Failed to fetch work URL: ${response.status} ${response.statusText}`);
          }
  
          const contentType = response.headers.get("content-type") || "";
  
          if (contentType.startsWith("image/")) {
            const arrayBuffer = await response.arrayBuffer();
            const fileName = submission.work.split("/").pop() || "image";
            preparedWork = new FileCtor([arrayBuffer], fileName, { type: contentType });
          } else {
            preparedWork = await response.text();
          }
        } catch (err) {
          console.error("Error fetching work URL:", err);
          preparedWork = submission.work;
        }
      }
    return preparedWork;
}

const getQualityCheckResult = async (jobId: string) => {
    await dbConnect();
    const qualityCheckResult = await QualityCheck.findOne({ jobId: jobId });
    return qualityCheckResult.result;
}

interface ReviewRequest {
  rejectionReason: string;
  jobDetails: JobDetails;
  jobId: string;
  freelancerAddress: string;
}

export async function POST(request: NextRequest) {
    const { rejectionReason, jobDetails, jobId, freelancerAddress }: ReviewRequest = await request.json();
    const work = await getWork(jobId, freelancerAddress);
    const qualityCheckResult: QualityCheckResult = await getQualityCheckResult(jobId);
    const reviewResult: AgentReviewResponse = await review(work, jobDetails, qualityCheckResult, rejectionReason);
    return NextResponse.json(reviewResult);
}