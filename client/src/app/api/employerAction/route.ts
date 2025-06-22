import { NextRequest, NextResponse } from "next/server";
import { review, AgentReviewResponse } from "@/components/functions/review";
import { JobDetails, QualityCheckResult } from "@/components/functions/qualityCheck";
import dbConnect from "@/lib/mongodb";
import WorkSubmission from "@/models/WorkSubmission";
import QualityCheck from "@/models/QualityCheck";
import { isHttpUrl, FileCtor } from "@/components/utils/utils";

interface EmployerActionRequest {
  jobId: string;
  freelancerAddress: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  jobDetails: JobDetails;
}

const getWork = async (jobId: string, freelancerAddress: string) => {
  await dbConnect();
  const submission = await WorkSubmission.findOne({ 
    jobId: jobId, 
    freelancerAddress: freelancerAddress 
  });
  
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
};

const getQualityCheckResult = async (jobId: string): Promise<QualityCheckResult> => {
  await dbConnect();
  const qualityCheckResult = await QualityCheck.findOne({ jobId: jobId });
  if (!qualityCheckResult) {
    throw new Error("Quality check result not found");
  }
  return qualityCheckResult.result;
};

export async function POST(request: NextRequest) {
  try {
    const { jobId, freelancerAddress, action, rejectionReason, jobDetails }: EmployerActionRequest = await request.json();

    await dbConnect();

    const submission = await WorkSubmission.findOne({ 
      jobId: jobId, 
      freelancerAddress: freelancerAddress 
    });

    if (!submission) {
      return NextResponse.json({ 
        success: false, 
        message: "Work submission not found" 
      }, { status: 404 });
    }

    if (action === 'approve') {
      // Approve the work
      submission.status = 'approved';
      submission.lastUpdated = new Date();
      await submission.save();

      return NextResponse.json({ 
        success: true, 
        message: "Work approved successfully!" 
      });

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ 
          success: false, 
          message: "Rejection reason is required" 
        }, { status: 400 });
      }

      // Get work and quality check result for review
      const work = await getWork(jobId, freelancerAddress);
      const qualityCheckResult = await getQualityCheckResult(jobId);

      // Perform review
      const reviewResult: AgentReviewResponse = await review(work, jobDetails, qualityCheckResult, rejectionReason);

      // Update submission with review results
      submission.rejectionReason = rejectionReason;
      submission.reviewScore = reviewResult.reviewScore;
      submission.fixableScore = reviewResult.fixableScore;
      submission.reassignScore = reviewResult.reassignScore;
      submission.lastUpdated = new Date();

      // Determine action based on review scores
      if (reviewResult.reviewScore < 5) {
        // Review score is less than 5 - rejection reason is not justified
        // Don't change the submission status, just return the review result
        return NextResponse.json({ 
          success: false, 
          message: "Rejection reason is not sufficiently justified (Review Score: " + reviewResult.reviewScore.toFixed(1) + "/10). You can either accept the work or provide a better rejection reason.",
          action: 'cannot_reject',
          reviewResult,
          canReject: false
        });
      } else if (reviewResult.fixableScore > reviewResult.reassignScore) {
        // Work is fixable - allow revision
        if (submission.retryCount >= 2) {
          submission.status = 'rejected';
          await submission.save();
          
          return NextResponse.json({ 
            success: true, 
            message: "Work rejected - maximum retries exceeded",
            action: 'final_rejection',
            reviewResult,
            canReject: true
          });
        } else {
          // Allow retry
          submission.status = 'revision_requested';
          submission.retryCount += 1;
          await submission.save();
          
          return NextResponse.json({ 
            success: true, 
            message: "Revision requested - freelancer can resubmit",
            action: 'revision_requested',
            reviewResult,
            retriesLeft: 2 - submission.retryCount,
            canReject: true
          });
        }
      } else {
        // Work should be reassigned
        submission.status = 'rejected';
        await submission.save();
        
        return NextResponse.json({ 
          success: true, 
          message: "Work rejected - job should be reassigned to another freelancer",
          action: 'reassign_recommended',
          reviewResult,
          canReject: true
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: "Invalid action" 
    }, { status: 400 });

  } catch (error) {
    console.error("Error in employer action:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
} 