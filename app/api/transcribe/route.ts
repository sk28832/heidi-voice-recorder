// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY is not set in environment variables');
}

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/webm'
] as const;

async function waitForTranscript(transcriptId: string) {
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait time

  while (attempts < maxAttempts) {
    const transcript = await client.transcripts.get(transcriptId);
    console.log('Transcript status:', transcript.status);
    
    if (transcript.status === 'completed') {
      return transcript;
    } else if (transcript.status === 'error') {
      console.error('Transcript error:', transcript);
      throw new Error('Transcription failed with status: error');
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Transcription timed out');
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';
    try {
      await limiter.check(10, ip);
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];
if (!ALLOWED_MIME_TYPES.includes(audioFile.type as AllowedMimeType)) {
      return NextResponse.json(
        { 
          error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
        },
        { status: 400 }
      );
    }

    try {
      console.log('Starting audio processing...');
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload the audio file
      console.log('Uploading audio to AssemblyAI...');
      const audioUrl = await client.files.upload(buffer);
      console.log('Audio uploaded successfully, URL:', audioUrl);

      // Create transcript
      console.log('Creating transcript...');
      const transcriptResponse = await client.transcripts.create({
        audio_url: audioUrl,
        speaker_labels: true,
        speakers_expected: 2
      });
      console.log('Transcript created, ID:', transcriptResponse.id);

      // Wait for completion
      console.log('Waiting for transcript completion...');
      const transcript = await waitForTranscript(transcriptResponse.id);
      console.log('Transcript completed:', transcript.text ? 'has text' : 'no text');

      if (!transcript.text) {
        throw new Error('No transcription text received');
      }

      // Format and return the response
      const response = {
        text: transcript.text,
        utterances: transcript.utterances?.map(u => ({
          speaker: u.speaker,
          text: u.text,
          start: u.start,
          end: u.end
        }))
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('AssemblyAI API error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process audio' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}