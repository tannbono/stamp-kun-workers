import {
  verifyKey,
  InteractionType,
  InteractionResponseType
} from "discord-interactions";

import { GITHUB_BASE, imageMap } from "./imageMap.js";
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

    // Discordの接続確認(PING)
    if (interaction.type === InteractionType.PING) {
      return Response.json({
        type: InteractionResponseType.PONG
      });
    }

    // スラッシュコマンド
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
	
		const fileName = imageMap[interaction.data.name];
	
		if (fileName) {
			const imageUrl = GITHUB_BASE + encodeURIComponent(fileName);
			return Response.json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: imageUrl
				}
			});
		}
		return Response.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "未実装のコマンドです。"
			}
		});
	}

    return new Response("OK");
  }
};