import { useEffect, useMemo, useState } from 'react';
import {
  createUserStore,
  type BlockNoteEditor,
} from '@blocknote/core';
import {
  CommentsExtension,
  DefaultThreadStoreAuth,
} from '@blocknote/core/comments';
import {
  RESTYjsThreadStore,
  withCollaboration,
} from '@blocknote/core/yjs';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusAwareness,
  useHocuspocusConnectionStatus,
  useHocuspocusProvider,
  useHocuspocusSyncStatus,
} from '@hocuspocus/provider-react';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import {
  FIELD_NOTE_YJS_FRAGMENT,
  FIELD_NOTE_YJS_THREADS,
  fieldNoteDocumentSchema,
} from '@/lib/field-note-document/schema';
import type { FieldNoteEditorAccess, FieldNoteSaveState } from '@/lib/field-note-document/types';
import {
  fieldNoteCollaborationToken,
  resolveFieldNoteUsers,
} from '@/services/field-note-editor';
import { uploadFieldNoteMedia } from '@/services/media';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface CollaborativeStoryEditorProps {
  noteId: number;
  accessToken: string;
  shareToken?: string;
  access: FieldNoteEditorAccess;
  onEditorReady(editor: BlockNoteEditor): void;
  onChange(): void;
  onSaveStateChange(state: FieldNoteSaveState): void;
}

function collaborationUrl(): string {
  const configured = import.meta.env.VITE_COMMUNITY_COLLAB_URL?.trim();
  if (configured) return configured;
  if (import.meta.env.DEV) return `ws://${window.location.hostname}:1234`;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/community/field-note-collaboration`;
}

function collaboratorColor(userId: string): string {
  let hash = 0;
  for (const character of userId) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  const palette = ['#D86B35', '#2F6B4F', '#3E6F8F', '#8B5E83', '#9A713A', '#477A73'];
  return palette[Math.abs(hash) % palette.length];
}

function RoomEditor({
  noteId,
  accessToken,
  shareToken,
  access,
  document,
  onEditorReady,
  onChange,
  onSaveStateChange,
}: CollaborativeStoryEditorProps & { document: Y.Doc }) {
  const provider = useHocuspocusProvider();
  const connectionStatus = useHocuspocusConnectionStatus();
  const syncStatus = useHocuspocusSyncStatus();
  const awareness = useHocuspocusAwareness();

  const userStore = useMemo(() => createUserStore(async (userIds) => {
    if (userIds.includes(access.user.id)) {
      const currentUser = {
        id: access.user.id,
        username: access.user.displayName,
        avatarUrl: '',
        color: collaboratorColor(access.user.id),
      };
      const others = userIds.filter((userId) => userId !== access.user.id);
      return [
        currentUser,
        ...await resolveFieldNoteUsers({
          noteId,
          accessToken,
          shareToken,
          userIds: others,
        }),
      ];
    }
    return resolveFieldNoteUsers({ noteId, accessToken, shareToken, userIds });
  }), [access.user.displayName, access.user.id, accessToken, noteId, shareToken]);

  const threadStore = useMemo(() => new RESTYjsThreadStore(
    `/api/community/field-note-comments/${noteId}`,
    {
      Authorization: `Bearer ${accessToken}`,
      ...(shareToken ? { 'X-Field-Note-Share-Token': shareToken } : {}),
    },
    document.getMap(FIELD_NOTE_YJS_THREADS),
    new DefaultThreadStoreAuth(access.user.id, access.canWrite ? 'editor' : 'comment'),
  ), [access.canWrite, access.user.id, accessToken, document, noteId, shareToken]);

  const editor = useCreateBlockNote(withCollaboration({
    schema: fieldNoteDocumentSchema,
    collaboration: {
      fragment: document.getXmlFragment(FIELD_NOTE_YJS_FRAGMENT),
      provider,
      user: {
        name: access.user.displayName,
        color: collaboratorColor(access.user.id),
      },
      showCursorLabels: 'activity',
    },
    extensions: access.canComment
      ? [CommentsExtension({ threadStore, resolveUsers: userStore })]
      : [],
    ...(access.canManageCollaboration
      ? { uploadFile: (file: File) => uploadFieldNoteMedia(noteId, file) }
      : {}),
  }), [
    access.canComment,
    access.canManageCollaboration,
    access.user.displayName,
    access.user.id,
    document,
    noteId,
    provider,
    threadStore,
    userStore,
  ]);

  useEffect(() => {
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!navigator.onLine || connectionStatus === 'disconnected') {
      onSaveStateChange('offline');
    } else if (connectionStatus === 'connecting') {
      onSaveStateChange('connecting');
    } else if (syncStatus === 'syncing') {
      onSaveStateChange('saving');
    } else {
      onSaveStateChange('saved');
    }
  }, [connectionStatus, onSaveStateChange, syncStatus]);

  const activeUsers = awareness
    .map((state) => state.user as { id?: string; name?: string; color?: string } | undefined)
    .filter((user): user is { id?: string; name?: string; color?: string } => Boolean(user?.name));

  return (
    <div className="community-story-editor__document">
      <div className="community-story-editor__presence" aria-live="polite">
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 5).map((user, index) => (
            <span
              key={`${user.id || user.name}-${index}`}
              className="community-story-editor__avatar"
              style={{ backgroundColor: user.color || '#477A73' }}
              title={user.name}
            >
              {user.name?.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
        <span>{activeUsers.length > 1 ? `${activeUsers.length} people here` : 'Just you for now'}</span>
      </div>

      <BlockNoteView
        editor={editor}
        editable={access.canWrite}
        comments={access.canComment}
        onChange={onChange}
        theme="light"
        className="community-blocknote"
      />
    </div>
  );
}

export default function CollaborativeStoryEditor(props: CollaborativeStoryEditorProps) {
  const documentName = `field-note:${props.noteId}`;
  const [document] = useState(() => new Y.Doc());
  const onSaveStateChange = props.onSaveStateChange;
  const token = useMemo(
    () => fieldNoteCollaborationToken(props.accessToken, props.shareToken),
    [props.accessToken, props.shareToken],
  );
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!props.access.canWrite) return;
    const persistence = new IndexeddbPersistence(`rgan-${documentName}`, document);
    return () => { void persistence.destroy(); };
  }, [document, documentName, props.access.canWrite]);

  useEffect(() => () => document.destroy(), [document]);

  useEffect(() => {
    if (!online) onSaveStateChange('offline');
  }, [online, onSaveStateChange]);

  return (
    <HocuspocusProviderWebsocketComponent url={collaborationUrl()}>
      <HocuspocusRoom
        name={documentName}
        document={document}
        token={token}
        sessionAwareness
        flushDelay={80}
        onAuthenticationFailed={() => onSaveStateChange('failed')}
      >
        <RoomEditor {...props} document={document} />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  );
}
