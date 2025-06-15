export default function OgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        color: "white",
        fontSize: 72,
        fontWeight: 700,
        textAlign: "center",
        padding: 40,
        background: "#888",
      }}
    >
      <div style={{ marginBottom: 20 }}>⚡ vite-plugin-react-og-image</div>
      <div style={{ fontSize: 36, opacity: 0.8, fontWeight: 400 }}>
        Auto-generated Open Graph images
      </div>
      <div style={{ fontSize: 36, opacity: 0.8, fontWeight: 400 }}>
        日本語のサンプルテキストです
      </div>
    </div>
  );
}
