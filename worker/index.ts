export interface Env {
  BACKEND_UPSTREAM: string;
  PRIMARY_DOMAIN: string;
  REDIRECT_MODE?: string;
}

function getRedirectStatus(value?: string): 301 | 302 | 307 | 308 {
  const parsed = Number(value);
  if (parsed === 301 || parsed === 302 || parsed === 307 || parsed === 308) {
    return parsed;
  }
  return 301;
}

function buildUpstreamUrl(origin: string, path: string, search: string): URL {
  const url = new URL(origin);
  url.pathname = path;
  url.search = search;
  return url;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);
    const primaryDomain = env.PRIMARY_DOMAIN?.trim().toLowerCase();
    const upstreamOrigin = env.BACKEND_UPSTREAM?.trim();
    const redirectStatus = getRedirectStatus(env.REDIRECT_MODE);

    if (!primaryDomain || !upstreamOrigin) {
      return new Response("Missing required worker configuration.", {
        status: 500,
      });
    }

    const hostname = requestUrl.hostname.toLowerCase();

    if (hostname !== primaryDomain) {
      const redirectUrl = new URL(request.url);
      redirectUrl.protocol = "https:";
      redirectUrl.hostname = primaryDomain;
      redirectUrl.port = "";

      return Response.redirect(redirectUrl.toString(), redirectStatus);
    }

    const upstreamUrl = buildUpstreamUrl(
      upstreamOrigin,
      requestUrl.pathname,
      requestUrl.search,
    );

    const upstreamHeaders = new Headers(request.headers);

    // Standard hop-by-hop headers as per RFC 7230
    const hopByHopHeaders = [
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailers",
      "transfer-encoding",
      "upgrade",
    ];

    // Headers listed in the 'Connection' header are also hop-by-hop
    const connectionHeader = request.headers.get("connection");
    if (connectionHeader) {
      for (const header of connectionHeader.split(",")) {
        hopByHopHeaders.push(header.trim().toLowerCase());
      }
    }

    // Sensitive headers that should not be forwarded
    const sensitiveHeaders = ["cookie", "authorization"];

    const headersToStrip = [...hopByHopHeaders, ...sensitiveHeaders];

    for (const header of headersToStrip) {
      upstreamHeaders.delete(header);
    }

    upstreamHeaders.set("host", new URL(upstreamOrigin).hostname);
    upstreamHeaders.set("x-forwarded-host", requestUrl.hostname);
    upstreamHeaders.set(
      "x-forwarded-proto",
      requestUrl.protocol.replace(":", ""),
    );

    const upstreamRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "manual",
    });

    return fetch(upstreamRequest, {
      redirect: "manual",
    });
  },
};
