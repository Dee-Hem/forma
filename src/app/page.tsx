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
  Eye as EyeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
        (window as any).MathJax.typesetPromise?.();
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
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        html += '<br/>';
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
        let processed = trimmed
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
          .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>");
        html += `<p>${processed}</p>`;
      }
    });
    return html;
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isFocusMode ? 'focus-mode' : ''}`}>
      <header className="no-print flex items-center justify-between px-2 md:px-4 py-2 border-b bg-card h-14 shrink-0">
        <div className="flex items-center gap-1 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-5 h-5 text-primary" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-sm md:text-lg text-primary tracking-tight hidden sm:block">FormaText</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && lastSaved && (
            <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {!isMobile && (
              <>
                <Button variant="ghost" size="sm" onClick={handleAIComplete} disabled={isProcessingAI}>
                  <Sparkles className={`w-4 h-4 mr-1 ${isProcessingAI ? 'animate-pulse' : ''}`} />
                  Complete
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">AI Tools</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAIRephrase}>Rephrase Selection</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAISummarize}>Summarize Document</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button variant="primary" size="sm" onClick={handleExportPDF} className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><Sparkles className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAIComplete}>AI Complete</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAIRephrase}>AI Rephrase</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className={`no-print border-r bg-card transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-64 fixed md:relative z-20 h-full shadow-xl md:shadow-none' : 'w-0'}`}>
          <div className="p-4 w-64">
            <h2 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4" />
              OUTLINE
            </h2>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-1">
                {toc.length > 0 ? (
                  toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        jumpToHeading(item.text);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className="w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-accent/10 transition-colors truncate"
                      style={{ paddingLeft: `${item.level * 12}px` }}
                    >
                      {item.text}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2">No headings...</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {isSidebarOpen && isMobile && (
          <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <div className="bg-muted/30 border-b px-2 py-1 flex justify-center no-print">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full max-w-[200px] grid-cols-2">
                  <TabsTrigger value="editor" className="text-xs flex items-center gap-1">
                    <Type className="w-3 h-3" /> Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" /> Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            <div className={`flex flex-col flex-1 h-full no-print ${isFocusMode ? 'max-w-3xl mx-auto shadow-2xl' : ''} ${isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b shrink-0">
                <span className="text-[10px] font-medium text-muted-foreground">EDITOR</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.max(10, prev - 1))}>-</Button>
                  <span className="text-[10px] font-mono">{fontSize}pt</span>
                  <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.min(24, prev + 1))}>+</Button>
                </div>
              </div>
              <textarea
                ref={editorRef}
                className="editor-textarea flex-1 p-4 md:p-8 w-full font-code focus:ring-0 text-foreground/90 selection:bg-accent/30"
                style={{ fontSize: `${fontSize}pt` }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                spellCheck={false}
              />
            </div>

            <Separator orientation="vertical" className="h-full no-print hidden md:block" />

            <div className={`flex flex-col flex-1 h-full bg-white dark:bg-slate-900 print-container overflow-hidden ${isMobile && activeTab !== 'preview' ? 'hidden' : 'flex'} ${!isPreviewVisible && !isMobile ? 'hidden' : ''}`}>
              <div className="no-print flex items-center justify-between px-4 py-2 bg-muted/30 border-b shrink-0">
                <span className="text-[10px] font-medium text-muted-foreground">PREVIEW</span>
                {!isMobile && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPreviewVisible(false)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div 
                  ref={previewRef}
                  className="preview-content px-6 md:px-12 py-8 md:py-16 max-w-4xl mx-auto text-black dark:text-slate-100"
                  style={{ fontSize: `12pt` }}
                  dangerouslySetInnerHTML={{ __html: isMounted ? renderMarkdown(content) : '' }}
                />
              </ScrollArea>
            </div>

            {!isPreviewVisible && !isMobile && (
              <div className="no-print flex items-center bg-card border-l px-1">
                <Button variant="ghost" size="icon" onClick={() => setIsPreviewVisible(true)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="no-print flex items-center justify-between px-4 py-1 border-t bg-card text-[10px] text-muted-foreground h-6 shrink-0 font-mono">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">UTF-8</span>
          <span>Markdown</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span className="hidden sm:inline">{content.length} chars</span>
        </div>
      </footer>
    </div>
  );
}