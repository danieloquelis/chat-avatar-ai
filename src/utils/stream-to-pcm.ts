import Stream from "node:stream";

export const streamToPcm = async (
  stream: Stream.Readable
): Promise<Buffer<ArrayBuffer>> => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
