import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import { Navbar, Nav } from "react-bootstrap";
import { PdfExtract } from "./components/PdfExtract";
import { About } from "./components/About";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Navbar bg="dark" variant="dark" className="px-2">
            <Navbar.Brand href="/">ChemEScribe</Navbar.Brand>
            <Nav className="mr-auto">
              <Nav.Link href="/molscribe">MolScribe</Nav.Link>
              <Nav.Link href="/rxnscribe">RxnScribe</Nav.Link>
              <Nav.Link href="/chenrxnextractor">ChemRxnExtractor</Nav.Link>
            </Nav>
          </Navbar>

          <Routes>

            <Route path="/molscribe" element={<PdfExtract url="/extract" />}/>

            <Route path="/rxnscribe" element={<PdfExtract url="/extractrxn" />}/>

            <Route path="/chenrxnextractor" element={<PdfExtract url="/extracttxt" />}/>

            <Route path="/" element={<About/>}/>
          </Routes>
        </div>
      </Router>

      <footer className="footer">
        <div className="container">
          <span className="footer-head">ChemEScribe v0.1 @ 2023. MIT CSAIL. </span> &nbsp;<br />
        </div>
      </footer>
    </div >
  );
}

export default App;