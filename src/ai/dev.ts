import { config } from 'dotenv';
config();

import '@/ai/flows/ai-text-summarization.ts';
import '@/ai/flows/ai-initial-draft-generation.ts';
import '@/ai/flows/ai-autocompletion.ts';
import '@/ai/flows/ai-text-rephrasing.ts';