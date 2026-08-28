
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import container from 'markdown-it-container';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
import Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="language-${lang}"><code>${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
})
  .use(anchor, {
    permalink: anchor.permalink.ariaHidden({
      placement: 'before',
      symbol: '#',
      class: 'header-anchor',
    })
  })
  .use(footnote)
  .use(taskLists, { label: true })
  .use(container, 'NOTE', {
    render: (tokens: any, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="alert alert-note"><p class="alert-title"><span class="icon"></span>NOTE</p>';
      } else {
        return '</div>\n';
      }
    }
  })
  .use(container, 'TIP', {
    render: (tokens: any, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="alert alert-tip"><p class="alert-title"><span class="icon"></span>TIP</p>';
      } else {
        return '</div>\n';
      }
    }
  })
  .use(container, 'IMPORTANT', {
    render: (tokens: any, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="alert alert-important"><p class="alert-title"><span class="icon"></span>IMPORTANT</p>';
      } else {
        return '</div>\n';
      }
    }
  })
  .use(container, 'WARNING', {
    render: (tokens: any, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="alert alert-warning"><p class="alert-title"><span class="icon"></span>WARNING</p>';
      } else {
        return '</div>\n';
      }
    }
  })
  .use(container, 'CAUTION', {
    render: (tokens: any, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="alert alert-caution"><p class="alert-title"><span class="icon"></span>CAUTION</p>';
      } else {
        return '</div>\n';
      }
    }
  });

export function renderMarkdown(content: string): string {
  // Pre-processing for custom GitHub alerts [!NOTE] -> ::: NOTE
  let processed = content.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/g, '::: $1');
  
  // Auto-correction for bash''' -> ```bash
  processed = processed.replace(/^(\w+)'''([\s\S]*?)'''$/gm, '```$1\n$2\n```');

  return md.render(processed);
}
