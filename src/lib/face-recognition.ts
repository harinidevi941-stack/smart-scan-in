import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

let modelsLoaded = false;

export async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load face-api models:', error);
    return false;
  }
}

export async function detectFaces(video: HTMLVideoElement) {
  return faceapi
    .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
}

export async function getFaceDescriptor(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection?.descriptor ?? null;
}

export function matchFace(
  descriptor: Float32Array,
  registeredDescriptors: { id: string; name: string; descriptor: Float32Array }[],
  threshold: number = 0.6
): { id: string; name: string; distance: number } | null {
  let bestMatch: { id: string; name: string; distance: number } | null = null;

  for (const reg of registeredDescriptors) {
    const distance = faceapi.euclideanDistance(descriptor, reg.descriptor);
    if (distance < threshold && (!bestMatch || distance < bestMatch.distance)) {
      bestMatch = { id: reg.id, name: reg.name, distance };
    }
  }

  return bestMatch;
}

export function drawDetections(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detections: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>[], 
  matchResults: { name: string; status: string }[]
) {
  const dims = faceapi.matchDimensions(canvas, video, true);
  const resized = faceapi.resizeResults(detections, dims);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  resized.forEach((det, i) => {
    const box = det.detection.box;
    const result = matchResults[i];

    ctx.strokeStyle = result ? '#3b82f6' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (result) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(box.x, box.y - 24, box.width, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`${result.name} (${result.status})`, box.x + 4, box.y - 8);
    }
  });
}
