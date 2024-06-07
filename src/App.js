// import logo from './logo.svg';
import "./App.css";
import Board from "./Board";

export const NUM_SQUARES = 127;

function App() {
  const createInitialSquares = () => {
    let initialSquares = new Array(127);
    for (let i = 0; i < initialSquares.length; i++) {
      initialSquares[i] = new Array(127);
    }

    for (let row = 0; row < NUM_SQUARES; row++) {
      for (let col = 0; col < NUM_SQUARES; col++) {
        const squareIndex = `${[row, col]}`;

        const whiteStartingIndex = `${[
          Math.ceil(NUM_SQUARES / 2),
          Math.ceil(NUM_SQUARES / 2),
        ]}`;

        initialSquares[row][col] = (
          <div
            key={`${[row, col]}`}
            className={`square ${
              squareIndex === whiteStartingIndex ? "W" : "B"
            }`}
          ></div>
        );
      }
    }

    return initialSquares;
  };

  return (
    <div className="App">
      <div className="board-container">
        <Board initialSquares={createInitialSquares()} />
      </div>
    </div>
  );
}

export default App;
