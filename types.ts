export interface ColoringPage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  originalDescription: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_PROMPTS = 'GENERATING_PROMPTS',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  READY = 'READY',
  ERROR = 'ERROR'
}
