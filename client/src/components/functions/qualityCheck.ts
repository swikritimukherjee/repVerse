import { generate, generateWithImage } from "../utils/ai/generate";
import { parseUntilJson } from "../utils/parseUntilJson";

export interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  instructions: string[];
}

export interface QualityCheckResult {
  quality: number;
  positiveFeedback: string[];
  negativeFeedback: string[];
}

const veryLenientAgent = async (
  work: string | File,
  jobDetails: JobDetails
): Promise<QualityCheckResult> => {
  const { title, description, requirements, instructions } = jobDetails;
  const prompt = `You are a helpful quality assurance assistant with a generous perspective. You are given a job description and a work sample. Try to find ways the sample fulfills the intent, even if loosely.

Your response should be in the following format:
{
    "quality": <quality of the work sample on a scale of 1 to 10>,
    "positiveFeedback": [
        <list of positive feedbacks on the work sample>
    ],
    "negativeFeedback": [
        <list of gentle, constructive areas where the work might be improved slightly>
    ]
}

Focus on encouragement and assume good intent in the work. Give the benefit of the doubt wherever reasonable. The response should be in JSON format, there should be no other text before or after the JSON in the response.

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
`;
  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as QualityCheckResult;
  } else {
    const response = await generate(prompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as QualityCheckResult;
  }
};

const lenientAgent = async (work: string | File, jobDetails: JobDetails): Promise<QualityCheckResult> => {
  const { title, description, requirements, instructions } = jobDetails;
  const prompt = `You are a quality assurance reviewer with a supportive mindset. You are given a job description and a work sample. Evaluate how well the sample meets the requirements, but remain flexible and prioritize overall intent and effort.

Your response should be in the following format:
{
    "quality": <quality of the work sample on a scale of 1 to 10>,
    "positiveFeedback": [
        <list of positive feedbacks on the work sample>
    ],
    "negativeFeedback": [
        <list of constructive feedbacks for possible improvements>
    ]
}

Be generally generous with your rating, unless the work clearly misses the mark. The response should be in JSON format, there should be no other text before or after the JSON in the response.

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
`;

  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as QualityCheckResult;
  } else {
    const response = await generate(prompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as QualityCheckResult;
  }
};

const neutralAgent = async (work: string | File, jobDetails: JobDetails): Promise<QualityCheckResult> => {
  const { title, description, requirements, instructions } = jobDetails;
  const prompt = `You are a quality assurance expert. You are given a job description and a work sample. You need to check if the work sample meets the job requirements.

Your response should be in the following format:
{
    "quality": <quality of the work sample on a scale of 1 to 10>,
    "positiveFeedback": [
        <list of positive feedbacks on the work sample>
    ],
    "negativeFeedback": [
        <list of negative feedbacks on the work sample>
    ]
}

The response should be in JSON format, there should be no other text before or after the JSON in the response.

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
`;

  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as QualityCheckResult;
  } else {
    const response = await generate(prompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as QualityCheckResult;
  }
};

const strictAgent = async (work: string | File, jobDetails: JobDetails): Promise<QualityCheckResult> => {
  const { title, description, requirements, instructions } = jobDetails;
  const prompt = `You are a meticulous quality assurance evaluator. You are given a job description and a work sample. Your job is to strictly assess whether the sample adheres to the requirements and instructions, with minimal tolerance for deviation.

Your response should be in the following format:
{
    "quality": <quality of the work sample on a scale of 1 to 10>,
    "positiveFeedback": [
        <list of precise, well-justified strengths of the work sample>
    ],
    "negativeFeedback": [
        <list of specific, clear shortcomings in the work sample>
    ]
}

Be critical. Only give high scores if the sample fully and exactly meets the stated requirements.

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
`;

  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as QualityCheckResult;
  } else {
    const response = await generate(prompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as QualityCheckResult;
  }
};

