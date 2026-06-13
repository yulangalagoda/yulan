import { fetchSiteData } from '@/lib/notion';
import { renderLlmsTxt } from '@/lib/agent-content';

// Force static generation; the Notion fetch happens at build time and the
// rendered markdown is emitted as out/llms.txt by `output: 'export'`.
export const dynamic = 'force-static';

export async function GET() {
  const data = await fetchSiteData();
  return new Response(renderLlmsTxt(data), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
