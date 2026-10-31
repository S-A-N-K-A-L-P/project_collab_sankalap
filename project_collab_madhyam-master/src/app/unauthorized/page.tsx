export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 bg-surface border-2 border-accent rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-4xl">🚫</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground">Access Denied</h1>
          <p className="text-muted text-[13px] font-medium">You do not have permission to access this page.</p>
        </div>
        <a
          href="/feed"
          className="inline-block px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg font-bold text-[12px] uppercase tracking-wider transition-colors"
        >
          Go Back to Feed
        </a>
      </div>
    </div>
  )
}
