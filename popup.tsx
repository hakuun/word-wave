import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { CEFR_LEVELS } from "~constants"
import type { UserConfig } from "~types"

function IndexPopup() {
  const storage = new Storage()
  const [config, setConfig] = useState<UserConfig>({
    CEFR: CEFR_LEVELS[1]
  })

  useEffect(() => {
    storage.get<UserConfig>("userConfig").then((config) => {
      setConfig(config)
    })
  }, [])

  return (
    <div
      style={{
        padding: 16
      }}>
      CEFR:{config.CEFR}
    </div>
  )
}

export default IndexPopup
