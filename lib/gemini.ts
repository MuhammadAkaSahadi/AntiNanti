import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Parses and retrieves all configured Gemini API keys from environment variables.
 * It looks for GEMINI_API_KEYS (comma-separated), and falls back to GEMINI_API_KEY.
 */
export function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || "";
  if (keysStr) {
    return keysStr.split(",").map(k => k.trim()).filter(Boolean);
  }
  const singleKey = process.env.GEMINI_API_KEY || "";
  return singleKey ? [singleKey] : [];
}

/**
 * Wraps any Vercel AI SDK call in an automatic rotation retry block.
 * If a key fails (e.g. status 429, RESOURCE_EXHAUSTED, or rate limit exceeded),
 * it logs a warning, switches to the next key, and retries.
 */
export async function withKeyRotation<T>(
  fn: (google: ReturnType<typeof createGoogleGenerativeAI>) => Promise<T>
): Promise<T> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API Keys configured in environment variables (GEMINI_API_KEY or GEMINI_API_KEYS).");
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      // Initialize the Google Generative AI provider with the current key
      const google = createGoogleGenerativeAI({
        apiKey,
      });

      // Attempt to execute the AI SDK operation
      return await fn(google);
    } catch (error: any) {
      const isLastKey = i === keys.length - 1;
      const maskedKey = apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "empty";
      console.warn(
        `[GEMINI ROTATION] Attempt ${i + 1}/${keys.length} failed using key: ${maskedKey}. Error:`,
        error.message || error
      );
      
      lastError = error;

      if (isLastKey) {
        break; // All keys have been tried, exit loop and throw
      }

      // Check if the error is rate limit or quota exceeded (429 or RESOURCE_EXHAUSTED)
      const errorMsg = String(error.message || "").toLowerCase();
      const isQuotaOrRateLimit =
        errorMsg.includes("429") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("exhausted") ||
        errorMsg.includes("rate limit") ||
        error.status === 429 ||
        error.statusCode === 429;

      if (isQuotaOrRateLimit) {
        console.warn(`[GEMINI ROTATION] Quota exceeded or rate limit hit. Swapping to the next key...`);
        continue;
      }

      // For safety, we also retry on other transient API errors to be robust
      console.warn(`[GEMINI ROTATION] Retrying with the next key...`);
    }
  }

  throw new Error(`All configured Gemini API keys failed. Last error: ${lastError?.message || lastError}`);
}
