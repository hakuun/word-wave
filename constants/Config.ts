import type { UserConfig } from "~types"

import { MAJOR_LLM_PROVIDERS } from "./LLMProvider"

export const USER_CONFIG_KEY = "USER_CONFIG_KEY"

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

export const DEFAULT_CONFIG: UserConfig = {
  CEFR: CEFR_LEVELS[0],
  modelCompany: MAJOR_LLM_PROVIDERS[0].company,
  model: MAJOR_LLM_PROVIDERS[0].models[0]
}
