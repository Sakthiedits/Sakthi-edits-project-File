import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06050b] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute w-[500px] h-[500px] bg-[#7c3aed]/15 rounded-full blur-[150px]" />

      {/* Large 404 */}
      <p className="text-[120px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#e879f9] select-none drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        Page Not Found
      </h1>

      {/* Subtext */}
      <p className="mt-4 max-w-md text-base text-[#94a3b8] leading-relaxed">
        Looks like this frame got cut from the final edit. The page you're
        looking for doesn't exist or may have been moved.
      </p>

      {/* Go Home button */}
      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(147,51,234,0.45)] hover:shadow-[0_0_35px_rgba(147,51,234,0.65)] hover:opacity-95 transition-all"
      >
        ← Go Home
      </Link>
    </div>
  )
}
