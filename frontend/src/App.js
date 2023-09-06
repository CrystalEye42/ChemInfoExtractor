import React, { useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import { Navbar, Nav } from "react-bootstrap";
import { PdfExtract } from "./components/PdfExtract";
import { MolExtract } from "./components/MolExtract"
import { About } from "./components/About";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Helmet} from "react-helmet";

function App() {
  const [url, setUrl] = useState(null);

  return (
    <div className="App">
      <Helmet>
        <script src="./chemdrawweb/chemdrawweb.js"></script>
      </Helmet>
      <Router>
        <div>
          <Navbar bg="dark" variant="dark" className="px-2">
            <Navbar.Brand href="/">OpenChemIE</Navbar.Brand>
            <Nav className="mr-auto">
              <Nav.Link className={url==="/extract" ? "active" : ""} href="/molscribe">MolScribe</Nav.Link>
              <Nav.Link className={url==="/extractrxn" ? "active" : ""} href="/rxnscribe">RxnScribe</Nav.Link>
              <Nav.Link className={url==="/extractner" ? "active" : ""} href="/chemner">ChemNER</Nav.Link>
              <Nav.Link className={url==="/extracttxt" ? "active" : ""} href="/chemrxnextractor">ChemRxnExtractor</Nav.Link>
            </Nav>
          </Navbar>

          <Routes>

            <Route path="/molscribe" element={<MolExtract url="/extract" setActive={setUrl}/>}/>

            <Route path="/rxnscribe" element={<MolExtract url="/extractrxn" setActive={setUrl}/>}/>
            
            <Route path="/chemner" element={<PdfExtract url="/extractner" setActive={setUrl}/>}/>

            <Route path="/chemrxnextractor" element={<PdfExtract url="/extracttxt" setActive={setUrl}/>}/>

            <Route path="/" element={<About/>}/>
          </Routes>
        </div>
      </Router>

      <footer className="footer">
        <div className="container">
          <span className="footer-head">OpenChemIE v0.1 @ 2023. MIT CSAIL. </span> &nbsp;<br />
        </div>
      </footer>
    </div >
  );
}

export default App;