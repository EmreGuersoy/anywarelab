import { useNavigate } from 'react-router-dom'

// ── Step ──────────────────────────────────────────────────────────────────────

function Step({ num, title, body }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ── Landing page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-y-auto bg-white">

      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-40px)] flex items-center overflow-hidden">

        {/* Background grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Soft radial glow */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-gray-100 via-transparent to-transparent pointer-events-none" />

        <div className="relative w-full max-w-6xl mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-12 pt-16 pb-10">

          {/* Left: copy */}
          <div className="flex-1 min-w-0">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
              Design custom<br />
              <span className="text-gray-400">labware visually.</span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed max-w-md mb-10">
              A browser-based editor for creating Opentrons-compatible labware definitions.
              Place wells, tune dimensions, and export a ready-to-use JSON in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Primary CTA */}
              <button
                onClick={() => navigate('/design')}
                className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-gray-700 active:scale-[0.98] transition-all duration-150 overflow-hidden"
              >
                <span className="relative z-10">Start Designing</span>
                <svg
                  className="relative z-10 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
                {/* Shine sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>

              {/* Secondary CTA */}
              <a
                href="https://anywarelab.readthedocs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Docs
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M7 2l5 5-5 5" />
                </svg>
              </a>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-gray-100">
              {[['4', 'Labware types'], ['JSON + PNG', 'Export formats']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-xl font-bold text-gray-900">{val}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: video placeholder */}
          <div className="flex-shrink-0 w-full max-w-[380px] lg:max-w-[440px] relative">
            <div className="relative rounded-3xl border border-gray-200 bg-gray-50 shadow-xl overflow-hidden aspect-video flex flex-col items-center justify-center gap-4">
              {/* Play button */}
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">Video coming soon</div>
                <div className="text-[11px] text-gray-400 mt-1">A walkthrough of the designer</div>
              </div>
              {/* Corner decoration */}
              <div className="absolute top-3 right-3 text-[9px] font-bold tracking-widest uppercase text-gray-300">
                Demo
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── How it works ── */}
      <section className="pt-10 pb-16 px-8 lg:px-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
          <p className="text-sm text-gray-500 mb-10">From blank canvas to robot-ready labware in three steps.</p>
          <div className="flex flex-col lg:flex-row gap-8">
            <Step
              num="1"
              title="Set up your plate"
              body="Choose a labware type and enter the physical dimensions of your footprint. Start from a template or build from scratch."
            />
            <Step
              num="2"
              title="Place and configure wells"
              body="Use the Add Well or Add Grid tools to place wells on the canvas. Fine-tune shape, depth, volume, and position from the properties panel."
            />
            <Step
              num="3"
              title="Export and use"
              body="Download the JSON definition and import it into the Opentrons App. Reference it in your Python protocol with load_labware_from_definition()."
            />
          </div>
        </div>
      </section>

    </div>
  )
}
