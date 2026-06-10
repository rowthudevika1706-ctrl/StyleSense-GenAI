import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { photoAPI } from "../../utils/api";

export default function PhotoUploader({ onDetected, skipAnalysis = false, onUpload }) {
  const [mode, setMode] = useState("upload"); // "upload" | "webcam"
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const webcamRef = useRef();

  const analyzeImage = async (base64) => {
    setAnalyzing(true);
    try {
      const res = await photoAPI.analyze(base64);
      onDetected(res.data);
      toast.success(`Skin tone detected: ${res.data.skin_tone}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      if (onUpload) onUpload(e.target.result);
      if (!skipAnalysis) {
        analyzeImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      setMode("upload");
      if (onUpload) onUpload(imageSrc);
      if (!skipAnalysis) {
        analyzeImage(imageSrc);
      }
    }
  }, [webcamRef, skipAnalysis, onUpload]);

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${mode === "upload" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setMode("upload")}
        >
          <Upload size={14} /> Upload Photo
        </button>
        <button
          className={`btn btn-sm ${mode === "webcam" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setMode("webcam")}
        >
          <Camera size={14} /> Use Camera
        </button>
      </div>

      {mode === "webcam" ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 12 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: "100%", maxWidth: 400, borderRadius: "var(--radius-lg)" }}
              videoConstraints={{ facingMode: "user" }}
            />
          </div>
          <button className="btn btn-primary" onClick={captureWebcam} disabled={analyzing}>
            <Camera size={16} />
            {analyzing ? "Analyzing..." : "Capture & Analyze"}
          </button>
        </div>
      ) : (
        <div>
          {preview ? (
            skipAnalysis ? (
              <div style={{
                border: "2px dashed var(--success)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                textAlign: "center",
                background: "rgba(16, 185, 129, 0.04)"
              }}>
                <div style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.95rem", marginBottom: 6 }}>
                  ✓ Item Image Uploaded Successfully!
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                  Your item is displayed in full resolution on the right side.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setPreview(null);
                      if (onUpload) onUpload(null);
                    }}
                  >
                    Remove Image
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setPreview(null);
                      fileRef.current.click();
                    }}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={preview}
                  alt="Uploaded"
                  style={{ width: "100%", maxWidth: 320, borderRadius: "var(--radius-lg)", border: "2px solid var(--border)" }}
                />
                {analyzing && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                    borderRadius: "var(--radius-lg)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: 12
                  }}>
                    <div className="spinner" />
                    <span style={{ color: "white", fontSize: "0.85rem" }}>Detecting skin tone...</span>
                  </div>
                )}
                <button
                  className="btn btn-sm"
                  onClick={() => setPreview(null)}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.7)", color: "white", borderRadius: "50%",
                    width: 28, height: 28, padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )
          ) : (
            <div
              className={`upload-area ${dragOver ? "dragover" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} style={{ color: "var(--accent)", marginBottom: 12 }} />
              <p style={{ fontSize: "0.95rem", marginBottom: 6 }}>Drop a photo here or click to browse</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Best results: clear facial photo, good lighting
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {preview && !analyzing && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setPreview(null); fileRef.current.click(); }}
              style={{ marginTop: 12 }}
            >
              <RefreshCw size={14} /> Retake Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}