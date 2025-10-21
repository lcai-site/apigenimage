// api/generate-images.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCanvas, loadImage, CanvasRenderingContext2D, CanvasTextAlign, Image } from 'canvas';

// --- Constants ---
const SPRITE_SHEET_URL = 'https://i.postimg.cc/YSFN8DvS/N%C3%BAmeros-transparentes.png';

const SPRITE_COORDINATES = {
  yellow: {
    '0': { x: 0, y: 0, width: 40, height: 50 },
    '1': { x: 40, y: 0, width: 40, height: 50 },
    '2': { x: 80, y: 0, width: 40, height: 50 },
    '3': { x: 120, y: 0, width: 40, height: 50 },
    '4': { x: 160, y: 0, width: 40, height: 50 },
    '5': { x: 200, y: 0, width: 40, height: 50 },
    '6': { x: 240, y: 0, width: 40, height: 50 },
    '7': { x: 280, y: 0, width: 40, height: 50 },
    '8': { x: 320, y: 0, width: 40, height: 50 },
    '9': { x: 360, y: 0, width: 40, height: 50 },
    '%': { x: 400, y: 0, width: 40, height: 50 },
  },
  white: {
    '0': { x: 0, y: 50, width: 30, height: 40 },
    '1': { x: 30, y: 50, width: 30, height: 40 },
    '2': { x: 60, y: 50, width: 30, height: 40 },
    '3': { x: 90, y: 50, width: 30, height: 40 },
    '4': { x: 120, y: 50, width: 30, height: 40 },
    '5': { x: 150, y: 50, width: 30, height: 40 },
    '6': { x: 180, y: 50, width: 30, height: 40 },
    '7': { x: 210, y: 50, width: 30, height: 40 },
    '8': { x: 240, y: 50, width: 30, height: 40 },
    '9': { x: 270, y: 50, width: 30, height: 40 },
    '%': { x: 300, y: 50, width: 30, height: 40 },
  }
};


// --- Type Definitions ---
interface AnimalData {
  lobo: number;
  aguia: number;
  tubarao: number;
  gato: number;
}

interface BrainData {
  pensante: number;
  atuante: number;
  razao: number;
  emocao: number;
}

// --- Image Processing Logic ---

// Helper function to draw percentage text from sprite sheet
const drawPercentage = (
  ctx: CanvasRenderingContext2D,
  spriteSheet: Image,
  text: string,
  x: number,
  y: number,
  color: 'yellow' | 'white',
  align: CanvasTextAlign = 'left'
) => {
  const coordinates = SPRITE_COORDINATES[color];

  let totalWidth = 0;
  for (const char of text) {
    const coord = coordinates[char as keyof typeof coordinates];
    if (coord) {
      totalWidth += coord.width;
    }
  }

  let startX = x;
  if (align === 'center') {
    startX = x - totalWidth / 2;
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  // Adjust Y to center the text vertically, similar to 'middle' textBaseline
  const charHeight = coordinates['0'].height;
  const startY = y - charHeight / 2;

  let currentX = startX;
  for (const char of text) {
    const coord = coordinates[char as keyof typeof coordinates];
    if (coord) {
      ctx.drawImage(
        spriteSheet,
        coord.x,
        coord.y,
        coord.width,
        coord.height,
        currentX,
        startY,
        coord.width,
        coord.height
      );
      currentX += coord.width;
    }
  }
};


const generateAnimalImage = async (baseImageUrl: string, data: AnimalData, spriteSheet: Image): Promise<string> => {
    try {
        const img = await loadImage(baseImageUrl);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        const animalEntries = Object.entries(data) as [keyof AnimalData, number][];

        let highestAnimalName: keyof AnimalData | null = null;
        let maxPercentage = -1;

        for (const [name, percentage] of animalEntries) {
            if (percentage > maxPercentage) {
                maxPercentage = percentage;
                highestAnimalName = name;
            }
        }

        const positions: { [key: string]: { x: number; y: number } } = {
          lobo:    { x: 160, y: 280 },
          aguia:   { x: 480, y: 280 },
          tubarao: { x: 160, y: 630 },
          gato:    { x: 480, y: 630 },
        };

        for (const [name, percentage] of animalEntries) {
          const isHighest = name === highestAnimalName;
          const color = isHighest ? 'yellow' : 'white';
          const text = `${percentage}%`;
          const { x, y } = positions[name as keyof AnimalData];

          drawPercentage(ctx, spriteSheet, text, x, y, color, 'center');
        }

        return canvas.toDataURL('image/png');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Error during animal image processing: ${errorMessage}`);
    }
};

const generateBrainImage = async (baseImageUrl: string, data: BrainData, spriteSheet: Image): Promise<string> => {
    try {
        const img = await loadImage(baseImageUrl);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
  
        ctx.drawImage(img, 0, 0);
        
        const positions: { [key: string]: { x: number; y: number; align: CanvasTextAlign } } = {
            pensante: { x: 320, y: 330, align: 'center' },
            atuante:  { x: 320, y: 800, align: 'center' },
            razao:    { x: 100, y: 510, align: 'center' },
            emocao:   { x: 540, y: 510, align: 'center' },
        };
  
        const brainEntries = Object.entries(data) as [keyof BrainData, number][];

        for (const [name, percentage] of brainEntries) {
            const pos = positions[name];
            if(pos) {
                drawPercentage(ctx, spriteSheet, `${percentage}%`, pos.x, pos.y, 'white', pos.align);
            }
        }
  
        return canvas.toDataURL('image/png');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Error during brain image processing: ${errorMessage}`);
    }
};

const BASE_IMAGE_BRAIN_URL = 'https://i.postimg.cc/LXMYjwtX/Inserir-um-t%C3%ADtulo-6.png';
const BASE_IMAGE_ANIMALS_URL = 'https://i.postimg.cc/0N1sjN2W/Inserir-um-t%C3%ADtulo-7.png';


// --- Vercel Serverless Function Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // We only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { animalData, brainData } = req.body;

    // Basic validation
    if (!animalData || !brainData) {
      return res.status(400).json({ error: 'Request body must contain "animalData" and "brainData" objects.' });
    }

    const spriteSheet = await loadImage(SPRITE_SHEET_URL);
    
    const [animalImage, brainImage] = await Promise.all([
      generateAnimalImage(BASE_IMAGE_ANIMALS_URL, animalData, spriteSheet),
      generateBrainImage(BASE_IMAGE_BRAIN_URL, brainData, spriteSheet),
    ]);

    res.status(200).json({
      animalImage,
      brainImage,
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to generate images.', details: errorMessage });
  }
}
