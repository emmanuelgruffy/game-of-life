import React from "react";
import "./style/Board.css";
import { NUM_SQUARES } from "./App";

const Board = ({ initialSquares = [] }) => {
  const [squares, setSquares] = React.useState(initialSquares);

  const NW = (x, y) => {
    let counter = 0;

    if (squares[x][y]?.props?.className?.includes("W")) {
      counter++;
    }

    if (
      x - 1 >= 0 &&
      y - 1 >= 0 &&
      squares[x - 1][y - 1]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    if (x - 1 >= 0 && squares[x - 1][y]?.props?.className?.includes("W")) {
      counter++;
    }

    if (
      x - 1 >= 0 &&
      y + 1 < NUM_SQUARES &&
      squares[x - 1][y + 1]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    if (y - 1 >= 0 && squares[x][y - 1]?.props?.className?.includes("W")) {
      counter++;
    }

    if (
      y + 1 < NUM_SQUARES &&
      squares[x][y + 1]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    if (
      y - 1 >= 0 &&
      x + 1 < NUM_SQUARES &&
      squares[x + 1][y - 1]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    if (
      x + 1 < NUM_SQUARES &&
      squares[x + 1][y]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    if (
      x + 1 < NUM_SQUARES &&
      y + 1 < NUM_SQUARES &&
      squares[x + 1][y + 1]?.props?.className?.includes("W")
    ) {
      counter++;
    }

    return counter;
  };

  const createVariationSquares = (variation) => {
    const blueprint = ["B", "W", ...variation, "B", "W"];

    let newSquares = new Array(127);
    for (let i = 0; i < newSquares.length; i++) {
      newSquares[i] = new Array(127);
    }

    // for i: 1 to 62 later
    for (let row = 0; row < NUM_SQUARES; row++) {
      for (let col = 0; col < NUM_SQUARES; col++) {
        console.log(`iterating over: ${[row, col]}`);

        const numberOfWhites = blueprint[NW(row, col)];

        newSquares[row][col] = (
          <div
            key={`${[row, col]}`}
            className={`square ${numberOfWhites}`}
          ></div>
        );
      }
    }
    setSquares(newSquares);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ marginRight: "10%" }}>
        <button
          className="start-button"
          onClick={() => createVariationSquares(["W", "W", "W", "W", "B", "B"])}
        >
          Next
        </button>
      </div>
      <div className="board">{squares}</div>
    </div>
  );
};

export default Board;
