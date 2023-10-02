import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import "./styles/bootstrap-custom.scss";
import Stream from "./screens/Stream";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/stream' element={<Stream />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
