import type { FieldNoteBlocks } from './schema.js';

export type FieldNoteSaveState =
  | 'connecting'
  | 'saving'
  | 'saved'
  | 'offline'
  | 'reconnecting'
  | 'failed';

export interface FieldNoteDocumentSnapshot {
  blocks: FieldNoteBlocks;
  plainText: string;
  html: string;
  schemaVersion: number;
}

export interface FieldNoteEditorAccess {
  fieldNoteId: number;
  status: string;
  collaborationMode: 'invite_only' | 'members_with_link';
  canRead: boolean;
  canWrite: boolean;
  canComment: boolean;
  shareLinkUsed: boolean;
  collaboratorRole: 'editor' | 'commenter' | null;
  title: string;
  excerpt: string;
  legacyContent: string;
  contentJson: FieldNoteBlocks | null;
  contentSchemaVersion: number;
  canManageCollaboration: boolean;
  visibility: 'public' | 'members' | 'private';
  language: 'zh' | 'en';
  isOwner: boolean;
  user: {
    id: string;
    displayName: string;
    avatarMediaId: number | null;
  };
}
