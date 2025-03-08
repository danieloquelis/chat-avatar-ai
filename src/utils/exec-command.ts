import { exec } from "child_process";

export const execCommand = async ({
  command,
}: {
  command: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};
