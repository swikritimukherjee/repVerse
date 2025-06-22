import { generateImage } from "../utils/ai/generate";

interface GenerateImageProps {
    title: string;
    description: string;
}

export const genImage = async ({ title, description }: GenerateImageProps): Promise<Blob> => {
    const updatedPrompt = `Create a pixel art NFT image for a gig with the following details:

Title: ${title}
Description: ${description}

Generate a strict pixel art style image that represents this gig/job. The image should be:
- Pure pixel art with large, chunky pixels that are clearly visible
- 64-bit aesthetic with rich, vibrant color palette
- Suitable for NFT use with bold, distinctive design
- Representative of the gig's theme and purpose
- High contrast and visually striking
- Include relevant symbols or elements that relate to the job title and description
- Each pixel should be deliberately placed with no anti-aliasing or smooth gradients
- Maintain the authentic pixel art aesthetic throughout
- You do not need to include any text in the image, just a pictoral depiction of the gig/job as a pixel art image

Make sure the pixel art has a retro gaming feel with large, distinct pixels and captures the essence of the gig in a classic digital art format suitable for NFT minting.`;
    
    const response = await generateImage(updatedPrompt);
    return response;
};

