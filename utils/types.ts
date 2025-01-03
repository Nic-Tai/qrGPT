export type QrCodeControlNetRequest = {
  url: string;
  prompt: string;
  qr_conditioning_scale?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
};

export type QrCodeControlNetResponse = [string];

export type ImageResponse = {
  image_url: string;
  model_latency_ms: number;
  id: string;
};
