import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import { Navbar, Nav } from "react-bootstrap";
import { PdfExtract } from "./components/PdfExtract";
import { ImageExtract } from "./components/ImageExtract";
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
            <Navbar.Brand href="/">ChemEScribe</Navbar.Brand>
            <Nav className="mr-auto">
              <Nav.Link href="/molscribe">MolScribe</Nav.Link>
              <Nav.Link href="/rxnscribe">RxnScribe</Nav.Link>
              <Nav.Link href="/figure">ChemRxnExtractor</Nav.Link>
            </Nav>
          </Navbar>

          <Routes>

            <Route path="/molscribe" element={<MolExtract url="/extract" />}/>

            <Route path="/figure" element={<ImageExtract/>}/>

            <Route path="/rxnscribe" element={<PdfExtract url="/extractrxn" />}/>

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