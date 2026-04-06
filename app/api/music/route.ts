import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { notes } = await req.json();

    const prompt = `
You are a music theory AI.

Melody (note + duration):
${JSON.stringify(notes)}

Tasks:
1. Detect the key
2. Generate a simple, musical chord progression (4–8 chords)
3. Generate a bassline that matches the chords

Rules:
- Keep it tonal and clean (no jazz or random dissonance)
- Bass should mostly follow chord roots
- Keep it beginner-friendly
- Match the LENGTH of the bass array roughly to the melody

CRITICAL:
Return ONLY valid JSON.
No explanation.
No markdown.
No extra text.

Format:
{
  "key": "C Major",
  "chords": ["C", "G", "Am", "F"],
  "bass": ["C2", "G2", "A2", "F2"]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4, // 🔥 lower = less random
          },
        }),
      }
    );

    const data = await response.json();

    // 🔥 Extract Gemini text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini empty response:', data);
      return NextResponse.json({ error: 'Empty AI response', raw: data });
    }

    // 🔥 Clean JSON (Gemini sometimes wraps it)
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('API ERROR:', err);
    return NextResponse.json({ error: 'Server failed' });
  }
}
