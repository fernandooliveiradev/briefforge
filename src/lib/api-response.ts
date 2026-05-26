import { NextResponse } from 'next/server';

export function apiError(message: string, status: number, code = 'request_failed'): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
}

export const unauthorizedResponse = () =>
  apiError('Acesso não autorizado.', 401, 'unauthorized');

export const notFoundResponse = (message = 'Recurso não encontrado.') =>
  apiError(message, 404, 'not_found');

export const invalidRequestResponse = (message = 'Parâmetros inválidos.') =>
  apiError(message, 400, 'invalid_request');
