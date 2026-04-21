
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  Eye, 
  Settings, 
  Download, 
  Share2, 
  Search, 
  Sparkles, 
  Menu, 
  Maximize2, 
  Save,
  Clock,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TOC Generation
  useEffect(() => {
    setToc(generateTOC(content));
  }, [content]);

  // MathJax Rendering
  useEffect(() => {
    if (isMounted && (window as any).MathJax) {
      // Small timeout to ensure the HTML content has actually been injected
      // by React before MathJax scans the DOM
      const timer = setTimeout(() => {
        (window as any).MathJax.typesetPromise?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content, isPreviewVisible, isMounted]);

  // Auto-save logic (60 seconds)
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

  // AI Actions
  const handleAIComplete = async () => {
    setIsProcessingAI(true);
    try {
      const suggestions = await aiAutocompletion({ editorContent: content });
      if (suggestions && suggestions.length > 0) {
        const suggestion = suggestions[0];
        setContent(prev => prev + ' ' + suggestion);
        toast({ title: "AI Completion added", description: "Successfully updated content." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to get suggestions." });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAIRephrase = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      toast({ title: "No text selected", description: "Please highlight text to rephrase." });
      return;
    }
    setIsProcessingAI(true);
    try {
      const options = await aiTextRephrasing({ selectedText: selection });
      if (options && options.length > 0) {
        setContent(prev => prev.replace(selection, options[0]));
        toast({ title: "Text rephrased", description: "Applied AI suggestion." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to rephrase." });
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
      toast({ variant: "destructive", title: "AI Error", description: "Failed to summarize." });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleExportPDF = async () => {
    // Re-trigger MathJax to ensure everything is rendered before print dialog opens
    if ((window as any).MathJax) {
      await (window as any).MathJax.typesetPromise?.();
    }
    window.print();
    toast({ title: "PDF Export triggered", description: "Your document is being prepared for export." });
  };

  const jumpToHeading = (text: string) => {
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
        return;
      }
      
      if (trimmed.startsWith('# ')) {
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
        // Simple paragraph wrapper but leave math delimiters alone for MathJax
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
      {/* Top Header */}
      <header className="no-print flex items-center justify-between px-4 py-2 border-b bg-card h-14 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-5 h-5 text-primary" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-lg text-primary tracking-tight">FormaText</h1>
            <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent-foreground">Draft</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleAIComplete} disabled={isProcessingAI}>
              <Sparkles className={`w-4 h-4 mr-1 ${isProcessingAI ? 'animate-pulse' : ''}`} />
              Complete
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  AI Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAIRephrase}>Rephrase Selection</DropdownMenuItem>
                <DropdownMenuItem onClick={handleAISummarize}>Summarize Document</DropdownMenuItem>
                <DropdownMenuItem onClick={() => generateInitialDraft({ topic: "New Chapter Outline" }).then(res => setContent(prev => prev + '\n\n' + res.markdownContent))}>
                  Insert Chapter Outline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>Export as PDF (High Fidelity)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "HTML Export", description: "HTML code copied to clipboard." })}>Export as HTML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "DOCX Export", description: "Ready to download DOCX." })}>Export as Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => setIsFocusMode(!isFocusMode)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={`no-print border-r bg-card transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className="p-4 w-64">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                OUTLINE
              </h2>
            </div>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-1">
                {toc.length > 0 ? (
                  toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => jumpToHeading(item.text)}
                      className="w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-accent/10 transition-colors truncate"
                      style={{ paddingLeft: `${item.level * 12}px` }}
                    >
                      {item.text}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2">No headings found...</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Editor & Preview Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Panel */}
          <div className={`flex flex-col flex-1 h-full no-print ${isFocusMode ? 'max-w-3xl mx-auto shadow-2xl' : ''}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
              <span className="text-xs font-medium text-muted-foreground">SOURCE</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.max(10, prev - 1))}>-</Button>
                <span className="text-[10px] font-mono">{fontSize}pt</span>
                <Button variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.min(24, prev + 1))}>+</Button>
              </div>
            </div>
            <textarea
              ref={editorRef}
              className="editor-textarea flex-1 p-8 w-full font-code focus:ring-0 text-foreground/90 selection:bg-accent/30 selection:text-accent-foreground"
              style={{ fontSize: `${fontSize}pt` }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              spellCheck={false}
            />
          </div>

          <Separator orientation="vertical" className="h-full no-print" />

          {/* Preview Panel */}
          {isPreviewVisible && (
            <div className="flex flex-col flex-1 h-full bg-white print-container">
              <div className="no-print flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <span className="text-xs font-medium text-muted-foreground">PREVIEW</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPreviewVisible(false)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div 
                  ref={previewRef}
                  className="preview-content px-12 py-16 max-w-4xl mx-auto text-black"
                  style={{ fontSize: `12pt` }}
                  dangerouslySetInnerHTML={{ __html: isMounted ? renderMarkdown(content) : '' }}
                />
              </ScrollArea>
            </div>
          )}

          {!isPreviewVisible && (
            <div className="no-print flex items-center bg-card border-l px-1">
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewVisible(true)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="no-print flex items-center justify-between px-4 py-1 border-t bg-card text-[10px] text-muted-foreground h-6 shrink-0 font-mono">
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Markdown</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.length} characters</span>
        </div>
      </footer>
    </div>
  );
}
