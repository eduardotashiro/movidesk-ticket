import dotenv from "dotenv"
dotenv.config()


 export function homeTab (app){
 app.event("app_home_opened", async ({ event, client }) => {
   try {
  await client.views.publish({
  user_id: event.user,
  view: {
    type: "home",
    blocks: [
      {
        type: "image",
        image_url: process.env.HOME_BANNER_URL,
        alt_text: "Banner principal",
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text:  `📊 Total de Tickets criados: 780 `, //${ticketCount}
          emoji: true,
        },
      },
      {
        type: "divider",
      },
    ],
  },
});
  } catch (error) {
    console.error("Erro ao atualizar Home Tab:", error);
  }
})}
