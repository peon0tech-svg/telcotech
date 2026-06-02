# Telco Tech Namibia - Project Context & Architecture

This document serves as the AI memory and reference guide for expanding or modifying the Telco Tech Namibia documentation website.

## 1. Technology Stack
- **Framework**: Astro (Static Site Generation)
- **UI Integration**: React (configured via `@astrojs/react`)
- **Styling**: Tailwind CSS v4 (using `@import "tailwindcss";` in `src/styles/global.css`)
- **Node Version**: Node.js 24 (Required by modern Astro)
- **Package Manager**: npm

## 2. Design System & Aesthetics
- **Theme**: Terminal-inspired, high-tech, and technologically advanced.
- **Layout**: Bento-grid system for the homepage (`src/pages/index.astro`).
- **Colors**: Monochromatic dark backgrounds with neon green (`#0f0`) and cyan (`#0ff`) accents.
- **Typography**: `Fira Code`, `Courier New`, and monospaced fonts.
- **UI Elements**: Elements have a `.terminal-box` class applying borders and glowing box-shadow effects (`var(--glow)`).
- **Background**: A vector-style telecommunications network topology graphic (`public/tech-bg.png`) used as a fixed, low-opacity background.

## 3. Data Architecture & Pipeline
The website dynamically renders data extracted from official CRAN (Communications Regulatory Authority of Namibia) markdown gazettes and regulations. 

**Data Flow:**
1. **Raw Markdown**: Stored externally (originally in `/opt/cran_clean_mds/docs`).
2. **Parsing Script**: A custom Node.js parser (`/opt/parse_docs.js` and `/opt/split_data.js`) scans the markdown, extracts specific tables using regex, and categorizes them.
3. **Structured JSON**: The parsed data is saved directly into the Astro project at `src/data/*.json`. 
   - Files include: `telecomLicenses.json`, `broadcastingLicenses.json`, `spectrumLicenses.json`, `tariffs.json`, `numbers.json`, `typeApprovedEquipment.json`.
4. **Rendering**: 
   - The homepage (`src/pages/index.astro`) counts the array lengths of these JSON files to show summary statistics in a Bento-grid.
   - Individual Astro pages (e.g., `src/pages/telecom.astro`) import the JSON data and pass it to `src/components/DataTable.astro` which generically renders the varied table structures.

## 4. Deployment Workflow
- **Hosting**: Hostinger (`telcotech.peon.tech`).
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`).
- **Trigger**: Pushes to the `main` branch trigger the workflow.
- **Process**:
  1. Checks out the repository.
  2. Sets up Node.js v24.
  3. Runs `npm ci` and `npm run build`. Astro outputs the compiled static site to the `./dist/` directory.
  4. Deploys the `./dist/` directory via `rsync` over SSH to the Hostinger server using GitHub Secrets (`SSH_KEY`, `SSH_HOST`, `SSH_USER`, `DEPLOY_PATH`).

## 5. How to Expand This Website
When instructing an AI to expand this site, provide this file as context and specify:
1. **Adding Pages**: Create a new `.astro` file in `src/pages/`. If it requires new data, add the JSON to `src/data/` and update the generator scripts if necessary.
2. **Modifying Styling**: Edit `src/styles/global.css` or use Tailwind utility classes directly in the components. Stick to the neon/terminal aesthetic.
3. **Adding Interactivity**: Create standard `.jsx` React components in `src/components/` and import them into the `.astro` pages using client directives (e.g., `<MyComponent client:load />`).
