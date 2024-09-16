import React from "react";
import "./App.css";
import Board from "./Board";
import HeartSensorIcon from "../src/style/heart-senso-icon.svg";

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

export const ONBOARDING_STEPS = [
  "connect-to-serial",
  "onboarding-intro-loop",
  "onboarding-welcome",
  "onboarding-touch-sensor",
];

function App() {
  const [pattern, setPattern] = React.useState([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [userPressedStart, setUserPressedStart] = React.useState(false);
  const [onboardingSteps, setOnboardingSteps] = React.useState(
    isStreaming ? ONBOARDING_STEPS[1] : ONBOARDING_STEPS[0]
  );
  const [loader, setLoader] = React.useState(false);

  const isAppReady = pattern.length >= 6 && userPressedStart;

  console.log({ isStreaming });
  console.log({ isAppReady });

  // ALL OF THIS IS FOR MOCK PURPOSES ///////////////////////////////////////////

  // const insertNewSignal = () => {
  //   console.log({ pattern });
  //   if (pattern.length === 1000) {
  //     //shrink array back to length of 6
  //     setPattern((prev) => prev.slice(0, 6));
  //   }

  //   // create random signal between 50 and 100
  //   const randomSignal = Math.floor(Math.random() * 50 + 50);

  //   setPattern((prev) => [randomSignal, ...prev]);
  // };

  // const patternFeed = React.useRef();

  // async function connectToSerialMock() {
  //   setIsStreaming(true);

  //   if (pattern.length === 1000) {
  //     //shrink array back to length of 6
  //     setPattern((prev) => prev.slice(0, 6));
  //   }

  //   patternFeed.current = setTimeout(() => {
  //     // create random signal between 50 and 100
  //     const randomSignal = Math.floor(Math.random() * 50 + 50);

  //     setPattern((prev) => [randomSignal, ...prev]);
  //   }, 850);
  // }

  // React.useEffect(() => {
  //   connectToSerialMock();
  //   return () => {
  //     if (pattern.length === 999) {
  //       clearTimeout(patternFeed.current); // Clean up the timeout
  //     }
  //   };
  // }, [pattern, onboardingSteps]);

  // ALL OF THIS IS FOR MOCK PURPOSES ///////////////////////////////////////////

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

            if (signal > 0) {
              console.log({ signal });
              setPattern((prev) => [signal, ...prev]);
            }
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
        {onboardingSteps === "connect-to-serial" && (
          <div style={{ position: "absolute", top: "50%", left: "50%" }}>
            <button
              onClick={() => {
                setOnboardingSteps(ONBOARDING_STEPS[1]);
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
              setOnboardingSteps={setOnboardingSteps}
            />
          </div>
        ) : (
          <>
            {onboardingSteps === "onboarding-intro-loop" && (
              <div style={{ position: "absolute" }}>
                <video
                  autoPlay
                  loop
                  playsInline
                  style={{
                    width: "100vw",
                    height: "100vh",
                  }}
                >
                  <source
                    src={`${process.env.PUBLIC_URL}/onboarding-videos/pulse-and-pattern.mp4`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {onboardingSteps === "onboarding-welcome" && (
              <div style={{ position: "absolute" }}>
                <video
                  autoPlay
                  playsInline
                  style={{
                    width: "100vw",
                    height: "100vh",
                  }}
                >
                  <source
                    src={`${process.env.PUBLIC_URL}/onboarding-videos/welcome.mp4`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {onboardingSteps === "onboarding-touch-sensor" && (
              <div style={{ position: "absolute" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <video
                    onEnded={() => setLoader(true)}
                    autoPlay
                    playsInline // Ensures the video behaves well on mobile browsers
                    style={{
                      width: "100vw",
                      height: "90vh",
                    }}
                  >
                    <source
                      src={`${process.env.PUBLIC_URL}/onboarding-videos/touch-sensor.mp4`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "15rem",
                      width: "100vw",
                      height: "10vh",
                    }}
                  >
                    {loader && (
                      <video
                        autoPlay
                        loop
                        playsInline // Ensures the video behaves well on mobile browsers
                        style={{
                          width: "10vw",
                          height: "10vh",
                        }}
                      >
                        <source
                          src={`${process.env.PUBLIC_URL}/onboarding-videos/loader.mp4`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* <div style={{ position: "absolute", top: 0, left: 0 }}>
          <button onClick={insertNewSignal}>NEW PATTERN</button>
        </div> */}
        <button
          className="onboarding-button"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOnboardingSteps(ONBOARDING_STEPS[0]);
            }
            if (e.key === "Enter") {
              if (onboardingSteps === "onboarding-welcome") {
                setUserPressedStart(true);
                setOnboardingSteps((prev) => {
                  const currentIndex = ONBOARDING_STEPS.indexOf(prev);
                  return ONBOARDING_STEPS[currentIndex + 1];
                });
              } else {
                if (onboardingSteps !== "onboarding-touch-sensor") {
                  setOnboardingSteps((prev) => {
                    const currentIndex = ONBOARDING_STEPS.indexOf(prev);
                    return ONBOARDING_STEPS[currentIndex + 1];
                  });
                }
              }
            }
          }}
        />
      </div>
    </PatternContext.Provider>
  );
}

export default App;
