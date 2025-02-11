# Voice Recorder

A simple web app for recording and transcribing voice. Record your voice, get text transcriptions, and keep recording even when offline - it'll transcribe everything once you're back online.

[Check out the demo](your-demo-video-link)

## Quick Start

1. Clone and install:

```bash
git clone [your-repo]
cd voice-recorder
npm install
```

2. Get your API key from [AssemblyAI](https://www.assemblyai.com/) and add it to `.env.local`:

```
ASSEMBLYAI_API_KEY=your_key_here
```

3. Run it:

```bash
npm run dev
```

## What's Inside

Built with Next.js 14, React, and AssemblyAI for transcription. The interface is built with shadcn/ui components and styled with Tailwind.

### Main Features

- Record, pause, and stop recordings
- Automatic speech-to-text conversion
- Works offline - queue recordings and transcribe when back online
- Shows different speakers in transcriptions

### Project Structure

```
src/
├── components/          # UI components
├── hooks/              # Recording and transcription logic
└── app/
    └── api/            # AssemblyAI integration
```

#### Components

- `VoiceRecorderContainer`: The main wrapper
- `RecordingControls`: Record, pause, and stop buttons
- `TranscriptDisplay`: Shows your transcribed text
- `OfflineAlert`: Tells you when you're offline

#### Hooks

- `useAudioRecorder`: Handles all the recording stuff
- `useTranscription`: Deals with the transcription API
- `useNetworkQueue`: Manages offline recording queue

The API endpoint at `/api/transcribe` handles file uploads to AssemblyAI and includes basic rate limiting.

## Development

The whole thing is built with:

- Next.js 14
- React (with hooks)
- Web Audio API
- AssemblyAI
- shadcn/ui components
- Tailwind CSS
