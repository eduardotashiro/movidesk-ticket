import { showMetrics } from "../db/dbQueries.js"
import {config} from "../config/env.js"

export function homeTab(app) {
  app.event("app_home_opened", async ({ event, client }) => {

    const metrics = await showMetrics()
    const ticketCount= metrics.total_tickets

    try {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: [
            {
              type: "image",
              image_url: config.slack.bannerHome,
              alt_text: "Banner principal",
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `:tuna-bot: Total de Tickets criados: ${ticketCount} `, //${ticketCount} <- sabia que um dia iria te usar 
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
      console.warn("Opa, não conseguimos baixar o banner, mas relaxa, não vai crashar");
    }
  })
}
