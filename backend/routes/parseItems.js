import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const router = express.Router();

router.post("/parse", async (req, res) => {
  try {
    const { rawInput } = req.body;

    if (!rawInput || typeof rawInput !== "string") {
      return res.status(400).json({ items: [] });
    }

    const prompt = `
You are a grocery list parser.

Task:
- Extract only grocery item names.
- Remove quantities, brands, sizes, numbers.
- Normalize to lowercase.
- Use common generic item names.
- Return a JSON array ONLY.

Input:
"${rawInput}"

Output format:
["item1", "item2", "item3"]
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();
//-----------------------------
    console.log("=== Gemini Raw Response ===");
    console.log(JSON.stringify(data, null, 2));
//-----------------------------

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";


    // Remove Markdown code fences (```json ... ```)
    rawText = rawText.replace(/```json\s*|\s*```/g, '');

    let items;
    try {
    items = JSON.parse(rawText);
    console.log(items);
    } catch (err) {
    console.error("Failed to parse JSON:", err);
    }

    res.json({ items });
  } catch (err) {
    console.error("Gemini parse error:", err);
    res.json({ items: [] });
  }
});

export default router;