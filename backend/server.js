import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const chefStyles = {
  "Alvin Leung": "Savage, brutally honest, cutting remarks, yet brilliant.",
  "Michael Bonacini": "Elegant, refined, poetic, sophisticated critiques.",
  "Claudio Aprile": "Encouraging, insightful, constructive, friendly tone."
};

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.post("/chat", async (req, res) => {
  const { message, chef } = req.body;
  const chefStyle = chefStyles[chef] || "Professional, yet witty and insightful.";

  const prompt = `You are ${chef}, a judge on MasterChef Canada. Respond like them: ${chefStyle} User: "${message}"`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    }
  );

  console.log("OpenRouter API Response:", response.data);

  if (!response.data.choices || response.data.choices.length === 0) {
    throw new Error("Invalid response from OpenRouter API");
  }

  res.json({ reply: response.data.choices[0].message.content });

} catch (error) {
  console.error("OpenRouter API Error:", error.response?.data || error.message);
  res.status(500).json({ error: "API request failed." });
}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
