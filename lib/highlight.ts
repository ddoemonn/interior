import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["vitesse-light", "vitesse-dark"],
    langs: ["tsx", "ts", "bash", "css", "json"],
  });
  return highlighterPromise;
}

export type Lang = "tsx" | "ts" | "bash" | "css" | "json";

export async function highlight(code: string, lang: Lang = "tsx") {
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    // emit CSS variables for both themes; globals.css picks the side
    defaultColor: false,
  });
}
