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

// Geocode helper via OpenStreetMap Nominatim
async function geocodePlace(query: string): Promise<{ lat: string; lon: string } | null> {
  try {
    const cleaned = query
      .replace(/^(find|search|scrape|get|show|fetch|list|all|companies|services|agencies|houses|shops|restaurants|dentists|doctors)\s+/i, "")
      .replace(/^(in|at|near|around)\s+/i, "")
      .trim();

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleaned || query)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "DevForge-LeadGen/1.0 (https://devforge.ai)" },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: String(data[0].lat), lon: String(data[0].lon) };
      }
    }
  } catch (err) {
    console.warn("Geocoding failed:", err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body.prompt || "").trim();
    const requestedDepth = body.depth ? Number(body.depth) : 5;

    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid lead search query (e.g. 'Find dentists in Karachi')." },
        { status: 400, headers: corsHeaders }
      );
    }

    const scraperBaseUrl = (
      process.env.GOOGLE_MAPS_SCRAPER_URL ||
      process.env.SCRAPER_BASE_URL ||
      "http://localhost:8080"
    ).replace(/\/$/, "");

    // 1. Check health of scraper service
    try {
      const healthRes = await fetch(`${scraperBaseUrl}/api/v1/jobs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!healthRes.ok && healthRes.status !== 200) {
        throw new Error(`Service returned HTTP ${healthRes.status}`);
      }
    } catch (err: any) {
      return NextResponse.json(
        {
          error: `Google Maps Scraper service is not reachable at ${scraperBaseUrl}. Please verify the scraper backend/Docker container is running.`,
        },
        { status: 503, headers: corsHeaders }
      );
    }

    // 2. Resolve coordinates
    let coords = await geocodePlace(prompt);
    if (!coords) {
      coords = { lat: "24.8607", lon: "67.0011" }; // Default Karachi center fallback
    }

    // 3. Create scrape job
    const jobPayload = {
      name: "devforge-lead-scrape",
      keywords: [prompt],
      lang: "en",
      zoom: 15,
      lat: coords.lat,
      lon: coords.lon,
      fast_mode: false,
      radius: 10000,
      depth: requestedDepth,
      email: true,
      max_time: 300,
    };

    const createRes = await fetch(`${scraperBaseUrl}/api/v1/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobPayload),
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to create scrape job: ${errText || createRes.statusText}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const createData = await createRes.json();
    const jobId = createData.id || createData.ID;

    if (!jobId) {
      return NextResponse.json(
        { error: "Scraper did not return a valid Job ID." },
        { status: 500, headers: corsHeaders }
      );
    }

    // 4. Poll until complete
    let completed = false;
    let pollCount = 0;
    const maxPolls = 40;

    while (!completed && pollCount < maxPolls) {
      pollCount++;
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const pollRes = await fetch(`${scraperBaseUrl}/api/v1/jobs/${jobId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (pollRes.ok) {
        const pollData = await pollRes.json();
        const status = (pollData.Status || pollData.status || "").toLowerCase();

        if (status === "ok") {
          completed = true;
          break;
        }
        if (status === "failed") {
          return NextResponse.json(
            { error: "The scraper job failed. Google rate limits or anti-bot blocks may be active." },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    }

    if (!completed) {
      return NextResponse.json(
        { error: "Scrape request timed out. Please try again with a narrower search." },
        { status: 504, headers: corsHeaders }
      );
    }

    // 5. Download results CSV
    const downloadRes = await fetch(`${scraperBaseUrl}/api/v1/jobs/${jobId}/download`, {
      method: "GET",
      cache: "no-store",
    });

    if (!downloadRes.ok) {
      return NextResponse.json(
        { error: "Failed to download scraped results from backend." },
        { status: 500, headers: corsHeaders }
      );
    }

    const csvText = await downloadRes.text();
    const rawRows = parseCSV(csvText);

    // Map rows to clean lead objects
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
        query: prompt,
        total: leads.length,
        leads: leads,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Scrape Leads Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while searching for leads." },
      { status: 500, headers: corsHeaders }
    );
  }
}
