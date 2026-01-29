import getStroke from "perfect-freehand";
import { ElementType } from "../types";

export const drawElement = (
  // TODO: add type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roughCanvas: any,
  context: CanvasRenderingContext2D,
  element: ElementType
) => {
  switch (element.type) {
    case "line":
    case "rectangle":
    case "circle":
    case "arrow":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil": {
      if (!element.points) {
        throw new Error("Pencil element points are undefined");
      }
      const strokePoints = getStroke(element.points, {
        size: element.strokeWidth || 5, // Default thickness
      });
      const formattedPoints: [number, number][] = strokePoints.map((point) => {
        if (point.length !== 2) {
          throw new Error(
            `Expected point to have exactly 2 elements, got ${point.length}`
          );
        }
        return [point[0], point[1]];
      });
      const stroke = getSvgPathFromStroke(formattedPoints);
      context.fillStyle = element.stroke || "#000000";
      context.fill(new Path2D(stroke));
      break;
    }
    case "text": {
      context.textBaseline = "top";
      // Mapping strokeWidth to font size: 24 + (strokeWidth - 1) * 2
      const calculatedFontSize = 24 + ((element.strokeWidth || 1) - 1) * 2;
      context.font = `${calculatedFontSize}px sans-serif`;
      context.fillStyle = element.stroke || "#000000";
      const text = element.text || "";
      context.fillText(text, element.x1, element.y1);
      context.fillText(text, element.x1, element.y1);
      break;
    }
    case "image": {
      context.save();
      context.globalAlpha = (element.opacity || 100) / 100;
      if (element.cachedImage && element.cachedImage.complete && element.cachedImage.naturalWidth > 0) {
        try {
          const imgX = Math.min(element.x1, element.x2);
          const imgY = Math.min(element.y1, element.y2);
          const imgW = Math.abs(element.x2 - element.x1);
          const imgH = Math.abs(element.y2 - element.y1);
          context.drawImage(element.cachedImage, imgX, imgY, imgW, imgH);
        } catch (e) {
          console.warn("Failed to draw image", e);
        }
      } else if (element.dataURL) {
        // Attempt to load if missing (fallback for immediate updates, e.g. local creation)
        const img = new Image();
        img.src = element.dataURL;
        element.cachedImage = img; // Cache it for next frame
      }
      context.restore();
      break;
    }
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

// 🥑 source: https://www.npmjs.com/package/perfect-freehand/v/1.0.4
const getSvgPathFromStroke = (stroke: [number, number][]) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (
      acc: string[],
      [x0, y0]: [number, number],
      i: number,
      arr: [number, number][]
    ) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(
        x0.toString(),
        y0.toString(),
        ((x0 + x1) / 2).toString(),
        ((y0 + y1) / 2).toString()
      );
      return acc;
    },
    ["M", ...stroke[0].map((num) => num.toString()), "Q"]
  );

  d.push("Z");
  return d.join(" ");
};



