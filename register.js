import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { stamps } from "./stamps.js";
import "dotenv/config";

const commands = [
	...stamps.map(stamp =>
		new SlashCommandBuilder()
			.setName(stamp.name)
			.setDescription(stamp.description)
			.toJSON()
	),

	new SlashCommandBuilder()
		.setName("らんだむ")
		.setDescription("ランダムにスタンプを表示します")
		.toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

try {
	console.log("コマンドを登録しています...");

	await rest.put(
		Routes.applicationCommands(process.env.APPLICATION_ID),
		{
			body: commands
		}
	);

	console.log("コマンド登録完了！");
}
catch (error) {
	console.error(error);
}