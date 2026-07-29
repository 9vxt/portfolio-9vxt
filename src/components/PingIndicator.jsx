export default function PingIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5" title="System online">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-[#34d399] opacity-75" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-[#34d399]" />
      </span>
      <span className="text-[9px] font-mono text-[#34d399] tracking-wider">ONLINE</span>
    </span>
  )
}
