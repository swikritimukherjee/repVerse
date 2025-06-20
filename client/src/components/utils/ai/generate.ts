import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import wav from 'wav';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDTH5jjua96R-W5SFYFk5SD7DfQJ1treNw';

export const generate = async (prompt: string, image?: File) => {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('Error generating response with Gemini:', error);
        throw error;
    }
}

export const generateImage = async (prompt: string) => {

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const contents =
    prompt;

  // Set responseModalities to include "Image" so the model can generate  an image
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data || '';
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

async function saveWaveFile(
   filename: string,
   pcmData: Buffer,
   channels = 1,
   rate = 24000,
   sampleWidth = 2,
) {
   return new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
      });

      writer.on('finish', resolve);
      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
   });
}

async function generateAudio(prompt: string, characters: { name: string, voice: string }[]) {
   const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

   const speakerVoiceConfigs = characters.map((character) => ({
      speaker: character.name,
      voiceConfig: {
         prebuiltVoiceConfig: { voiceName: character.voice }
      }
   }));


   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      // @ts-ignore
      contents: [{ parts: [{ text: prompt }] }],
      config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
               multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: speakerVoiceConfigs,
               }
            }
      }
   });

   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
   const audioBuffer = Buffer.from(data || '', 'base64');

   const fileName = 'output.wav';
   await saveWaveFile(fileName, audioBuffer);
   return fileName;
}