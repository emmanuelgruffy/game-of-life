import React from 'react';
import "./App.css";
import Board from "./Board";


class ReadlineParser {
  constructor(delimiter = '\n') {
    this.delimiter = delimiter;
    this.buffer = '';
  }

  parse(value) {
    // Append the new chunk to the buffer
    this.buffer += value;

    // Split the buffer into lines
    let lines = this.buffer.split(this.delimiter);

    // The last element of the split is either an empty string or an incomplete line
    this.buffer = lines.pop();

    // Return the complete lines
    return lines;
  }

  flush() {
    // If there's any leftover data in the buffer, return it
    if (this.buffer) {
      const remaining = this.buffer;
      this.buffer = '';
      return remaining;
    }
    return null;
  }
}

const secretKey = process.env.OPENAI_API_KEY;

export const NUM_SQUARES = 127;

function App() {

console.log({secretKey});

  async function connectToSerial() {
    try {
      // Request a port and open it
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
  
      const reader = port.readable.getReader();
      const readlineParser = new ReadlineParser('\n'); // Using newline as the delimiter
  
    
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
  
        if (value) {
          const text = new TextDecoder().decode(value);
          const lines = readlineParser.parse(text);
  
          // Process each line separately
          lines.forEach(line => {
            console.log(line); // Handle each complete line
  
          });
        }
  
        
      }
  
      // If there's any remaining data in the buffer, process it
      const remaining = readlineParser.flush();
      if (remaining) {
        console.log(remaining);
      }
    } catch (error) {
      console.error('Failed to connect to the serial port', error);
    }
  }

  const createInitialSquares = () => {
    let initialSquares = new Array(127);
    for (let i = 0; i < initialSquares.length; i++) {
      initialSquares[i] = new Array(127);
    }

    for (let row = 0; row < NUM_SQUARES; row++) {
      for (let col = 0; col < NUM_SQUARES; col++) {
        const squareIndex = `${[row, col]}`;

        const whiteStartingIndex = `${[
          Math.floor(NUM_SQUARES / 2),
          Math.floor(NUM_SQUARES / 2),
        ]}`;

        initialSquares[row][col] = (
          <rect
          x={col * 5}
          y={row * 5}
          width={5}
          height={5}
          fill={squareIndex === whiteStartingIndex ? "white" : "black"}
          className={squareIndex === whiteStartingIndex ?  "W" : "B"}
          ></rect>
        );
      }
    }

    return initialSquares;
  };

  return (
    <div className="App">
      <div style={{ position: 'absolute', top: 0, left: 0}}>
      <button onClick={connectToSerial}>Connect to Serial</button>
      </div>
      <div className="board-container">
        <Board initialSquares={createInitialSquares()} />
      </div>
    </div>
  );
}

export default App;
