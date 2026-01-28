
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TextRegion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Forensic Optical Analysis: Maps document geometry, ink viscosity, and paper grain.
 */
export const analyzeDocument = async (base64Image: string): Promise<TextRegion[]> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Act as a forensic document examiner. Perform an ultra-high-resolution scan of this image.
    Identify all editable text fields, including printed forms, handwritten notes, dates, and signatures.
    
    For each field, return:
    - text: The precise existing content.
    - x, y, width, height: Percentage-based bounding box coordinates (0-100).
    - detectedColor: The hex color code of the ink (e.g., #0A1B4D).
    - inkType: Specific classification ("ballpoint-pen", "fountain-pen", "laser-print", "thermal-print", "marker").
    - confidence: Reliability score (0-1).
    
    Return the result strictly as a JSON array of objects.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1],
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            width: { type: Type.NUMBER },
            height: { type: Type.NUMBER },
            detectedColor: { type: Type.STRING },
            inkType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["text", "x", "y", "width", "height", "detectedColor", "inkType", "confidence"],
        },
      },
    },
  });

  try {
    const rawJson = response.text || "[]";
    const data = JSON.parse(rawJson);
    return data.map((item: any, index: number) => ({
      ...item,
      id: `region-${index}`
    }));
  } catch (error) {
    console.error("Forensic analysis failed", error);
    return [];
  }
};

/**
 * Neural Inpainting: Reconstructs document surface using style-transfer and texture synthesis.
 */
export const applyInpainting = async (
  base64Image: string, 
  region: TextRegion, 
  newText: string
): Promise<string | null> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    TASK: Microscopic Document Reconstruction.
    TARGET: x:${region.x}%, y:${region.y}%, w:${region.width}%, h:${region.height}%
    MODIFICATION: Replace existing text with "${newText}".
    
    CRITICAL FORENSIC CONSTRAINTS:
    1. INK SYNC: Match the exact color ${region.detectedColor} and the medium properties of ${region.inkType}.
    2. TYPOGRAPHY: Replicate stroke width, slant, and character spacing from surrounding text.
    3. TEXTURE: Maintain paper grain, subtle noise, and background patterns (lines/grids).
    4. ARTIFACTS: Ensure no blurring, digital seams, or unnatural edges. The result must be indistinguishable from a physical original.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
};
