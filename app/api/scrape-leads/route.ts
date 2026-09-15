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
    
    // Construct query from businessType + city or prompt
    let query = (body.prompt || "").trim();
    if (!query && body.businessType) {
      query = body.city ? `${body.businessType} in ${body.city}` : body.businessType;
    }

    const requestedDepth = body.depth ? Number(body.depth) : 5;

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid search query or business type and city." },
        { status: 400, headers: corsHeaders }
      );
    }

    const scraperBaseUrl = (
      process.env.SCRAPER_URL ||
      process.env.GOOGLE_MAPS_SCRAPER_URL ||
      process.env.SCRAPER_BASE_URL ||
      "http://localhost:8080"
    ).replace(/\/$/, "");

    // 1. Health check Docker scraper API
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
          error: `Docker Google Maps Scraper service is unreachable at ${scraperBaseUrl}. Check that the container and Cloudflare Tunnel are running.`,
        },
        { status: 503, headers: corsHeaders }
      );
    }

    // 2. Geocode query location
    let coords = await geocodePlace(query);
    if (!coords) {
      if (/lahore/i.test(query)) {
        coords = { lat: "31.5204", lon: "74.3587" };
      } else {
        coords = { lat: "24.8607", lon: "67.0011" };
      }
    }

    // 3. Create scrape job payload (conservative defaults: depth 5, max_time 300)
    const jobPayload = {
      name: "devforge-lead-scrape",
      keywords: [query],
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
        { error: `Failed to create scraper job: ${errText || createRes.statusText}` },
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

    // Return job ID immediately (asynchronous pattern)
    return NextResponse.json(
      {
        success: true,
        jobId: jobId,
        status: "working",
        query: query,
        message: "Scraping job created successfully.",
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Scrape Create Job Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while initiating scrape job." },
      { status: 500, headers: corsHeaders }
    );
  }
}
