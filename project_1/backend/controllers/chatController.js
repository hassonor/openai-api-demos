import { EventEmitter } from 'events';
import {PDFExtract} from "pdf.js-extract";
import openai from '../services/openaiService.js';
import {calculateTokens, splitTextIntoChunks, summariseChunk, summariseChunks} from "../helpers/pdfHelper.js";
import {encode} from "gpt-3-encoder";

const completionEmitter = new EventEmitter();

async function startCompletionStream(prompt, emitter) {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        stream: true,
    });

    for await (const part of stream) {
        const message = part.choices[0]?.delta?.content || '';

        if (part.choices[0]?.finish_reason !== "stop") {
            emitter.emit('data', message);
        } else {
            emitter.emit('done');
        }
    }
}

export const streamChat = async (req, res) => {
    try {
        const { text } = req.body;

        // Create a new EventEmitter for this request
        const localEmitter = new EventEmitter();

        // Start the completion stream
        startCompletionStream(text, localEmitter);

        const dataListener = (data) => {
            res.write(data);
        }
        const doneListener = () => {
            res.write('{"event":"done"}');
            res.end();
            localEmitter.off('data', dataListener);
            localEmitter.off('done', doneListener);
        }
        localEmitter.on('data', dataListener);
        localEmitter.on('done', doneListener);

    } catch (error) {
        handleError(error, res);
    }
};


export const gptChatCompletion = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: 'system', content: 'You are a doctor.'},
                { role: 'user', content: text }],
            temperature: 1,
            max_tokens: 50,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        res.json(response);

    } catch (error) {
        handleError(error, res);
    }
};

export const gptCompletion = async (req, res) => {
    try {
        const {text} = req.body;
        const chatCompletion = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: text,
            temperature: 1,
            max_tokens: 20,
        });
        res.json({data: chatCompletion});
    } catch (error) {
        handleError(error, res);
    }
};

export const summaryPDF = async (req, res) => {
    try {
        const { maxWords } = req.body;
        const pdfFile = req.file;

        const pdfExtract = new PDFExtract();
        const extractOptions = {
            firstPage: 1,
            lastPage: undefined,
            password: '',
            verbosity: -1,
            normalizeWhitespace: false,
            disableCombineTextItems: false,
        };

        const data = await pdfExtract.extract(pdfFile.path, extractOptions);
        const pdfText = data.pages.map(page => page.content.map(item => item.str).join(' ')).join(' ');

        if (!pdfText) {
            return res.json({ error: "Text could not be extracted from this PDF. Please try another PDF." });
        }

        let summarisedText = pdfText;
        const maxToken = 4000;
        while (calculateTokens(summarisedText) > maxToken) {
            const newChunks = splitTextIntoChunks(summarisedText, maxToken);
            summarisedText = await summariseChunks(newChunks);
        }

        summarisedText = await summariseChunk(summarisedText, maxWords);
        res.json({ summarisedText });

    } catch (error) {
        handleError(error, res);
    }
};



const handleError = (error, res) => {
    if(error.response){
        console.error(error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
    } else {
        console.error('Error with OPENAI API request:', error.message);
        res.status(500).json({
            error: {
                message: 'An error occurred during your request.'
            }
        });
    }
}