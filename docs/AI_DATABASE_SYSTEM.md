# AI-Powered Medicine Database - Technical Documentation

## Overview
This system automatically expands the medicine database using AI verification. When users ask about medicines not in the database, the AI provides information and automatically saves it to the database for future users.

## Architecture

### 1. Authentication Flow
- **Public Access**: Search and browse existing medicines (no login required)
- **Protected Access**: AI features (chatbot, tablet scanner, adding medicines) require authentication
- **Implementation**: `AuthContext.tsx` with localStorage-based auth

### 2. AI Data Collection Flow

#### Step-by-Step Process:
1. **User searches for medicine** → Not found in database
2. **"Ask AI" button appears** → User clicks it
3. **Authentication check** → Login required for AI features
4. **User logs in** → Gains access to chatbot
5. **User asks about medicine** → "What is Paracetamol?"
6. **AI analyzes query** → Determines if it's a specific medicine query
7. **AI generates response** → Returns:
   - Human-readable text response
   - Structured medicine data (JSON format)
8. **Automatic database save** → System automatically:
   - Extracts structured data
   - Validates completeness
   - Saves to `medicineData.json`
   - Marks with `aiVerified: true`
   - Records user ID and timestamp
9. **User notification** → Toast and chat message confirm save
10. **Database expanded** → Medicine now searchable by all users

### 3. Data Structure

#### Medicine Data Format
```typescript
{
  id: "med_ai_1234567890",
  brandName: "Paracetamol 500mg",
  genericName: "Acetaminophen",
  dosage: "500mg every 4-6 hours",
  category: "Painkiller",
  uses: "Relief from pain and fever",
  sideEffects: "Nausea, stomach pain (rare)",
  price: "₹5-20 INR per strip",
  warnings: "Do not exceed 4000mg per day",
  language: ["English"],
  aiVerified: true,          // Indicates AI-added medicine
  addedBy: "user_1234567890", // User who triggered the addition
  addedAt: "2026-02-20T10:30:00.000Z"
}
```

### 4. AI Integration

#### Chatbot Flow (`medicine-query-chatbot.ts`)
- **Model**: Google Gemini 2.5 Flash
- **Input**: User's natural language query
- **Output**: 
  - `response`: Human-readable text
  - `medicineData`: Structured JSON (optional)
  
#### AI Prompt Structure
The AI is instructed to:
1. Identify if query is about a specific medicine
2. Provide concise, accurate information
3. Include structured data in special format:
   ```
   ---MEDICINE_DATA---
   { "brandName": "...", "genericName": "...", ... }
   ---END_DATA---
   ```
4. Double-check accuracy before responding

### 5. API Endpoints

#### POST `/api/medicines`
Adds AI-verified medicine to database
- **Auth**: Required (userId in body)
- **Request**: 
  ```json
  {
    "medicine": { /* medicine data */ },
    "userId": "user_123"
  }
  ```
- **Response**: 
  - 201: Medicine added successfully
  - 409: Medicine already exists
  - 401: Unauthorized
  - 400: Invalid data

#### GET `/api/medicines`
Retrieves all AI-verified medicines
- **Auth**: Not required
- **Response**: List of AI-verified medicines

### 6. Security Measures

#### Authentication Protection
- Prevents misuse by unauthenticated users (e.g., children)
- Only logged-in users can:
  - Access chatbot
  - Scan tablets
  - Trigger AI database additions

#### Data Validation
- Brand name and generic name are required
- Duplicate detection prevents redundant entries
- All AI-added medicines are flagged for review

### 7. User Experience Flow

#### Scenario: User searches "Amoxicillin"
1. Search returns no results → Shows "Ask AI" button
2. User clicks "Ask AI" → Auth dialog appears (if not logged in)
3. User logs in → Chatbot opens
4. User types "What is Amoxicillin?"
5. AI responds: "Amoxicillin is an antibiotic used to treat bacterial infections..."
6. **Automatic Save**: System saves Amoxicillin to database
7. User sees: "✅ I've automatically added Amoxicillin to our medicine database"
8. Next user searches "Amoxicillin" → Found in database!

## Benefits

### For Users
- No manual data entry
- Consistent, AI-verified information
- Expanding database helps entire community
- Transparent process with notifications

### For System
- Automatic database growth
- User attribution for accountability
- Duplicate prevention
- Quality control through AI verification

### For Administrators
- Track AI-added entries via `aiVerified` flag
- Review user contributions via `addedBy` field
- Monitor database growth over time
- Identify popular medicines not in original dataset

## Technical Stack
- **Frontend**: Next.js 14, React, TypeScript
- **AI**: Google Genkit, Gemini 2.5 Flash
- **Auth**: Custom context (localStorage-based)
- **Database**: JSON file (production would use real DB)
- **API**: Next.js API routes

## Future Enhancements
1. Admin review dashboard for AI-added medicines
2. User reputation system based on contributions
3. Medicine rating/feedback system
4. Real database (PostgreSQL, MongoDB)
5. Server-side authentication (NextAuth, Firebase)
6. Medicine verification by medical professionals
7. Multi-language support for medicine names
8. Image recognition for tablet identification

## Development Notes
- Medicine data stored in `public/data/medicineData.json`
- Auth uses localStorage (replace with secure backend in production)
- AI parsing uses structured markers in response
- Fuzzy search helps with speech recognition errors
- All AI interactions require authentication
