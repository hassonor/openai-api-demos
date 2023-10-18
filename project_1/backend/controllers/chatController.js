import {EventEmitter} from 'events';
import {PDFExtract} from "pdf.js-extract";
import openai from '../services/openaiService.js';
import {calculateTokens, splitTextIntoChunks, summariseChunk, summariseChunks} from "../helpers/pdfHelper.js";
import {runCompletion, runCompletion2, startCompletionStream} from "../helpers/openAIHelpers.js";
import {getWeather} from "../services/weatherService.js";

export const streamChat = async (req, res) => {
    try {
        const {text} = req.body;

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


export const getWeatherWithGptChatCompletion = async (req, res) => {
    try {
        const {text} = req.body;

        const response = await runCompletion(text);

        // get called_function
        const called_function = response.choices[0].message.function_call;

        if (!called_function) {
            res.json(response);
            return;
        }

        // get function name and arguments
        const {name: function_name, arguments: function_arguments} = called_function;
        const parsed_function_arguments = JSON.parse(function_arguments);


        if (function_name === "get_current_weather") {
            // get weather
            const weatherObject = await getWeather(parsed_function_arguments);
            const response = await runCompletion2(text, function_arguments, weatherObject);

            res.json(response);
        }

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
        const {maxWords} = req.body;
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
            return res.json({error: "Text could not be extracted from this PDF. Please try another PDF."});
        }

        let summarisedText = pdfText;
        const maxToken = 4000;
        while (calculateTokens(summarisedText) > maxToken) {
            const newChunks = splitTextIntoChunks(summarisedText, maxToken);
            summarisedText = await summariseChunks(newChunks);
        }

        summarisedText = await summariseChunk(summarisedText, maxWords);
        res.json({summarisedText});

    } catch (error) {
        handleError(error, res);
    }
};


const handleError = (error, res) => {
    if (error.response) {
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