import React, { useState } from 'react';
import './styles/style.css';

function Stream() {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [jresult, setJresult] = useState('');
    const [prompt, setPrompt] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValue.trim()) {
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }

        try {
            const response = await fetch('/api/chatgpt/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputValue }),
            });

            if (response.ok) {
                const reader = response.body.getReader();
                let resultData = '';
                let jresultData = [];
                setPrompt(inputValue);
                setResult(resultData);
                setInputValue('');
                setError('');

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const text = new TextDecoder().decode(value);

                    // Check if the text contains the unwanted event and skip it
                    if (text.includes('{"event":"done"}')) continue;

                    resultData += text;
                    setResult(resultData);

                    jresultData.push(text);
                    setJresult(JSON.stringify(jresultData, null, 2));

                }
            } else {
                throw new Error('An error occurred while submitting the form.');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while submitting the form.');
        }
    };

    return (
        <div className='container'>
            <form className='form-horizontal' onSubmit={handleSubmit}>
                <div className='row form-group mt-2'>
                    <div className='col-sm-10'>
                        <div className='form-floating'>
                            <textarea
                                className='form-control custom-input'
                                id='floatingTextarea'
                                placeholder='Enter a prompt'
                                style={{ height: '100px' }}
                                value={inputValue}
                                onChange={(event) => setInputValue(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        handleSubmit(event);
                                    }
                                }}
                            />
                            <label htmlFor='floatingTextarea'>Input</label>
                        </div>
                    </div>
                    <div className='col-sm-2'>
                        <button type="submit" className='btn btn-primary custom-button'>Submit</button>
                    </div>
                </div>
            </form>
            {error && <div className='alert alert-dark mt-3'>{error}</div>}
            {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
            {result && <div className='alert alert-success mt-3' style={{ whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{__html: result}}></div>}
            {result && (
                <pre className="alert alert-info mt-3">
                    <code>{jresult}</code>
                </pre>
            )}
        </div>
    );
}

export default Stream;
