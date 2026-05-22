/**
 * Cloudflare Pages Function — homepage content negotiation.
 * When an AI agent requests the page with Accept: text/markdown,
 * serve llms.txt with Content-Type: text/markdown instead of HTML.
 * All other requests pass through to the static site as normal.
 */
export async function onRequest(context) {
  const accept = context.request.headers.get('Accept') || '';

  if (accept.includes('text/markdown')) {
    const mdUrl = new URL('/llms.txt', context.request.url);
    const asset = await context.env.ASSETS.fetch(mdUrl.toString());
    const text = await asset.text();

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Link': '<https://yulan.me/sitemap.xml>; rel="sitemap", <https://yulan.me/.well-known/api-catalog>; rel="api-catalog"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return context.next();
}
