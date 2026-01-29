import rough from "roughjs";
import { Tools, ElementType, ToolsType } from "../types";

export const createElement = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ToolsType,
  options?: { stroke: string; strokeWidth: number; fill: string; fillStyle: string; opacity: number; dataURL?: string; cachedImage?: HTMLImageElement }
): ElementType => {
  const generator = rough.generator();
  const { stroke = "#000000", strokeWidth = 1, fill = "transparent", fillStyle = "hachure", opacity = 100 } = options || {};
  const roughOptions = { stroke, strokeWidth, fill: fill === "transparent" ? undefined : fill, fillStyle };

  switch (type) {
    case Tools.line:
    case Tools.rectangle:
    case Tools.circle: {
      const roughElement =
        type === Tools.line
          ? generator.line(x1, y1, x2, y2, roughOptions)
          : type === Tools.rectangle
            ? generator.rectangle(x1, y1, x2 - x1, y2 - y1, roughOptions)
            : generator.ellipse((x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1, roughOptions);
      return { id, x1, y1, x2, y2, type, roughElement, stroke, strokeWidth, fill, fillStyle, opacity };
    }
    case Tools.arrow: {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const length = 20;
      const arrowX1 = x2 - length * Math.cos(angle - Math.PI / 6);
      const arrowY1 = y2 - length * Math.sin(angle - Math.PI / 6);
      const arrowX2 = x2 - length * Math.cos(angle + Math.PI / 6);
      const arrowY2 = y2 - length * Math.sin(angle + Math.PI / 6);

      const path = `M ${x1} ${y1} L ${x2} ${y2} L ${arrowX1} ${arrowY1} M ${x2} ${y2} L ${arrowX2} ${arrowY2}`;
      const roughElement = generator.path(path, roughOptions);
      return { id, x1, y1, x2, y2, type, roughElement, stroke, strokeWidth };
    }
    case Tools.pencil: {
      const defaultRoughElement = null;
      return {
        id,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        type,
        points: [{ x: x1, y: y1 }],
        roughElement: defaultRoughElement,
        stroke,
        strokeWidth
      };
    }
    case Tools.text:
      return { id, type, x1, y1, x2, y2, text: "", stroke, strokeWidth };
    case Tools.image:
      return {
        id,
        type,
        x1,
        y1,
        x2,
        y2,
        dataURL: options?.dataURL || "",
        cachedImage: options?.cachedImage,
        stroke,
        strokeWidth,
        opacity
      };
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

