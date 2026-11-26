import {
  createCssVariablesTheme,
  createHighlighter,
  type Highlighter,
} from "shiki";

const theme = createCssVariablesTheme({
  name: "interior",
  variablePrefix: "--code-",
  variableDefaults: {},
  fontStyle: false,
});

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [theme],
    langs: ["tsx", "ts", "bash", "css", "json"],
  });
  return highlighterPromise;
}

export type Lang = "tsx" | "ts" | "bash" | "css" | "json";

export async function highlight(code: string, lang: Lang = "tsx") {
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code.trimEnd(), { lang, theme: "interior" });
}
