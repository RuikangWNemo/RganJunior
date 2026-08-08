import { getFieldNoteCollaborationServer } from '../_lib/field-note-collaboration/runtime.js';

const collaborationServer = getFieldNoteCollaborationServer();

export default collaborationServer.httpServer;
