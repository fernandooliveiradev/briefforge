# AI Providers

BriefForge supports OpenAI, DeepSeek, and OpenRouter through server-side environment variables. The creation screen lets the user choose the provider per briefing.

`AI_PROVIDER` only controls the default option selected in the UI. A briefing can still be generated with any provider when the matching API key is configured.

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

## OpenRouter

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://your-site.example
OPENROUTER_APP_NAME=BriefForge
```

Free Gemma model options currently documented for this project:

- `google/gemma-4-26b-a4b-it:free`
- `google/gemma-4-31b-it:free`

BriefForge does not hardcode the OpenRouter model. It sends exactly the model slug configured in `OPENROUTER_MODEL`.

`OPENROUTER_SITE_URL` and `OPENROUTER_APP_NAME` are optional app attribution headers. They help OpenRouter identify the app, but generation works without them.

To make multiple options available, configure each matching key: `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, and/or `OPENROUTER_API_KEY`. After changing provider variables, restart the Next.js server.

## Runtime Behavior

- The selected provider is sent with the briefing creation request.
- BriefForge saves the provider and model as `openai:model`, `deepseek:model`, or `openrouter:model` in the project record.
- Stage regeneration follows the provider saved on that briefing.
- If the selected provider has no API key or returns invalid data, the project or stage update is not persisted.

## Notes

- OpenAI uses Chat Completions with strict JSON Schema output.
- DeepSeek uses its OpenAI-compatible `POST /chat/completions` endpoint with JSON output mode.
- OpenRouter uses its OpenAI-compatible `POST /chat/completions` endpoint with JSON output mode and optional app attribution headers.
- Free OpenRouter models may have provider-side rate limits or availability changes. If generation fails, try again later or switch `OPENROUTER_MODEL`.
- BriefForge validates the returned JSON before saving.

References:

- OpenAI API documentation: <https://platform.openai.com/docs>
- DeepSeek chat completion documentation: <https://api-docs.deepseek.com/api/create-chat-completion>
- DeepSeek cURL example: <https://api-docs.deepseek.com/api_samples/chat_curl>
- OpenRouter API reference: <https://openrouter.ai/docs/api/reference/overview>
- OpenRouter quickstart: <https://openrouter.ai/docs/quickstart>
