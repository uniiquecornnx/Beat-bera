import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Logging the request to ensure message is received
        console.log("Received message:", message);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: message }],
                max_tokens: 100,
                temperature: 0.8,
            }),
        });

        // Log the status and response from the OpenAI API
        console.log("OpenAI API response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API error response:", errorData);
            return res.status(500).json({ error: errorData?.error?.message || "Error communicating with OpenAI API" });
        }

        const data = await response.json();

        // Log the response data from OpenAI
        console.log("OpenAI API response data:", data);

        // Check if the response contains choices and at least one choice
        if (data.choices && data.choices.length > 0) {
            const reply = data.choices[0].message.content.trim();
            console.log("Reply from OpenAI:", reply);
            res.status(200).json({ reply });
        } else {
            console.error("No choices in the OpenAI response");
            res.status(500).json({ error: "No response from OpenAI API" });
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        res.status(500).json({ error: "Error communicating with OpenAI API" });
    }
}
