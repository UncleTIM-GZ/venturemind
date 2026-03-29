export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome to VentureMind. Your AI-native VC command center.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Deals", value: "—" },
          { label: "Portfolio Companies", value: "—" },
          { label: "Pending IC Reviews", value: "—" },
          { label: "This Week Meetings", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold font-mono">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
