import { marked } from 'marked';

export function simpleMarkdown(text) {
  const parsed = marked.parse(text || '');
  return parsed.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

export function extractChartData(text) {
  const charts = [];
  let cleanText = text;
  const regex = /\[CHART:(\{[^[\]]*\})\]/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    try { charts.push(JSON.parse(m[1])); } catch (e) {}
  }
  cleanText = cleanText.replace(/\[CHART:\{[^[\]]*\}\]/g, '').trim();
  if (!charts.length) return { cleanText, chartData: null, allCharts: null };
  return { cleanText, chartData: charts[0], allCharts: charts };
}

export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDisplayName(raw) {
  let name = raw.includes('@') ? raw.split('@')[0] : raw;
  name = name.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
