import { NextResponse } from 'next/server';
import { apiError, invalidRequestResponse } from '@/lib/api-response';

type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type') || '';
  return contentType.toLowerCase().includes('application/json');
}

export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<JsonBodyResult> {
  if (!hasJsonContentType(request)) {
    return {
      ok: false,
      response: invalidRequestResponse('Content-Type deve ser application/json.'),
    };
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      ok: false,
      response: apiError('Payload muito grande.', 413, 'payload_too_large'),
    };
  }

  if (!request.body) {
    return {
      ok: false,
      response: invalidRequestResponse(),
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return {
          ok: false,
          response: apiError('Payload muito grande.', 413, 'payload_too_large'),
        };
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const bodyText = new TextDecoder().decode(
      chunks.length === 1 ? chunks[0] : concatChunks(chunks, totalBytes)
    );

    return {
      ok: true,
      data: JSON.parse(bodyText),
    };
  } catch {
    return {
      ok: false,
      response: invalidRequestResponse(),
    };
  }
}

function concatChunks(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const merged = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}
