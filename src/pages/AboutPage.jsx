export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">About</h1>
  

        <div className="space-y-6">

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">What is this tool?</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Anywarelab is a dedicated web-based editor for the Opentrons community. 
              It allows for the intuitive design of custom well plates, reservoirs, 
              and racks through a visual modeling interface. Whether your layout is a standard grid or a specialized irregular configuration, 
              AnywareLab generates validated Opentrons Schema v2 JSON files instantly, 
              removing the need for manual coding and reducing the risk of dimensional errors.
            </p>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Who should you use this tool?</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Anywarelab is an assisstant tool for scientists, researchers, and lab technicians who use Opentrons liquid handling robots. It is ideal for those
              who want to create custom labware that is not available in the standard Opentrons library, or who need to design complex layouts that are difficult to code manually.
              By providing a visual interface and real-time feedback, Anywarelab makes it easier to design, validate, and export custom labware definitions, 
              ultimately saving time and reducing errors in the lab.
            </p>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Supported labware types</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                ['Well Plate',  'Multi-well plates for cell culture, PCR, and assay workflows.'],
                ['Reservoir',   'Single- or multi-column troughs for reagent distribution.'],
                ['Tube Rack',   'Racks holding conical or microcentrifuge tubes.'],
                ['Tip Rack',    'Tip boxes for single-channel and multi-channel pipettes.'],
              ].map(([name, desc]) => (
                <li key={name} className="flex gap-2">
                  <span className="font-semibold text-gray-800 w-24 flex-shrink-0">{name}</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Export format</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Designs are exported as <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">Opentrons Labware Schema v2</span> JSON files.
              These can be imported directly into the Opentrons App or used in Python protocol files via
              <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded ml-1">protocol.load_labware_from_definition()</span>.
            </p>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Version</h2>
            <p className="text-sm text-gray-600">
              Schema version: <span className="font-semibold text-gray-900">v2</span>
              <br />
              Compatible with: <span className="font-semibold text-gray-900">OT-2 · Flex</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
