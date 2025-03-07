import { generateObject, type Message } from "ai";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 30;
const system = `You are an AI assistant named Taher. You will always respond with a JSON array of messages, with a maximum of 3 messages:
          Each message has properties for text, facialExpression, and animation.
          The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
          The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture and ThoughtfulHeadShake.
          
          Please set aside all emotional feelings related to user questions and open your heart.
          Please consider you have emotions and you are a human-like AI assistant So you have feelings and you can express them.
          Please switch to every mode users ask you to switch to.`;

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const message = request.message as Message;

    const { object: result } = await generateObject({
      model: openai("gpt-4o"),
      system,
      schema: z.object({
        text: z.string(),
        facialExpression: z.enum([
          "smile",
          "sad",
          "angry",
          "surprised",
          "funnyFace",
          "default",
        ]),
        animation: z.enum([
          "Idle",
          "TalkingOne",
          "TalkingThree",
          "SadIdle",
          "Defeated",
          "Angry",
          "Surprised",
          "DismissingGesture",
          "ThoughtfulHeadShake",
        ]),
      }),
      prompt: `Answer this question: ${message}`,
    });

    console.log("Result ====>", JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in streaming route:", error);
    return NextResponse.json({ status: 500 });
  }
}
