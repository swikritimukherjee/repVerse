import { JobDetails } from "./qualityCheck";
import { generate } from "../utils/ai/generate";
import { parseUntilJson } from "../utils/parseUntilJson";

export const extractDetails = async (blurb: string): Promise<JobDetails> => {
  const prompt = `You are a helpful assistant that extracts job details from a blurb. You need to carefully distinguish between requirements (general requirements for the job output) and instructions (specific requirements for the job output).

  The extracted job details should be in the following JSON format:
  {
    "title": <clear, concise job title>,
    "description": <detailed description of what the job entails>,
    "requirements": [<list of general requirements that the final output must meet or have>],
    "instructions": [<list of specific requirements for the job output>]
  }

  Examples:
  - Requirements: "The poem should be 10 lines long", "The design should use blue color scheme"
  - Instructions: "The poem must rhyme", "The design must be minimalist", "The logo must be scalable"

  The blurb is: ${blurb}

  There should be no other text before or after the JSON in the response.
  `;
  console.log("Prompt", prompt);
  const response = await generate(prompt);
  console.log("Response", response);
  const json = parseUntilJson(response) as JobDetails;
  return json;
};