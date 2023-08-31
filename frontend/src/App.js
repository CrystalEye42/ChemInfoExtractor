import React from "react"
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
              <Nav.Link href="/molscribe">MolScribe</Nav.Link>
              <Nav.Link href="/rxnscribe">RxnScribe</Nav.Link>
              <Nav.Link href="/chemner">ChemNER</Nav.Link>
              <Nav.Link href="/chemrxnextractor">ChemRxnExtractor</Nav.Link>
            </Nav>
          </Navbar>

          <Routes>

            <Route path="/molscribe" element={<MolExtract url="/extract" />}/>

            <Route path="/rxnscribe" element={<MolExtract url="/extractrxn" />}/>
            
            <Route path="/chemner" element={<PdfExtract url="/extractner" />}/>

            <Route path="/chemrxnextractor" element={<PdfExtract url="/extracttxt" />}/>

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