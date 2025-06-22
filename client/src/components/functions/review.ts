import { generate, generateWithImage } from "../utils/ai/generate";
import { parseUntilJson } from "../utils/parseUntilJson";
import { JobDetails, QualityCheckResult } from "./qualityCheck";


export interface AgentReviewResponse {
  reviewScore: number;
  criticalConsideration: string[];
  fixableScore: number;
  reassignScore: number;
}

interface MasterAggregation {
  aggregatedCriticalConsideration: string[];
}

// Helper to build the shared context part of the prompt
const buildContext = (
  rejectionReason: string,
  jobDetails: JobDetails,
  qualityResult: QualityCheckResult
): string => {
  const { title, description, requirements, instructions } = jobDetails;
  return `Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
\nAggregated QA Result: ${JSON.stringify(
    qualityResult
  )}\nJob Poster\'s Rejection Reason: "${rejectionReason}"`;
};

const VERY_LENIENT_PROMPT_PREFIX = `You are an empathetic review agent who generally gives workers the benefit of the doubt. You must decide whether the job poster's rejection reason is valid or over-critical. Lean towards seeing the work as acceptable and fixable.`;

const LENIENT_PROMPT_PREFIX = `You are a supportive review agent. Assess the validity of the rejection reason while remaining generous, but be prepared to acknowledge valid points.`;

const NEUTRAL_PROMPT_PREFIX = `You are a neutral review agent. Objectively determine whether the rejection reason is justified, without bias towards either the worker or the poster.`;

const STRICT_PROMPT_PREFIX = `You are a strict review agent. Scrutinise the work and the rejection reason closely, tending to side with the poster when there is reasonable doubt.`;

const VERY_STRICT_PROMPT_PREFIX = `You are a very strict review agent who assumes high standards must be met. Unless the evidence clearly shows the work satisfies all requirements, the rejection is likely valid.`;

const buildAgentPrompt = (prefix: string, context: string) => `${prefix}
\n${context}
\nReturn a JSON object **only** in the following format with no extra text:
{
  "reviewScore": <number 1-10 indicating how valid the rejection reason is>,
  "criticalConsideration": [
    <list of concise bullet points examining the reason in light of the work and QA feedback>
  ],
  "fixableScore": <number 1-10 indicating likelihood the current worker can fix the issues>,
  "reassignScore": <number 1-10 indicating likelihood the job should be reassigned>
}`;

const callAgent = async (
  prefix: string,
  work: string | File,
  context: string
): Promise<AgentReviewResponse> => {
  const prompt = buildAgentPrompt(prefix, context);
  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as AgentReviewResponse;
  }
  const response = await generate(`${prompt}\nWork Sample: ${work}`);
  return parseUntilJson(response) as AgentReviewResponse;
};

const VERY_LENIENT = "veryLenient" as const;
const LENIENT = "lenient" as const;
const NEUTRAL = "neutral" as const;
const STRICT = "strict" as const;
const VERY_STRICT = "veryStrict" as const;

type AgentKey =
  // | typeof VERY_LENIENT
  // | typeof LENIENT
  | typeof NEUTRAL
  // | typeof STRICT
  // | typeof VERY_STRICT;

type AgentMap = Record<
  AgentKey,
  (work: string | File, context: string) => Promise<AgentReviewResponse>
>;

const AGENTS: AgentMap = {
  // [VERY_LENIENT]: (work, context) =>
  //   callAgent(VERY_LENIENT_PROMPT_PREFIX, work, context),
  // [LENIENT]: (work, context) => callAgent(LENIENT_PROMPT_PREFIX, work, context),
  [NEUTRAL]: (work, context) => callAgent(NEUTRAL_PROMPT_PREFIX, work, context),
  // [STRICT]: (work, context) => callAgent(STRICT_PROMPT_PREFIX, work, context),
  // [VERY_STRICT]: (work, context) =>
  //   callAgent(VERY_STRICT_PROMPT_PREFIX, work, context),
};

const masterAgentPrompt = (
  context: string,
  feedbackFromAgents: { agent: AgentKey; response: AgentReviewResponse }[]
) => `You are a master review aggregator. Your task is to analyse multiple agent evaluations of whether the job poster's rejection reason is justified. Do **not** add new opinions, only consolidate.

${context}

Here are the agent evaluations:
${JSON.stringify(feedbackFromAgents, null, 2)}

Return a single JSON object in this exact format with **no** extra text:
{
  "aggregatedCriticalConsideration": [
    <consolidated, non-redundant list of critical considerations>
  ]
}`;

