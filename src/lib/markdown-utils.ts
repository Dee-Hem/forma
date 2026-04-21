
export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function generateTOC(content: string): TOCItem[] {
  const lines = content.split('\n');
  const toc: TOCItem[] = [];
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = `heading-${index}-${text.toLowerCase().replace(/[^\w]/g, '-')}`;
      toc.push({ id, text, level });
    }
  });
  
  return toc;
}

export function simpleMarkdownToHTML(markdown: string): string {
  // This is a very basic replacement for demonstration. 
  // In a real app, use a library like 'marked' or 'unified'.
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1 id="h1-$1">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 id="h2-$1">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 id="h3-$1">$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />');

  // Basic list support
  html = html.replace(/^\s*\n\*/gm, '<ul>\n*');
  html = html.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');

  return html;
}
