//runCompletion
import openai from "../services/openaiService.js";

export const runCompletion = async (prompt) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {role: 'user', content: prompt}],
        "functions": [
            {
                "name": "get_current_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                        }
                    },
                    "required": ["location"]
                }
            }
        ],
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    return response;
}

export const runCompletion2 = async (prompt, function_arguments, weatherObject) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": 'user', "content": prompt},
            {
                "role": "assistant",
                "content": null,
                "function_call": {
                    "name": "get_current_weather",
                    "arguments": function_arguments
                }
            },
            {
                "role": 'function',
                "name": "get_current_weather",
                "content": JSON.stringify(weatherObject)
            },
        ],
        "functions": [
            {
                "name": "get_current_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                        }
                    },
                    "required": ["location"]
                }
            }
        ],
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    return response;
}


export const runCompletionChatBot = async (messages) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages,
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    return response;
}


export const startCompletionStream = async (prompt, emitter) => {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role: 'user', content: prompt}],
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