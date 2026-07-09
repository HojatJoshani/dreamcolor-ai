import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates 5 distinct scene descriptions for the coloring book based on a theme.
 */
export const generateSceneDescriptions = async (theme: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 distinct, fun, and creative scene descriptions for a children's coloring book based on the theme: "${theme}". 
      Each description should be brief (1-2 sentences) and visualize a clear, simple scene suitable for thick-line art. 
      Focus on action and main characters. Do not describe shading or colors, just the subjects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    // Parse the JSON array
    const descriptions = JSON.parse(text);
    return descriptions.slice(0, 5); // Ensure max 5
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw new Error("Failed to plan the coloring book pages.");
  }
};

/**
 * Generates a single coloring page image using Gemini 2.5 Flash Image.
 */
export const generateColoringPageImage = async (description: string): Promise<string> => {
  try {
    const prompt = `A professional children's coloring book page. Black and white line art ONLY. Thick, clean, continuous black outlines on a pure white background. No shading, no grayscale, no dither. High contrast. Subject: ${description}. Cute, cartoon style suitable for young children.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        // Nano banana models do not support responseMimeType/responseSchema
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Edits an existing image based on a user prompt using Gemini 2.5 Flash Image.
 */
export const editColoringPage = async (base64Image: string, instruction: string): Promise<string> => {
  try {
    // Strip prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `Edit this image. Instruction: ${instruction}. IMPORTANT: Maintain the style of a black and white children's coloring book page. Thick lines, white background, no shading.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

/**
 * Chat with the AI assistant.
 */
export const sendChatMessage = async (
  message: string, 
  history: ChatMessage[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are a helpful, cheerful AI assistant for a children's coloring book app called DreamColor. You help parents and kids come up with creative themes for their coloring books. Keep answers concise and family-friendly.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm not sure how to answer that, but I love coloring!";
  } catch (error) {
    console.error("Chat error:", error);
    return "Oops! I had a little trouble thinking. Try asking again?";
  }
};
