import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKlATLMfu3WirHZTBqujJ58plGcJzW8ZI4I9ut609T-rsleKxGeKqGOZsKgIZvV32h/execT";

    // Server-to-server requests don't care about browser CORS
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({ email }),
    });

    const result = await googleResponse.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Backend signup error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
