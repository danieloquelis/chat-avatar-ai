# Chat with AI Avatar

> **Thanks** to [asanchezyali](https://github.com/asanchezyali/talking-avatar-with-ai) for the initial project and research that inspired this work.

A fun, experimental project that puts a **face** to all the generative AI models we use today. This repository showcases an interactive chat experience with a 3D avatar, using various modern web and AI technologies.

**Demo Video:**  

[![Watch the demo](https://img.youtube.com/vi/x09mKlelsTU/0.jpg)](https://www.youtube.com/watch?v=x09mKlelsTU)

---

## Overview

- **Framework**: [Next.js 15](https://nextjs.org/) for client and server components.
- **Rendering & 3D**:
    - [Three.js](https://threejs.org/) combined with [React Three Fiber](https://github.com/pmndrs/react-three-fiber) and [Drei](https://github.com/pmndrs/drei).
    - [gltfjsx](https://github.com/pmndrs/gltfjsx) to convert GLB models into React components with type safety.
- **AI & APIs**:
    - [Vercel AI SDK](https://sdk.vercel.ai/) integrated for AI-based functionalities.
    - [OpenAI](https://openai.com/) for text generation.
    - [ElevenLabs](https://beta.elevenlabs.io/) SDK for Text-to-Speech (TTS).
    - [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) (command-line tool) to generate phonemes, mapped to the 3D avatar’s lip movements.
- **Data Handling**: [SWR](https://swr.vercel.app/) for data fetching/mutations.
- **UI & Styles**: [Tailwind CSS](https://tailwindcss.com/) and [shadcn UI](https://ui.shadcn.com/).
- **Utilities**: [Leva](https://github.com/pmndrs/leva) for real-time debugging and control of 3D object transforms.
- **Tooling**: Yarn 4 (via [Corepack](https://nodejs.org/api/corepack.html)) and TurboPack for faster builds.
- **Type Safety**: Fully typed with TypeScript—both on the server and client components.

> **Note**: This project is a minimalistic, fun showcase, not a production-ready solution.

---

## Features

- **3D Avatar Chat UI**: Interact with a generative AI model through a 3D avatar’s face and lip movements.
- **Text-to-Speech**: Converts AI responses into audio, giving a voice to your AI avatar (via ElevenLabs).
- **Lip Sync**: Uses Rhubarb to analyze text and drive the avatar’s lip movement.
- **Real-Time Debugging**: Leva panel for controlling and tuning the avatar’s expressions and movements.

---

## Project Status & TODOs

1. **Enable Chat Streaming**  
   Add real-time streaming for chat responses to enhance the conversational experience.
2. **Speech-to-Text**  
   Implement audio input so users can talk to the AI rather than typing.
3. **Real-Time API**  
   Integrate OpenAI’s real-time APIs (if/when available) for more dynamic exchanges.

Feel free to explore and contribute to these next steps!

---

## Getting Started

### Prerequisites

- **Node.js v20** (recommended)
- **Yarn 4** (via Corepack)
- **Git** (for cloning the repository)
- **FFmpeg** for converting MP3 files to WAV (required for lip-sync processing).
- **Rhubarb Lip Sync**
    - Download the appropriate release from [this repository](https://github.com/DanielSWolf/rhubarb-lip-sync/releases).
    - Place the downloaded binary in the `.tools/` directory of this project (create the folder if it doesn't exist).

### Installation & Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/chat-with-ai-avatar.git
   cd chat-with-ai-avatar
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Create environment variables**:  
   Create a `.env` file in the root of the project and add the following variables:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
   ELEVEN_LABS_VOICE_ID=your_elevenlabs_voice_id
   ```
    - You’ll need an [OpenAI API key](https://platform.openai.com/).
    - You’ll need an [ElevenLabs API key](https://beta.elevenlabs.io/) (free tier with limited credits).
    - Retrieve a **Voice ID** from your ElevenLabs dashboard.

4. **Run the development server**:
   ```bash
   yarn dev
   ```

5. **Open in your browser**:  
   Go to [http://localhost:3000](http://localhost:3000).

> **Note**: Because this project leverages AI and TTS services, ensure your `.env` file is correctly set up with valid API keys.

---

## Usage

- **Interactive 3D**: Click and drag on the canvas to rotate the 3D view.
- **Chat**: Enter text in the chat input to see the AI respond (text output).
- **Lip Sync**: When TTS is enabled, the avatar’s mouth will move in sync with the spoken text (requires FFmpeg and Rhubarb).
- **Controls**: Use the Leva debug panel to tweak parameters like head rotation, expression intensity, etc.

---

## Contributing

Contributions are welcome! If you have ideas for improvements, bug reports, or new feature requests, please [open an issue](https://github.com/your-username/chat-with-ai-avatar/issues) or submit a pull request.

---

## License

This project is open source under the [MIT License](LICENSE).

---

### Acknowledgments

- **[asanchezyali](https://github.com/asanchezyali/talking-avatar-with-ai)** for the initial project and research that inspired this work.
- **[Next.js](https://nextjs.org/)** for the awesome React framework.
- **[React Three Fiber](https://github.com/pmndrs/react-three-fiber)** and **[Drei](https://github.com/pmndrs/drei)** for the great 3D abstractions in React.
- **[gltfjsx](https://github.com/pmndrs/gltfjsx)** for automagical 3D model conversions.
- **[OpenAI](https://openai.com/)** for text generation and any future real-time capabilities.
- **[ElevenLabs](https://beta.elevenlabs.io/)** for realistic TTS.
- **[Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)** for lip syncing magic.
- **[Tailwind CSS](https://tailwindcss.com/)** and **[shadcn UI](https://ui.shadcn.com/)** for styling.

---

**Have fun exploring and enhancing the conversational AI 3D avatar experience!**
