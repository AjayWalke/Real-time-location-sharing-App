import React from "react";
import logo from "./logo.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./layout/Home";
import Layout from "./layout/Layout";
import Location from "./layout/Location";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path='/location/:roomId' element={<Location/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

