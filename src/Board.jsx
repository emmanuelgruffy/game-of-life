import React from "react";
import "./style/Board.css";

// constants
import { NUM_SQUARES, PatternContext } from "./App";
import { DESCRIPTIONS } from "./prompt";
import { ONBOARDING_STEPS } from "./App";

const NUM_STEPS = 62;

const VIDEOS_IN_CYCLE = [
  "do-you-feel-your-pulse-2.mp4",
  "is-it-fast-3.mp4",
  "is-it-slow-4.mp4",
  "do-you-have-any-intention-5.mp4",
  "you-are-done-8.mp4",
  "loader-9.mp4",
];

const Board = ({
  initialSquares = [],
  setUserPressedStart,
  setPattern,
  setOnboardingSteps,
}) => {
  const [{ squares, step }, setSquares] = React.useState({
    squares: initialSquares,
    step: 0,
  });

  const patternFromContext = React.useContext(PatternContext);
  const [isPlayingVideo, setIsPlayingVideo] = React.useState(false);
  const [inCycleVideo, setInCycleVideo] = React.useState(null);
  const [description, setDescription] = React.useState(null);

  const hasPrinted = React.useRef(false);
  const doVariation = React.useRef();

  const handlePrinterDialog = () => {
    window.print();
  };

  const handlePrinting = () => {
    return async () => {
      hasPrinted.current = true;
      handlePrinterDialog();
    };
  };

  const handleLoaderVideo = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPlayingVideo(false);
        setInCycleVideo(null);
        resolve();
      }, 3000);
    });
  };

  const handleDescription = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
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
              className={`${blackOrWhite === "W" ? "W" : "B"}`}
            ></rect>
          );
        }
      }

      if (step >= 8 && step < 12) {
        setInCycleVideo(VIDEOS_IN_CYCLE[0]);
        !isPlayingVideo && setIsPlayingVideo(true);
      }

      if (step >= 20 && step < 24) {
        setInCycleVideo(VIDEOS_IN_CYCLE[1]);
        !isPlayingVideo && setIsPlayingVideo(true);
      }

      if (step >= 32 && step < 36) {
        setInCycleVideo(VIDEOS_IN_CYCLE[2]);
        !isPlayingVideo && setIsPlayingVideo(true);
      }
      if (step >= 44 && step < 48) {
        setInCycleVideo(VIDEOS_IN_CYCLE[3]);
        !isPlayingVideo && setIsPlayingVideo(true);
      }
      if (step >= NUM_STEPS - 1 && step < NUM_STEPS) {
        setInCycleVideo(VIDEOS_IN_CYCLE[4]);
        !isPlayingVideo && setIsPlayingVideo(true);
      }

      if (step < NUM_STEPS) {
        setSquares((prev) => ({ squares: newSquares, step: prev.step + 1 }));
      }
    },
    [calcNumberOfWhites]
  );

  const setPrinting = handlePrinting();

  const asyncEffect = async () => {
    if (step < NUM_STEPS) {
      const variation = translatePatternToVariation(patternFromContext);

      doVariation.current = setTimeout(() => {
        createNextVariationSquares(variation);
      }, 1000 * (1 / patternFromContext[0]));
    }

    if (step === NUM_STEPS && doVariation.current) {
      setInCycleVideo(VIDEOS_IN_CYCLE[5]);
      setIsPlayingVideo(true);
      await handleLoaderVideo();
      setDescription(DESCRIPTIONS[0]);
      await handleDescription();

      setSquares((prev) => ({ ...prev, step: NUM_STEPS + 1 }));
      clearTimeout(doVariation.current);
    }
  };

  React.useEffect(() => {
    asyncEffect();
    return () => {
      if (step > NUM_STEPS && doVariation.current) {
        clearTimeout(doVariation.current); // Clean up the timeout
        if (!hasPrinted.current) {
          setPrinting();
        }
        setSquares((prev) => ({ ...prev, step: 0 }));
        setUserPressedStart(false);
        setPattern([]);
        setOnboardingSteps(ONBOARDING_STEPS[1]);
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
      <div
        style={{
          marginTop: "5rem",
          display: "flex",
          justifyContent: "center",
          width: "100vw",
          height: "5vh",
        }}
      >
        {inCycleVideo && isPlayingVideo && (
          <video
            autoPlay
            onEnded={() => setIsPlayingVideo(false)}
            playsInline
            style={{
              width: "100vw",
              height: "5vh",
            }}
          >
            <source
              src={`${process.env.PUBLIC_URL}/cycle-videos/${inCycleVideo}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        )}
        {description && !isPlayingVideo && (
          <div className="description fade-in">
            <div>
              <h3>
                <strong>description: </strong>
                <span>{description.description}</span>
              </h3>
            </div>
            <div>
              <h3>
                <strong>what your heart wants: </strong>
                <span>{description.heart}</span>
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
