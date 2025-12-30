import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initializes the Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.log('Warning: VITE_GEMINI_API_KEY not found in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default genAI;