import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const language = formData.get('language') as string || 'en-US';

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio provided' },
        { status: 400 }
      );
    }

    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Use Gemini 2.0 Flash for audio transcription
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Transcribe this audio to text. The audio is in ${language} language. Return ONLY the transcribed text without any additional explanation, formatting, or punctuation at the end. If it's a medicine name or medical term, spell it correctly.`
              },
              {
                inline_data: {
                  mime_type: "audio/webm",
                  data: base64Audio
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Speech recognition failed', details: errorData },
        { status: 500 }
      );
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json({
        transcript: '',
        confidence: 0,
        error: 'No speech detected',
      });
    }

    const transcript = data.candidates[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    if (!transcript) {
      return NextResponse.json({
        transcript: '',
        confidence: 0,
        error: 'No speech detected',
      });
    }

    return NextResponse.json({
      transcript: transcript,
      confidence: 0.9,
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
