import { TENDER_CATEGORIES } from "@shared/schema";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function categorizeTender(
  title: string,
  department?: string | null,
  itemCategory?: string | null
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn("GROQ_API_KEY not set, using fallback categorization");
    return fallbackCategorize(title, department, itemCategory);
  }

  try {
    const prompt = `Classify the following government tender into exactly one of these categories:
${TENDER_CATEGORIES.join(", ")}

Tender Details:
Title: ${title}
${department ? `Department: ${department}` : ""}
${itemCategory ? `Item Category: ${itemCategory}` : ""}

Respond with ONLY the category name, nothing else.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a tender classification assistant. Classify tenders into one of the provided categories. Respond with only the category name.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const category = data.choices?.[0]?.message?.content?.trim();

    // Validate category
    if (category && TENDER_CATEGORIES.includes(category as any)) {
      return category;
    }

    // Try to find a matching category
    const matchedCategory = TENDER_CATEGORIES.find(c => 
      category?.toLowerCase().includes(c.toLowerCase().split("/")[0].trim())
    );

    return matchedCategory || "Miscellaneous";
  } catch (error) {
    console.error("AI categorization error:", error);
    return fallbackCategorize(title, department, itemCategory);
  }
}

function fallbackCategorize(
  title: string,
  department?: string | null,
  itemCategory?: string | null
): string {
  const text = `${title} ${department || ""} ${itemCategory || ""}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    "Construction / Civil": ["construction", "civil", "building", "road", "bridge", "cement", "concrete", "infrastructure"],
    "IT / Software / Networking": ["software", "computer", "it ", "networking", "server", "database", "digital", "cyber", "web", "application"],
    "Medical / Healthcare": ["medical", "hospital", "health", "pharma", "medicine", "surgical", "diagnostic", "ambulance"],
    "Electrical / Electronics": ["electrical", "electronics", "power", "transformer", "cable", "wiring", "circuit"],
    "Machinery / Industrial": ["machinery", "industrial", "equipment", "machine", "manufacturing", "plant"],
    "Transport / Automotive": ["transport", "vehicle", "automotive", "car", "bus", "truck", "logistics"],
    "Security / Defence": ["security", "defence", "defense", "guard", "surveillance", "cctv", "military", "army"],
    "Housekeeping / Manpower": ["housekeeping", "manpower", "cleaning", "janitorial", "staff", "labour", "labor"],
    "Agriculture / Rural Development": ["agriculture", "rural", "farming", "irrigation", "crop", "seeds", "fertilizer"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return "Miscellaneous";
}

export async function categorizeMultipleTenders(
  tenders: Array<{ id: number; title: string; department?: string | null; itemCategory?: string | null }>
): Promise<Map<number, string>> {
  const results = new Map<number, string>();

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < tenders.length; i += batchSize) {
    const batch = tenders.slice(i, i + batchSize);
    const promises = batch.map(async (tender) => {
      const category = await categorizeTender(tender.title, tender.department, tender.itemCategory);
      results.set(tender.id, category);
    });
    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < tenders.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}
