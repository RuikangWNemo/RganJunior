import { createSecretSupabaseClient } from '../supabase.js';

export interface CollaborationRpcError {
  code?: string;
  message: string;
}

export interface CollaborationRpcResponse {
  data: unknown;
  error: CollaborationRpcError | null;
}

export interface CollaborationRpcClient {
  rpc(
    functionName: string,
    parameters?: Record<string, unknown>,
  ): Promise<CollaborationRpcResponse>;
}

export function createCollaborationRpcClient(): CollaborationRpcClient {
  return createSecretSupabaseClient() as unknown as CollaborationRpcClient;
}

export async function callCollaborationRpc(
  client: CollaborationRpcClient,
  functionName: string,
  parameters: Record<string, unknown>,
): Promise<unknown> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error) {
    const failure = new Error(error.message);
    Object.assign(failure, { code: error.code ?? 'COLLABORATION_RPC_FAILED' });
    throw failure;
  }
  return data;
}

export function firstRpcRow(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === 'object'
    ? candidate as Record<string, unknown>
    : null;
}
