import {
  verifyKey,
  InteractionType,
  InteractionResponseType
} from "discord-interactions";

import { GITHUB_BASE, stamps } from "./stamps.js";

async function fetchImage(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`画像取得失敗: ${response.status}`);
	}

	return response.arrayBuffer();
}

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
	//ランダム処理
	if (interaction.data.name === "らんだむ") {
		const stamp = stamps[Math.floor(Math.random() * stamps.length)];
		const imageUrl = GITHUB_BASE + encodeURIComponent(stamp.file);
		
		return Response.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: imageUrl
			}
		});
	}
	if (interaction.data.name === "検索") {
		
		const method = interaction.data.options.find(
			option => option.name === "方法"
		).value;

		const value = interaction.data.options.find(
			option => option.name === "内容"
		).value.toLowerCase();

		let result = [];

		if (method === "word") {

			result = stamps.filter(stamp => {

				if (stamp.name.toLowerCase().includes(value)) {
					return true;
				}

				if (stamp.aliases?.some(alias =>
					alias.toLowerCase().includes(value)
				)) {
					return true;
				}

				return false;
			});
		}
		else if (method === "tag") {

			result = stamps.filter(stamp =>
				stamp.tags?.some(tag =>
					tag.toLowerCase().includes(value)
				)
			);
		}

	if (result.length === 0) {

		return Response.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "該当するスタンプは見つかりませんでした。"
			}
		});
	}

	return Response.json({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content:
				"検索結果\n\n" +
				result.map(stamp => `・${stamp.name}`).join("\n")
		}
	});
}
	// スタンプ送付処理
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		const stamp = stamps.find(s => s.name === interaction.data.name);
		
		if (stamp) {
			const imageUrl = GITHUB_BASE + encodeURIComponent(stamp.file);
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