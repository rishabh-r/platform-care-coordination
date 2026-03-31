export const config = { runtime: 'edge' };

const AZURE_ENDPOINT = 'https://care-coordination-project.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();

    const azureRes = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': process.env.AZURE_OPENAI_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!azureRes.ok) {
      const errText = await azureRes.text();
      return new Response(errText, {
        status: azureRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(azureRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
