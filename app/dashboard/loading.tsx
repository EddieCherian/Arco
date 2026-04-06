export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#EEF2FF]/60">Loading dashboard...</p>
      </div>
    </div>
  );
}