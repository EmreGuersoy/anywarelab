# Anywarelab

**Anywarelab** is a browser-based CAD tool specifically designed for the Opentrons ecosystem. It simplifies the creation of custom labware definitions, allowing researchers to move beyond standard plates and tubes.

The tool excels at generating definitions for **irregular grids** automatically, ensuring that even the most unique labware can be seamlessly integrated into the Opentrons Protocol Designer.

-----

## ✨ Main Features

  * **Custom Geometry:** Design labware with various sizes, shapes, and well configurations.
  * **Irregular Grid Engine:** Automatically calculate offsets and spacing for non-standard layouts.
  * **Visualizer:** Upload and render custom labware files to verify dimensions before running a protocol.
  * **Protocol Ready:** Export definitions that are fully compatible with the Opentrons ecosystem.

## ⚠️ Important Notes

* **Compatibility**: The current version is optimized and tested for OT-2 only.
* **Safety Disclaimer**: Always perform a dry run or calibration check with your custom labware before executing a protocol with expensive reagents or samples.

-----

## 🚀 Getting Started

While we recommend using our official web domain (coming soon), you can easily run Anywarelab locally for full control and privacy.

### Prerequisites

  * **Node.js:** 18.0 or higher
  * **npm:** 9.0 or higher

### Installation & Local Development

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/<your-username>/ot2-labware-designer.git
    cd ot2-labware-designer
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Launch the development server:**

    ```bash
    npm run dev
    ```

4.  **Access the tool:**
    Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173) in your preferred web browser.

-----

## 📦 Production Build

To bundle the application for production use:

```bash
# Generate the production build
npm run build

# Preview the production build locally
npm run preview
```

-----

## 🛡️ Privacy & Data

Anywarelab is hosted as a static site via Vercel. We do not use a database, and we do not store personal data, labware designs, or geometry files.
