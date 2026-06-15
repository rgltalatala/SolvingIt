import { classifyHsvToColor, rgbToHsv } from '../cube/cubeColors';
import type { FaceState } from '../cube/cubeState';
import { SCAN_GRID_FRACTION } from './scannerConstants';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function sampleAverageRgb(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  sampleSize: number,
): Rgb {
  const half = Math.floor(sampleSize / 2);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = centerY - half; y <= centerY + half; y += 1) {
    for (let x = centerX - half; x <= centerX + half; x += 1) {
      if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height)
        continue;
      const index = (y * imageData.width + x) * 4;
      r += imageData.data[index];
      g += imageData.data[index + 1];
      b += imageData.data[index + 2];
      count += 1;
    }
  }

  if (count === 0) return { r: 0, g: 0, b: 0 };
  return { r: r / count, g: g / count, b: b / count };
}

export function detectFaceColorsFromImageData(imageData: ImageData): FaceState {
  const gridSize = Math.floor(
    Math.min(imageData.width, imageData.height) * SCAN_GRID_FRACTION,
  );
  const offsetX = Math.floor((imageData.width - gridSize) / 2);
  const offsetY = Math.floor((imageData.height - gridSize) / 2);
  const cell = gridSize / 3;

  const colors = Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const centerX = Math.round(offsetX + col * cell + cell / 2);
    const centerY = Math.round(offsetY + row * cell + cell / 2);
    const avg = sampleAverageRgb(imageData, centerX, centerY, 5);
    return classifyHsvToColor(rgbToHsv(avg.r, avg.g, avg.b));
  });

  return colors as FaceState;
}
