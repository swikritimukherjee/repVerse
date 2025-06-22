import { NextRequest, NextResponse } from 'next/server';
import { extractDetails } from '@/components/functions/extractDetails';
import { JobDetails } from '@/components/functions/qualityCheck';

export async function POST(req: NextRequest) {
  const { blurb } = await req.json();
  try {
    const jobDetails: JobDetails = await extractDetails(blurb);
    return NextResponse.json(jobDetails);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to extract job details' }, { status: 500 });
  }
}