const veryStrictAgent = async (work: string | File, jobDetails: JobDetails): Promise<QualityCheckResult> => {
  const { title, description, requirements, instructions } = jobDetails;
  const prompt = `You are a no-compromise quality assurance inspector. You are given a job description and a work sample. Your task is to rigorously evaluate the sample for full compliance with all listed requirements and instructions. Any deviation, however minor, should be noted.

Your response should be in the following format:
{
    "quality": <quality of the work sample on a scale of 1 to 10>,
    "positiveFeedback": [
        <list of strengths that meet or exceed expectations precisely>
    ],
    "negativeFeedback": [
        <list of all deficiencies, inaccuracies, or deviations from the job's stated requirements>
    ]
}

Assume the highest standards. Be detailed and unforgiving in your assessment. Only give a 10 if the work is flawless.

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
`;

  if (work instanceof File) {
    const response = await generateWithImage(prompt, work);
    return parseUntilJson(response) as QualityCheckResult;
  } else {
    const response = await generate(prompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as QualityCheckResult;
  }
};

const AGENTS = {
  // veryLenient: veryLenientAgent,
  // lenient: lenientAgent,
  neutral: neutralAgent,
  // strict: strictAgent,
  // veryStrict: veryStrictAgent,
};

const masterAgent = async (
  work: string | File,
  jobDetails: JobDetails,
  feedbackFromAgents: {
    positiveFeedback: string[];
    negativeFeedback: string[];
  }[]
): Promise<{
  aggregatedPositiveFeedback: string[];
  aggregatedNegativeFeedback: string[];
}> => {
  const { title, description, requirements, instructions } = jobDetails;
  const masterPrompt = `You are a master quality assurance aggregator. Your role is to synthesize multiple QA agent evaluations into a single, objective summary.

You are given:
- A job title
- A job description
- A list of requirements and instructions
- A set of positive and negative feedbacks provided by multiple QA agents (who have reviewed the same work sample)

Your task:
- Carefully analyze whether the feedback aligns with the stated job requirements and instructions.
- Identify which points of feedback are valid, consistent, and supported by the job details.
- Remove any redundant, vague, or biased points.
- Do not generate your own feedback or speculate about the work sample — only judge the **validity and usefulness** of the provided feedback.
- Be neutral, precise, and fact-based.

Return a single JSON object in the following format:
{
  "aggregatedPositiveFeedback": [
    <consolidated list of valid, non-redundant positive feedback points>
  ],
  "aggregatedNegativeFeedback": [
    <consolidated list of valid, non-redundant negative feedback points>
  ]
}

Job Title: ${title}
Job Description: ${description}
Requirements: ${JSON.stringify(requirements)}
Instructions: ${JSON.stringify(instructions)}
FeedbackFromAgents: ${JSON.stringify(feedbackFromAgents, null, 2)}
`;

  if (work instanceof File) {
    const response = await generateWithImage(masterPrompt, work);
    return parseUntilJson(response) as {
      aggregatedPositiveFeedback: string[];
      aggregatedNegativeFeedback: string[];
    };
  } else {
    const response = await generate(masterPrompt + `\nWork Sample: ${work}`);
    return parseUntilJson(response) as {
      aggregatedPositiveFeedback: string[];
      aggregatedNegativeFeedback: string[];
    };
  }
};

export const qualityCheck = async (
  work: string | File,
  jobDetails: JobDetails
): Promise<QualityCheckResult> => {
  const results = [];
  const feedbackFromAgents = [];
  
  for (const [key, value] of Object.entries(AGENTS)) {
    console.log(`Evaluation by ${key} agent: `);
    const response = await value(work, jobDetails);
    feedbackFromAgents.push({
      positiveFeedback: response.positiveFeedback,
      negativeFeedback: response.negativeFeedback,
    });
    console.log(response.quality);
    results.push({
      agent: key,
      response,
    });
  }
  const masterResponse = await masterAgent(
    work,
    jobDetails,
    feedbackFromAgents
  );
  const finalResponse = {
    quality:
      results.reduce((acc, result) => acc + result.response.quality, 0) /
      results.length,
    positiveFeedback: masterResponse.aggregatedPositiveFeedback,
    negativeFeedback: masterResponse.aggregatedNegativeFeedback,
  };
  return finalResponse;
};

// const jobDetails: JobDetails = {
//     title: "Poem",
//     description: "We are looking for a poem that is about the beauty of nature.",
//     requirements: ["The poem should be about the beauty of nature", "The poem should be in English", "The poem should be 10 lines long"],
//     instructions: ["The poem should not be too long", "The poem should not be too short", "The poem should be about the beauty of nature"]
// }

// const response = await qualityCheck("Whispers of the forest breeze,\nAncient trees sway with ease.\nGolden sunlight through the leaves,\nNature's beauty never leaves.\nMountain peaks touch the sky,\nEagles soaring way up high.\nRivers flowing crystal clear,\nNature's voice for all to hear.\nWildflowers in the meadow bright,\nStars that twinkle through the night.", jobDetails);
// console.log(response);

// const response = await qualityCheck("Whisers of the forest breeze,\nAncient trees sway with ease.\nGolden sunlight through the leaves,\nNature's bauty never leaves.\nEages soaring way up high.\nRivers floing crystal clear,\nNature's ice for all to hear.\nWildflowers in the meaow bright", jobDetails);
// console.log(response);

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

// const jobDetails: JobDetails = {
//     title: "Minimalist Text-Only Menu",
//     description: "We are looking for a simple, text-only food menu layout that can be printed on a small receipt-sized paper.",
//     requirements: [
//       "The menu must be in plain black and white text with no colors or images",
//       "It should include only two sections: Food and Drinks",
//       "Each item should be listed with its price on the same line",
//       "No logos, design elements, or graphics are allowed",
//       "The layout must be compact and suitable for thermal printers"
//     ],
//     instructions: [
//       "Do not include any images or decorative fonts",
//       "Avoid any color usage or visual embellishments",
//       "Use a monospaced or system font for simplicity",
//       "Focus on readability and compactness",
//       "Each item must take only one line",
//       "No sections like 'Main Course', 'Appetizers', etc.; just 'Food' and 'Drinks'"
//     ]
//   }

// import path from "path";
// import * as fs from "fs";

// const imagePath = path.join(__dirname, "chingri.webp");
// const imageBuffer = fs.readFileSync(imagePath);
// const image = new File([imageBuffer], "image.png", { type: "image/png" });

// const response = await qualityCheck(image, jobDetails);
// console.log(response);
