# AI Providers

BriefForge supports OpenAI and DeepSeek through server-side environment variables. The creation screen lets the user choose the provider per briefing.

`AI_PROVIDER` only controls the default option selected in the UI. A briefing can still be generated with either provider when the matching API key is configured.

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

To make both options available, configure both `OPENAI_API_KEY` and `DEEPSEEK_API_KEY`. After changing provider variables, restart the Next.js server.

## Runtime Behavior

- The selected provider is sent with the briefing creation request.
- BriefForge saves the provider and model as `openai:model` or `deepseek:model` in the project record.
- Stage regeneration follows the provider saved on that briefing.
- If the selected provider has no API key or returns invalid data, the project or stage update is not persisted.

## Notes

- OpenAI uses Chat Completions with strict JSON Schema output.
- DeepSeek uses its OpenAI-compatible `POST /chat/completions` endpoint with JSON output mode.
- BriefForge validates the returned JSON before saving.

References:

- OpenAI API documentation: <https://platform.openai.com/docs>
- DeepSeek chat completion documentation: <https://api-docs.deepseek.com/api/create-chat-completion>
- DeepSeek cURL example: <https://api-docs.deepseek.com/api_samples/chat_curl>
