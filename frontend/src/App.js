import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import { Navbar, Nav } from "react-bootstrap";
import { PdfExtract } from "./components/PdfExtract";
import { ImageExtract } from "./components/ImageExtract";
import { MolExtract } from "./components/MolExtract";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Navbar bg="dark" variant="dark" className="px-2">
            <Navbar.Brand href="/">MolScribe</Navbar.Brand>
            <Nav className="mr-auto">
              <Nav.Link href="/pdf">Extract PDF</Nav.Link>
              <Nav.Link href="/figure">Extract Figure</Nav.Link>
              <Nav.Link href="/molecule">Extract Molecule</Nav.Link>
            </Nav>
          </Navbar>

          <Routes>

            <Route path="/pdf" element={<PdfExtract/>}/>

            <Route path="/figure" element={<ImageExtract/>}/>

            <Route path="/molecule" element={<MolExtract/>}/>

            <Route path="/" element={<PdfExtract/>}/>
          </Routes>
        </div>
      </Router>

      <footer className="footer">
        <div className="container">
          <span className="footer-head">MolScribe v0.1 @ 2022. MIT CSAIL. </span> &nbsp;<br />
        </div>
      </footer>
    </div >
  );
}

export default App;