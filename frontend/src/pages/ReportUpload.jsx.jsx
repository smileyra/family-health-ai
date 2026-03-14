import { useState } from "react";
import axios from "axios";

export default function ReportUpload() {

  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("XRAY");
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadReport = async () => {

    if (!file) {
      alert("Please select a report");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);
    formData.append("type", reportType);

    try {

      const response = await axios.post(
        "http://localhost:5000/api/ai/analyze-report",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(response.data.summary);

    } catch (error) {

      console.error(error);
      alert("Upload failed");

    }

  };

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Upload Medical Report
      </h1>

      <div className="bg-white shadow p-6 rounded-lg">

        <label className="block mb-2 font-semibold">
          Report Type
        </label>

        <select
          className="border p-2 rounded w-full"
          onChange={(e)=>setReportType(e.target.value)}
        >
          <option value="XRAY">X-Ray</option>
          <option value="ECG">ECG</option>
          <option value="ECHO">Echo</option>
          <option value="LAB">Lab Report</option>
        </select>

        <input
          type="file"
          className="mt-4"
          onChange={handleFileChange}
        />

        <button
          onClick={uploadReport}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload & Analyze
        </button>

      </div>

      {result && (

        <div className="mt-6 bg-green-100 p-4 rounded">

          <h2 className="font-bold">AI Report Summary</h2>

          <p className="mt-2">{result}</p>

        </div>

      )}

    </div>

  );
}