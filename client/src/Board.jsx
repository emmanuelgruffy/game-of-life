import React from "react";
import "./style/Board.css";

// components
import FormControl from "@mui/material/FormControl";
import { InputLabel } from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as $C from "js-combinatorics";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// constants
import { NUM_SQUARES } from "./App";

const possibleVariations = [];

let variations = new $C.BaseN("WB", 6);
for (const elem of variations) {
  possibleVariations.push(elem);
}

const NUM_STEPS = 62;

const Board = ({ initialSquares = [] }) => {
  const [variation, setVariation] = React.useState([]);
  const [startCycle, setStartCycle] = React.useState(false);
  const [{ squares, step }, setSquares] = React.useState({
    squares: initialSquares,
    step: 0,
  });

  const calcNumberOfWhites = React.useCallback(
    (x, y) => {
      let whiteSquaresCounter = 0;

      if (squares[x][y]?.props?.className?.includes("W")) {
        whiteSquaresCounter++;
      }

      if (
        x - 1 >= 0 &&
        y - 1 >= 0 &&
        squares[x - 1][y - 1]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      if (x - 1 >= 0 && squares[x - 1][y]?.props?.className?.includes("W")) {
        whiteSquaresCounter++;
      }

      if (
        x - 1 >= 0 &&
        y + 1 < NUM_SQUARES &&
        squares[x - 1][y + 1]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      if (y - 1 >= 0 && squares[x][y - 1]?.props?.className?.includes("W")) {
        whiteSquaresCounter++;
      }

      if (
        y + 1 < NUM_SQUARES &&
        squares[x][y + 1]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      if (
        y - 1 >= 0 &&
        x + 1 < NUM_SQUARES &&
        squares[x + 1][y - 1]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      if (
        x + 1 < NUM_SQUARES &&
        squares[x + 1][y]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      if (
        x + 1 < NUM_SQUARES &&
        y + 1 < NUM_SQUARES &&
        squares[x + 1][y + 1]?.props?.className?.includes("W")
      ) {
        whiteSquaresCounter++;
      }

      return whiteSquaresCounter;
    },
    [squares]
  );

  const createNextVariationSquares = React.useCallback(
    (variation) => {
      const blueprint = ["B", "W", ...variation, "B", "W"];

      let newSquares = new Array(127);
      for (let i = 0; i < newSquares.length; i++) {
        newSquares[i] = new Array(127);
      }

      for (let row = 0; row < NUM_SQUARES; row++) {
        for (let col = 0; col < NUM_SQUARES; col++) {
          const blackOrWhite = blueprint[calcNumberOfWhites(row, col)];

          newSquares[row][col] = (
            <rect
              x={col * 5}
              y={row * 5}
              width={5}
              height={5}
              fill={blackOrWhite === "W" ? "white" : "black"}
              className={blackOrWhite === "W" ? "W" : "B"}
            ></rect>
          );
        }
      }
      setSquares((prev) => ({ squares: newSquares, step: prev.step + 1 }));
    },
    [calcNumberOfWhites]
  );

  const doVariation = React.useRef();

  React.useEffect(() => {
    if (startCycle && step < NUM_STEPS) {
      doVariation.current = setTimeout(() => {
        createNextVariationSquares(variation);
      }, 150);
    }
    if (step === NUM_STEPS) {
      setStartCycle(false);
      clearTimeout(doVariation.current);
    }
  }, [startCycle, step, createNextVariationSquares, variation]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ marginRight: "10%" }}>
        <Box sx={{ minWidth: 120 }} marginBottom={"10px"}>
          <FormControl fullWidth>
            <InputLabel id="variation-label">Variation</InputLabel>
            <Select
              labelId="variation-label"
              id="variation-select"
              value={variation?.length ? variation : ""}
              label="Variation"
              disabled={startCycle}
              onChange={(e) => setVariation(e.target.value)}
            >
              {possibleVariations.map((variation) => (
                <MenuItem key={`${variation}`} value={variation}>
                  {variation.join(" ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <button
          className={`start-button ${
            !variation?.length || startCycle ? "disabled" : ""
          }`}
          onClick={() => {
            if (step >= NUM_STEPS - 1) {
              setSquares({
                squares: initialSquares,
                step: 0,
              });
            }

            setStartCycle(true);
          }}
          disabled={!variation?.length || startCycle}
        >
          {step >= NUM_STEPS - 1 ? "Re-start" : "Start"}
        </button>
      </div>
      <div>
        <div className="board">
          <svg width={127 * 5} height={127 * 5}>
            {squares}
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {step > 0 && step < NUM_STEPS ? (
            <>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  clearTimeout(doVariation.current);
                  setStartCycle((prev) => !prev);
                }}
              >
                {startCycle ? <PauseIcon /> : <PlayArrowIcon />}
              </button>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <StopIcon
                  onClick={() => {
                    clearTimeout(doVariation.current);
                    setStartCycle(false);
                    setVariation([]);
                    setSquares({
                      squares: initialSquares,
                      step: 0,
                    });
                  }}
                />
              </button>
            </>
          ) : (
            <div style={{ height: "29.5px" }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
