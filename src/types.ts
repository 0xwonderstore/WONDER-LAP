// Add this to your types.ts file
export interface InstagramPost {
  type: string;
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  position: number;
  url: string;
  commentsCount: number;
  displayUrl: string;
  id: string;
  likesCount: number;
  timestamp: string;
  ownerUsername: string;
  language: string;
}
