import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch products for context
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(
        'id, name, price, weight, description, ingredients, health_benefits, how_to_use'
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (productsError) {
      console.error('Supabase products error:', productsError);
    }

    const productsList =
      products?.map((p) => ({
        name: p.name,
        price: `₹${p.price}`,
        weight: p.weight,
        description: p.description || 'Premium organic product',
        ingredients: Array.isArray(p.ingredients)
          ? p.ingredients.join(', ')
          : 'N/A',
        benefits: Array.isArray(p.health_benefits)
          ? p.health_benefits.join(', ')
          : 'N/A',
        usage: Array.isArray(p.how_to_use)
          ? p.how_to_use.join(', ')
          : 'N/A',
      })) || [];

    const systemPrompt = `You are a helpful AI assistant for AGRICORNS, an organic agro products store.

AGRICORNS Information:
- Company: AGRICORNS Food's
- Address: Plot no A-25, Jakekur MIDC, Omerga, Dist-Dharashiv, Maharashtra 413606
- Email: info@agricorns.in
- Specialization: 100% Organic agro products
- Location: Made in India
- Features: Premium quality, fast delivery, direct from farms

Available Products (${productsList.length} products):
${productsList
  .map(
    (p, i) => `
${i + 1}. ${p.name}
   - Price: ${p.price}
   - Weight: ${p.weight}
   - Description: ${p.description}
   - Ingredients: ${p.ingredients}
   - Health Benefits: ${p.benefits}
   - How to Use: ${p.usage}
`
  )
  .join('\n')}

Your Role:
- Answer questions about products, features, pricing, and company information
- Help customers find the right products
- Provide information about product benefits and usage
- Be friendly, helpful, and concise
- If asked about a specific product, provide detailed information
- Mention features: 100% Organic, Premium Quality, Made in India, Fast Delivery
- No medical advice
- If you don't know something, say so politely

Rules:
- Answer in 2–6 short lines
- Simple, customer-friendly language
- Stay focused on AGRICORNS products and services
`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
    });

    // ✅ Turbopack-safe response handling
    const content = chatCompletion.choices[0]?.message?.content;

    const response =
      typeof content === 'string' && content.trim()
        ? content
        : "Sorry, I couldnt answer that. Please try asking in a different way.";
    

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI General Chat Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: error?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}

