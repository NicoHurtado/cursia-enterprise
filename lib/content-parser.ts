
export function parseTaggedContent(content: string): string {
  if (!content) return "";

  let markdown = content;

  // 1. Highlight / Bold
  // [HIGHLIGHT] text -> **text**
  // Handle cases where text is on the same line or next line
  markdown = markdown.replace(/\[HIGHLIGHT\]\s*([^\n]+)/g, "**$1**");

  // 2. Emphasis / Italic
  // [EMPHASIS] text -> *text*
  markdown = markdown.replace(/\[EMPHASIS\]\s*([^\n]+)/g, "*$1*");

  // 3. Code Blocks
  // Replace tags with markdown fences.
  // We add newlines to ensure proper formatting.
  markdown = markdown.replace(/\[PYTHON_CODE\]/g, "\n```python\n");
  markdown = markdown.replace(/\[JAVASCRIPT_CODE\]/g, "\n```javascript\n");
  markdown = markdown.replace(/\[SQL_CODE\]/g, "\n```sql\n");
  markdown = markdown.replace(/\[CODE_BLOCK\]/g, "\n```\n");

  // Inline code
  markdown = markdown.replace(/\[INLINE_CODE\]\s*([^\n]+)/g, "`$1`");

  // 4. Tables
  // Just remove the tags as the content is expected to be in markdown table format already
  markdown = markdown.replace(/\[COMPARISON_TABLE\]/g, "");
  markdown = markdown.replace(/\[DATA_TABLE\]/g, "");
  markdown = markdown.replace(/\[SPECIFICATION_TABLE\]/g, "");

  return markdown;
}

export function convertToMarkdown(text: string): string {
  return parseTaggedContent(text);
}
