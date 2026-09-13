export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in model output");
  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

export function langBlock(locale: "en" | "pl", kind: "council" | "ask"): string {
  if (locale === "pl") {
    return kind === "council"
      ? "JĘZYK OBOWIĄZKOWY: tezy, podsumowania i pola why pisz PO POLSKU, prostym językiem. Tickerów (META, BTC) nie tłumacz. Zakazany żargon: tape, wire, floor, probe, fills, heurystyki, quorum, lastCouncil, livePx, RSI, SMA20 — zamiast tego: notowania, wiadomości, rada, mała pozycja, transakcje, portfel, cena na żywo, średnia. Damian NIE głosuje na spółkę. Nie mów VIX/DXY — mów zmienność i dolar."
      : "JĘZYK OBOWIĄZKOWY: pole text w CAŁOŚCI PO POLSKU. Mów jak starszy kolega z biurka, nie jak terminal i nie jak czatbot. Dwa akapity, nie więcej. Żadnego zdania-hasła w osobnej linijce. Jeśli P&L koło zera: „praktycznie na zero”, nigdy „+0,0%”. Tickerów nie tłumacz. Zakazany żargon (tape, clip, rvol, RSI, SMA, livePx, quorum). Wolno jedną cenę albo jeden procent jako kolor. Zero angielskich sloganów.";
  }
  return "LANGUAGE: English. Keep ticker symbols as-is.";
}

export async function agentChat(
  system: string,
  user: string,
  maxTokens: number,
  opts?: { timeoutMs?: number; temperature?: number },
): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available in this environment");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(opts?.timeoutMs ?? 12_000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: opts?.temperature ?? 0.35,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return body.choices?.[0]?.message?.content ?? "";
}

export function hasXaiKey() {
  return Boolean(process.env.XAI_API_KEY);
}
