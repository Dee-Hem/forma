
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
  Code,
  Layers,
  Baseline,
  ArrowUpRight
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
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { renderMarkdown } from '@/lib/markdown-engine';
import { Input } from '@/components/ui/input';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { RESUME_TEMPLATES, ResumeTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  isFavorite: boolean;
  templateId?: string;
  fontFamily?: string;
}

const DOCUMENT_FONTS = [
  { group: "Serif (Professional)", fonts: [
    { name: "Times New Roman", value: "Tinos, serif" },
    { name: "Georgia", value: "Gelasio, serif" },
    { name: "Garamond", value: "'EB Garamond', serif" },
    { name: "Cambria / Caladea", value: "Caladea, serif" },
    { name: "Palatino / Book Antiqua", value: "Spectral, serif" },
    { name: "Didot / Constantia", value: "'Playfair Display', serif" },
    { name: "Bookman Old Style", value: "Lora, serif" },
    { name: "Rockwell", value: "Arvo, serif" },
  ]},
  { group: "Sans-Serif (Modern)", fonts: [
    { name: "Arial", value: "Arimo, sans-serif" },
    { name: "Calibri / Segoe UI", value: "Inter, sans-serif" },
    { name: "Verdana", value: "'Varela Round', sans-serif" },
    { name: "Tahoma", value: "Hind, sans-serif" },
    { name: "Century Gothic", value: "Montserrat, sans-serif" },
    { name: "Franklin Gothic / Trebuchet", value: "'Libre Franklin', sans-serif" },
    { name: "Gill Sans", value: "Lato, sans-serif" },
    { name: "Corbel / Candara", value: "'Noto Sans', sans-serif" },
  ]},
  { group: "Monospace", fonts: [
    { name: "Courier New", value: "Cousine, monospace" },
    { name: "Consolas", value: "'Fira Code', monospace" },
    { name: "Lucida Console", value: "'Fira Code', monospace" },
  ]},
  { group: "Script / Decorative", fonts: [
    { name: "Lucida Handwriting", value: "Caveat, cursive" },
    { name: "Brush Script", value: "Pacifico, cursive" },
    { name: "Segoe Script", value: "Sacramento, cursive" },
  ]},
  { group: "Display / Heading", fonts: [
    { name: "Impact", value: "Anton, sans-serif" },
    { name: "Copperplate", value: "Cinzel, serif" },
    { name: "Bahnschrift", value: "'Roboto Condensed', sans-serif" },
  ]}
];

