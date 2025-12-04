export class TokenClassify {
  private readonly BASE_URL = "http://127.0.0.1:8000"

  public async segment(text: string) {
    const url = `${this.BASE_URL}/segment`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    const json = await response.json()
    return json
  }

  public async align({
    source_sentence,
    target_sentence
  }: {
    source_sentence: string[]
    target_sentence: string[]
  }) {
    const url = `${this.BASE_URL}/align`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_sentence, target_sentence })
    })
    const json = await response.json()
    return json
  }
}
