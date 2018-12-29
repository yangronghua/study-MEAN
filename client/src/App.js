import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";
import Landing from "./layout/landing";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar />
        <Landing />
        <Footer />
      </div>
    );
  }
}

export default App;
