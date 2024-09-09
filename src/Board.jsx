import React from "react";
import OpenAI from "openai";
import "./style/Board.css";

// constants
import { NUM_SQUARES, PatternContext } from "./App";
import { openAIPrompt } from "./prompt";
import { convertSvgToPng, uploadImageToImgur } from "./helpers";

const NUM_STEPS = 10;

const Board = ({ initialSquares = [], setUserPressedStart, setPattern }) => {
  const openAIClient = new OpenAI({
    apiKey: `${OPENAI_API_KEY}`,
    dangerouslyAllowBrowser: true,
  });

  const [{ squares, step }, setSquares] = React.useState({
    squares: initialSquares,
    step: 0,
  });

  const patternFromContext = React.useContext(PatternContext);
  const [generatingResponse, setGeneratingResponse] = React.useState(false);
  const [response, setResponse] = React.useState(null);

  //inspect the following svg picture: ${svgElement}. ${openAIPrompt}

  const handleConvertToImg = () => {
    return (svgElement) => {
      convertSvgToPng(svgElement).then((pngBlob) => {
        const formData = new FormData();
        formData.append("image", pngBlob);

        uploadImageToImgur(pngBlob)
          .then((imageUrl) => {
            console.log("Image uploaded to Imgur:", imageUrl);

            setPattern([]);
          })
          .catch((error) => {
            console.error("Failed to upload image:", error);
          });
      });
    };
  };

  const handleOpenAIResponse = () => {
    return async (serializedSvg) => {
      console.log(serializedSvg);

      setGeneratingResponse(true);
      try {
        const chatCompletion = await openAIClient.chat.completions.create({
          messages: [{ role: "user", content: "Say this is a test" }],
          model: "text-embedding-3-small",
        });
        console.log({ chatCompletion });
      } catch (error) {
        console.error("Failed to generate response", error);
      } finally {
        setGeneratingResponse(false);
        setResponse(
          response?.data?.choices[0]?.text || "No response generated"
        );
      }
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

  const askGPT = handleOpenAIResponse();
  const convertToImg = handleConvertToImg();

  const asyncEffect = async () => {
    if (step < NUM_STEPS) {
      const variation = translatePatternToVariation(patternFromContext);

      doVariation.current = setTimeout(() => {
        createNextVariationSquares(variation);
      }, 1000 * (1 / patternFromContext[0]));
    }
    if (step === NUM_STEPS && doVariation.current) {
      const svgElement = document.querySelector("svg") || null;
      convertToImg(svgElement);
      setSquares((prev) => ({ ...prev, step: NUM_STEPS + 1 }));
      clearTimeout(doVariation.current);

      //await askGPT(serializedSvg);
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
      <div>
        {generatingResponse && <p>Generating response...</p>}
        {response && !generatingResponse && <p>{response}</p>}
      </div>
    </div>
  );
};

export default Board;
