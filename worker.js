import {
  verifyKey,
  InteractionType,
  InteractionResponseType
} from "discord-interactions";

const imageMap = {
  'あ'           : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/あ？.png',
  'いいとおもう' : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/それいけ.png',
  'おーまい'     : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/おーまい.png',
  'おはよう'     : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/おはよう.png',
  'おとななのに' : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/おとななのに.png',
  'くさ'         : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/くさ.png',
  'さいあく'     : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/さいあく.png',
  'なきました'   : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/なきました.png',
  'にこ'         : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/にこっ.png',
  'もてない'     : 'https://raw.githubusercontent.com/tannbono/stamp-kun-workers/main/images/もてない.png',
};
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
	
		const imageUrl = imageMap[interaction.data.name];
	
		if (imageUrl) {
			return Response.json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [
						{
							image: {
								url: imageUrl
							}
						}
					]
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