export default function UnauthorizedPage() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      background: "#0f172a",
      color: "white"
    }}>
      <h1 style={{ fontSize: "48px" }}>🚫 403</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/feed" style={{ color: "#6366f1", marginTop: "16px" }}>
        Go back to Feed
      </a>
    </div>
  )
}
