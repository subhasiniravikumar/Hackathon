# Firebase Studio

A Next.js application powered by Firebase and Google Genkit AI for medicine information and tablet recognition.

## Prerequisites

Before setting up this project, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (Package Manager) - Install globally:
  ```bash
  npm install -g pnpm
  ```
- **Git** - [Download here](https://git-scm.com/downloads)
- **Google AI API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Setup Instructions

Follow these steps in order to set up the project:

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Hackathon
```

Replace `<your-github-repository-url>` with your actual GitHub repository URL.

### 2. Install Dependencies

Install all required packages using pnpm:

```bash
pnpm install
```

This will install all dependencies listed in `package.json`.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# On Windows (PowerShell)
New-Item .env

# On macOS/Linux
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Google AI API Key (Required)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here

# Firebase Configuration (if using Firebase features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Replace all placeholder values with your actual credentials.

### 4. Verify Installation

Check that TypeScript compiles without errors:

```bash
pnpm typecheck
```

## Running the Application

### Development Mode

Start the Next.js development server:

```bash
pnpm dev
```

The application will be available at: **http://localhost:9002**

### Genkit Development Server

For AI features development, run the Genkit dev server:

```bash
pnpm genkit:dev
```

Or with watch mode (auto-reload on changes):

```bash
pnpm genkit:watch
```

### Production Build

To create a production build:

```bash
pnpm build
pnpm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server on port 9002 with Turbopack |
| `pnpm genkit:dev` | Start Genkit development server |
| `pnpm genkit:watch` | Start Genkit with auto-reload on file changes |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint checks |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm export` | Export static site |

## Project Structure

```
├── src/
│   ├── ai/                 # Genkit AI configurations and flows
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── services/           # API services
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## Features

- 💊 Medicine information lookup
- 📸 Tablet/pill recognition using OCR
- 🤖 AI-powered chatbot for medicine queries
- 🗣️ Voice input support
- 🌐 Multi-language support

## Troubleshooting

### Common Issues

**Issue:** `pnpm: command not found`
- **Solution:** Install pnpm globally: `npm install -g pnpm`

**Issue:** Port 9002 already in use
- **Solution:** Change the port in package.json dev script or kill the process using port 9002

**Issue:** Google AI API errors
- **Solution:** Verify your API key is correctly set in `.env` file

**Issue:** Module not found errors
- **Solution:** Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again

## Support

For issues and questions, please open an issue on the GitHub repository.

