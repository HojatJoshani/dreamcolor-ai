# DreamColor AI 🎨✨

DreamColor AI is a magical, AI-powered coloring book generator designed to turn children's imaginations into beautiful, printable realities. By utilizing advanced generative models, DreamColor AI designs custom adventure scenes tailored specifically to a child's name and any custom adventure theme they can dream up!

## 🚀 Live Demo & Shared Links
- **Development App:** [DreamColor AI Dev Preview](https://ais-dev-moi2fitr43wdnyvf2ip73o-167919592175.us-east1.run.app)
- **Shared Workspace:** [DreamColor AI Share](https://ais-pre-moi2fitr43wdnyvf2ip73o-167919592175.us-east1.run.app)

---

## ✨ Features

- **Personalized Adventures**: Custom themes curated specifically for your child (e.g. *Leo's Deep Sea Dinosaurs*).
- **Gemini AI Page Generation**: Powered by Google Gemini to construct precise, high-quality, print-ready line drawings and scene concepts.
- **Interactive Page Editor**: Tweak descriptions or swap styles directly within a built-in Modal Editor.
- **Custom Chat Widget Assistant**: A helpful sidebar chat widget to guide users in crafting the perfect coloring book ideas.
- **Printable PDF Compiler**: Generates high-quality PDF booklets featuring a custom title page and neatly paginated coloring pages using `jspdf`.
- **Aesthetic Modern UI**: A responsive, colorful, modern user interface featuring polished typography and delightful micro-interactions.

---

## 🛠️ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Generative AI Services**: [@google/genai SDK](https://github.com/google/generative-ai-js)
- **Document Compiling**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
- A **Google Gemini API Key**

### 1. Installation
Clone this repository and install all of its dependencies:

```bash
git clone https://github.com/hojatjoshani/dreamcolor-ai.git
cd dreamcolor-ai
npm install
```

### 2. Environment Variables Configuration
Create a `.env` or `.env.local` file in the root directory and specify your Google Gemini API Key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Development Server
Launch the application locally on `http://localhost:3000`:

```bash
npm run dev
```

### 4. Build for Production
To compile and optimize your static site for production deployment, run:

```bash
npm run build
```

The build assets will be written to the `/dist` directory, ready to be served from any static provider.

---

## 📂 Project Structure

```text
/
├── components/
│   ├── ChatWidget.tsx      # Guide chat widget assistant
│   └── EditorModal.tsx     # Custom image canvas & prompts editor
├── services/
│   ├── gemini.ts           # Gemini scene & image generator SDK integration
│   └── pdfGenerator.ts     # jsPDF custom formatting and download compiler
├── App.tsx                 # Main application dashboard
├── index.html              # Primary HTML mount
├── index.tsx               # Client entry-point module
├── package.json            # Scripts & dependencies
├── types.ts                # TypeScript global schemas & state enums
└── tsconfig.json           # TS compiling configurations
```

---

## 📄 License
This project is open-source under the MIT License. Feel free to use, modify, and distribute as you wish. Enjoy coloring! 🖍️
