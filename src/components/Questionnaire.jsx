/**
 * Questionnaire.jsx
 *
 * Full-screen step-by-step wizard shown before the editor loads.
 * Steps:
 *   0 – Labware type
 *   1 – Footprint (SBS or custom)
 *   2 – Total height
 *   3 – A1 orientation
 */

import { useLabwareStore } from '../store/useLabwareStore'

const SBS = { x: 127.76, y: 85.48 }

const TOTAL_STEPS = 4

// ── Shared primitives ─────────────────────────────────────────────────────────

function StepWrapper({ title, subtitle, children, onBack, onNext, nextLabel = 'Next →', canNext = true }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 w-full max-w-lg shadow-2xl">
      <p className="text-xs text-[#8b949e] uppercase tracking-widest mb-1">
        Custom Labware Designer
      </p>
      <h2 className="text-lg font-semibold text-[#c9d1d9] mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-[#8b949e] mb-6">{subtitle}</p>}

      <div className="space-y-3 mb-8">{children}</div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!onBack}
          className="text-sm text-[#8b949e] hover:text-[#c9d1d9] disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className={
            'px-5 py-2 rounded text-sm font-medium transition-colors ' +
            (canNext
              ? 'bg-[#58a6ff] hover:bg-[#79b8ff] text-white'
              : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed')
          }
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

function RadioCard({ label, description, selected, onClick, icon }) {
  return (
    <div
      onClick={onClick}
      className={
        'flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all ' +
        (selected
          ? 'border-[#58a6ff] bg-[#58a6ff]/10'
          : 'border-[#30363d] bg-[#21262d] hover:border-[#58a6ff]/50')
      }
    >
      <div className="text-xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#c9d1d9]">{label}</div>
        {description && (
          <div className="text-xs text-[#8b949e] mt-0.5">{description}</div>
        )}
      </div>
      <div
        className={
          'w-4 h-4 rounded-full border-2 flex-shrink-0 ' +
          (selected ? 'border-[#58a6ff] bg-[#58a6ff]' : 'border-[#30363d]')
        }
      />
    </div>
  )
}

const inputCls =
  'w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm ' +
  'text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] transition-colors'

// ── Step 0: Labware type ───────────────────────────────────────────────────────

function Step0({ config, set, onNext }) {
  const types = [
    { value: 'wellPlate',     label: 'Well Plate',     icon: '⬛', description: 'Standard microplates — 6, 12, 24, 48, 96, 384 wells' },
    { value: 'reservoir',     label: 'Reservoir',      icon: '🟦', description: 'Single- or multi-channel troughs' },
    { value: 'tubeRack',      label: 'Tube Rack',      icon: '🧪', description: 'Eppendorf tubes, falcon tubes, vials' },
    { value: 'aluminumBlock', label: 'Aluminum Block', icon: '🔲', description: 'Thermal blocks for tubes or plates' },
  ]

  return (
    <StepWrapper
      title="What type of labware?"
      subtitle="Choose the category that best matches your vessel."
      onBack={null}
      onNext={onNext}
    >
      {types.map(t => (
        <RadioCard
          key={t.value}
          icon={t.icon}
          label={t.label}
          description={t.description}
          selected={config.labwareType === t.value}
          onClick={() => set('labwareType', t.value)}
        />
      ))}
    </StepWrapper>
  )
}

// ── Step 1: Footprint ──────────────────────────────────────────────────────────

