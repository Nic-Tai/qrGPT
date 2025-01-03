import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from '@/utils/utils';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { ImageResponse } from '@/utils/types';

// New way to configure the API route
export const runtime = 'nodejs'; // 'nodejs' (default) | 'edge'
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const image = formData.get('image') as File;

    if (!url || !image) {
      return new Response('URL and image are required', { status: 400 });
    }

    // Validate file size (200KB)
    if (image.size > 200 * 1024) {
      return new Response('Image size must be less than 200KB', { status: 400 });
    }

    const id = nanoid();
    const startTime = performance.now();

    // Generate QR Code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H', // Highest error correction for better image overlay
      margin: 1,
      width: 1000,
    });

    // Convert uploaded image to buffer
    const imageArrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // Resize uploaded image to match QR code size
    const resizedImage = await sharp(imageBuffer)
      .resize(1000, 1000, { fit: 'cover' })
      .toBuffer();

    // Merge QR code with uploaded image
    const mergedImage = await sharp(resizedImage)
      .composite([
        {
          input: qrBuffer,
          blend: 'multiply', // This blend mode helps maintain QR code readability
          opacity: 0.9,
        },
      ])
      .png()
      .toBuffer();

    // Upload merged image to Vercel Blob
    const { url: imageUrl } = await put(`${id}.png`, mergedImage, {
      access: 'public',
    });

    const endTime = performance.now();
    const durationMS = endTime - startTime;

    // Store metadata in KV
    await kv.hset(id, {
      website_url: url,
      image: imageUrl,
      model_latency: Math.round(durationMS),
    });

    const response: ImageResponse = {
      image_url: imageUrl,
      model_latency_ms: Math.round(durationMS),
      id: id,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response('Error processing image', { status: 500 });
  }
}
