export interface AIConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
  baseUrl: string; // Optional custom base URL
  chatModel: string;
  imageModel: string;
  temperature: number;
}

export interface AppConfig {
  ai: {
    chat: AIConfig;
    image: AIConfig;
  };
  editor: {
    fontSize: number; // 12, 14, 16, 18
    showLineNumbers: boolean;
    tabSize: number; // 2 or 4
    autoSave: boolean;
    pastePlainText: boolean; // New: Force paste as plain text
  };
  preview: {
    themeId: string;
    showPlaceholder: boolean;
  };
  general: {
    showStatusBar: boolean;   // New: Toggle status bar
    enableShortcuts: boolean; // New: Toggle shortcuts
  };
}

export interface Theme {
  id: string;
  name: string;
  css: string;
  isCustom: boolean;
  isFavorite?: boolean; // New: Pin to top
}

export interface Snippet {
  id: string;
  title: string;
  content: string;
  category: string; // e.g., "引导", "声明", "通用"
}

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  isCustom: boolean;
}

export interface UserData {
  content: string; // Current markdown
  savedDrafts: { id: string; date: string; content: string }[];
  customThemes: Theme[];
  snippets: Snippet[]; // New: Saved snippets
  chatHistory: ChatMessage[];
  imageHistory: GeneratedImage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum ModalType {
  NONE,
  SETTINGS,
  AI,
  THEME,
  SNIPPET,
}