const masterAgent = async (
  work: string | File,
  context: string,
  feedbackFromAgents: { agent: AgentKey; response: AgentReviewResponse }[]
): Promise<MasterAggregation> => {
  const prompt = masterAgentPrompt(context, feedbackFromAgents);
  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as MasterAggregation;
  }
  const response = await generate(`${prompt}\nWork Sample: ${work}`);
  return parseUntilJson(response) as MasterAggregation;
};

export const review = async (
  work: string | File,
  jobDetails: JobDetails,
  qualityResult: QualityCheckResult,
  rejectionReason: string
): Promise<AgentReviewResponse> => {
  const context = buildContext(rejectionReason, jobDetails, qualityResult);
  const agentResults: { agent: AgentKey; response: AgentReviewResponse }[] = [];

  for (const [agentKey, agentFn] of Object.entries(AGENTS) as [
    AgentKey,
    AgentMap[AgentKey]
  ][]) {
    console.log(`Review by ${agentKey} agent:`);
    const res = await agentFn(work, context);
    console.log(res);
    agentResults.push({ agent: agentKey, response: res });
  }

  const aggregated = await masterAgent(work, context, agentResults);

  const average = (key: keyof AgentReviewResponse) =>
    agentResults.reduce((acc, cur) => acc + (cur.response[key] as number), 0) /
    agentResults.length;

  return {
    reviewScore: average("reviewScore"),
    criticalConsideration: aggregated.aggregatedCriticalConsideration,
    fixableScore: average("fixableScore"),
    reassignScore: average("reassignScore"),
  };
};

// const qualityResult: QualityCheckResult = {
//   quality: 9.6,
//   positiveFeedback: [
//     "The menu successfully includes the three required sections: Main Course, Appetizers, and Beverages, with each section featuring 4-6 items and clear USD pricing.",
//     "The design is modern and clean, effectively utilizing the requested black background and vibrant orange highlights, creating a visually appealing contrast.",
//     "The 'FOOD MENU' title is bold and large, establishing a clear hierarchy at the top of the menu.",
//     "The restaurant name, 'Paucek and Lage Restaurant', is clearly displayed at the top as requested.",
//     "Item names are consistently left-aligned and prices are right-aligned, which greatly enhances readability and organization.",
//     "The use of white text for menu items and prices against the dark background provides excellent contrast and legibility.",
//     "Orange label tags are effectively used for section headings (MAIN COURSE, APPETIZERS, BEVERAGES), making the categories stand out.",
//     "Circular and appropriate food images are included next to each section, adding an appealing visual element to the menu.",
//     "Contact information, including a phone number and address, is accurately placed at the bottom with appropriate icons.",
//   ],
//   negativeFeedback: [
//     "The 'Appetizers' section lists 'Cocktails', which is a beverage and not a food item, thereby deviating from the requirement that 'Each section should have 4-6 food items'.",
//     "The image provided for the 'Appetizers' section, depicting grilled chicken and potatoes, does not typically represent appetizers, which are usually smaller, shared dishes, potentially misaligning with the section's content.",
//   ],
// };

// const jobDetails: JobDetails = {
//   title: "Design a Restaurant Menu",
//   description:
//     "Create a visually appealing food menu for a restaurant called 'Paucek and Lage Restaurant'. The menu should be divided into categories with pricing.",
//   requirements: [
//     "The menu must include three sections: Main Course, Appetizers, and Beverages",
//     "Each section should have 4-6 food items with prices in USD",
//     "Include appropriate food images for each section",
//     "Use a modern and clean design with orange highlights and a black background",
//     "Display the restaurant name at the top of the menu",
//     "Add contact number and address at the bottom",
//   ],
//   instructions: [
//     "Use a bold and large title for 'FOOD MENU'",
//     "Ensure that item names are aligned left and prices aligned right",
//     "Use white text for item names and prices to contrast with the dark background",
//     "Add orange label tags for section headings like 'MAIN COURSE', 'APPETIZERS', and 'BEVERAGES'",
//     "Include circular food images next to each section",
//     "Include contact information (phone and address) with icons at the bottom",
//   ],
// };

// const rejectionReason = "This is not a menu at all!";

// import path from "path";
// import * as fs from "fs";

// const imagePath = path.join(__dirname, "chingri.webp");
// const imageBuffer = fs.readFileSync(imagePath);
// const image = new File([imageBuffer], "image.png", { type: "image/png" });

// const response = await review(image, jobDetails, qualityResult, rejectionReason);
// console.log(response);