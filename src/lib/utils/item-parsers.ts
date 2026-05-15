/** description_markup의 ## 섹션을 파싱 */
export function parseDescriptionSections(markup: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const parts = markup.split(/^##\s+/m);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) {
      sections.push({ title: trimmed, content: "" });
    } else {
      sections.push({
        title: trimmed.slice(0, newlineIdx).trim(),
        content: trimmed.slice(newlineIdx + 1).trim(),
      });
    }
  }
  return sections;
}

/** aiCookingUsage의 "- **key**: value" 패턴 파싱 */
export function parseCookingUsage(text: string): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  const regex = /[-•]?\s*\*\*([^*]+)\*\*\s*[:：]\s*([^\n\-•]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    result.push({ key: match[1].trim(), value: match[2].trim() });
  }
  return result;
}
