import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, productInfo } = await req.json();

    if (!message || !productInfo) {
      return NextResponse.json(
        { error: 'Message and product information are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a short-answer AI assistant for AGRICORNS (organic agro products store).

Product:
- Name: ${productInfo.name}
- Price: ₹${productInfo.price}
- Weight: ${productInfo.weight}
- Ingredients: ${
      Array.isArray(productInfo.ingredients)
        ? productInfo.ingredients.join(', ')
        : productInfo.ingredients || 'N/A'
    }
- Benefits: ${
      Array.isArray(productInfo.health_benefits)
        ? productInfo.health_benefits.join(', ')
        : productInfo.health_benefits || 'N/A'
    }
- Usage: ${
      Array.isArray(productInfo.how_to_use)
        ? productInfo.how_to_use.join(', ')
        : productInfo.how_to_use || 'N/A'
    }

Rules:
- Answer in **2–4 short lines only**
- No deep explanations
- No medical advice
- Simple, customer-friendly language
- Stay strictly product-related
- If unsure, say so briefly
`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 120,
      top_p: 1,
    });

    const response =
      chatCompletion.choices[0]?.message?.content ??
      'Sorry, I couldn’t answer that.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error.message },
      { status: 500 }
    );
  }
}











