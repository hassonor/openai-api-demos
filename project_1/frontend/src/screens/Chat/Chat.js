import React, {useState} from 'react';
import '../styles/style.css';
import {Link} from "react-router-dom";

function Chat() {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [responseOk, setResponseOk] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputValue) {
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }

        const response = await fetch('/api/chatgpt/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({text: inputValue}),
        });

        try {
            if (response.ok) {
                setResponseOk(true);
                const data = await response.json();
                setPrompt(inputValue);
                setResult(data.choices[0].message.content);
                setJresult(JSON.stringify(data, null, 2));
                setInputValue('');
                setError('');
            } else {
                setResponseOk(false);
                throw new Error('An error occurred');
            }
        } catch (error) {
            console.log(error);
            setResult('');
            setError('An error occurred while submitting the form.');
        }
    };

    return (
        <div className="container">
            <Link to="/" className="btn btn-secondary mb-3">Home</Link>
            <Link to="/stream" className="btn btn-secondary mb-3">Stream</Link>
            <Link to="/chatbot" className="btn btn-secondary mb-3">Chatbot</Link>
            <Link to="/pdfsummary" className="btn btn-secondary mb-3 mr-4">Book</Link>
            <form className="form-horizontal" onSubmit={handleSubmit}>
                <div className="form-group row">
                    <div className="col-sm-10 mt-2">
                        <div className="form-floating">
              <textarea
                  className="form-control custom-input"
                  id="floatingInput"
                  placeholder="Enter a value"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSubmit(event);
                      }
                  }}
              />

                            <label htmlFor="floatingInput">Input</label>
                        </div>
                    </div>
                    <div className="col-sm-2 mt-2">
                        <button type="submit" className="btn btn-primary custom-button">Submit</button>
                    </div>
                </div>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {prompt && <div className="alert alert-secondary mt-3">{prompt}</div>}
            {result && <div className="alert alert-success mt-3">{result}</div>}
            {responseOk && (
                <pre className="alert alert-info mt-3">
          <code>{jresult}</code>
        </pre>
            )}
        </div>
    );
}

export default Chat;
