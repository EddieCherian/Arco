import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });

    const prompt = `You are Arco AI, a professional music assistant built into a digital audio workstation called Arco.

Current piece context:
- Key: ${context.key}
- Tempo: ${context.tempo} BPM
- Time Signature: ${context.timeSignature}
- Instrument: ${context.instrument}
- Note Count: ${context.noteCount}
- Duration: ${context.duration} seconds

User request: ${message}

Respond as a knowledgeable music theory expert. Give specific, actionable advice — chord progressions with actual chord names, specific melody suggestions, arrangement ideas, or technical help. Keep responses concise and practical. Do not use markdown formatting, just plain text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}
