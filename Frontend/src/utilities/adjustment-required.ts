import { ToolsType } from "../types";

export const adjustmentRequired = (type: ToolsType) =>
  ["line", "rectangle", "image"].includes(type);



