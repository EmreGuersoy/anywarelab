# Opentrons custom layout designer

A browser-based CAD tool for designing custom labware definitions for the Opentrons OT-2 liquid handling robot.
It creates custom labware with irregular grid automatically. The layout can then easily be used in Opentrons protocol designer. 

### Important notes.
- The current version is being tested for OT-2 only!
- A hosted web application is in process but currenlty we only support to run on your local machine


## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
git clone https://github.com/<your-username>/ot2-labware-designer.git
cd ot2-labware-designer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