function Step1({ config, set, onBack, onNext }) {
  const isSBS = config.footprintType === 'sbs'
  const canNext = config.xDimension > 0 && config.yDimension > 0

  function handleFootprintType(type) {
    set('footprintType', type)
    if (type === 'sbs') {
      set('xDimension', SBS.x)
      set('yDimension', SBS.y)
    }
  }

  return (
    <StepWrapper
      title="Footprint dimensions"
      subtitle="ANSI/SLAS SBS standard is 127.76 × 85.48 mm."
      onBack={onBack}
      onNext={onNext}
      canNext={canNext}
    >
      <div className="flex gap-3">
        {[
          { value: 'sbs', label: 'SBS Standard' },
          { value: 'custom', label: 'Custom' },
        ].map(o => (
          <button
            key={o.value}
            onClick={() => handleFootprintType(o.value)}
            className={
              'flex-1 py-2 rounded border text-sm transition-colors ' +
              (config.footprintType === o.value
                ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]'
                : 'border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/50')
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      {isSBS ? (
        <div className="text-sm text-[#8b949e] bg-[#21262d] rounded px-4 py-3">
          <span className="font-mono text-[#c9d1d9]">127.76 × 85.48 mm</span>
          &nbsp;— ANSI/SLAS SBS footprint
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8b949e] block mb-1">X dimension (mm)</label>
            <input
              type="number"
              className={inputCls}
              value={config.xDimension}
              min={1}
              step={0.01}
              onChange={e => set('xDimension', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-xs text-[#8b949e] block mb-1">Y dimension (mm)</label>
            <input
              type="number"
              className={inputCls}
              value={config.yDimension}
              min={1}
              step={0.01}
              onChange={e => set('yDimension', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      )}
    </StepWrapper>
  )
}

// ── Step 2: Total height ───────────────────────────────────────────────────────

const PRESETS = [
  { label: '96-well (14.22 mm)', z: 14.22 },
  { label: '384-well (14.22 mm)', z: 14.22 },
  { label: 'Deep-well (41 mm)', z: 41.0 },
  { label: '1.5 mL tubes (75 mm)', z: 75.0 },
]

function Step2({ config, set, onBack, onNext }) {
  return (
    <StepWrapper
      title="Total height"
      subtitle="Measured from the bottom of the footprint to the tallest point (z-dimension)."
      onBack={onBack}
      onNext={onNext}
      canNext={config.zDimension > 0}
    >
      <div>
        <label className="text-xs text-[#8b949e] block mb-1">Height (mm)</label>
        <input
          type="number"
          className={inputCls}
          value={config.zDimension}
          min={0.1}
          step={0.01}
          onChange={e => set('zDimension', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div>
        <div className="text-xs text-[#8b949e] mb-2">Quick presets</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => set('zDimension', p.z)}
              className={
                'text-xs py-1.5 px-3 rounded border text-left transition-colors ' +
                (config.zDimension === p.z
                  ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]'
                  : 'border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/50')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}

// ── Step 3: A1 orientation ────────────────────────────────────────────────────

function Step3({ config, set, onBack, onComplete }) {
  const corners = [
    {
      value: 'frontLeft',
      label: 'Front-Left (standard)',
      description: 'A1 is closest to the robot arm and pipette. Most common.',
    },
    {
      value: 'frontRight',
      label: 'Front-Right',
      description: 'Mirrored X-axis orientation.',
    },
    {
      value: 'backLeft',
      label: 'Back-Left',
      description: 'A1 is at the far back-left.',
    },
    {
      value: 'backRight',
      label: 'Back-Right',
      description: 'A1 is at the far back-right.',
    },
  ]

  return (
    <StepWrapper
      title="A1 well location"
      subtitle="Where is the A1 well relative to the labware footprint?"
      onBack={onBack}
      onNext={onComplete}
      nextLabel="Start designing →"
    >
      {corners.map(c => (
        <RadioCard
          key={c.value}
          icon={c.value === 'frontLeft' ? '↙' : c.value === 'frontRight' ? '↘' : c.value === 'backLeft' ? '↖' : '↗'}
          label={c.label}
          description={c.description}
          selected={config.a1Corner === c.value}
          onClick={() => set('a1Corner', c.value)}
        />
      ))}
    </StepWrapper>
  )
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={
            'h-1 flex-1 rounded-full transition-colors duration-300 ' +
            (i <= step ? 'bg-[#58a6ff]' : 'bg-[#30363d]')
          }
        />
      ))}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────

export function Questionnaire() {
  const {
    currentStep,
    labwareConfig,
    setConfigField,
    nextStep,
    prevStep,
    completeQuestionnaire,
  } = useLabwareStore()

  const props = {
    config: labwareConfig,
    set: setConfigField,
  }

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col items-center justify-center p-6 z-50">
      <ProgressBar step={currentStep} />

      {currentStep === 0 && (
        <Step0 {...props} onNext={nextStep} />
      )}
      {currentStep === 1 && (
        <Step1 {...props} onBack={prevStep} onNext={nextStep} />
      )}
      {currentStep === 2 && (
        <Step2 {...props} onBack={prevStep} onNext={nextStep} />
      )}
      {currentStep === 3 && (
        <Step3 {...props} onBack={prevStep} onComplete={completeQuestionnaire} />
      )}
    </div>
  )
}
