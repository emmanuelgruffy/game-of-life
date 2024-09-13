import React from "react";
import "./style/Board.css";

// constants
import { NUM_SQUARES, PatternContext } from "./App";
import { sendSvgForPrinting } from "./helpers";

const NUM_STEPS = 10;

const Board = ({ initialSquares = [], setUserPressedStart, setPattern }) => {
  const [{ squares, step }, setSquares] = React.useState({
    squares: initialSquares,
    step: 0,
  });

  const patternFromContext = React.useContext(PatternContext);
  //const [generatingResponse, setGeneratingResponse] = React.useState(false);
  //const [response, setResponse] = React.useState(null);

  const handlePrintSvg = () => {
    return (svgElement) => {
      sendSvgForPrinting(svgElement);
    };
  };

  const translatePatternToVariation = (pattern) => {
    // console.log({ pattern });
    const latestSixSignals = pattern.slice(0, 6);
    const variationToApply = latestSixSignals.map((_, index) => {
      if (pattern[index] > pattern[index + 1]) {
        return "W";
      } else {
        return "B";
      }
    });
    return variationToApply;
  };

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

  const sendToPrinter = handlePrintSvg();

  const asyncEffect = async () => {
    if (step < NUM_STEPS) {
      const variation = translatePatternToVariation(patternFromContext);

      doVariation.current = setTimeout(() => {
        createNextVariationSquares(variation);
      }, 1000 * (1 / patternFromContext[0]));
    }
    if (step === NUM_STEPS && doVariation.current) {
      const svgElement = document.querySelector("svg") || null;
      sendToPrinter(svgElement);
      setSquares((prev) => ({ ...prev, step: NUM_STEPS + 1 }));
      clearTimeout(doVariation.current);
    }
  };

  React.useEffect(() => {
    asyncEffect();
    return () => {
      if (step > NUM_STEPS && doVariation.current) {
        clearTimeout(doVariation.current); // Clean up the timeout
      }
    };
  }, [patternFromContext]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="board">
        <svg width={127 * 5} height={127 * 5}>
          {squares}
        </svg>
      </div>
      {step > NUM_STEPS && <div>{"some description about the result"}</div>}
    </div>
  );
};

export default Board;
