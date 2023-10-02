import React, {useState} from 'react';
import '../styles/style.css';
import {Link} from "react-router-dom";

function PDFSummary (){
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [jresult, setJresult] = useState('');
    const [maxWords, setMaxWords] = useState(100);
    const [selectedFile, setSelectedFile] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {

    }

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
        <div className='container position-relative mt-4'>
            <Link to="/stream" className="btn btn-secondary mb-3" style={{ marginRight: '20px' }}>Stream</Link>
            <Link to="/" className="btn btn-secondary mb-3">Home</Link>
            <div className='hero d-flex align-items-center justify-content-center text-center flex-column p-4'>
                <h1 className='display-4 mb-3'>PDF Book Summariser</h1>
                <p className='lead mb-4'>Summarise PDF Books</p>
                <form className='w-100'>
                    <input type='file' accept='.pdf' onChange={handleFileChange} className='mb-3' /> {/* Added margin-bottom */}
                    <div className="form-group row">
                        <div className="col-sm-4 offset-sm-4 mt-3">
                            <input type='number' min='10' value={maxWords}
                                   onChange={(e) => {
                                       if (e.target.value === '' || isNaN(parseInt(e.target.value))) return; // Prevent deleting the value
                                       setMaxWords(parseInt(e.target.value));
                                   }}
                                   className='form-control'
                            />
                        </div>
                        <button type='submit' disabled={!selectedFile || loading} className='btn btn-primary custom-button mt-1'>
                            {loading ? 'Analysing PDF' : `Summarise PDF in about ${maxWords} words`}
                        </button>
                    </div>
                </form>
            </div>
            {error && <div className='alert alert-dark mt-3'>{error}</div>}
            {result && <div className='alert alert-success mt-3'>{result}</div>}
            {result && <pre className='alert alert-info mt-3'><code>{jresult}</code></pre>}
        </div>
    )
}

export default PDFSummary;