import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home/Home";
import "./styles/bootstrap-custom.scss";
import Stream from "./screens/Stream/Stream";
import Chat from "./screens/Chat/Chat";
import PDFSummary from "./screens/PDFSummary/PDFSummary";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/stream' element={<Stream />} />
                    <Route path='/chat' element={<Chat />} />
                    <Route path='/pdfsummary' element={<PDFSummary />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
