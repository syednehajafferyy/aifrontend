import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

// Simple robust CSV parser for scraper output
function parseCSV(csvText: string): Array<Record<string, string>> {
  if (!csvText || !csvText.trim()) return [];
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && csvText[i + 1] === "\n") i++;
      lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length === 0) return [];

  const parseRow = (rowStr: string): string[] => {
    const cells: string[] = [];
    let currentCell = "";
    let insideQuote = false;

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        if (insideQuote && rowStr[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === "," && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const rowValues = parseRow(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      let val = rowValues[idx] || "";
      val = val.replace(/^"|"$/g, "").trim();
      rowObj[header] = val;
    });
    results.push(rowObj);
  }

  return results;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const scraperBaseUrl = (
      process.env.SCRAPER_URL ||
      process.env.GOOGLE_MAPS_SCRAPER_URL ||
      process.env.SCRAPER_BASE_URL ||
      "http://localhost:8080"
    ).replace(/\/$/, "");

    // 1. Query job status from scraper
    const pollRes = await fetch(`${scraperBaseUrl}/api/v1/jobs/${jobId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!pollRes.ok) {
      return NextResponse.json(
        { error: `Scraper API returned HTTP ${pollRes.status} for job ${jobId}` },
        { status: pollRes.status, headers: corsHeaders }
      );
    }

    const pollData = await pollRes.json();
    const status = (pollData.Status || pollData.status || "").toLowerCase();

    if (status === "working") {
      return NextResponse.json(
        {
          success: true,
          status: "working",
          jobId: jobId,
          message: "Scraping in progress...",
        },
        { headers: corsHeaders }
      );
    }

    if (status === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          jobId: jobId,
          error: "The Google Maps scraper job failed. Google rate limits or IP blocks may be active.",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    if (status === "ok") {
      // 2. Download CSV results
      const downloadRes = await fetch(`${scraperBaseUrl}/api/v1/jobs/${jobId}/download`, {
        method: "GET",
        cache: "no-store",
      });

      if (!downloadRes.ok) {
        return NextResponse.json(
          { error: "Failed to download results from scraper backend." },
          { status: 500, headers: corsHeaders }
        );
      }

      const csvText = await downloadRes.text();
      const rawRows = parseCSV(csvText);

      // Clean core lead fields
      const leads = rawRows.map((r) => ({
        title: r.title || r.name || "N/A",
        category: r.category || "",
        address: r.address || r.complete_address || "",
        phone: r.phone || "",
        website: r.website || "",
        review_rating: r.review_rating || r.rating || "",
        review_count: r.review_count || r.reviews || "",
        emails: r.emails || r.email || "",
        link: r.link || r.maps_url || "",
        instagram: r.instagram || "",
        facebook: r.facebook || "",
        linkedin: r.linkedin || "",
      }));

      return NextResponse.json(
        {
          success: true,
          status: "ok",
          jobId: jobId,
          total: leads.length,
          leads: leads,
        },
        { headers: corsHeaders }
      );
    }

    // Default status fallback
    return NextResponse.json(
      {
        success: true,
        status: status || "unknown",
        jobId: jobId,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Scrape Job Status Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while checking job status." },
      { status: 500, headers: corsHeaders }
    );
  }
}
