# AI Providers

BriefForge supports OpenAI and DeepSeek through server-side environment variables. Only one provider is active per running server.

## OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com/v1
```

## DeepSeek

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

After changing provider variables, restart the Next.js server.

## Notes

- OpenAI uses Chat Completions with strict JSON Schema output.
- DeepSeek uses its OpenAI-compatible `POST /chat/completions` endpoint with JSON output mode.
- BriefForge validates the returned JSON before saving. If the provider fails or returns invalid data, the project is not persisted.

References:

- OpenAI API documentation: <https://platform.openai.com/docs>
- DeepSeek chat completion documentation: <https://api-docs.deepseek.com/api/create-chat-completion>
- DeepSeek cURL example: <https://api-docs.deepseek.com/api_samples/chat_curl>
