# MediQuery - AI-Powered Medicine Information System

A modern web application that helps users find medicine information through multiple intuitive interfaces: text search, voice commands, image recognition, and AI chatbot assistance.

## 🌟 Key Features

### 1. **Smart Medicine Search**
- Real-time fuzzy search across 2335+ medicines
- Autocomplete suggestions with relevance scoring
- Category-based filtering (Painkiller, Antibiotic, Antihistamine, etc.)
- Search by brand name, generic name, or medical uses

### 2. **Advanced Voice Input**
- Multi-language support (English US, English India, Tamil)
- Automatic speech-to-text conversion using Web Speech API
- Smart medicine name correction using fuzzy matching
- Checks 5 alternative interpretations to find best medicine match
- Auto-corrects misheard names (e.g., "Docks are so simple" → "Doxazosin")

### 3. **AI Tablet Scanner**
- Upload or capture tablet/pill images
- Gemini 2.5 Flash AI vision model identifies medicines
- Matches against curated database or generates AI details
- Shows comprehensive medicine information with safety disclaimers

### 4. **Medical AI Chatbot**
- Powered by Gemini 2.5 Flash for accurate medical information
- Answers queries about dosage, side effects, interactions
- Provides structured medicine data
- Always includes professional consultation reminders

### 5. **Age-Verified Authentication**
- 18+ age verification system
- Automatic age extraction from email (e.g., john2000@email.com)
- Auto-fills date of birth for eligible users
- Restricts AI features to authenticated adult users

### 6. **Comprehensive Medicine Database**
- 2335+ medicines with detailed information:
  - Brand and generic names
  - Dosage and category
  - Medical uses
  - Side effects
  - Pricing information
  - Manufacturer details

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Hackathon
```

2. **Install dependencies**
```bash
npm install -g pnpm
pnpm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Gemini API Key (required for AI features)
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

**Get your API key:** [Google AI Studio](https://aistudio.google.com/apikey)

4. **Run the application**

```bash
# Start the Next.js development server
pnpm dev
```

Access the app at: **http://localhost:9002**

## 🎯 Usage Guide

### Search Medicines
1. Type medicine name in the search bar
2. Use autocomplete suggestions for quick selection
3. Click category buttons for filtered results

### Voice Search
1. Click "Voice Search" button
2. Select your preferred language (English/Tamil)
3. Speak the medicine name clearly
4. System auto-corrects misheard names using database

### Scan Tablets
1. Click "Scan Tablet" button (requires login)
2. Upload image or capture with camera
3. Click "Recognize This Image"
4. View identified medicine from database or AI-generated details

### Ask AI Chatbot
1. Click chatbot icon in header (requires login)
2. Type medical questions
3. Get accurate, concise answers with sources
4. Receive structured medicine information when applicable

### Create Account
1. Click "Login" in header
2. Switch to "Sign Up" tab
3. Enter email with birth year (e.g., user2000@email.com)
4. System auto-detects age - must be 18+
5. Complete registration

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.2, React 18, TypeScript
- **UI Components:** Radix UI, Tailwind CSS, shadcn/ui
- **AI/ML:** Google Gemini 2.5 Flash, Genkit 1.6
- **Voice:** Web Speech API (Browser-native)
- **Image Recognition:** Gemini Vision API
- **State Management:** React Hooks, Context API
- **Data Storage:** JSON database, LocalStorage

## 📁 Project Structure

```
Hackathon/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       └── genkit/           # Genkit API routes
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   └── AuthDialog.tsx    # Login/Signup with age verification
│   │   ├── chatbot/              # AI chatbot interface
│   │   ├── medicine/             # Medicine display components
│   │   ├── tablet-scanner/       # Image recognition dialog
│   │   ├── voice/                # Voice input with auto-correction
│   │   └── ui/                   # Reusable UI components
│   ├── ai/
│   │   ├── genkit.ts             # Genkit configuration
│   │   └── flows/
│   │       ├── medicine-query-chatbot.ts    # Chatbot AI flow
│   │       ├── recognize-tablet-flow.ts     # Tablet recognition
│   │       └── medicine-details-flow.ts     # Medicine details fetch
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── lib/
│   │   ├── fuzzy-search.ts       # Medicine name matching algorithms
│   │   └── utils.ts              # Utility functions
│   └── types/
│       └── medicine.ts           # TypeScript interfaces
├── public/
│   └── data/
│       └── medicineData.json     # 2335+ medicines database
└── docs/                         # Documentation files
```

## 🔧 Configuration

### Voice Recognition Languages
- English (US): `en-US`
- English (India): `en-IN`
- Tamil (India): `ta-IN`

Language preference is saved in browser localStorage.

### Fuzzy Matching Threshold
Medicine name matching uses 60% similarity threshold for auto-correction.
Configured in: `src/components/voice/VoiceInput.tsx`

### AI Model Configuration
- **Tablet Recognition:** `gemini-2.5-flash`
- **Chatbot:** `gemini-2.5-flash`
- **Medicine Details:** `gemini-2.5-flash`

Models configured in individual flow files under `src/ai/flows/`

## 🔐 Security & Privacy

- **Age Verification:** Enforced at signup (18+ only)
- **Authentication:** Local storage-based (not production-ready)
- **API Keys:** Environment variables (never committed)
- **Medical Disclaimers:** Shown on all AI-generated content
- **Data Privacy:** No user data sent to external servers except AI APIs

## ⚠️ Important Notes

1. **Medical Disclaimer:** This app provides information only. Always consult healthcare professionals for medical advice.

2. **Voice Recognition:** Works best in Chrome, Edge, and Safari. Requires microphone permissions.

3. **AI Accuracy:** Tablet recognition and chatbot responses are AI-generated and may contain errors.

4. **Production Deployment:** Current authentication is localStorage-based. Use proper backend for production.

5. **API Limits:** Free Gemini API has rate limits. Monitor usage in [Google AI Studio](https://aistudio.google.com/).

## 🐛 Troubleshooting

### Voice input not working
- Ensure browser supports Web Speech API (Chrome/Edge/Safari)
- Grant microphone permissions when prompted
- Check browser console for errors

### AI features returning errors
- Verify `NEXT_PUBLIC_GOOGLE_GENAI_API_KEY` is set in `.env`
- Check API key is valid at [Google AI Studio](https://aistudio.google.com/)
- Ensure you haven't exceeded API rate limits
- Restart dev server after changing `.env`

### Tablet scanner not recognizing medicines
- Use clear, well-lit images
- Ensure pill/tablet is centered in frame
- Try different angles if recognition fails
- Check image file is supported (jpg, png, webp)

### Search not finding medicines
- Use simple terms (brand or generic name)
- Try partial matches (e.g., "para" for paracetamol)
- Use category filters for broader results
- Check spelling - fuzzy matching has 60% tolerance

## 📝 License

This project is for educational and informational purposes only.

## 🤝 Contributing

Issues and feature requests are welcome. Always include medical disclaimers when adding health-related features.

---

**Built with ❤️ for better access to medicine information**

**Error: 'tsx' is not recognized**
```bash
pnpm install tsx -D
```
Then run `pnpm genkit:watch` again.

**Error: "Method doesn't allow unregistered callers" (Gemini API)**

Ensure `NEXT_PUBLIC_GOOGLE_GENAI_API_KEY` is in your `.env` file, then restart the dev server:
```bash
# Stop the server (Ctrl+C), then:
pnpm dev
```

