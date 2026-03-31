import { OPENAI_MODEL } from '../config/constants';
import { TOOLS } from '../config/tools';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function sendToOpenAI(messages, onTextChunk = null, onRetryWait = null, retryCount = 0) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      stream: true
    })
  });

  if (res.status === 429 && retryCount < 3) {
    const errText = await res.text();
    let waitMs = 12000;
    try {
      const errJson = JSON.parse(errText);
      const msg = errJson.error?.message || '';
      const match = msg.match(/try again in (\d+\.?\d*)s/i);
      if (match) waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
    } catch (e) {}
    const waitSec = Math.ceil(waitMs / 1000);
    if (onRetryWait) onRetryWait(waitSec);
    await sleep(waitMs);
    if (onRetryWait) onRetryWait(0);
    return sendToOpenAI(messages, onTextChunk, onRetryWait, retryCount + 1);
  }

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `API error (${res.status})`;
    try { const errJson = JSON.parse(errText); errMsg = errJson.error?.message || errMsg; } catch (e) {}
    throw new Error(errMsg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  const toolCallsMap = {};
  let finishReason = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') { finishReason = finishReason || 'stop'; continue; }
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const choice = parsed.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta;
        if (delta?.content) {
          fullContent += delta.content;
          if (onTextChunk) onTextChunk(delta.content);
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallsMap[idx]) {
              toolCallsMap[idx] = { id: '', type: 'function', function: { name: '', arguments: '' } };
            }
            if (tc.id) toolCallsMap[idx].id += tc.id;
            if (tc.function?.name) toolCallsMap[idx].function.name += tc.function.name;
            if (tc.function?.arguments) toolCallsMap[idx].function.arguments += tc.function.arguments;
          }
        }
      } catch (e) {}
    }
  }

  const toolCallsList = Object.values(toolCallsMap);
  return {
    content: fullContent || null,
    tool_calls: toolCallsList.length ? toolCallsList : null,
    finish_reason: finishReason || (toolCallsList.length ? 'tool_calls' : 'stop')
  };
}
