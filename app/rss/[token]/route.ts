import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_USER_ID, getPublicBaseUrl, getRssToken } from "@/lib/config";
import { listSnapshots } from "@/lib/storage";
import { escapeXml } from "@/lib/utils";

export const runtime = "nodejs";

type RssRouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(request: NextRequest, context: RssRouteContext) {
  const expectedToken = getRssToken();
  const { token } = await context.params;

  if (!expectedToken || token !== expectedToken) {
    return new NextResponse("Not found", { status: 404 });
  }

  const categorySlug = request.nextUrl.searchParams.get("category") ?? undefined;
  const snapshots = await listSnapshots(DEFAULT_USER_ID, { categorySlug });
  const baseUrl = getPublicBaseUrl();
  const feedUrl = `${baseUrl}/rss/${encodeURIComponent(token)}`;
  const latestDate = snapshots[0]?.updatedAt ?? new Date().toISOString();

  const items = snapshots
    .slice(0, 50)
    .map((snapshot) => {
      const link = snapshot.sourceUrl ?? new URL(snapshot.imageUrl, baseUrl).toString();
      const imageUrl = new URL(snapshot.imageUrl, baseUrl).toString();
      const topics = snapshot.topics.length ? `<p>Topics: ${escapeXml(snapshot.topics.join(", "))}</p>` : "";

      return `
        <item>
          <title>${escapeXml(snapshot.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="false">${escapeXml(snapshot.id)}</guid>
          <pubDate>${new Date(snapshot.updatedAt).toUTCString()}</pubDate>
          <category>${escapeXml(snapshot.categoryName)}</category>
          <description><![CDATA[
            <p>${escapeXml(snapshot.summary)}</p>
            ${topics}
            <p>Last updated: ${escapeXml(new Date(snapshot.updatedAt).toUTCString())}</p>
            <p>Source confidence: ${escapeXml(snapshot.sourceConfidence)}</p>
            <p><img src="${escapeXml(imageUrl)}" alt="Screenshot preview" /></p>
          ]]></description>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Private Screenshot Feed</title>
        <link>${escapeXml(baseUrl)}</link>
        <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
        <description>Factual private feed generated from phone screenshots.</description>
        <lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new NextResponse(xml.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "private, no-store"
    }
  });
}
