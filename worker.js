import {
  verifyKey
} from "discord-interactions";

export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Discord Worker");
    }

    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");

    const body = await request.text();

    const isValid = await verifyKey(
      body,
      signature,
      timestamp,
      env.DISCORD_PUBLIC_KEY
    );

    if (!isValid) {
      return new Response("Bad request signature.", {
        status: 401
      });
    }

    const interaction = JSON.parse(body);

    // DiscordのPING
    if (interaction.type === 1) {
      return Response.json({
        type: 1
      });
    }

    return Response.json({
      type: 4,
      data: {
        content: "Cloudflareとの接続に成功しました！"
      }
    });
  }
};