export default function FormaTextApp() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'outline'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const activeDoc = documents.find(d => d.id === activeDocId);

  // Hydration fix for time
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = { editor, monaco };
    editor.onDidScrollChange(() => syncScroll());
    if (typeof document !== 'undefined' && 'fonts' in document) {
      (document as any).fonts.ready.then(() => editor.layout());
    }
    [50, 200, 500].forEach(delay => setTimeout(() => editor.layout(), delay));
  };

  const syncScroll = useCallback(() => {
    if (!editorRef.current?.editor || !previewRef.current || isSyncing.current) return;
    const editor = editorRef.current.editor;
    const preview = previewRef.current;
    const viewport = preview.closest('[data-radix-scroll-area-viewport]');
    if (!viewport) return;
    isSyncing.current = true;
    const scrollHeight = editor.getScrollHeight();
    const scrollTop = editor.getScrollTop();
    const height = editor.getLayoutInfo().height;
    const maxScroll = scrollHeight - height;
    if (maxScroll > 0) {
      const percentage = scrollTop / maxScroll;
      const maxPreviewScroll = viewport.scrollHeight - viewport.clientHeight;
      viewport.scrollTop = percentage * maxPreviewScroll;
    }
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, []);

  const insertMarkdown = (type: string) => {
    if (!editorRef.current) return;
    const { editor } = editorRef.current;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);
    let newText = '';
    switch (type) {
      case 'bold': newText = `**${selectedText || 'bold text'}**`; break;
      case 'italic': newText = `*${selectedText || 'italic text'}*`; break;
      case 'code': newText = `\`${selectedText || 'code'}\``; break;
      case 'quote': newText = `\n> ${selectedText || 'quote'}\n`; break;
      case 'list': newText = (selectedText || 'item').split('\n').map(l => `- ${l}`).join('\n'); break;
      case 'ordered-list': newText = (selectedText || 'item').split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'); break;
      case 'task-list': newText = (selectedText || 'item').split('\n').map(l => `- [ ] ${l}`).join('\n'); break;
      case 'link': newText = `[${selectedText || 'link text'}](https://)`; break;
      case 'image': newText = `![${selectedText || 'alt text'}](https://)`; break;
      case 'undo': editor.trigger('keyboard', 'undo', null); return;
      case 'redo': editor.trigger('keyboard', 'redo', null); return;
      case 'code-block': newText = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`; break;
      case 'hr': newText = `\n---\n`; break;
    }
    editor.executeEdits('toolbar', [{ range: selection, text: newText, forceMoveMarkers: true }]);
    editor.focus();
  };

  useEffect(() => {
    const savedDocs = localStorage.getItem('formatext_docs');
    const lastActive = localStorage.getItem('formatext_active_id');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedDocs) {
      const parsed = JSON.parse(savedDocs);
      setDocuments(parsed);
      if (lastActive && parsed.some((d: any) => d.id === lastActive)) setActiveDocId(lastActive);
      else if (parsed.length > 0) setActiveDocId(parsed[0].id);
    } else {
      const initialDoc: Document = {
        id: 'welcome',
        title: 'Welcome to FormaText',
        content: '# Welcome to FormaText\n\nA professional editor for structured writing.\n\n## Media Budget Example\n| Item | Description | Cost |\n| :--- | :--- | :--- |\n| Hosting | AWS Infrastructure | $1,200 |\n| Design | Brand Identity | $3,500 |\n| Marketing | Social Campaigns | $2,000 |\n\n> This is a professional blockquote with refined styling.',
        updatedAt: Date.now(),
        isFavorite: false,
        fontFamily: "Inter, sans-serif"
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandOpen(prev => !prev); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem('formatext_docs', JSON.stringify(documents)); }, [documents, isMounted]);
  useEffect(() => { if (isMounted && activeDocId) localStorage.setItem('formatext_active_id', activeDocId); }, [activeDocId, isMounted]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
    toast({ title: "Document saved" });
  }, [toast]);

  const updateContent = (val: string | undefined) => {
    if (!activeDocId || val === undefined) return;
    setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, content: val, updatedAt: Date.now() } : d));
  };

  const updateFont = (fontFamily: string) => {
    if (!activeDocId) return;
    setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, fontFamily, updatedAt: Date.now() } : d));
  };

  const createNewDoc = (title = 'Untitled', content = '', templateId?: string) => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      content: content,
      updatedAt: Date.now(),
      isFavorite: false,
      templateId,
      fontFamily: "Inter, sans-serif"
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    return newDoc;
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

  const handleExport = (format: 'md' | 'pdf') => {
    if (!activeDoc) return;
    if (format === 'md') {
      const blob = new Blob([activeDoc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDoc.title}.md`;
      a.click();
    } else if (format === 'pdf') {
      window.print();
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

  const useTemplate = (template: ResumeTemplate) => {
    createNewDoc(template.name, template.content, template.id);
    setIsTemplatesOpen(false);
    toast({ title: `${template.name} applied` });
  };

  if (!isMounted) return null;

  const outline = activeDoc ? generateOutline(activeDoc.content) : [];

  return (
    <div className={`flex flex-col h-screen bg-background selection:bg-accent/20 selection:text-accent overflow-hidden ${isZenMode ? 'zen-mode' : ''}`}>
      {/* Premium Header */}
      {!isZenMode && (
        <header className="no-print h-14 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-xl shrink-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-9 w-9 hover:bg-muted/50 transition-colors">
              <Menu className="w-4 h-4 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsCommandOpen(true)}>
              <div className="bg-accent/10 p-1.5 rounded-lg group-hover:bg-accent/20 transition-colors">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-foreground/90">FormaText</span>
            </div>
            <Separator orientation="vertical" className="h-5 mx-2 bg-border/50" />
            <div className="flex items-center gap-3">
              <Input 
                value={activeDoc?.title || ''} 
                onChange={(e) => setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, title: e.target.value } : d))}
                className="h-8 px-2 text-sm font-semibold border-none bg-transparent focus-visible:ring-1 focus-visible:ring-accent/30 max-w-[240px] transition-all"
                placeholder="Untitled Document"
              />
              {isSaving && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent),0.5)]" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-muted/30 rounded-xl p-1 gap-1 border border-border/50">
              <Button 
                variant={viewMode === 'editor' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('editor')}
                className={cn("h-7 px-3 text-[11px] font-bold rounded-lg transition-all", viewMode === 'editor' && "shadow-sm bg-card")}
              >
                Editor
              </Button>
              <Button 
                variant={viewMode === 'split' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('split')}
                className={cn("h-7 px-3 text-[11px] font-bold rounded-lg transition-all", viewMode === 'split' && "shadow-sm bg-card")}
              >
                Split
              </Button>
              <Button 
                variant={viewMode === 'preview' ? 'secondary' : 'ghost'} 
                size="xs" 
                onClick={() => setViewMode('preview')}
                className={cn("h-7 px-3 text-[11px] font-bold rounded-lg transition-all", viewMode === 'preview' && "shadow-sm bg-card")}
              >
                Preview
              </Button>
            </div>

            <Separator orientation="vertical" className="h-5 mx-2 bg-border/50 hidden md:block" />

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsZenMode(true)} className="h-9 w-9 hover:text-accent transition-colors">
                <Maximize2 className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="h-8 px-4 text-xs font-bold rounded-lg bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                    Export <Download className="w-3 h-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-2xl border-border/50">
                  <DropdownMenuItem onClick={() => handleExport('md')} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2 text-muted-foreground" /> Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                    <ArrowUpRight className="w-4 h-4 mr-2 text-muted-foreground" /> PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="h-9 w-9 hover:text-accent transition-colors">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {/* Professional Sidebar */}
          {isSidebarOpen && !isZenMode && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30} className="no-print bg-card/30 border-r border-border/50 sidebar-panel-wrapper backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-9 rounded-xl bg-muted/50 p-1 border border-border/30">
                        <TabsTrigger value="explorer" className="text-[10px] uppercase font-black tracking-widest rounded-lg transition-all data-[state=active]:bg-card data-[state=active]:text-accent">Docs</TabsTrigger>
                        <TabsTrigger value="outline" className="text-[10px] uppercase font-black tracking-widest rounded-lg transition-all data-[state=active]:bg-card data-[state=active]:text-accent">Outline</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <ScrollArea className="flex-1">
                    {sidebarTab === 'explorer' ? (
                      <div className="px-3 space-y-4">
                        <div className="relative group">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <Input 
                            placeholder="Quick search..." 
                            className="h-9 pl-9 text-xs bg-muted/50 border-border/30 rounded-xl focus-visible:ring-accent/30 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <Button variant="outline" size="sm" onClick={() => createNewDoc()} className="flex-1 justify-start text-[11px] font-bold h-9 px-3 rounded-xl hover:bg-accent/5 hover:text-accent hover:border-accent/30 transition-all">
                              <Plus className="w-3.5 h-3.5 mr-2" /> New Doc
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsTemplatesOpen(true)} className="flex-1 justify-start text-[11px] font-bold h-9 px-3 rounded-xl hover:bg-accent/5 hover:text-accent hover:border-accent/30 transition-all">
                              <Layers className="w-3.5 h-3.5 mr-2" /> Library
                            </Button>
                          </div>
                          
                          <div className="space-y-0.5">
                            {documents
                              .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(doc => (
                                <div 
                                  key={doc.id}
                                  className={cn(
                                    "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200",
                                    activeDocId === doc.id 
                                      ? "bg-accent/10 text-accent font-bold shadow-sm" 
                                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                  )}
                                  onClick={() => setActiveDocId(doc.id)}
                                >
                                  <div className="flex items-center gap-3 truncate">
                                    <div className={cn("w-2 h-2 rounded-full transition-all", activeDocId === doc.id ? "bg-accent" : "bg-transparent")} />
                                    <span className="text-[13px] truncate tracking-tight">{doc.title}</span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="rounded-xl">
                                      <DropdownMenuItem onClick={() => deleteDoc(doc.id)} className="text-destructive font-semibold"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-1">
                        {outline.length > 0 ? (
                          outline.map((item: any) => (
                            <button
                              key={item.id}
                              className="w-full text-left text-[12px] py-2 px-3 rounded-lg hover:bg-accent/5 truncate text-muted-foreground hover:text-accent transition-all border-l-2 border-transparent hover:border-accent/50"
                              style={{ marginLeft: `${(item.level - 1) * 8}px` }}
                              onClick={() => editorRef.current?.editor?.revealLineInCenter(item.id + 1)}
                            >
                              {item.text}
                            </button>
                          ))
                        ) : (
                          <div className="text-[11px] text-muted-foreground/60 italic p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                            Start typing headings to see the document structure.
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </Panel>
              <PanelResizeHandle className="no-print w-1 bg-border/20 hover:bg-accent/30 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Editor & Preview Panels */}
          <Panel 
            defaultSize={viewMode === 'editor' ? 100 : viewMode === 'preview' ? 0 : 50} 
            minSize={0}
            className="editor-panel-wrapper"
            onResize={() => editorRef.current?.editor?.layout()}
          >
            <div className="h-full flex flex-col bg-background relative">
              {!isZenMode && (
                <div className="no-print h-10 border-b flex items-center px-4 gap-2 bg-card/30 shrink-0 overflow-x-auto no-scrollbar">
                  {/* Categorized Toolbar */}
                  <div className="flex items-center gap-1">
                    <Select value={activeDoc?.fontFamily || "Inter, sans-serif"} onValueChange={updateFont}>
                      <SelectTrigger className="h-7 w-[160px] text-[11px] font-bold bg-muted/40 border-none rounded-lg focus:ring-accent/30 transition-all hover:bg-muted/60">
                        <Baseline className="w-3.5 h-3.5 mr-2 text-accent" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96 rounded-xl shadow-2xl">
                        {DOCUMENT_FONTS.map(group => (
                          <SelectGroup key={group.group}>
                            <SelectLabel className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground px-4 py-3">{group.group}</SelectLabel>
                            {group.fonts.map(font => (
                              <SelectItem key={font.name} value={font.value} className="text-[13px] py-2">
                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />
                  
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('bold')}><Bold className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('italic')}><Italic className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('code')}><Code className="w-3.5 h-3.5" /></Button>
                  </div>

                  <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />

                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('list')}><List className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('task-list')}><CheckSquare className="w-3.5 h-3.5" /></Button>
                  </div>

                  <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />

                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('link')}><Link className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-7 w-7 rounded-lg hover:text-accent transition-colors" onClick={() => insertMarkdown('image')}><ImageIcon className="w-3.5 h-3.5" /></Button>
                  </div>

                  <div className="flex-1" />
                  <Button variant="ghost" size="xs" onClick={() => setIsCommandOpen(true)} className="h-7 px-2 text-[10px] font-black bg-accent/5 text-accent rounded-lg border border-accent/10">
                    <Command className="w-3 h-3 mr-1" /> K
                  </Button>
                </div>
              )}
              
              <div ref={editorContainerRef} className="flex-1 relative overflow-hidden print:hidden p-2">
                <div className="h-full rounded-2xl overflow-hidden border border-border/50 shadow-inner">
                  <Editor
                    height="100%"
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    language="markdown"
                    value={activeDoc?.content || ''}
                    onChange={updateContent}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 15,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      padding: { top: 32, bottom: 32 },
                      scrollBeyondLastLine: true,
                      fontFamily: "'Fira Code', monospace",
                      renderLineHighlight: 'all',
                      lineHeight: 1.6,
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      letterSpacing: 0,
                    }}
                  />
                </div>
              </div>
            </div>
          </Panel>

          {viewMode !== 'editor' && (
            <>
              {!isZenMode && <PanelResizeHandle className="no-print w-1 bg-border/20 hover:bg-accent/30 transition-colors cursor-col-resize" />}
              <Panel 
                defaultSize={viewMode === 'preview' ? 100 : 50} 
                minSize={20}
                className="preview-container"
              >
                <div className="h-full flex flex-col bg-background print:bg-white overflow-hidden border-l border-border/50 print:border-none relative">
                  {!isZenMode && (
                    <div className="no-print h-10 border-b flex items-center justify-between px-6 bg-card/30 shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.25em] text-accent uppercase">Live Preview</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <Badge variant="outline" className="text-[9px] h-5 rounded-lg font-black bg-muted/50 border-border/50">GFM RENDERER</Badge>
                    </div>
                  )}
                  <ScrollArea className="flex-1 print:overflow-visible">
                    <div className="max-w-4xl mx-auto px-8 py-16 md:px-16 md:py-24 print:p-0">
                      <div 
                        ref={previewRef}
                        className={cn(
                          "preview-content text-foreground/90 dark:text-slate-100 print:text-black",
                          activeDoc?.templateId && `resume-${activeDoc.templateId}`
                        )}
                        style={{ fontFamily: activeDoc?.fontFamily || 'Inter, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(activeDoc?.content || '') }}
                      />
                    </div>
                  </ScrollArea>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </main>

      {/* Modern Status Bar */}
      {!isZenMode && (
        <footer className="no-print h-9 border-t flex items-center justify-between px-6 bg-card/50 text-[10px] font-bold text-muted-foreground/70 shrink-0 select-none backdrop-blur-md">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors" />
              <span className="tracking-tight">{activeDoc?.content.split(/\s+/).filter(Boolean).length || 0} WORDS</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-accent/50" />
              <span className="tracking-tight">{Math.ceil((activeDoc?.content.split(/\s+/).filter(Boolean).length || 0) / 200)} MIN READ</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {activeDoc && currentTime && (
              <span className="flex items-center gap-2 tracking-tighter uppercase opacity-80">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                Auto-saved {currentTime}
              </span>
            )}
            <Badge variant="secondary" className="text-[8px] h-4 rounded-md font-black bg-accent/10 text-accent border-none">V0.3.0 PRO</Badge>
          </div>
        </footer>
      )}

      {/* Command Palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Search actions, files, settings..." className="no-print border-none" />
        <CommandList className="no-print">
          <CommandEmpty>No matching results.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { createNewDoc(); setIsCommandOpen(false); }} className="rounded-lg py-3"><Plus className="mr-3 h-4 w-4 text-accent" /> New Document</CommandItem>
            <CommandItem onSelect={() => { setIsTemplatesOpen(true); setIsCommandOpen(false); }} className="rounded-lg py-3"><Layers className="mr-3 h-4 w-4 text-accent" /> Browse Template Library</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Workspace Layout">
            <CommandItem onSelect={() => { setViewMode('editor'); setIsCommandOpen(false); }}><Square className="mr-3 h-4 w-4" /> Focus Mode (Editor)</CommandItem>
            <CommandItem onSelect={() => { setViewMode('split'); setIsCommandOpen(false); }}><Columns className="mr-3 h-4 w-4" /> Collaborative View (Split)</CommandItem>
            <CommandItem onSelect={() => { setViewMode('preview'); setIsCommandOpen(false); }}><Eye className="mr-3 h-4 w-4" /> Presentation Mode (Preview)</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Templates Dialog */}
      <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <DialogContent className="max-w-5xl rounded-3xl border-border/50 shadow-2xl overflow-hidden p-0">
          <div className="grid md:grid-cols-[280px_1fr] h-[600px]">
            <div className="bg-muted/30 p-8 border-r border-border/50">
              <h2 className="text-2xl font-black tracking-tight mb-4">Template Library</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Choose a pre-configured layout to start your professional document. All templates are fully customizable.</p>
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-accent"><Layout className="w-4 h-4" /> Featured</div>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/60"><FileText className="w-4 h-4" /> Resumes</div>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/60"><TableIcon className="w-4 h-4" /> Reports</div>
              </div>
            </div>
            <ScrollArea className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RESUME_TEMPLATES.map((template) => (
                  <div 
                    key={template.id} 
                    className="group border border-border/50 rounded-2xl p-6 hover:border-accent hover:shadow-xl hover:shadow-accent/5 cursor-pointer transition-all bg-card relative overflow-hidden"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold text-lg group-hover:text-accent transition-colors">{template.name}</h3>
                      <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent transition-all">
                        <ArrowUpRight className="w-4 h-4 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground/80 mb-6 leading-relaxed line-clamp-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-[9px] font-black uppercase bg-muted/50 text-muted-foreground border-none">Professional</Badge>
                      <Badge variant="secondary" className="text-[9px] font-black uppercase bg-muted/50 text-muted-foreground border-none">{template.id}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="rounded-3xl border-border/50 shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Application Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">Manage your writing environment and preferences.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-6">
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border/50 transition-all hover:bg-muted/30">
              <div className="space-y-1">
                <div className="text-sm font-bold flex items-center gap-2">{theme === 'dark' ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />} Appearance</div>
                <div className="text-xs text-muted-foreground">Switch between light and high-contrast dark modes.</div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-xl border-border/50 font-bold text-xs h-9 px-4">
                Set to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border/50 transition-all hover:bg-muted/30">
              <div className="space-y-1">
                <div className="text-sm font-bold flex items-center gap-2"><Maximize2 className="w-4 h-4 text-accent" /> Zen Interface</div>
                <div className="text-xs text-muted-foreground">Focus exclusively on the editor and preview.</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setIsZenMode(true); setIsSettingsOpen(false); }} className="rounded-xl border-border/50 font-bold text-xs h-9 px-4">
                Enable Focus
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-2 text-sm font-black text-accent uppercase tracking-widest mb-3">About FormaText</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">A high-fidelity structured writing platform built for precision and professional output. Powered by Monaco, Genkit AI, and Markdown-it.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
