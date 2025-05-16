
// TODO: Remove the following lines once the Firebase SDK is integrated.
process.env.FIREBASE_API_KEY = 'xxxx';
process.env.FIREBASE_PROJECT_ID = 'xxxx';
process.env.FIREBASE_AUTH_DOMAIN = 'xxxx';
process.env.GCLOUD_PROJECT = 'xxxx';

import {NextRequest} from 'next/server';
// import {createNextApiHandler} from '@genkit-ai/next';
import '@/ai/flows/medicine-query-chatbot';
import '@/ai/flows/recognize-tablet-flow';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// const handler = createNextApiHandler();

export async function POST(req: NextRequest) {
  return req;
}
