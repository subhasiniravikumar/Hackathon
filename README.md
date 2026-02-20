# Firebase Studio

## Setup

### 1. Clone Repository

```bash
git clone <your-github-repository-url>
cd Hackathon
```

### 2. Install Dependencies

```bash
npm install -g pnpm
pnpm install
```

### 3. Configure Environment

Create `.env` file:

```env
GOOGLE_GENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run

```bash
pnpm dev
```

Access at `http://localhost:9002`

