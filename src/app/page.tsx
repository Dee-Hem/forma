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
  const [content, setContent] = useState<string>('# Welcome to FormaText\n\nWrite beautiful **Markdown** and *reStructuredText* documents here. \n\n## Math Support\n\n$E = mc^2$\n\n$$\\int_a^b f(x)dx$$\n\n## Features\n- Live Preview\n- AI Writing Assistant\n- PDF Export\n- TOC Navigation');
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
        (window as any).MathJax.typesetPromise?.().catch((e: any) => console.error(e));
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
    if ((window as any).MathJax) {
      await (window as any).MathJax.typesetPromise?.();
    }
    window.print();
    toast({ title: "Preparing PDF Export" });
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
    
    const lines = text.split('\n');
    let html = '';
    let inMathBlock = false;
    let mathBuffer = '';

    lines.forEach(line => {
      const trimmed = line.trim();

      // Handle display math block
      if (trimmed.startsWith('$$')) {
        if (!inMathBlock) {
          inMathBlock = true;
          mathBuffer = trimmed;
          // Check if it's a single line display math like $$ E=mc^2 $$
          if (trimmed.length > 2 && trimmed.endsWith('$$')) {
            html += `<div class="my-4 text-center">${mathBuffer}</div>`;
            inMathBlock = false;
            mathBuffer = '';
          }
        } else {
          mathBuffer += '\n' + trimmed;
          html += `<div class="my-4 text-center">${mathBuffer}</div>`;
          inMathBlock = false;
          mathBuffer = '';
        }
        return;
      }

      if (inMathBlock) {
        mathBuffer += '\n' + line;
        return;
      }

      if (trimmed === '') {
        html += '<div class="h-4"></div>';
      } else if (trimmed.startsWith('# ')) {
        const hText = trimmed.slice(2);
        html += `<h1 id="${hText}">${hText}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        const hText = trimmed.slice(3);
        html += `<h2 id="${hText}">${hText}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        const hText = trimmed.slice(4);
        html += `<h3 id="${hText}">${hText}</h3>`;
      } else if (trimmed.startsWith('> ')) {
        html += `<blockquote>${trimmed.slice(2)}</blockquote>`;
      } else {
        // Simple inline processing with non-greedy regex
        let processed = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/!\[(.*?)\]\((.*?)\)/g, "<img alt='$1' src='$2' />")
          .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>");
        html += `<p>${processed}</p>`;
      }
    });
    
    // Safety check for unclosed math blocks
    if (inMathBlock) {
      html += `<div class="my-4 text-center">${mathBuffer}</div>`;
    }

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
