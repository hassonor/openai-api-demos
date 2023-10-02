import React, {useState} from 'react';
import '../styles/style.css';
import {Link} from "react-router-dom";

function Home (){
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');

    const handleSubmit = async(event) => {
        event.preventDefault();
        if(!inputValue){
            setError('Please enter a prompt!');
            setPrompt('');
            setResult('');
            setJresult('');
            return;
        }
        try{
            const response = await fetch('/api/chatgpt', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    text: inputValue
                })
            });

            if(response.ok){
                const data = await response.json();
                console.log(data);
                setPrompt(inputValue);
                setResult(data.data.choices[0].text);
                setJresult(JSON.stringify(data.data, null, 2))
                setInputValue('');
                setError('');

            }
            else{
                throw new Error('An error occurred while submitting the form.');
            }

        }
        catch(error){
            console.log(error);
            setResult('');
            setError('An error occurred while submitting the form.');
            setResult('');
        }
    }

    return (
        <div className='container position-relative mt-4 '>
            <Link to="/stream" className="btn btn-secondary mb-3" style={{ marginRight: '20px' }}>Stream</Link>
            <Link to="/pdfsummary" className="btn btn-secondary mb-3 mr-4">Book Summary</Link>
            <form className='form-horizontal' onSubmit={handleSubmit}>
            <div className='row form-group  mt-2'>
                <div className='col-sm-10'>
                    <div className='form-floating'>
                        <textarea
                            className='form-control custom-input'
                            id='floatingTextarea'
                            placeholder='Enter a prompt'
                            style={{height: '100px'}}
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
                <div className='col-sm-2 '>
                    <button type="submit" className='btn btn-primary custom-button mb-2'>Submit</button>
                </div>
            </div>
            </form>
            {error && <div className='alert alert-dark mt-3'>{error}</div>}
            {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
            {result && <div className='alert alert-success mt-3'>{result}</div>}
            {result && <pre className='alert alert-info mt-3'><code>{jresult}</code></pre>}
        </div>
    )

}

export default Home;