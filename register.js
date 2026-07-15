import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { stamps } from "./stamps.js";
import "dotenv/config";

const commands = [];

for (const stamp of stamps) {

	// メインコマンド
	commands.push(
		new SlashCommandBuilder()
			.setName(stamp.name)
			.setDescription(stamp.description)
			.toJSON()
	);

	// エイリアス
	/*if (stamp.aliases) {

		for (const alias of stamp.aliases) {

			commands.push(
				new SlashCommandBuilder()
					.setName(alias)
					.setDescription(`${stamp.name} の別名`)
					.toJSON()
			);
		}
	}*/
}

// ランダム
commands.push(
	new SlashCommandBuilder()
		.setName("らんだむ")
		.setDescription("ランダムにスタンプを表示します")
		.toJSON()
);
// 検索
commands.push(
	new SlashCommandBuilder()
		.setName("検索")
		.setDescription("スタンプを検索します")
		.addStringOption(option =>
			option
				.setName("ことば")
				.setDescription("検索する文字")
				.setRequired(true)
		)
		.toJSON()
);

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