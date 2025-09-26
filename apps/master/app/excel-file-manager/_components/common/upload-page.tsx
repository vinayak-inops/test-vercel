"use client";
import { useState } from "react";
import Head from "next/head";
import { organization } from "@/json/organization/form-structure";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is an Excel file
      if (
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError("");
      } else {
        setFile(null);
        setFileName("");
        setError("Please select an Excel file (.xls or .xlsx)");
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      if (
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(droppedFile);
        setFileName(droppedFile.name);
        setError("");
      } else {
        setError("Please drop an Excel file (.xls or .xlsx)");
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setError("");

    try {
      // Create FormData and append the entire file as binary data
      const formData = new FormData();

      // This adds the complete file to the form data
      formData.append("file", file);

      const response = await fetch(
        "http://49.206.252.89:8080/api/workflow/attendance/uploadfile",
        {
          method: "POST",
          headers: {
            "X-workflow": "Excel file upload",
            "X-Tenant": "Midhani",
            "X-user": "Midhani",
          },
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus("Upload successful!");
        setFile(null);
        setFileName("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server responded with status ${response.status}`
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.message}`);
      setUploadStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Attendance Excel Upload</title>
        <meta name="description" content="Upload attendance Excel files" />
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Attendance Excel Upload
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer mb-6"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleFileChange}
            />

            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">
                {fileName ? fileName : "Click to upload or drag and drop"}
              </span>
              {!fileName && (
                <p className="text-xs text-gray-500 mt-1">
                  Excel files only (.xls or .xlsx)
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {uploadStatus && (
            <p className="text-sm text-green-600 mb-4">{uploadStatus}</p>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !file || isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>
    </div>
  );
}
