# IdeaBridge 🌌
> **Bridging early-stage ideas to structured, venture-ready startup blueprints.**

IdeaBridge is a cinematic, highly interactive web experience designed to guide early-stage founders from a raw business idea to a structured, venture-ready plan. Featuring a responsive, immersive 3D orb controller, a structured idea input wizard, and a comprehensive analysis workspace, the platform equips founders with AI insights, mentor matches, and incubator timelines.

---

## 🌟 Key Features

### 1. Immersive Cinematic Landing Page
*   **Interactive 3D Orb**: A custom Three.js shader-based orb that morphs, rotates, and reacts dynamically to user scrolling and cursor proximity.
*   **Immersive Storytelling**: Interactive sections mapping out the transition from raw concepts to market-ready businesses.

### 2. Multi-Step Founder Intake Flow
*   **Structured Discovery**: Step-by-step intake wizard covering:
    *   **Core Concept**: Raw idea description.
    *   **Target Audience**: Intended demographics and market segments.
    *   **Industry Category**: Domain classification (SaaS, FinTech, EdTech, etc.).
    *   **Financial Scope**: Seed budgets, fundraising target scopes, and timeline constraints.

### 3. AI analysis Workspace
*   **Market Position Insights**: Instant analysis of the target market.
*   **Competitor Landscape**: Strategic analysis of direct and indirect competitors.
*   **SWOT & Risk Assessment**: Identification of key strengths, weaknesses, opportunities, and risks.
*   **Tech Stack Suggestions**: Curated suggestions for databases, frontend frameworks, and cloud hosting.

### 4. Ecosystem Matching & Milestones
*   **Readiness Index**: Interactive gauges scoring startup feasibility.
*   **Incubator & Accelerator Match**: Automatic mapping to top programs.
*   **Interactive Roadmap**: A visual milestones timeline showing critical steps from MVP build to initial fundraising.

---

## 🛠️ Technical Architecture & Stack

IdeaBridge is built using a modern, performant, and type-safe frontend stack:

| Technology | Purpose | Key Usage |
| :--- | :--- | :--- |
| **React 18** | UI Framework | Component-based interactive layout |
| **TypeScript** | Type Safety | Strong typing across states, parameters, and Three.js hooks |
| **Vite 8** | Build Tool | Instant hot module replacement (HMR) and optimized assets |
| **Three.js / React Three Fiber** | 3D Graphics | Custom shader-based interactive 3D orb |
| **Framer Motion** | Animation Library | Micro-interactions, scroll-driven reveals, and step transitions |
| **Zustand** | State Management | Centralized, ultra-fast global state for intake steps and scroll positions |
| **React Router v7** | Routing | Seamless switching between landing page, flow, and results |
| **Tailwind CSS** | Styling | Responsive layouts, grid systems, and glassmorphic UI components |

---

## 📂 Project Directory Structure

```text
SocialiteInternship/
├── src/
│   ├── components/            # Reusable UI & 3D WebGL components
│   │   ├── InteractiveOrb.tsx     # Shader-based 3D particle orb using Three.js / R3F
│   │   ├── OrbController.tsx     # Controls scroll/mouse interactions for the 3D scene
│   │   ├── BridgeSection.tsx     # Section styling for the landing page narrative
│   │   ├── RoadmapTimeline.tsx   # Interactive milestones roadmap
│   │   ├── StartupStats.tsx      # Diagnostic scores and progress gauges
│   │   ├── ContentLayer.tsx      # Page scrolling layouts
│   │   └── ProjectionLayer.tsx   # HTML overlay elements on WebGL canvas
│   │
│   ├── pages/                 # Full screen page views
│   │   ├── LandingPage.tsx       # Immersive entrance page
│   │   ├── IdeaInputFlow.tsx     # Step-by-step startup wizard
│   │   ├── AnalysisScreen.tsx    # Detailed diagnostic charts and AI data
│   │   └── ResultsWorkspace.tsx  # Hub for mentors, funding, and next steps
│   │
│   ├── stores/                # Zustand global state management
│   │   └── useJourneyStore.ts    # Manages user-entered ideas, results, and step progress
│   │
│   ├── styles/                # CSS styling
│   │   ├── index.css             # Base Tailwind imports and global variables
│   │   └── landing.css           # Cinematic gradient animations and custom glassmorphism
│   │
│   ├── utils/                 # General helpers
│   │   └── timelineData.ts       # Mock datasets for mentors, funding, and roadmaps
│   │
│   ├── App.tsx                # React Router v7 routes configuration
│   └── main.tsx               # Client entry point
│
├── public/                    # Static assets
└── dist/                      # Production build output
```

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: `v18.x` or higher
*   **npm**: `v9.x` or higher

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/HusainMain/ideabridge.git
   cd ideabridge
   ```

2. Install the package dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

4. Build the application for production:
   ```bash
   npm run build
   ```
   The compiled, optimized output will be available in the `dist/` directory.

---

## 🌐 Production Deployment

IdeaBridge is optimized for hosting on **Vercel** via GitHub integration:

1. Push the repository to your GitHub account.
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New** > **Project** and import the `ideabridge` repository.
4. Vercel will automatically detect **Vite** as the framework:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
5. Click **Deploy**. Vercel will build and host the production site on a secure HTTPS domain.

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
