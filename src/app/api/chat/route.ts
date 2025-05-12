import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Send request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    // Log the entire response to see its structure
    console.log("OpenAI API Response:", data);

    // Check if 'choices' is present and has at least one item
    const reply = data.choices?.[0]?.message?.content || "I didn't quite catch that. Could you say it again?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Error processing the request" }, { status: 500 });
  }
}
