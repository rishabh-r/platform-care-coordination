import { marked } from 'marked';

export function simpleMarkdown(text) {
  const parsed = marked.parse(text || '');
  return parsed.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

export function extractChartData(text) {
  const match = text.match(/\[CHART:(\{[\s\S]*?\})\]/);
  if (!match) return { cleanText: text, chartData: null };
  try {
    return { cleanText: text.replace(match[0], '').trim(), chartData: JSON.parse(match[1]) };
  } catch (e) {
    return { cleanText: text.replace(match[0], '').trim(), chartData: null };
  }
}

export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDisplayName(raw) {
  let name = raw.includes('@') ? raw.split('@')[0] : raw;
  name = name.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
