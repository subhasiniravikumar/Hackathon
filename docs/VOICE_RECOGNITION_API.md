# Voice Recognition API Implementation

## Overview
The application now uses **Google Cloud Speech-to-Text API** instead of the browser's built-in Web Speech API for more accurate voice recognition.

## Architecture

### 1. Frontend (MediaRecorder API)
- Records audio using `MediaRecorder` API in `audio/webm;codecs=opus` format
- Captures audio chunks while user is speaking
- Sends audio data to backend API when recording stops

### 2. Backend API (`/api/speech-to-text`)
- Located at: `src/app/api/speech-to-text/route.ts`
- Accepts: FormData with audio blob and language code
- Returns: `{ transcript: string, confidence: number }`

### 3. Speech-to-Text Processing
Primary: Google Cloud Speech-to-Text API
- Converts audio blob to base64
- Sends to Google Cloud Speech API
- Returns transcription with confidence score

Fallback: Google Gemini API
- If Speech-to-Text fails, uses Gemini for transcription
- Less accurate but more resilient

## Implementation Details

### Components Updated

#### `VoiceInput.tsx`
```typescript
// Old: Browser Web Speech API
const recognition = new SpeechRecognition();
recognition.start();

// New: MediaRecorder + API
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.start();
// On stop: send audio to /api/speech-to-text
```

#### `ChatbotInterface.tsx`
- Same MediaRecorder implementation
- Records audio for chatbot voice input
- Sends to same `/api/speech-to-text` endpoint

### API Configuration

**Required Environment Variable:**
```
GOOGLE_GENAI_API_KEY=your_google_api_key
```
or
```
NEXT_PUBLIC_GOOGLE_GENAI_API_KEY=your_google_api_key
```

### Audio Format
- **Encoding**: WEBM_OPUS
- **Sample Rate**: 48000 Hz
- **MIME Type**: `audio/webm;codecs=opus`

## Benefits Over Web Speech API

1. **Higher Accuracy**: Google Cloud Speech-to-Text is more accurate than browser APIs
2. **Consistent Results**: Same API across all browsers (Chrome, Firefox, Safari)
3. **Better Language Support**: More languages and dialects
4. **No Punctuation Issues**: API doesn't add periods automatically
5. **Server-Side Processing**: Can log, monitor, and improve transcription quality

## User Flow

1. User clicks "Speak Query" button
2. Browser requests microphone permission (first time only)
3. MediaRecorder starts capturing audio
4. Red "Stop Recording" button appears
5. User clicks stop or automatically stops after silence
6. "Processing..." indicator shows
7. Audio sent to `/api/speech-to-text`
8. API returns transcription
9. Search field populated with transcript
10. Toast shows confidence level

## Error Handling

- **Microphone access denied**: Shows error toast with instructions
- **No speech detected**: Returns empty transcript with confidence 0
- **API failure**: Falls back to Gemini API
- **Network error**: Shows user-friendly error message

## Testing

Test with different scenarios:
1. Medicine names: "Paracetamol", "Ibuprofen"
2. Complex queries: "What are the side effects of Aspirin"
3. Noisy environment: Background noise handling
4. Different languages: Tamil, Hindi voice input
5. Short vs long audio clips

## Limitations

- Requires internet connection (server-side processing)
- Uses API quota (Google Cloud Speech-to-Text)
- Slight delay compared to browser API (network latency)
- Audio data sent to Google servers (privacy consideration)

## Future Improvements

1. Add support for more audio formats (MP3, WAV)
2. Implement real-time streaming transcription
3. Add custom vocabulary for medical terms
4. Cache common medicine names for faster recognition
5. Implement offline fallback using IndexedDB
