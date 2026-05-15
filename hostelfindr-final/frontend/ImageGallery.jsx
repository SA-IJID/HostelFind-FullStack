import { useState } from "react";

/**
 * ImageGallery
 * Props:
 *   images  - array of { id, url } from the API
 *   name    - hostel name (used as alt text)
 */
export default function ImageGallery({ images = [], name = "Hostel" }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div style={{ width: "100%", height: 180, borderRadius: 12, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: "1rem" }}>
        🏠
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Main image */}
      <div style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden", marginBottom: 8, position: "relative" }}>
        <img
          src={images[active].url}
          alt={`${name} — photo ${active + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
            >‹</button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
            >›</button>
            <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 11, borderRadius: 20, padding: "2px 8px" }}>
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.url}
              alt={`thumb ${i + 1}`}
              onClick={() => setActive(i)}
              style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, cursor: "pointer", flexShrink: 0, border: i === active ? "2px solid #0F6E56" : "1px solid #F0D9BE", transition: "border-color 0.15s" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
