import axios from "axios";
import jsPDF from "jspdf";

export const convertSvgToPng = (svgElement) => {
  const svgString = new XMLSerializer().serializeToString(svgElement);

  // Create a new image element
  const img = new Image();
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  // Return a promise that resolves when the image has loaded
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a PNG blob
      canvas.toBlob((blob) => {
        resolve(blob); // Return the PNG blob
      }, "image/png");
    };
    img.onerror = reject;

    // Set the src to the SVG blob URL
    img.src = url;
  });
};

export const uploadImageToImgur = async (imageBlob) => {
  const formData = new FormData();
  formData.append("image", imageBlob);

  try {
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      formData,
      {
        headers: {
          Authorization: `Client-ID ${process.env.REACT_APP_CLIENT_ID}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log({ response });

    // Return the image URL
    return response.data.data.link;
  } catch (error) {
    console.error("Error uploading image to Imgur:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const sendSvgForPrinting = async (svgElement) => {
  // Assuming you have an <svg> element in your React component
  const svgData = new XMLSerializer().serializeToString(svgElement);

  // Convert SVG to PDF using jsPDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [58, 100], // Set receipt dimensions, adjust as necessary
  });

  doc.addSvgAsImage(svgData, 0, 0, 58, 100); // Adjust dimensions

  // Save the PDF as a Blob
  const pdfBlob = doc.output("blob");

  // Send the PDF blob to the server
  const formData = new FormData();
  formData.append("pdf", pdfBlob, "receipt.pdf");

  try {
    const response = await fetch("http://localhost:4000/api/print", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("Print request sent successfully");
    } else {
      console.error("Failed to send print request");
    }
  } catch (error) {
    console.error("Error sending print request:", error);
  }
};

// to be used maybe in the future in Board.jsx

// const openAIClient = new OpenAI({
//   apiKey: `${process.env.REACT_APP_OPENAI_API_KEY}`,
//   dangerouslyAllowBrowser: true,
// });

// const handleOpenAIResponse = () => {
//   return async (serializedSvg) => {
//     console.log(serializedSvg);

//     setGeneratingResponse(true);
//     try {
//       const chatCompletion = await openAIClient.chat.completions.create({
//         messages: [{ role: "user", content: "Say this is a test" }],
//         model: "text-embedding-3-small",
//       });
//       console.log({ chatCompletion });
//     } catch (error) {
//       console.error("Failed to generate response", error);
//     } finally {
//       setGeneratingResponse(false);
//       setResponse(response?.data?.choices[0]?.text || "No response generated");
//     }
//   };
// };

// to be used maybe later in on Board.jsx

// const handleConvertToImg = () => {
//   return (svgElement) => {
//     convertSvgToPng(svgElement).then((pngBlob) => {
//       const formData = new FormData();
//       formData.append("image", pngBlob);

//       uploadImageToImgur(pngBlob)
//         .then((imageUrl) => {
//           console.log("Image uploaded to Imgur:", imageUrl);
//         })
//         .catch((error) => {
//           console.error("Failed to upload image:", error);
//         });
//     });
//   };
// };
