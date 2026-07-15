import {
  verifyKey,
  InteractionType,
  InteractionResponseType
} from "discord-interactions";

import { GITHUB_BASE, stamps } from "./stamps.js";

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
			return new Response("Bad request signature.", { status: 401 });
		}

		const interaction = JSON.parse(body);

		// Discordの接続確認(PING)
		if (interaction.type === InteractionType.PING) {
			return Response.json({
				type: InteractionResponseType.PONG
			});
		}
		// オートコンプリート
		if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
			const options = interaction.data.options ?? [];
			const method = options.find(
				option => option.name === "方法"
			)?.value;

			const value = (
				options.find(option => option.name === "内容")?.value ?? ""
			).toLowerCase();

			let choices = [];

			if (method === "word") {
				const names = [];
				for (const stamp of stamps) {
					names.push(stamp.name);

					if (stamp.aliases) {
						names.push(...stamp.aliases);
					}
				}
				
				choices = [...new Set(names)]
					.filter(name =>
						name.toLowerCase().includes(value)
					);
			}
			
			else if (method === "tag") {
				const tags = [...new Set(
					stamps.flatMap(stamp => stamp.tags ?? [])
				)];
				choices = tags.filter(tag =>
					tag.toLowerCase().includes(value)
				);
			}
			
			return Response.json({
				type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
				data: {
					choices: choices
						.slice(0, 25)
						.map(choice => ({
							name: choice,
							value: choice
						}))
				}
			});
		}
		
		// ボタン処理
		if (interaction.type === InteractionType.MESSAGE_COMPONENT) {

			const customId = interaction.data.custom_id;

			if (customId.startsWith("stamp:")) {
				const stampName = customId.substring(6);
				const stamp = stamps.find(s => s.name === stampName);
				if (!stamp) {
					return Response.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "スタンプが見つかりません。"
						}
					});
				}

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
					content: "未実装のボタンです。"
				}
			});
		}
		
		
		if (interaction.type !== InteractionType.APPLICATION_COMMAND) { return new Response("OK");}
		const commandName = interaction.data.name;
		
		//ランダム処理
		if (commandName === "らんだむ") {
			const stamp = stamps[Math.floor(Math.random() * stamps.length)];
			const imageUrl = GITHUB_BASE + encodeURIComponent(stamp.file);
			
			return Response.json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: imageUrl,
					
					components: [{
						type: 1,
						components: [{
							type: 2,
							style: 2,
							label:  stamp.name,
							custom_id: `stamp:${stamp.name}`
						}]
					}]
				}
			});
		}
		//検索
		if (commandName === "検索"){
			
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
					content: `検索結果 ${result.length}件\nボタンを押すとスタンプが送信されます。`,

					components: [{
						type: 1,
						components: result.slice(0, 5).map(stamp => ({
							type: 2,
							style: 2,
							label: stamp.name,
							custom_id: `stamp:${stamp.name}`
						}))
					}]
				}
			});
		}
		// スタンプ送付処理
		const stamp = stamps.find( s => s.name === commandName );
		
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
};