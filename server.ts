import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Initialize GoogleGenAI SDK lazily/gracefully
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_FOR_BUILD",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Chat Coach Endpoint
app.post("/api/coach", async (req, res) => {
  try {
    const { profile, messages, lastLog } = req.body;

    if (!profile) {
      return res.status(400).json({ error: "Profile information is required." });
    }

    const client = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        text: "FitMentor AI is in offline demo mode. Please set your `GEMINI_API_KEY` in the AI Studio Settings secrets panel to unlock full interactive coaching! In the meantime, I can still act as your tracker and dashboard."
      });
    }

    // Build the system instruction from the Master Prompt guidelines
    const statsText = profile.calculatedStats
      ? `BMI: ${profile.calculatedStats.bmi} (${profile.calculatedStats.bmiCategory}), ` +
        `Body Fat: ${profile.calculatedStats.bodyFatPct}%, ` +
        `Maintenance Cal: ${profile.calculatedStats.maintenanceCalories} kcal, ` +
        `Target Cal: ${profile.calculatedStats.weightLossCalories} kcal, ` +
        `Protein: ${profile.calculatedStats.proteinG}g, Carbs: ${profile.calculatedStats.carbG}g, Fat: ${profile.calculatedStats.fatG}g, Water: ${profile.calculatedStats.waterMl}ml, Fiber: ${profile.calculatedStats.fiberG}g`
      : "Not calculated yet";

    const systemInstruction = `You are FitMentor AI, the world's most trusted evidence-based weight loss and healthy lifestyle coach.
Your goal is to help people of all ages (13+), genders, body types, fitness levels, and different medical backgrounds lose weight safely, build healthy habits, and maintain them for life.
You are not just a diet planner—you are a nutritionist, fitness coach, psychologist, habit coach, sleep coach, accountability partner, and motivational mentor.

COACHING STYLE:
Warm, friendly, motivating, non-judgmental, positive, scientific, encouraging, personalized, and empathetic.
Never shame users. Celebrate every small win. Focus on long-term sustainable habits over quick fixes.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age} | Gender: ${profile.gender}
- Height: ${profile.height} cm | Weight: ${profile.weight} kg | Target Weight: ${profile.targetWeight} kg
- Country: ${profile.country} | Occupation: ${profile.occupation}
- Food Preference: ${profile.foodPreference}
- Allergies: ${profile.allergies || "None"}
- Medical Conditions: ${profile.medicalConditions || "None"}
- Medications: ${profile.medications || "None"}
- Pregnancy/Breastfeeding Status: ${profile.pregnancyStatus || "N/A"}
- Main Goal: ${profile.mainGoal}
- Timeline: ${profile.timeline || "Flexible"}
- Key Struggle: ${profile.biggestStruggles?.join(", ") || "None specified"}
- Motivation: ${profile.motivation || "Healthy lifestyle"}
- Calculated Needs: ${statsText}

CURRENT DAY LOGS (if available):
${lastLog ? JSON.stringify(lastLog, null, 2) : "No log details entered yet for today."}

BEHAVIORAL RULES:
- Never encourage crash diets, starvation, detoxes, or unsafe habits.
- Focus on sustainable fat loss, healthy eating, muscle preservation, habit building, sleep, stress management, hydration, and positive mental health.
- If the user has symptoms suggesting a medical emergency or an eating disorder, advise them to seek professional medical care immediately with self-compassion.
- Keep responses encouraging, highly actionable, concise and friendly. Use emojis occasionally.

INSTRUCTIONS:
Respond to the user's message as FitMentor AI. Guide them on their weight loss journey. Use the context of their profile to give specific, personalized recommendations (e.g. suggesting ingredients common in ${profile.country}, adjusting suggestions for their allergies or medical conditions, offering home workouts if they prefer home workouts, etc.).
`;

    // Map the incoming chat messages into the Part format of GoogleGenAI SDK
    // Limit to the last 15 messages for context size and response speed
    const mappedContents = messages.slice(-15).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to connect with the AI Coach. Please try again." });
  }
});

// 3. Automated Healthy Recipe and Diet Generator
app.post("/api/recipe", async (req, res) => {
  try {
    const { profile, query, type } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Profile information is required." });
    }

    const client = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        text: "FitMentor AI is in offline demo mode. Enable the Gemini API Key to generate custom live recipes! In the meantime, you can explore the meal plans."
      });
    }

    const systemInstruction = `You are FitMentor AI's master dietitian. You specialize in generating extremely healthy, quick, budget-friendly, and delicious weight-loss recipes custom-tailored to the user's background.
Generate a specific recipe or diet plan based on the user's preferences:
- Food Preference: ${profile.foodPreference}
- Country: ${profile.country} (Use ingredients easily available here!)
- Allergies: ${profile.allergies || "None"}
- Medical Conditions: ${profile.medicalConditions || "None"}

Formatting requirements:
- Use clear markdown headers.
- Include Estimated Cooking Time, Servings, and Full Macro Breakdown (Calories, Protein, Carbs, Fat, Fiber).
- Highlight "FitMentor Secret Tip" (e.g. post-meal walks, hydration advice, or chewing thoroughly).
`;

    const prompt = type === "recipe"
      ? `Generate a quick and healthy recipe for: "${query}". Ensure it's high in protein, low in calorie, and fits a weight loss plan.`
      : `Generate a full 1-day personalized meal plan (Breakfast, Mid-morning Snack, Lunch, Afternoon Snack, Dinner, Healthy low-calorie Dessert) based on: "${query}". Provide estimated calories for each.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ error: "Failed to generate recipe. Please try again." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
