"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  Settings, 
  Download, 
  Sparkles, 
  Menu, 
  Maximize2, 
  Clock,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sun,
  Moon,
  Type,
  Eye as EyeIcon,
  X,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  aiAutocompletion, 
  aiTextRephrasing, 
  summarizeText, 
  generateInitialDraft 
} from '@/ai/flows';
import { generateTOC, TOCItem } from '@/lib/markdown-utils';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FormaTextApp() {
  const [content, setContent] = useState<string>(`# Welcome to FormaText

## Advanced Markdown Support

### Fenced Code Blocks
\`\`\`bash
echo "Hello from auto-corrected bash!"
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

### Task Lists
- [x] Implement Advanced Parser
- [ ] Add real-time collaboration
- [x] Fix hydration errors

### Tables
| Feature | Status | Priority |
|:---|:---:|---:|
| MathJax | Supported | High |
| Tables | Supported | Med |
| PDF | Supported | High |

### Footnotes & Strikethrough
This is a strikethrough text ~~oops~~.
And here is a footnote reference[^1].

[^1]: This is the footnote definition at the bottom.

### Math Notation
When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$`);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    setToc(generateTOC(content));
  }, [content]);

  useEffect(() => {
    if (isMounted && (window as any).MathJax) {
      const timer = setTimeout(() => {
        (window as any).MathJax.typesetPromise?.().catch((e: any) => {});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content, isPreviewVisible, isMounted, activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleSave();
    }, 60000);
    return () => clearInterval(timer);
  }, [content]);

  const handleSave = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('formatext_document', content);
      setLastSaved(new Date());
    }
  }, [content]);

  const handleAIComplete = async () => {
    setIsProcessingAI(true);
    try {
      const suggestions = await aiAutocompletion({ editorContent: content });
      if (suggestions && suggestions.length > 0) {
        setContent(prev => prev + ' ' + suggestions[0]);
        toast({ title: "AI Completion added" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAIRephrase = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      toast({ title: "No text selected" });
      return;
    }
    setIsProcessingAI(true);
    try {
      const options = await aiTextRephrasing({ selectedText: selection });
      if (options && options.length > 0) {
        setContent(prev => prev.replace(selection, options[0]));
        toast({ title: "Text rephrased" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAISummarize = async () => {
    setIsProcessingAI(true);
    try {
      const result = await summarizeText({ text: content });
      toast({ title: "Summary Generated", description: result.summary });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleExportPDF = async () => {
    // Small delay to ensure any open menus or toasts are cleared
    setTimeout(async () => {
      if ((window as any).MathJax) {
        await (window as any).MathJax.typesetPromise?.();
      }
      window.print();
    }, 300);
  };

  const jumpToHeading = (text: string) => {
    if (isMobile) setActiveTab('preview');
    const elements = previewRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
    elements?.forEach((el) => {
      if (el.textContent === text) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const renderMarkdown = (text: string) => {
    if (!isMounted) return '';
    
    let processedText = text;

    // 0. Auto-Correction: language''' -> ```language
    processedText = processedText.replace(/^(\w+)'''([\s\S]*?)'''$/gm, '```$1\n$2\n```');

    // 1. Protect Fenced Code Blocks (```language ... ```)
    const codeBlocks: { content: string, lang: string }[] = [];
    processedText = processedText.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      codeBlocks.push({ content: code.trim(), lang: lang || 'text' });
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // 2. Protect display math blocks ($$ ... $$)
    const displayMathBlocks: string[] = [];
    processedText = processedText.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (match) => {
      displayMathBlocks.push(match);
      return `__DISPLAY_MATH_${displayMathBlocks.length - 1}__`;
    });

    // 3. Protect inline math blocks ($ ... $)
    const inlineMathBlocks: string[] = [];
    processedText = processedText.replace(/\$(.+?)\$/g, (match) => {
      inlineMathBlocks.push(match);
      return `__INLINE_MATH_${inlineMathBlocks.length - 1}__`;
    });

    // 4. Extract Footnote Definitions [^1]: content
    const footnoteDefs: Record<string, string> = {};
    processedText = processedText.replace(/^\[\^(\w+)\]:\s*(.+)$/gm, (match, id, content) => {
      footnoteDefs[id] = content;
      return '';
    });

    const lines = processedText.split('\n');
    let html = '';
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        html += '<div class="table-wrapper"><table class="w-full border-collapse my-4">';
        tableRows.forEach((row, i) => {
          if (i === 0) {
            html += '<thead><tr>' + row.map(c => `<th class="border border-border p-2 bg-muted/50">${c}</th>`).join('') + '</tr></thead><tbody>';
          } else {
            html += '<tr>' + row.map(c => `<td class="border border-border p-2">${c}</td>`).join('') + '</tr>';
          }
        });
        html += '</tbody></table></div>';
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach(line => {
      const trimmed = line.trim();

      // Table Check
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter(c => c.trim() !== '' || trimmed.indexOf('|'+c+'|') !== -1).map(c => c.trim());
        if (trimmed.match(/^[|:\-\s]+$/)) return; // Skip separator line
        tableRows.push(cells);
        inTable = true;
        return;
      } else if (inTable) {
        flushTable();
      }

      if (trimmed === '') {
        html += '<div class="h-4"></div>';
        return;
      }

      // Horizontal Rules
      if (/^(\s*[\*\-_]){3,}\s*$/.test(trimmed)) {
        html += '<hr class="my-8 border-t border-border" />';
        return;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        const hText = trimmed.slice(2);
        html += `<h1 id="${hText}">${hText}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        const hText = trimmed.slice(3);
        html += `<h2 id="${hText}">${hText}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        const hText = trimmed.slice(4);
        html += `<h3 id="${hText}">${hText}</h3>`;
      } 
      // Task Lists
      else if (trimmed.startsWith('- [ ] ')) {
        html += `<li class="flex items-center gap-3 ml-4 mb-2"><input type="checkbox" disabled class="h-4 w-4 rounded border-primary" /> <span class="leading-none">${trimmed.slice(6)}</span></li>`;
      }
      else if (trimmed.startsWith('- [x] ')) {
        html += `<li class="flex items-center gap-3 ml-4 mb-2"><input type="checkbox" checked disabled class="h-4 w-4 rounded border-primary" /> <span class="leading-none">${trimmed.slice(6)}</span></li>`;
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        html += `<blockquote class="border-l-4 border-primary pl-4 italic my-4 bg-muted/30 py-2">${trimmed.slice(2)}</blockquote>`;
      } 
      // Unordered Lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        html += `<li class="ml-4 mb-2 list-disc">${trimmed.slice(2)}</li>`;
      }
      // Ordered Lists
      else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        html += `<li class="ml-4 mb-2 list-decimal">${content}</li>`;
      }
      // Standard Text
      else {
        let processed = trimmed
          .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded font-code">$1</code>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/~~(.*?)~~/g, '<del class="opacity-60">$1</del>') // Strikethrough
          .replace(/\[\^(\w+)\]/g, '<sup><a href="#fn-$1" id="fnref-$1" class="text-primary hover:underline">$1</a></sup>') // Footnote Ref
          .replace(/!\[(.*?)\]\((.*?)\)/g, "<img alt='$1' src='$2' class='max-w-full h-auto rounded-lg my-4 shadow-sm' />")
          .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' class='text-primary underline'>$1</a>");
        
        if (!processed.startsWith('__DISPLAY_MATH_') && !processed.startsWith('__CODE_BLOCK_')) {
          html += `<p class="mb-4 leading-relaxed">${processed}</p>`;
        } else {
          html += processed;
        }
      }
    });
    flushTable();

    // Add Footnotes Section if definitions exist
    if (Object.keys(footnoteDefs).length > 0) {
      html += '<div class="footnotes mt-12 pt-8 border-t border-border opacity-80"><h4 class="text-sm font-bold mb-4">Footnotes</h4><ol class="list-decimal ml-6">';
      for (const [id, content] of Object.entries(footnoteDefs)) {
        html += `<li id="fn-${id}" class="mb-2 text-sm">${content} <a href="#fnref-${id}" class="text-primary hover:underline ml-1">↩</a></li>`;
      }
      html += '</ol></div>';
    }
    
    // Restore preserved blocks
    codeBlocks.forEach((block, i) => {
      const escapedCode = block.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      html = html.split(`__CODE_BLOCK_${i}__`).join(`<div class="relative group my-6"><div class="absolute right-3 top-2 text-[10px] font-bold text-muted-foreground/50 uppercase select-none">${block.lang}</div><pre class="bg-muted p-4 rounded-md overflow-x-auto font-code border border-border/50 shadow-sm language-${block.lang}"><code>${escapedCode}</code></pre></div>`);
    });

    displayMathBlocks.forEach((block, i) => {
      html = html.replace(`__DISPLAY_MATH_${i}__`, `<div class="my-8 text-center text-lg math-display">${block}</div>`);
    });

    inlineMathBlocks.forEach((block, i) => {
      html = html.split(`__INLINE_MATH_${i}__`).join(block);
    });

    return html;
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isFocusMode ? 'focus-mode' : ''}`}>
      <header className="no-print flex items-center justify-between px-3 md:px-6 py-2 border-b bg-card h-14 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-lg">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-base md:text-xl tracking-tight hidden xs:block">FormaText</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          {!isMobile && lastSaved && (
            <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {!isMobile && (
              <>
                <Button variant="secondary" size="sm" onClick={handleAIComplete} disabled={isProcessingAI} className="h-9 px-4">
                  <Sparkles className={`w-4 h-4 mr-2 ${isProcessingAI ? 'animate-pulse text-accent' : ''}`} />
                  Complete
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9">Tools</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleAIRephrase}>
                      <Type className="w-4 h-4 mr-2" /> Rephrase Selection
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAISummarize}>
                      <BookOpen className="w-4 h-4 mr-2" /> Summarize Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-2" /> Export PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleAIComplete}>
                    <Sparkles className="w-4 h-4 mr-2" /> AI Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAIRephrase}>
                    <Type className="w-4 h-4 mr-2" /> AI Rephrase
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAISummarize}>
                    <BookOpen className="w-4 h-4 mr-2" /> Summarize
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isMobile && (
              <Button variant="primary" size="sm" onClick={handleExportPDF} className="h-9 px-4">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className={`no-print border-r bg-card transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-64 fixed md:relative z-40 h-full shadow-2xl md:shadow-none' : 'w-0'}`}>
          <div className="p-5 w-64 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                OUTLINE
              </h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-full h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-1 pb-10">
                {toc.length > 0 ? (
                  toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        jumpToHeading(item.text);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className="w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-accent/10 hover:text-primary transition-all truncate group flex items-center gap-2"
                      style={{ paddingLeft: `${item.level * 12}px` }}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.text}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-3 py-4 bg-muted/30 rounded-lg">No headings found in your document yet.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {isSidebarOpen && isMobile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {isMobile && (
            <div className="bg-card border-b px-4 py-2 flex justify-center no-print shadow-sm z-20">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-xs">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="editor" className="text-xs flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs flex items-center gap-1.5">
                    <EyeIcon className="w-3.5 h-3.5" /> Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden relative">
            <div className={`flex flex-col flex-1 h-full no-print bg-card md:bg-transparent ${isFocusMode ? 'max-w-4xl mx-auto' : ''} ${isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'}`}>
              <div className="flex items-center justify-between px-6 py-2 bg-muted/20 border-b shrink-0">
                <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">Source Editor</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-muted/50 rounded-lg px-1">
                    <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.max(8, prev - 1))} className="h-6 w-6">-</Button>
                    <span className="text-[10px] font-mono px-2 w-8 text-center">{fontSize}</span>
                    <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.min(32, prev + 1))} className="h-6 w-6">+</Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsFocusMode(!isFocusMode)} className={`h-6 w-6 rounded-md ${isFocusMode ? 'text-primary bg-primary/10' : ''}`}>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <textarea
                ref={editorRef}
                className="editor-textarea flex-1 p-6 md:p-12 w-full font-code focus:ring-0 text-foreground/90 selection:bg-primary/20 leading-relaxed outline-none"
                style={{ fontSize: `${fontSize}pt` }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your masterpiece..."
                spellCheck={false}
              />
            </div>

            <Separator orientation="vertical" className="h-full no-print hidden md:block opacity-50" />

            <div className={`flex flex-col flex-1 h-full bg-white dark:bg-slate-950 print-container overflow-hidden transition-all duration-300 ${isMobile && activeTab !== 'preview' ? 'hidden' : 'flex'} ${!isPreviewVisible && !isMobile ? 'hidden' : ''}`}>
              <div className="no-print flex items-center justify-between px-6 py-2 bg-muted/20 border-b shrink-0">
                <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">Live Preview</span>
                {!isMobile && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsPreviewVisible(false)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div 
                  ref={previewRef}
                  className="preview-content px-8 md:px-16 py-10 md:py-24 max-w-4xl mx-auto text-black dark:text-slate-100"
                  style={{ fontSize: `12pt` }}
                  dangerouslySetInnerHTML={{ __html: isMounted ? renderMarkdown(content) : '' }}
                />
              </ScrollArea>
            </div>

            {!isPreviewVisible && !isMobile && (
              <div className="no-print flex items-center bg-card border-l px-1 shadow-inner group transition-all hover:bg-muted/50">
                <Button variant="ghost" size="icon" onClick={() => setIsPreviewVisible(true)} className="rounded-full group-hover:scale-110 transition-transform">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="no-print flex items-center justify-between px-6 py-1 border-t bg-card text-[10px] text-muted-foreground h-8 shrink-0 font-mono shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[8px] h-4 font-mono px-1">UTF-8</Badge> Markdown</span>
          <span className="hidden sm:inline text-primary/60">Ready to sync</span>
        </div>
        <div className="flex items-center gap-6 uppercase tracking-widest font-bold opacity-80">
          <span>{content.split(/\s+/).filter(Boolean).length} Words</span>
          <span className="hidden sm:inline">{content.length} Characters</span>
        </div>
      </footer>
    </div>
  );
}