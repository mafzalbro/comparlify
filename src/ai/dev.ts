
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-query-comparlify-chatbot.ts';
import '@/ai/flows/ai-generic-content-generator.ts';
import '@/ai/flows/ai-image-generator.ts';
import '@/ai/flows/ai-logo-generator.ts';
