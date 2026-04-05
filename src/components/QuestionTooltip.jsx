/**
 * QuestionTooltip.jsx
 * A portal-based ? tooltip that renders into document.body with position:fixed
 * so it is never clipped by overflow containers (scroll panels, etc.).
 */

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export function QuestionTooltip({ text }) {
  const ref        = useRef(null)
  const [rect, setRect] = useState(null)

  return (
    <div className="flex-shrink-0">
      <div
        ref={ref}
        className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white flex items-center justify-center cursor-default select-none"
        onMouseEnter={() => ref.current && setRect(ref.current.getBoundingClientRect())}
        onMouseLeave={() => setRect(null)}
      >
        <span className="text-[8px] text-gray-400 font-bold leading-none">?</span>
      </div>

      {rect && createPortal(
        <TooltipBubble text={text} anchorRect={rect} />,
        document.body
      )}
    </div>
  )
}

function TooltipBubble({ text, anchorRect }) {
  const GAP    = 10   // px gap between tooltip right edge and ? left edge
  const right  = window.innerWidth - anchorRect.left + GAP
  const centerY = anchorRect.top + anchorRect.height / 2
  // Clamp so the tooltip stays within the viewport vertically
  const top    = Math.max(8, Math.min(centerY, window.innerHeight - 80))

  return (
    <div
      style={{ position: 'fixed', right, top, transform: 'translateY(-50%)', zIndex: 9999, maxWidth: 220, pointerEvents: 'none' }}
      className="w-max bg-gray-900 text-white text-[10px] leading-relaxed rounded px-2.5 py-2 shadow-xl"
    >
      {text}
      {/* Arrow pointing right toward the ? */}
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
    </div>
  )
}
