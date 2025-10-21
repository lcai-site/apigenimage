import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { VercelRequest, VercelResponse } from '@vercel/node';

const SPRITE_SHEET_URL = path.join(__dirname, '..', 'assets', 'sprites.png');
const SPRITE_COORDINATES = {
  '0': { white: { x: 0, y: 0, width: 50, height: 80 }, yellow: { x: 0, y: 80, width: 60, height: 96 } },
  '1': { white: { x: 50, y: 0, width: 50, height: 80 }, yellow: { x: 60, y: 80, width: 60, height: 96 } },
  '2': { white: { x: 100, y: 0, width: 50, height: 80 }, yellow: { x: 120, y: 80, width: 60, height: 96 } },
  '3': { white: { x: 150, y: 0, width: 50, height: 80 }, yellow: { x: 180, y: 80, width: 60, height: 96 } },
  '4': { white: { x: 200, y: 0, width: 50, height: 80 }, yellow: { x: 240, y: 80, width: 60, height: 96 } },
  '5': { white: { x: 250, y: 0, width: 50, height: 80 }, yellow: { x: 300, y: 80, width: 60, height: 96 } },
  '6': { white: { x: 300, y: 0, width: 50, height: 80 }, yellow: { x: 360, y: 80, width: 60, height: 96 } },
  '7': { white: { x: 350, y: 0, width: 50, height: 80 }, yellow: { x: 420, y: 80, width: 60, height: 96 } },
  '8': { white: { x: 400, y: 0, width: 50, height: 80 }, yellow: { x: 480, y: 80, width: 60, height: 96 } },
  '9': { white: { x: 450, y: 0, width: 50, height: 80 }, yellow: { x: 540, y: 80, width: 60, height: 96 } },
  '%': { white: { x: 500, y: 0, width: 50, height: 80 }, yellow: { x: 600, y: 80, width: 60, height: 96 } },
};

async function drawPercentage(
  ctx: any,
  spriteSheet: any,
  percentage: string,
  x: number,
  y: number,
  color: 'white' | 'yellow',
  align: 'left' | 'center' | 'right'
) {
  try {
    let totalWidth = 0;
    const chars = percentage.split('');
    for (const char of chars) {
      const coords = SPRITE_COORDINATES[char]?.[color];
      if (coords) totalWidth += coords.width;
    }

    let startX = x;
    if (align === 'center') startX -= totalWidth / 2;
    else if (align === 'right') startX -= totalWidth;

    for (const char of chars) {
      const coords = SPRITE_COORDINATES[char]?.[color];
      if (!coords) {
        console.error(`No coordinates for char ${char} in color ${color}`);
        continue;
      }
      ctx.drawImage(
        spriteSheet,
        coords.x, coords.y, coords.width, coords.height,
        startX, y - coords.height, coords.width, coords.height
      );
      startX += coords.width;
    }
  } catch (error) {
    console.error('Error drawing percentage:', error);
  }
}

async function generateAnimalImage(data: any, spriteSheet: any) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  try {
    const baseImage = await loadImage(path.join(__dirname, '..', 'assets', 'animals.png'));
    ctx.drawImage(baseImage, 0, 0, 800, 600);

    const percentages = [
      { key: 'aguia', value: data.aguia, x: 100, y: 100, align: 'center' },
      { key: 'gato', value: data.gato, x: 300, y: 100, align: 'center' },
      { key: 'tubarao', value: data.tubarao, x: 500, y: 100, align: 'center' },
      { key: 'lobo', value: data.lobo, x: 700, y: 100, align: 'center' },
    ];

    const maxValue = Math.max(...percentages.map(p => p.value));
    for (const p of percentages) {
      const color = p.value === maxValue ? 'yellow' : 'white';
      await drawPercentage(ctx, spriteSheet, `${p.value}%`, p.x, p.y, color, p.align);
    }

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating animal image:', error);
    throw error;
  }
}

async function generateBrainImage(data: any, spriteSheet: any) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  try {
    const baseImage = await loadImage(path.join(__dirname, '..', 'assets', 'brain.png'));
    ctx.drawImage(baseImage, 0, 0, 800, 600);

    const percentages = [
      { key: 'emocao', value: data.emocao, x: 100, y: 100, align: 'center' },
      { key: 'razao', value: data.razao, x: 300, y: 100, align: 'center' },
      { key: 'pensante', value: data.pensante, x: 500, y: 100, align: 'center' },
      { key: 'atuante', value: data.atuante, x: 700, y: 100, align: 'center' },
    ];

    for (const p of percentages) {
      await drawPercentage(ctx, spriteSheet, `${p.value}%`, p.x, p.y, 'white', p.align);
    }

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating brain image:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { animalData, brainData } = req.body;
    console.log('Loading sprite sheet from:', SPRITE_SHEET_URL);
    const spriteSheet = await loadImage(SPRITE_SHEET_URL);
    console.log('Sprite sheet loaded successfully');

    const animalImage = await generateAnimalImage(animalData, spriteSheet);
    const brainImage = await generateBrainImage(brainData, spriteSheet);

    res.status(200).json({
      animalImage: animalImage.toString('base64'),
      brainImage: brainImage.toString('base64'),
    });
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Failed to generate images' });
  }
}
