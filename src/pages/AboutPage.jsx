import { PageFooter } from '../components/PageFooter'

// ── Plate image placeholder ────────────────────────────────────────────────

function PlatePlaceholder({ label, cols = 12, rows = 8 }) {
  const dotCols = Math.min(cols, 12)
  const dotRows = Math.min(rows, 8)
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden aspect-[4/3] flex flex-col items-center justify-center gap-3 p-5">
      <div
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${dotCols}, 1fr)` }}
      >
        {Array.from({ length: dotRows * dotCols }).map((_, i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-full border border-gray-300 bg-white"
          />
        ))}
      </div>
      <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase mt-1">
        {label}
      </span>
    </div>
  )
}

// ── About page ─────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-white">

      {/* ── Hero ── */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">About Anywarelab</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
            Built out of frustration<br />
            <span className="text-gray-400">with manual JSON editing.</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
            Anywarelab started as a personal tool to solve a real bottleneck in our lab —
            spending hours hand-coding custom labware definitions with irregular grids. These definitions could be wrong in
            ways that only fail at runtime, on the robot, mid-experiment.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-14 space-y-20">

        {/* ── Origin story ── */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">The Problem</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Irregular custom labware shouldn't require a programming session.</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              The Opentrons ecosystem is powerful, but creating custom labware has always been limited to regular grids.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              However, irregular labware formats can be useful, especially with the rise of custom 3D-printed labwares. For example, irregular tube rack can be used to aliquot reagent from 1.5 mL tube into pcr tubes within the same deck position.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/aliquot_plate.svg"
              alt="Aliquot plate layout"
              className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm"
            />
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Solution ── */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <img
              src="/aliquot_plate_editor.png"
              alt="Aliquot plate in the Anywarelab editor"
              className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-sm"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">The Solution</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">A canvas that speaks the robot's language.</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Anywarelab gives you a visual canvas where you place wells by clicking,
              drag them into position, and tune every dimension from a properties panel —
              all while seeing the result in real time.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              When you're done, the tool generates a validated Opentrons Schema v2 JSON
              file that you can import directly into your robot workflow. No guesswork,
              no schema lookups, no runtime surprises.
            </p>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Affiliation ── */}
        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Affiliation</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Independent. Community-built. Free.</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Anywarelab has no affiliation with Opentrons Labworks — the company, its products, or its official software. Opentrons is a trademark of Opentrons Labworks Inc.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              This tool was developed out of a personal need encountered in day-to-day lab work and shared openly with the community. It is free to use, open-source, and community maintained.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">Important</div>
              <p className="text-sm text-amber-900 font-medium leading-relaxed mb-3">
                Read the official Opentrons custom labware guidelines before using your design on a robot.
              </p>
              <p className="text-xs text-amber-700 leading-relaxed mb-4">
                Incorrect definitions can cause pipette crashes, missed wells, or damaged equipment. Always verify your dimensions against the physical labware before running a protocol.
              </p>
              <a
                href="https://support.opentrons.com/s/article/Creating-Custom-Labware-Definitions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors"
              >
                Opentrons custom labware documentation
                <svg className="w-3 h-3" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 1h6v6M9 1L1 9"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Who it's for ── */}
        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Who it's for</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anyone who uses an Opentrons robot.</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Whether you're a researcher setting up a new assay, a lab engineer
              maintaining a fleet of robots, or a student learning liquid-handling
              automation — if you've ever needed labware that isn't in the standard
              library, Anywarelab is for you.
            </p>
          </div>
          <div className="space-y-3">
            {[
              ['Researchers', 'Quickly prototype custom plates for novel assay formats without leaving the browser.'],
              ['Lab engineers', 'Standardise and document non-standard labware across instruments and sites.'],
              ['Students & educators', 'Learn Opentrons labware geometry interactively with instant visual feedback.'],
            ].map(([role, desc]) => (
              <div key={role} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 mb-0.5">{role}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <PageFooter />

    </div>
  )
}
