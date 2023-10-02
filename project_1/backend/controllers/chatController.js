import openai from '../services/openaiService.js';
import { EventEmitter } from 'events';

const completionEmitter = new EventEmitter();

async function startCompletionStream(prompt) {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        stream: true,
    });

    for await (const part of stream) {
        const message = part.choices[0]?.delta?.content || '';

        if (part.choices[0]?.finish_reason !== "stop") {
            completionEmitter.emit('data', message);
        } else {
            completionEmitter.emit('done');
        }
    }
}

export const streamChat = async (req, res) => {
    try {
        const { text } = req.body;
        startCompletionStream(text);

        const dataListener = (data) => {
            res.write(data);
        }
        const doneListener = () => {
            res.write('{"event":"done"}');
            res.end();
            completionEmitter.off('data', dataListener);
            completionEmitter.off('done', doneListener);
        }
        completionEmitter.on('data', dataListener);
        completionEmitter.on('done', doneListener);

    } catch (error) {
        handleError(error, res);
    }
};

export const chat = async (req, res) => {
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

function handleError(error, res) {
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