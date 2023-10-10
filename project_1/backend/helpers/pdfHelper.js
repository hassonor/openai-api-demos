import { encode } from 'gpt-3-encoder';
import openai from "../services/openaiService.js";

/**
 * Calculate the number of tokens in a given text.
 * @param {string} text - The text to be tokenized.
 * @returns {number} - The number of tokens.
 */
export const calculateTokens = text => encode(text).length;

/**
 * Splits a text into chunks based on a token limit.
 * @param {string} text - The text to be split.
 * @param {number} maxChunkSize - The maximum number of tokens allowed in a chunk.
 * @returns {string[]} - An array of text chunks.
 */
export const splitTextIntoChunks = (text, maxChunkSize) => {
    const chunks = [];
    let currentChunk = "";
    let currentChunkTokens = 0;

    text.split(' ').forEach(word => {
        const wordTokens = calculateTokens(word);
        if (currentChunkTokens + wordTokens < maxChunkSize) {
            currentChunk += word + " ";
            currentChunkTokens += wordTokens;
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = word + " ";
            currentChunkTokens = wordTokens;
        }
    });

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Summarizes a chunk of text.
 * @param {string} chunk - The chunk to be summarized.
 * @param {number} [maxWords] - Optional. The maximum number of words for the summary.
 * @returns {string} - The summarized text.
 */
export const summariseChunk = async (chunk, maxWords) => {
    const condition = maxWords ? `in about ${maxWords} words` : '';
    const prompt = `Please summarise the following text ${condition}:\n"""${chunk}"""\n\nSummary:`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            max_tokens: 8000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        return response.choices[0].message.content;
    } catch (error) {
        if (error.code === 'rate_limit_exceeded') {
            console.error("Rate limit exceeded. Retrying in 60 seconds...");
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
            return summariseChunk(chunk, maxWords); // Retry
        } else {
            console.error("Error in summariseChunk:", error.message);
            throw new Error("Failed to summarize the chunk.");
        }
    }
}

/**
 * Summarizes an array of text chunks.
 * @param {string[]} chunks - The chunks to be summarized.
 * @returns {string} - The concatenated summarized text.
 */
export const summariseChunks = async (chunks) => {
    const summarisedChunks = await Promise.all(chunks.map(chunk => summariseChunk(chunk)));
    return summarisedChunks.join(" ");
}
