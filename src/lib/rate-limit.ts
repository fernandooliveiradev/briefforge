import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRule {
  limit: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();

  return forwardedFor || realIp || 'local';
}

function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}

export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    memoryStore.set(key, { count: 1, resetAt });

    return {
      ok: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      resetAt,
    };
  }

  current.count += 1;

  return {
    ok: current.count <= rule.limit,
    limit: rule.limit,
    remaining: rule.limit - current.count,
    resetAt: current.resetAt,
  };
}

export function rateLimitRequest(
  request: Request,
  scope: string,
  rule: RateLimitRule
): RateLimitResult {
  return checkRateLimit(`${scope}:${getClientId(request)}`, rule);
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.',
      code: 'rate_limited',
    },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(result),
        'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
      },
    }
  );
}

export function withRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  const headers = rateLimitHeaders(result);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export function limitLogin(request: NextRequest): RateLimitResult {
  return rateLimitRequest(request, 'login', { limit: 8, windowMs: 15 * 60 * 1000 });
}

export function limitProjectRead(request: Request): RateLimitResult {
  return rateLimitRequest(request, 'project-read', { limit: 120, windowMs: 60 * 1000 });
}

export function limitProjectMutation(request: Request): RateLimitResult {
  return rateLimitRequest(request, 'project-mutation', { limit: 30, windowMs: 60 * 1000 });
}

export function limitAiGeneration(request: Request): RateLimitResult {
  return rateLimitRequest(request, 'ai-generation', { limit: 6, windowMs: 60 * 60 * 1000 });
}

export function limitPublicShare(request: Request): RateLimitResult {
  return rateLimitRequest(request, 'public-share', { limit: 120, windowMs: 60 * 1000 });
}
