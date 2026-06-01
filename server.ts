import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env.local first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function imageUrlToBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  if (!url) return null;
  if (url.startsWith('data:')) {
    const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        mimeType: matches[1],
        data: matches[2]
      };
    }
    return null;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/png';
    return {
      mimeType: contentType,
      data: buffer.toString('base64')
    };
  } catch (e) {
    console.error(`Failed to fetch image from URL: ${url}`, e);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post("/api/generate-kit", async (req, res) => {
    try {
      const { prompt, images } = req.body;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const parts: any[] = [];
      
      if (images && Array.isArray(images)) {
        for (const imgUrl of images) {
          const base64Data = await imageUrlToBase64(imgUrl);
          if (base64Data) {
            parts.push({
              inlineData: {
                mimeType: base64Data.mimeType,
                data: base64Data.data
              }
            });
          }
        }
      }
      
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Nando Banana / Nano Banana
        contents: {
          parts: parts
        }
      });

      let imageUrl = '';
      const partsOut = response.candidates?.[0]?.content?.parts || [];
      for (const part of partsOut) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate image" });
      }

    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "An error occurred" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
