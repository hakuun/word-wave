import type { PlasmoMessaging } from "@plasmohq/messaging"

import { OpenAICaller } from "~lib"
import { getUserConfig } from "~utils"

const systemPrompt = `
   The user will provide Chinese text and their CEFR level. Please extract the words that match the user's CEFR level and CEFR level + 1, and provide a context-appropriate translation, along with the corresponding CEFR level, a brief but helpful explanation, and the Chinese meaning of the explanation. Output the translation in JSON format.

Example Input:

Chinese: 我很乐意提供帮助. CEFR: A2.

Example JSON output (e.g., ... indicates omission; the actual response should be returned as required):

[
{
"original_text": "乐意",
"translation": "to be willing; to be happy to",
"CEFR_level": "B1",
"explanation": "Expresses a strong willingness or pleasure in doing something. "
"explanation_translation":"表示对做某事有强大意或愉感."
},

{
"original_text": "提供",
"translation": "to offer; to provide; to supply",
"CEFR_level": "A2",
...
},
{
...
}
]
    `

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const config = await getUserConfig()
  const openAICaller = new OpenAICaller({
    ...config,
    systemPrompt
  })

  const { CEFR, text } = req.body

  const message = await openAICaller.call(`Chinese: ${text} CEFR: ${CEFR}`)

  res.send({ message })
}

export default handler
