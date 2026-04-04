import { useNavigate } from 'react-router-dom'

// ── Abstract well-plate SVG ────────────────────────────────────────────────────

function WellPlateSVG() {
  const rows = 8
  const cols = 12
  const r    = 9
  const padX = 28
  const padY = 28
  const gap  = 26
  const W    = padX * 2 + (cols - 1) * gap + r * 2
  const H    = padY * 2 + (rows - 1) * gap + r * 2

  const wells = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      wells.push({ cx: padX + r + col * gap, cy: padY + r + row * gap, row, col })
    }
  }

  // Diagonal fade: wells closer to top-left are more opaque
  function opacity(row, col) {
    const norm = (row + col) / (rows + cols - 2)
    return 0.08 + (1 - norm) * 0.55
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      {/* Plate outline */}
      <rect
        x="1" y="1" width={W - 2} height={H - 2}
        rx="10" ry="10"
        fill="none" stroke="#111" strokeWidth="1.5" opacity="0.12"
      />
      {/* Wells */}
      {wells.map(({ cx, cy, row, col }) => (
        <circle
          key={`${row}-${col}`}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#111"
          strokeWidth="1.2"
          opacity={opacity(row, col)}
        />
      ))}
      {/* Highlight cluster — top-left wells filled */}
      {wells.filter(w => w.row < 3 && w.col < 4).map(({ cx, cy, row, col }) => (
        <circle
          key={`fill-${row}-${col}`}
          cx={cx} cy={cy} r={r - 2}
          fill="#111"
          opacity={0.06 + (1 - (row + col) / 8) * 0.10}
        />
      ))}
    </svg>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function Feature({ icon, title, body }) {
  return (
    <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white text-base flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

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

        <div className="relative w-full max-w-6xl mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-12 py-20">

          {/* Left: copy */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Opentrons Labware Schema v2
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
              Design custom<br />
              <span className="text-gray-400">labware visually.</span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed max-w-md mb-10">
              A browser-based editor for creating Opentrons-compatible labware definitions.
              Place wells, tune dimensions, and export a ready-to-use JSON in minutes — no coding required.
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
              <button
                onClick={() => navigate('/support/how-to-use')}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                How it works
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M7 2l5 5-5 5" />
                </svg>
              </button>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-gray-100">
              {[['4', 'Labware types'], ['v2', 'Opentrons schema'], ['JSON + PNG', 'Export formats']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-xl font-bold text-gray-900">{val}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: abstract well plate */}
          <div className="flex-shrink-0 w-full max-w-[380px] lg:max-w-[440px] relative">
            <div className="relative rounded-3xl border border-gray-200 bg-white shadow-xl p-6 overflow-hidden">
              {/* Plate label */}
              <div className="absolute top-4 left-5 text-[9px] font-bold tracking-widest uppercase text-gray-300">
                96-Well · SBS Standard
              </div>
              <div className="mt-6">
                <WellPlateSVG />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-gray-900 text-white rounded-2xl px-4 py-2.5 shadow-lg text-[11px] font-medium leading-tight">
              <div className="text-gray-400 text-[9px] uppercase tracking-widest mb-0.5">Export as</div>
              Opentrons JSON
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything you need</h2>
          <p className="text-sm text-gray-500 mb-10">Designed for researchers who need precise control over custom labware.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Feature
              icon="⊕"
              title="Visual placement"
              body="Click to place individual wells or drag to fill a grid. Circular and rectangular well shapes supported."
            />
            <Feature
              icon="⇤"
              title="Precise alignment"
              body="Align selections to plate edges, center horizontally or vertically, and distribute wells with custom gaps."
            />
            <Feature
              icon="↩"
              title="Undo / Redo"
              body="Full history stack so you can explore layouts freely and roll back any mistake instantly."
            />
            <Feature
              icon="↓"
              title="Export ready"
              body="Download Opentrons Labware Schema v2 JSON or a PNG snapshot of your design with one click."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-8 lg:px-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-sm text-gray-500 max-w-xs">From blank canvas to robot-ready labware in three steps.</p>
          </div>
          <div className="flex-1 flex flex-col gap-7">
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

      {/* ── Bottom CTA ── */}
      <section className="bg-gray-900 py-16 px-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to build your labware?</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
          No account needed. Open the editor and start designing in seconds.
        </p>
        <button
          onClick={() => navigate('/design')}
          className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 shadow-lg"
        >
          Open the Designer
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </section>

    </div>
  )
}
