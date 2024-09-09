import axios from "axios";

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
