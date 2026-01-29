export type SelectedElementType = ElementType & {
  xOffsets?: number[];
  yOffsets?: number[];
  offsetX?: number;
  offsetY?: number;
};

export interface ExtendedElementType extends ElementType {
  xOffsets?: number[];
  yOffsets?: number[];
}

export type ElementType = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ToolsType;
  // TODO: add type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roughElement?: any;
  offsetX?: number;
  offsetY?: number;
  position?: string | null;
  points?: { x: number; y: number }[];
  text?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: string; // "hachure", "solid", "zigzag", "cross-hatch", "dots", "sunburst", "dashed", "zigzag-line"
  opacity?: number;
  dataURL?: string; // Base64 string for images
  cachedImage?: HTMLImageElement; // Runtime only, not serialized
};

export type ElementOptions = {
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillStyle: string;
  opacity: number;
  dataURL?: string;
  cachedImage?: HTMLImageElement;
};

export type ActionsType =
  | "writing"
  | "drawing"
  | "moving"
  | "panning"
  | "resizing"
  | "erasing"
  | "selecting"
  | "none";

export const Tools = {
  pan: "pan",
  selection: "selection",
  rectangle: "rectangle",
  line: "line",
  pencil: "pencil",
  text: "text",
  circle: "circle",
  arrow: "arrow",
  eraser: "eraser",
  image: "image",
};

export type ToolsType = (typeof Tools)[keyof typeof Tools];

export type PointType = { x: number; y: number };



