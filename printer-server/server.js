const express = require("express");
const bodyParser = require("body-parser");
const Printer = require("node-printer");
const PDFDocument = require("pdfkit");
const svgToPDF = require("svg-to-pdfkit");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const os = require("os"); // To detect the operating system
const { exec } = require("child_process");

const app = express();
const port = 4000;

// Configure multer to save uploaded PDFs in a temporary directory
const upload = multer({ dest: "uploads/" });

// Enable CORS for all requests (you can restrict this to specific origins)
app.use(cors());

app.use(bodyParser.json());

function getPrintCommand(filePath) {
  const printerName = "Your_Printer_Name"; // Change this to your actual printer name

  if (os.platform() === "win32") {
    // Windows OS
    return `start /min acrord32.exe /t "${filePath}" "${printerName}"`;
  } else {
    // Linux/macOS
    return `lp ${filePath}`;
  }
}

// Endpoint to handle print requests
// Endpoint to handle the PDF upload and print it
app.post("/api/print", upload.single("pdf"), (req, res) => {
  const pdfPath = req.file.path; // Path where the uploaded PDF is stored

  if (!pdfPath) {
    return res.status(400).send({ message: "No PDF file uploaded" });
  }

  console.log(`Received PDF file at: ${pdfPath}`);

  const printCommand = getPrintCommand(pdfPath);

  // Step 1: Use the lp command to print the PDF file
  exec(printCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error while printing: ${error.message}`);
      return res
        .status(500)
        .send({ message: "Error while printing", error: error.message });
    }
    if (stderr) {
      console.error(`Print stderr: ${stderr}`);
      return res
        .status(500)
        .send({ message: "Error while printing", error: stderr });
    }

    // Print job succeeded
    console.log(`Print stdout: ${stdout}`);
    res.status(200).send({ message: "Print job sent successfully", stdout });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
