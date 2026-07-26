// src/services/consultaIA.js
import { supabase } from "../supabaseClient";

export const AI_CONSULTAS_ENDPOINT =
  process.env.REACT_APP_AI_CONSULTAS_ENDPOINT ||
  "https://eaxaxvnfllukoflzuxcq.supabase.co/functions/v1/ai-consultas";

export const isHSLike = (s) => /^\d{6,10}$/.test(String(s || "").trim());

export async function callAiConsultas(payload) {
  const { data: sess } = await supabase.auth.getSession();
  const jwt = sess?.session?.access_token;

  const res = await fetch(AI_CONSULTAS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json = {};

  try {
    json = JSON.parse(text);
  } catch {}

  if (!res.ok) {
    if (json?.error === "PREMIUM_ONLY") {
      throw new Error("Esta función es solo para usuarios premium.");
    }

    if (json?.error === "INSUFFICIENT_QUOTA") {
      throw new Error("La IA está sin cupo temporalmente. Intenta más tarde.");
    }

    throw new Error(json?.error || text || `HTTP ${res.status}`);
  }

  return json;
}

export async function getTopConsumers(hsCode) {
  return callAiConsultas({
    mode: "top_consumers",
    hs_code: hsCode,
  });
}

export async function getRequirements({ hsCode, originCountry, destinationCountry }) {
  return callAiConsultas({
    mode: "requirements",
    hs_code: hsCode,
    origin_country: originCountry,
    destination_country: destinationCountry,
  });
}

export async function getBuyers({ hsCode, destinationCountry }) {
  return callAiConsultas({
    mode: "buyers",
    hs_code: hsCode,
    destination_country: destinationCountry,
  });
}