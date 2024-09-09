import React from "react";
import "./App.css";
import Board from "./Board";
import HeartSensorIcon from "../src/style/heart-senso-icon.svg";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

class ReadlineParser {
  constructor(delimiter = "\n") {
    this.delimiter = delimiter;
    this.buffer = "";
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
      this.buffer = "";
      return remaining;
    }
    return null;
  }
}

export const NUM_SQUARES = 127;

export const PatternContext = React.createContext(null);

const ONBOARDING_STEPS = [
  "onboarding-intro",
  "onboarding-start-1",
  "onboarding-start-2",
  "onboarding-confirmation",
  "onboarding-sensor-description",
];

function App() {
  const [pattern, setPattern] = React.useState([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [userPressedStart, setUserPressedStart] = React.useState(false);
  const [onboardingSteps, setOnboardingSteps] = React.useState(
    ONBOARDING_STEPS[0]
  );

  const isAppReady = pattern.length >= 6 && userPressedStart;

  console.log({ isStreaming });

  async function connectToSerial() {
    setIsStreaming(true);
    try {
      // Request a port and open it
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const reader = port.readable.getReader();
      const readlineParser = new ReadlineParser("\n"); // Using newline as the delimiter

      while (true) {
        if (pattern.length === 1000) {
          //shrink array back to length of 6
          setPattern((prev) => prev.slice(0, 6));
        }
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }

        if (value) {
          const text = new TextDecoder().decode(value);
          const lines = readlineParser.parse(text);

          // Process each line separately
          lines.forEach((line) => {
            const signal = parseInt(line.slice(0, -1));
            console.log({ signal });
            setPattern((prev) => [signal, ...prev]);
          });
        }
      }

      // If there's any remaining data in the buffer, process it
      const remaining = readlineParser.flush();
      if (remaining) {
        console.log({ remaining });
      }
    } catch (error) {
      console.error("Failed to connect to the serial port", error);
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
            className={squareIndex === whiteStartingIndex ? "W" : "B"}
          ></rect>
        );
      }
    }

    return initialSquares;
  };

  return (
    <PatternContext.Provider value={pattern}>
      <div className="App">
        {!isStreaming && (
          <div style={{ position: "absolute", top: 0, left: 0 }}>
            <button
              onClick={() => {
                connectToSerial();
              }}
            >
              Connect to Serial
            </button>
          </div>
        )}

        {isAppReady ? (
          <div className="board-container">
            <Board
              initialSquares={createInitialSquares()}
              setUserPressedStart={setUserPressedStart}
              setPattern={setPattern}
            />
          </div>
        ) : (
          <>
            {onboardingSteps === "onboarding-intro" && (
              <div style={{ position: "absolute" }}>
                <h1 style={{ marginBottom: "0px" }}>
                  This machine will design
                </h1>
                <h1 style={{ marginTop: "8px" }}>straight from your heart</h1>
              </div>
            )}
            {onboardingSteps === "onboarding-start-1" && (
              <div style={{ position: "absolute", textAlign: "left" }}>
                <h1 style={{ marginBottom: "0px" }}>We will now start</h1>
                <h1 style={{ marginTop: "8px" }}>a small journey</h1>
                <br />
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  This app is a machine that
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  joints biofeedback and code
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  to create a unique pattern
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  out of your pulse.
                </h1>
                <br />
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  The pattern you will get
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  is not a medical graph.
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  but it is unique to you
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  and grows out of your
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  heart's data at this
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  specific moment in time.
                </h1>
              </div>
            )}
            {onboardingSteps === "onboarding-start-2" && (
              <div style={{ position: "absolute", textAlign: "left" }}>
                <h1 style={{ marginBottom: "0px" }}>During the measurement</h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  it is recommended to
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  pay attention to
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  your body so you could
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  feel more connected
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  to your real and metaphorical
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  heart.
                </h1>
                <br />
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  When you'll print the pattern
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  the machine will add an
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  interpretation of what your
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  heart desires based
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  on your unique pattern.
                </h1>
              </div>
            )}
            {onboardingSteps === "onboarding-confirmation" && (
              <div style={{ position: "absolute", textAlign: "left" }}>
                <h1 style={{ marginBottom: "0px" }}>
                  Press enter if you are willing
                </h1>
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  to start
                </h1>
              </div>
            )}
            {onboardingSteps === "onboarding-sensor-description" && (
              <div style={{ position: "absolute", textAlign: "center" }}>
                <h1 style={{ marginBottom: "0px" }}>
                  Touch the sensor in green
                </h1>
                <h2 style={{ marginTop: "8px", marginBottom: "8px" }}>
                  (it is right in front of you)
                </h2>
                <img
                  src={HeartSensorIcon}
                  alt="heart-sensor-icon"
                  width={211}
                  height={216}
                />

                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  Keep touching it for as long
                </h1>
                <br />
                <h1 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  as pattern grows
                </h1>
                <h5 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  The measure will start in
                </h5>
                <h2 style={{ marginTop: "8px", marginBottom: "0px" }}>
                  3..2..1..
                </h2>
              </div>
            )}
          </>
        )}
        {onboardingSteps !== "onboarding-sensor-description" && (
          <div className={`onboarding-div ${onboardingSteps}`}>
            <button
              className="intro-start"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOnboardingSteps(ONBOARDING_STEPS[0]);
                }
                if (e.key === "Enter") {
                  if (onboardingSteps === "onboarding-confirmation") {
                    setUserPressedStart(true);
                  }
                  setOnboardingSteps((prev) => {
                    const currentIndex = ONBOARDING_STEPS.indexOf(prev);
                    return ONBOARDING_STEPS[currentIndex + 1];
                  });
                }
              }}
            >
              {onboardingSteps === "onboarding-intro" ? (
                "press enter to start"
              ) : (
                <ArrowCircleRightOutlinedIcon
                  style={{ fontSize: "60px", fontWeight: 400 }}
                />
              )}
            </button>
          </div>
        )}
      </div>
    </PatternContext.Provider>
  );
}

export default App;
