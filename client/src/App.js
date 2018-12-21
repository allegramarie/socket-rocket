import React, { Component } from 'react';
import './App.css';
import { subscribeToTimer } from './api';
import DrawingForm from "./DrawingForm";
import DrawingList from "./DrawingList";
import Drawing from "./Drawing";
import Connection from "./Connection";

class App extends Component {
  state = {

  }

  selectDrawing = (drawing) => {
    this.setState({
      selectedDrawing: drawing,
    })
  }

  render() {
    let ctrl = (
      <React.Fragment>
        <DrawingForm />
        <DrawingList 
          selectDrawing={this.selectDrawing}
        />
      </React.Fragment>
    )

    if(this.state.selectedDrawing) {
      ctrl = (
        <Drawing 
        drawing={this.state.selectedDrawing}
        key={this.state.selectedDrawing.id}
        />
      )
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>Socket Rocket</h2>
        </div>
        <Connection />
        {ctrl}
      </div>
    );
  }
}

export default App;