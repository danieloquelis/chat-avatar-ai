import Stream from "node:stream";
import * as fs from "node:fs";
import { randomUUID } from "node:crypto";

type StreamToFileOptions = {
  stream: Stream.Readable;
  filePath?: string;
  fileName?: string;
  format: "mp3" | string;
};

type StreamToFile = { fileName: string; format: string; filePath: string };

export const streamToFile = async (
  options: StreamToFileOptions,
): Promise<StreamToFile> => {
  const { stream, fileName, format, filePath } = options;

  const uuid = randomUUID();
  const basePath = "/Users/danieloquelis/Developer/chat-avatar-ai/tmp";

  const name = fileName || uuid;
  const path = filePath || basePath;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  const file = `${path}/${name}.${format}`;

  const writeStream = fs.createWriteStream(file);
  stream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () =>
      resolve({
        fileName: name,
        format,
        filePath: path,
      }),
    );

    writeStream.on("error", reject);
  });
};
