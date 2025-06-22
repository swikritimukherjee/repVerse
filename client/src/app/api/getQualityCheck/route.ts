import { NextRequest, NextResponse } from "next/server";
import { JobDetails, qualityCheck, QualityCheckResult } from "@/components/functions/qualityCheck";
import dbConnect from "@/lib/mongodb";
import WorkSubmission from "@/models/WorkSubmission";
import QualityCheck from "@/models/QualityCheck";
import { isHttpUrl, FileCtor } from "@/components/utils/utils";

interface QualityCheckRequest {
  work: string;
  jobDetails: JobDetails;
  jobId: number;
}

export async function POST(request: NextRequest) {
  try {
    const { work, jobDetails, jobId }: QualityCheckRequest = await request.json();

    let preparedWork: string | File = work;

    if (typeof work === "string" && isHttpUrl(work)) {
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

    const qualityCheckResult: QualityCheckResult = await qualityCheck(preparedWork, jobDetails);

    await dbConnect();

    // Note: Work storage is now handled by WorkSubmission model in submitWork route
    // This route is kept for backward compatibility but should be deprecated

    await QualityCheck.create({
      jobId,
      result: qualityCheckResult
    });

    return NextResponse.json(qualityCheckResult);
  } catch (error) {
    console.error("Error in quality check:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}