import { useMemo } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  CEFR_LEVELS,
  DEFAULT_CONFIG,
  MAJOR_LLM_PROVIDERS,
  USER_CONFIG_KEY
} from "~constants"
import type { UserConfig } from "~types"

function IndexPopup() {
  const [config, setConfig] = useStorage<UserConfig>(
    USER_CONFIG_KEY,
    DEFAULT_CONFIG
  )

  const models = useMemo(
    () =>
      MAJOR_LLM_PROVIDERS.find(
        (model) => model.company === config?.modelCompany
      )?.models || [],
    [config?.modelCompany]
  )

  return (
    <div
      style={{
        padding: 16
      }}>
      <select
        value={config?.CEFR}
        onChange={(e) => setConfig({ ...config, CEFR: e.target.value })}>
        {CEFR_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <select
        value={config?.modelCompany}
        onChange={(e) => {
          const modelCompany = e.target.value
          const provider = MAJOR_LLM_PROVIDERS.find(
            (model) => model.company === modelCompany
          )
          if (!provider) return
          const models =
            MAJOR_LLM_PROVIDERS.find((model) => model.company === modelCompany)
              ?.models || []
          const baseURL = provider.baseUrl
          setConfig({ ...config, modelCompany, model: models[0], baseURL })
        }}>
        {MAJOR_LLM_PROVIDERS.map((model) => (
          <option key={model.company} value={model.company}>
            {model.company}
          </option>
        ))}
      </select>
      {models.length > 0 && (
        <select
          value={config?.model}
          onChange={(e) => {
            console.log("model", e.target.value)
            setConfig({ ...config, model: e.target.value })
          }}>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      )}
      <input
        value={config?.apiKey}
        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
      />
    </div>
  )
}

export default IndexPopup
