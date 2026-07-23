import type { App } from "@slack/bolt"
import { getTotalTicketsCount } from "../db/queries/ticketMetrics.js"
import { config } from "../config/env.js"

export function homeTab(app: App): void {
    app.event("app_home_opened", async ({ event, client }) => {

        const metrics = await getTotalTicketsCount()
        const ticketCount = metrics?.total_tickets

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
                                text: `:tuna-bot: Total de Tickets: ${ticketCount} `,
                                emoji: true,
                            },
                        },
                        {
                            type: "divider",
                        },
                    ],
                },
            })
        } catch (error: any) {
            console.error("Erro ao publicar a Home Tab:", error.message)
        }
    })
}