export function PageFooter() {
  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Emre Gürsoy. Released under the{' '}
          <a
            href="https://github.com/EmreGuersoy/OT_anyware/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            MIT License
          </a>
          . Not affiliated with Opentrons Labworks Inc.
        </p>
        <a
          href="https://github.com/EmreGuersoy/OT_anyware"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors whitespace-nowrap"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  )
}
