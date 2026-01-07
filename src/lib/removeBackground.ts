import { env, pipeline } from "@huggingface/transformers";

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
}

async function createSegmenter(device: "webgpu" | "cpu") {
  return pipeline(
    "image-segmentation",
    "Xenova/segformer-b0-finetuned-ade-512-512",
    { device }
  );
}

export async function removeBackground(imageElement: HTMLImageElement): Promise<Blob> {
  // Try WebGPU first for speed; fallback to CPU if unavailable.
  const segmenter = await createSegmenter("webgpu").catch(() => createSegmenter("cpu"));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  resizeImageIfNeeded(canvas, ctx, imageElement);

  const imageData = canvas.toDataURL("image/jpeg", 0.85);
  const result = await segmenter(imageData);

  if (!result || !Array.isArray(result) || result.length === 0 || !(result as any)[0]?.mask) {
    throw new Error("Invalid segmentation result");
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) throw new Error("Could not get output canvas context");

  outputCtx.drawImage(canvas, 0, 0);

  const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = outputImageData.data;

  const mask = (result as any)[0].mask;
  for (let i = 0; i < mask.data.length; i++) {
    // Invert mask so the subject remains.
    const alpha = Math.round((1 - mask.data[i]) * 255);
    data[i * 4 + 3] = alpha;
  }

  outputCtx.putImageData(outputImageData, 0, 0);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/png",
      1.0
    );
  });
}
