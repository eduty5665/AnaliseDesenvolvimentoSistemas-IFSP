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

    const { id_aluno, id_personal, nome_treino, dificuldade, observacao } = await req.json();

    if (!id_aluno || !id_personal) {
      return json({ error: "Informe id_aluno e id_personal." }, 400);
    }

    const supabase = createClient(
      getEnvAny(["SUPABASE_URL", "URL"]),
      getEnvAny(["SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY"]),
    );

    const { data: personal, error: personalError } = await supabase
      .from("personal")
      .select("fcm_token")
      .eq("id_personal", id_personal)
      .single();

    if (personalError) {
      throw personalError;
    }

    if (!personal?.fcm_token) {
      return json({ sent: false, reason: "Personal sem fcm_token." });
    }

    const { data: aluno, error: alunoError } = await supabase
      .from("alunos")
      .select("nome")
      .eq("id_aluno", id_aluno)
      .single();

    if (alunoError) {
      throw alunoError;
    }

    const nomeAluno = aluno?.nome ?? "Um aluno";
    const nomeTreino = nome_treino || "treino";
    const obs = observacao ? ` Observação: ${observacao}` : "";
    const title = "Treino finalizado";
    const body = `${nomeAluno} finalizou ${nomeTreino}. Dificuldade: ${dificuldade ?? "-"}/10.${obs}`;

    await sendFcmMessage(personal.fcm_token, {
      type: "workout_finished",
      title,
      body,
      nome_aluno: String(nomeAluno),
      nome_treino: String(nomeTreino),
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
    type: string;
    title: string;
    body: string;
    nome_aluno: string;
    nome_treino: string;
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
          data,
          android: {
            priority: "HIGH",
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

  const unsignedJwt = `${base64UrlJson({ alg: "RS256", typ: "JWT" })}.${base64UrlJson({
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })}`;
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

  return (await response.json()).access_token as string;
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
  const privateKey = value.trim().replaceAll("\\n", "\n");
  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error("FIREBASE_PRIVATE_KEY inválida.");
  }
  return privateKey;
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

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
