import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // Aumenta o tempo limite de execução para até 60 segundos (limite Hobby na Vercel)
};


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

export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel serverless function
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      model: 'gemini-2.5-flash-image',
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
      res.status(200).json({ imageUrl });
    } else {
      res.status(500).json({ error: "Failed to generate image" });
    }

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "An error occurred" });
  }
}
