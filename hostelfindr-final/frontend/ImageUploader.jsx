import { useState, useRef, useCallback } from "react";
import hostelService from "../api/hostels";

/**
 * ImageUploader
 *
 * Props:
 *   existingImages  - array of { id, url } already saved on the hostel (for edit mode)
 *   onChange        - called with the current File[] array whenever selection changes
 *   maxFiles        - max new files allowed (default 8)
 */
export default function ImageUploader({ existingImages = [], onChange, maxFiles = 8 }) {
  const [files, setFiles]       = useState([]);       // new File objects
  const [previews, setPreviews] = useState([]);       // blob URLs for preview
  const [saved, setSaved]       = useState(existingImages); // already-uploaded images
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(null);     // id being deleted
  const inputRef = useRef();

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    const remaining = maxFiles - files.length - saved.length;
    const toAdd = valid.slice(0, remaining);
    if (!toAdd.length) return;

    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    const nextFiles   = [...files, ...toAdd];
    const nextPreviews = [...previews, ...newPreviews];

    setFiles(nextFiles);
    setPreviews(nextPreviews);
    onChange?.(nextFiles);
  }, [files, previews, saved.length, maxFiles, onChange]);

  const removeNew = (index) => {
    URL.revokeObjectURL(previews[index]);
    const nf = files.filter((_, i) => i !== index);
    const np = previews.filter((_, i) => i !== index);
    setFiles(nf);
    setPreviews(np);
    onChange?.(nf);
  };

  const removeSaved = async (imgId) => {
    setDeleting(imgId);
    try {
      await hostelService.deleteImage(imgId);
      setSaved((prev) => prev.filter((img) => img.id !== imgId));
    } catch {
      alert("Failed to delete image. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const total    = saved.length + files.length;
  const canAdd   = total < maxFiles;

  const dropZone = {
    border: `2px dashed ${dragging ? "#0F6E56" : "#E8CFA8"}`,
    borderRadius: 12,
    padding: "1.2rem",
    textAlign: "center",
    background: dragging ? "#E1F5EE" : "#FFFBF5",
    cursor: "pointer",
    transition: "all 0.15s",
    marginBottom: "0.8rem",
  };

  const thumb = {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #F0D9BE",
    flexShrink: 0,
  };

  const delBtn = {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };

  return (
    <div>
      {canAdd && (
        <div
          style={dropZone}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div style={{ fontSize: 13, color: "#7A5C3A" }}>
            Drag & drop photos here, or <span style={{ color: "#0F6E56", fontWeight: 500 }}>click to browse</span>
          </div>
          <div style={{ fontSize: 11, color: "#9A7A58", marginTop: 4 }}>
            {total}/{maxFiles} photos · JPG, PNG, WEBP
          </div>
        </div>
      )}

      {(saved.length > 0 || files.length > 0) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {/* Already-saved images (edit mode) */}
          {saved.map((img) => (
            <div key={img.id} style={thumb}>
              <img src={img.url} alt="hostel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                style={delBtn}
                onClick={() => removeSaved(img.id)}
                disabled={deleting === img.id}
                title="Remove"
              >
                {deleting === img.id ? "…" : "×"}
              </button>
            </div>
          ))}
          {/* New file previews */}
          {previews.map((src, i) => (
            <div key={src} style={thumb}>
              <img src={src} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button style={delBtn} onClick={() => removeNew(i)} title="Remove">×</button>
              {/* Upload pending indicator */}
              <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 9, background: "#FAEEDA", color: "#854F0B", borderRadius: 4, padding: "1px 5px", fontWeight: 500 }}>new</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
