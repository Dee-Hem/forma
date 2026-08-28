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
  Eye,
  X,
  MoreVertical,
  Plus,
  Search,
  Folder,
  Hash,
  Share2,
  Trash2,
  Copy,
  Layout,
  Columns,
  Square,
  Undo2,
  Redo2,
  Command,
  HelpCircle,
  Link,
  Image as ImageIcon,
  Table as TableIcon,
  List,
  ListOrdered,
  CheckSquare,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  aiAutocompletion, 
  aiTextRephrasing, 
  summarizeText 
} from '@/ai/flows';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { renderMarkdown } from '@/lib/markdown-engine';
import { Input } from '@/components/ui/input';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  isFavorite: boolean;
}

export default function FormaTextApp() {
  // --- State ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'outline'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  const activeDoc = documents.find(d => d.id === activeDocId);

  // --- Monaco Helpers ---
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = { editor, monaco };
  };

  const insertMarkdown = (type: string) => {
    if (!editorRef.current) return;
    const { editor, monaco } = editorRef.current;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    let newText = '';
    
    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'quote'}\n`;
        break;
      case 'list':
        newText = (selectedText || 'item').split('\n').map(l => `- ${l}`).join('\n');
        break;
      case 'ordered-list':
        newText = (selectedText || 'item').split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n');
        break;
      case 'task-list':
        newText = (selectedText || 'item').split('\n').map(l => `- [ ] ${l}`).join('\n');
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](https://)`;
        break;
      case 'image':
        newText = `![${selectedText || 'alt text'}](https://)`;
        break;
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        return;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        return;
      case 'code-block':
        newText = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`;
        break;
      case 'hr':
        newText = `\n---\n`;
        break;
    }

    editor.executeEdits('toolbar', [{
      range: selection,
      text: newText,
      forceMoveMarkers: true
    }]);
    
    editor.focus();
  };

  // --- Persistence ---
  useEffect(() => {
    setIsMounted(true);
    const savedDocs = localStorage.getItem('formatext_docs');
    const lastActive = localStorage.getItem('formatext_active_id');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';

    if (savedDocs) {
      const parsed = JSON.parse(savedDocs);
      setDocuments(parsed);
      if (lastActive && parsed.some((d: any) => d.id === lastActive)) {
        setActiveDocId(lastActive);
      } else if (parsed.length > 0) {
        setActiveDocId(parsed[0].id);
      }
    } else {
      const initialDoc: Document = {
        id: 'welcome',
        title: 'Welcome to FormaText',
        content: '# Welcome to FormaText\n\nWrite Markdown. See it come alive.\n\n## Features\n- **Monaco Editor** integration\n- **GFM** Support\n- **Math** equations: $E=mc^2$\n- **Task Lists**\n- **Command Palette** (Cmd+K)\n\n[!NOTE]\nThis is a GitHub-style alert!',
        updatedAt: Date.now(),
        isFavorite: false
      };
      setDocuments([initialDoc]);
      setActiveDocId('welcome');
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('bold');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('italic');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('formatext_docs', JSON.stringify(documents));
    }
  }, [documents, isMounted]);

  useEffect(() => {
    if (isMounted && activeDocId) {
      localStorage.setItem('formatext_active_id', activeDocId);
    }
  }, [activeDocId, isMounted]);

  // --- Handlers ---
  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
    toast({ title: "Saved successfully" });
  }, [toast]);

  const updateContent = (val: string | undefined) => {
    if (!activeDocId || val === undefined) return;
    setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, content: val, updatedAt: Date.now() } : d));
  };

  const createNewDoc = () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled',
      content: '',
      updatedAt: Date.now(),
      isFavorite: false
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const deleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) setActiveDocId('');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleExport = (format: 'md' | 'html' | 'pdf') => {
    if (!activeDoc) return;
    if (format === 'md') {
      const blob = new Blob([activeDoc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDoc.title}.md`;
      a.click();
    } else if (format === 'pdf') {
      setIsCommandOpen(false);
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  const generateOutline = (content: string) => {
    const lines = content.split('\n');
    return lines
      .map((line, idx) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) return { level: match[1].length, text: match[2], id: idx };
        return null;
      })
      .filter(Boolean);
  };

  if (!isMounted) return null;

  const outline = activeDoc ? generateOutline(activeDoc.content) : [];

  return (
    <div className={`flex flex-col h-screen bg-background overflow-hidden ${isZenMode ? 'zen-mode' : ''}`}>
      {/* Header */}
      {!isZenMode && (
        <header className="no-print h-12 border-b flex items-center justify-between px-4 bg-card shrink-0 z-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-8 w-8">
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm tracking-tight hidden sm:block">FormaText</span>
            </div>
            <Separator orientation="vertical" className="h-4 mx-2" />
            <div className="flex items-center gap-2">
              <Input 
                value={activeDoc?.title || ''} 
                onChange={(e) => setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, title: e.target.value } : d))}
                className="h-7 px-2 text-sm font-medium border-none bg-transparent focus-visible:ring-1 max-w-[200px]"
              />
              {isSaving && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <Button variant="ghost" size="icon" onClick={() => insertMarkdown('undo')} className="h-8 w-8">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertMarkdown('redo')} className="h-8 w-8">
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-4 mx-2 hidden md:block" />

            <div className="hidden md:flex items-center bg-muted/30 rounded-lg p-0.5 mr-2">
              <Button 
                variant={viewMode === 'editor' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('editor')}
                className="h-7 w-7"
              >
                <Square className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant={viewMode === 'split' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('split')}
                className="h-7 w-7"
              >
                <Columns className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant={viewMode === 'preview' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('preview')}
                className="h-7 w-7"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setIsZenMode(true)} title="Zen Mode" className="h-8 w-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleExport('md')}><Download className="w-4 h-4 mr-2" /> Markdown</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}><Download className="w-4 h-4 mr-2" /> PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
          </div>
        </header>
      )}

      {/* Zen Mode Exit Overlay */}
      {isZenMode && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsZenMode(false)} 
          className="fixed top-4 right-4 z-[60] h-10 w-10 bg-background/50 backdrop-blur rounded-full border shadow-xl hover:bg-background no-print"
        >
          <X className="w-5 h-5" />
        </Button>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          {isSidebarOpen && !isZenMode && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30} className="no-print bg-card border-r">
                <div className="flex flex-col h-full">
                  <div className="p-3 flex items-center justify-between">
                    <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="explorer" className="text-[10px] uppercase font-bold tracking-widest">Docs</TabsTrigger>
                        <TabsTrigger value="outline" className="text-[10px] uppercase font-bold tracking-widest">Outline</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <ScrollArea className="flex-1">
                    {sidebarTab === 'explorer' ? (
                      <div className="p-2 space-y-4">
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-2.5 text-muted-foreground" />
                          <Input 
                            placeholder="Search..." 
                            className="h-8 pl-7 text-xs bg-muted/30 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Button variant="ghost" size="sm" onClick={createNewDoc} className="w-full justify-start text-xs h-8">
                            <Plus className="w-3 h-3 mr-2" /> New Document
                          </Button>
                          {documents
                            .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(doc => (
                              <div 
                                key={doc.id}
                                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${activeDocId === doc.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}`}
                                onClick={() => setActiveDocId(doc.id)}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className={`w-3.5 h-3.5 ${activeDocId === doc.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <span className="text-xs truncate">{doc.title}</span>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreVertical className="w-3 h-3" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => deleteDoc(doc.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-1">
                        {outline.length > 0 ? (
                          outline.map((item: any) => (
                            <button
                              key={item.id}
                              className="w-full text-left text-xs py-1.5 px-2 rounded hover:bg-muted/50 truncate text-muted-foreground hover:text-foreground transition-colors"
                              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                              onClick={() => {
                                // Monaco scroll to line logic could go here
                              }}
                            >
                              {item.text}
                            </button>
                          ))
                        ) : (
                          <div className="text-[10px] text-muted-foreground italic p-4 text-center">No headings found.</div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </Panel>
              <PanelResizeHandle className="no-print panel-resize-handle" />
            </>
          )}

          {/* Editor & Preview */}
          <Panel 
            defaultSize={viewMode === 'editor' ? 100 : viewMode === 'preview' ? 0 : 40} 
            minSize={0}
            className="editor-panel-wrapper"
          >
            <div className={`h-full flex flex-col bg-background ${isZenMode ? 'main-content' : ''}`}>
              {!isZenMode && (
                <div className="no-print h-9 border-b flex items-center px-4 gap-1 bg-muted/10 shrink-0">
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('bold')} title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('italic')} title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('code')} title="Inline Code"><Code className="w-3.5 h-3.5" /></Button>
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('list')} title="Bullet List"><List className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('ordered-list')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('task-list')} title="Task List"><CheckSquare className="w-3.5 h-3.5" /></Button>
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('link')} title="Insert Link"><Link className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('image')} title="Insert Image"><ImageIcon className="w-3.5 h-3.5" /></Button>
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <Button variant="ghost" size="xs" className="h-6 w-6" onClick={() => insertMarkdown('quote')} title="Quote"><Quote className="w-3.5 h-3.5" /></Button>
                  <div className="flex-1" />
                  <Button variant="ghost" size="xs" onClick={() => setIsCommandOpen(true)} className="h-6 px-2 text-[10px]"><Command className="w-3 h-3 mr-1" /> K</Button>
                </div>
              )}
              
              <div className="flex-1 relative overflow-hidden print:hidden">
                <Editor
                  height="100%"
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  language="markdown"
                  value={activeDoc?.content || ''}
                  onChange={updateContent}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    padding: { top: 20 },
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    fontFamily: "'Fira Code', monospace",
                  }}
                />
              </div>
            </div>
          </Panel>

          {viewMode !== 'editor' && (
            <>
              {!isZenMode && <PanelResizeHandle className="no-print panel-resize-handle" />}
              <Panel 
                defaultSize={viewMode === 'preview' ? 100 : 40} 
                minSize={20}
                className="preview-container"
              >
                <div className="h-full flex flex-col bg-background print:bg-white overflow-hidden border-l print:border-none">
                  {!isZenMode && (
                    <div className="no-print h-9 border-b flex items-center justify-between px-4 bg-muted/10 shrink-0">
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Preview</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4">GFM</Badge>
                      </div>
                    </div>
                  )}
                  <ScrollArea className="flex-1 print:overflow-visible">
                    <div 
                      ref={previewRef}
                      className="preview-content max-w-3xl mx-auto px-8 py-12 md:px-12 md:py-20 text-foreground dark:text-slate-100 print:text-black print:py-0 print:px-0"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(activeDoc?.content || '') }}
                    />
                  </ScrollArea>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </main>

      {/* Footer / Status Bar */}
      {!isZenMode && (
        <footer className="no-print h-7 border-t flex items-center justify-between px-4 bg-card text-[10px] font-medium text-muted-foreground shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[8px] h-4 font-mono px-1">GFM</Badge> Ready</span>
            {activeDoc && (
              <span className="flex items-center gap-3">
                <span>{activeDoc.content.split(/\s+/).filter(Boolean).length} Words</span>
                <span>{Math.ceil(activeDoc.content.split(/\s+/).filter(Boolean).length / 200)} Min Read</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activeDoc ? `Saved ${new Date(activeDoc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
            </span>
          </div>
        </footer>
      )}

      {/* Command Palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type a command or search..." className="no-print" />
        <CommandList className="no-print">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { insertMarkdown('undo'); setIsCommandOpen(false); }}>
              <Undo2 className="mr-2 h-4 w-4" /> Undo
            </CommandItem>
            <CommandItem onSelect={() => { insertMarkdown('redo'); setIsCommandOpen(false); }}>
              <Redo2 className="mr-2 h-4 w-4" /> Redo
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Documents">
            <CommandItem onSelect={() => { createNewDoc(); setIsCommandOpen(false); }}>
              <Plus className="mr-2 h-4 w-4" /> New Document
            </CommandItem>
            <CommandItem onSelect={() => setIsCommandOpen(false)}>
              <Search className="mr-2 h-4 w-4" /> Search Documents
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="View">
            <CommandItem onSelect={() => { setViewMode('editor'); setIsCommandOpen(false); }}>
              <Square className="mr-2 h-4 w-4" /> Editor Mode
            </CommandItem>
            <CommandItem onSelect={() => { setViewMode('split'); setIsCommandOpen(false); }}>
              <Columns className="mr-2 h-4 w-4" /> Split Mode
            </CommandItem>
            <CommandItem onSelect={() => { setViewMode('preview'); setIsCommandOpen(false); }}>
              <Eye className="mr-2 h-4 w-4" /> Preview Mode
            </CommandItem>
            <CommandItem onSelect={() => { setIsZenMode(true); setIsCommandOpen(false); }}>
              <Maximize2 className="mr-2 h-4 w-4" /> Zen Mode
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Formatting">
            <CommandItem onSelect={() => { insertMarkdown('bold'); setIsCommandOpen(false); }}>
              <Bold className="mr-2 h-4 w-4" /> Bold
            </CommandItem>
            <CommandItem onSelect={() => { insertMarkdown('italic'); setIsCommandOpen(false); }}>
              <Italic className="mr-2 h-4 w-4" /> Italic
            </CommandItem>
            <CommandItem onSelect={() => { insertMarkdown('code-block'); setIsCommandOpen(false); }}>
              <Code className="mr-2 h-4 w-4" /> Code Block
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => { toggleTheme(); setIsCommandOpen(false); }}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
