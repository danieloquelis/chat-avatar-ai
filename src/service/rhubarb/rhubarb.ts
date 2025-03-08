import { GetPhonemesOptions, Phoneme } from "./rhubarb-common";
import { execCommand } from "@/utils/exec-command";
import { promises as fs } from "fs";

const getPhonemes = async (
  options: GetPhonemesOptions,
): Promise<Phoneme | undefined> => {
  const { audioFilePath, audioFileName } = options;
  try {
    const time = new Date().getTime();
    const fileName = `${audioFilePath}/${audioFileName}`;

    // Conversion using ffmpeg library
    // This relies on terminal to have the package installed
    // On MacOS, use homebrew to install ffmpeg formula
    console.info(
      "[Rhubarb]",
      `Starting conversion to wav for audio ${audioFileName}`,
    );
    await execCommand({
      command: `ffmpeg -y -i ${fileName}.mp3 ${fileName}.wav`,
    });
    console.info(
      "[Rhubarb]",
      `Conversion to wav done in ${new Date().getTime() - time}ms`,
    );

    // Get phonemes using Rhubarb
    // Library is placed in the root of the project inside .tools folder
    // -r phonetic is faster but less accurate
    await execCommand({
      command: `/Users/danieloquelis/Developer/chat-avatar-ai/.tools/rhubarb/rhubarb -f json -o ${fileName}.json ${fileName}.wav -r phonetic`,
    });
    console.info(
      "[Rhubarb]",
      `LipSync done in ${new Date().getTime() - time}ms`,
    );

    // Parse JSON file generate
    // CLI Rhubarb command generates a JSON file with the metadata representing the phonemes
    const data = await fs.readFile(`${fileName}.json`, "utf8");
    return JSON.parse(data) as Phoneme;
  } catch (error) {
    console.error(
      "[Rhubarb]",
      `Error while getting phonemes for audio ${audioFileName}:`,
      error,
    );
  }
};

export const Rhubarb = {
  getPhonemes,
};
