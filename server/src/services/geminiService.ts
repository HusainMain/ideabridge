import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../prompts/startupPrompt';
import { StartupAnalysisRequest } from '../types/types';
import { withTimeout } from '../utils/timeout';

export async function generateGeminiAnalysis(data: StartupAnalysisRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptContent = `Startup Idea: ${data.idea}
Industry: ${data.industry}
Problem: ${data.problem}
Target Audience: ${data.audience}
Country: ${data.country}
Budget Level: ${data.budget}
Team Size: ${data.teamSize}`;

  const callApi = async (): Promise<string> => {
    console.log("Gemini Request");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    });

    return response.text || '';
  };

  try {
    return await withTimeout(callApi(), 15000, 'AI is taking longer than expected.');
  } catch (error: any) {
    console.log("Retry Attempt");
    console.warn('First Gemini call failed or timed out. Retrying once after 2 seconds...', error.message || error);
    
    // Wait for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
      return await withTimeout(callApi(), 15000, 'AI is taking longer than expected.');
    } catch (retryError: any) {
      console.error('Gemini retry call failed:', retryError.message || retryError);
      if (retryError.message === 'AI is taking longer than expected.') {
        throw retryError;
      }
      throw new Error('AI service is currently unavailable.');
    }
  }
}
