import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    const { id_aluno, id_personal, status } = await req.json();

    if (!id_aluno || !id_personal || !status) {
      return json({ error: "Informe id_aluno, id_personal e status." }, 400);
    }

    const supabase = createClient(
      getEnvAny(["SUPABASE_URL", "URL"]),
      getEnvAny(["SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY"]),
    );

    const { data: aluno, error: alunoError } = await supabase
      .from("alunos")
      .select("fcm_token")
      .eq("id_aluno", id_aluno)
      .single();

    if (alunoError) {
      throw alunoError;
    }

    if (!aluno?.fcm_token) {
      return json({ sent: false, reason: "Aluno sem fcm_token." });
    }

    const { data: personal } = await supabase
      .from("personal")
      .select("nome")
      .eq("id_personal", id_personal)
      .single();

    const nomePersonal = personal?.nome ?? "Seu personal";
    const aceita = status === "aceita";
    const title = aceita ? "Solicitação aceita" : "Solicitação recusada";
    const body = aceita
      ? `${nomePersonal} aceitou sua solicitação de vínculo.`
      : `${nomePersonal} recusou sua solicitação de vínculo.`;

    await sendFcmMessage(aluno.fcm_token, {
      title,
      body,
      status: String(status),
      id_aluno: String(id_aluno),
      id_personal: String(id_personal),
    });

    return json({ sent: true });
  } catch (error) {
    console.error(error);
    return json({ error: String(error?.message ?? error) }, 500);
  }
});

async function sendFcmMessage(
  token: string,
  data: {
    title: string;
    body: string;
    status: string;
    id_aluno: string;
    id_personal: string;
  },
) {
  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const accessToken = await getFirebaseAccessToken();

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: data.title,
            body: data.body,
          },
          data: {
            type: "link_response",
            title: data.title,
            body: data.body,
            status: data.status,
            id_aluno: data.id_aluno,
            id_personal: data.id_personal,
          },
          android: {
            priority: "HIGH",
            notification: {
              channel_id: "solicitacoes_vinculo",
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function getFirebaseAccessToken() {
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(getEnv("FIREBASE_PRIVATE_KEY"));
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const unsignedJwt = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = await signJwt(unsignedJwt, privateKey);
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();
  return json.access_token as string;
}

async function signJwt(unsignedJwt: string, privateKeyPem: string) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedJwt),
  );

  return base64Url(new Uint8Array(signature));
}

function normalizePrivateKey(value: string) {
  let privateKey = value.trim();

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }

  privateKey = privateKey
    .replace(/^private_key\s*[:=]\s*/i, "")
    .replace(/^"private_key"\s*:\s*"/i, "")
    .replace(/",?$/i, "")
    .replaceAll("\\n", "\n");

  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error("FIREBASE_PRIVATE_KEY deve conter BEGIN PRIVATE KEY e END PRIVATE KEY.");
  }

  return privateKey;
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    throw new Error("FIREBASE_PRIVATE_KEY contem caracteres invalidos.");
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function base64UrlJson(value: unknown) {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Variável ${name} não configurada.`);
  }
  return value;
}

function getEnvAny(names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name);
    if (value) {
      return value;
    }
  }

  throw new Error(`Configure uma destas variáveis: ${names.join(", ")}.`);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
