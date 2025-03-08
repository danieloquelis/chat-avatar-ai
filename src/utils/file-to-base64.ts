import { promises as fs } from "fs";

type FileToBase64Options = {
  fileName: string;
  filePath: string;
  format: string;
};

export const fileToBase64 = async (options: FileToBase64Options) => {
  const { format, filePath, fileName } = options;
  const file = `${filePath}/${fileName}.${format}`;
  const data = await fs.readFile(file);
  return data.toString("base64");
};
