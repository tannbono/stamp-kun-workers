const { Client, GatewayIntentBits, AttachmentBuilder, REST, Routes, SlashCommandBuilder } = require("discord.js");
const path = require("path");
const token = process.env.TOKEN;
const clientId = '1502001600456298526'; 

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});

// スラッシュコマンドの定義
const commands = [
  new SlashCommandBuilder().setName('あ').setDescription('ウェストリー・プリチェット「あ゛？」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('いいとおもう').setDescription('藍戸侑葵「いいと思う！」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('おーまい').setDescription('ソフィン・バリントン「オーマイブッダ……」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('おはよう').setDescription('ハルトヴィクベルト・シュヴァルツ「おはよう……」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('おとななのに').setDescription('立里子子子「オトナなのにそんなコトもわからないの～？」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('くさ').setDescription('臥紐笑「草」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('さいあく').setDescription('是頁勿「は～最悪 本っ当に最悪」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('なきました').setDescription('月下紐美「そのばん おなかが いたくて 泣きました」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('にこ').setDescription('示土会科「にこっ……」画像を送信').setDefaultMemberPermissions(null),
  new SlashCommandBuilder().setName('もてない').setDescription('トレアスレ・マギル「細かい事ばかり気にしているとモテないぜ？」画像を送信').setDefaultMemberPermissions(null),
].map(command => command.toJSON());

// コマンドと画像ファイルの対応
const imageMap = {
  'あ'         : 'あ？.png',
  'いいとおもう' : 'それいけ.png',
  'おーまい'     : 'おーまい.png',
  'おはよう'     : 'おはよう.png',
  'おとななのに' : 'おとななのに.png',
  'くさ'         : 'くさ.png',
  'さいあく'     : 'さいあく.png',
  'なきました'   : 'なきました.png',
  'にこ'         : 'にこっ.png',
  'もてない'     : 'もてない.png',
};

// スラッシュコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);
rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('コマンドを登録しました'))
  .catch(console.error);

client.on("clientReady", () => {
  console.log(`${client.user.tag} でログインしています。`);
});

// スラッシュコマンドの処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const filename = imageMap[interaction.commandName];
  if (filename) {
    await interaction.reply({
      files: [new AttachmentBuilder(path.join(__dirname, 'images', filename))]
    });
  }
});
//cd C:\Users\Kadota Terumi\Documents\プログラム\stamp-kun2
//git add .
//git commit -m "コードを修正"
//git commit -m "スタンプを追加"
//git push
client.login(token);
