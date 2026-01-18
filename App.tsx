import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Palette, Settings, Check, MoreVertical, Copy, FileText, Split, BookOpen, AlertCircle, CheckCircle, Plus, Trash2, Edit2, File } from 'lucide-react';
import { AppConfig, Theme, UserData, ModalType, Snippet, Article } from './types';
import { DEFAULT_CONFIG, DEFAULT_MARKDOWN, BUILT_IN_THEMES, DEFAULT_SNIPPETS } from './constants';
import { CodeEditor } from './components/Editor';
import { Preview } from './components/Preview';
import { SettingsModal } from './components/SettingsModal';
import { AIModal } from './components/AIModal';
import { ThemeModal } from './components/ThemeModal';
import { SnippetModal } from './components/SnippetModal';
import { PixelButton, PixelIconBtn, PixelModal } from './components/PixelComponents';

const App: React.FC = () => {
  // --- STATE ---
  const [articles, setArticles] = useState<Article[]>(() => {
      const savedArticles = localStorage.getItem('pixel_md_articles');
      if (savedArticles) return JSON.parse(savedArticles);
      
      // Migration: If no articles but has old content
      const oldContent = localStorage.getItem('pixel_md_content');
      const initialArticle: Article = {
          id: 'default_01',
          title: '未命名文档',
          content: oldContent || DEFAULT_MARKDOWN,
          lastModified: Date.now()
      };
      return [initialArticle];
  });
  
  const [activeArticleId, setActiveArticleId] = useState<string>(() => {
      return articles.length > 0 ? articles[0].id : '';
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('pixel_md_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    const saved = localStorage.getItem('pixel_md_themes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
      const saved = localStorage.getItem('pixel_md_snippets');
      return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
  });
  
  // UI State
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [splitRatio, setSplitRatio] = useState(50);
  const [selection, setSelection] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [renamingArticleId, setRenamingArticleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // New: ID of article to delete

  // Refs for Sync Scroll
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<'editor' | 'preview' | null>(null);
  
  // --- COMPUTED ---
  const allThemes = useMemo(() => [...BUILT_IN_THEMES, ...customThemes], [customThemes]);
  const activeTheme = useMemo(() => allThemes.find(t => t.id === config.preview.themeId) || allThemes[0], [allThemes, config.preview.themeId]);
  
  const activeArticle = useMemo(() => articles.find(a => a.id === activeArticleId) || articles[0], [articles, activeArticleId]);
  
  const wordCount = useMemo(() => {
    if (!activeArticle) return { title: 0, content: 0, total: 0 };
    const lines = activeArticle.content.split('\n');
    let titleCount = 0;
    let contentCount = 0;

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        
        if (cleanLine.startsWith('#')) {
            const text = cleanLine.replace(/^#+\s*/, '');
            const cn = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
            const en = (text.replace(/[\u4e00-\u9fa5]/g, '').match(/\w+/g) || []).length;
            titleCount += (cn + en);
        } else {
            const text = cleanLine.replace(/[*> \-`\[\]()]/g, '');
            const cn = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
            const en = (text.replace(/[\u4e00-\u9fa5]/g, '').match(/\w+/g) || []).length;
            contentCount += (cn + en);
        }
    });

    return { title: titleCount, content: contentCount, total: titleCount + contentCount };
  }, [activeArticle]);

  // --- EFFECTS ---
  useEffect(() => {
    if (config.editor.autoSave) {
        localStorage.setItem('pixel_md_articles', JSON.stringify(articles));
    }
  }, [articles, config.editor.autoSave]);

  useEffect(() => {
    localStorage.setItem('pixel_md_config', JSON.stringify(config));
  }, [config]);
  
  useEffect(() => {
    localStorage.setItem('pixel_md_themes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem('pixel_md_snippets', JSON.stringify(snippets));
  }, [snippets]);

  // Sync Scroll Implementation
  useEffect(() => {
      const editorEl = editorRef.current;
      const previewEl = previewRef.current;

      if (!editorEl || !previewEl) return;

      const handleEditorScroll = () => {
          if (isScrolling.current === 'preview') return;
          isScrolling.current = 'editor';
          
          const percent = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight);
          const previewTarget = percent * (previewEl.scrollHeight - previewEl.clientHeight);
          previewEl.scrollTop = previewTarget;

          clearTimeout((window as any).scrollTimeout);
          (window as any).scrollTimeout = setTimeout(() => { isScrolling.current = null; }, 100);
      };

      const handlePreviewScroll = () => {
          if (isScrolling.current === 'editor') return;
          isScrolling.current = 'preview';

          const percent = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight);
          const editorTarget = percent * (editorEl.scrollHeight - editorEl.clientHeight);
          editorEl.scrollTop = editorTarget;

          clearTimeout((window as any).scrollTimeout);
          (window as any).scrollTimeout = setTimeout(() => { isScrolling.current = null; }, 100);
      };

      editorEl.addEventListener('scroll', handleEditorScroll);
      previewEl.addEventListener('scroll', handlePreviewScroll);

      return () => {
          editorEl.removeEventListener('scroll', handleEditorScroll);
          previewEl.removeEventListener('scroll', handlePreviewScroll);
      };
  }, []);

  // Selection tracking
  useEffect(() => {
      const handleSelectionChange = () => {
          const sel = window.getSelection();
          if (sel && sel.toString().trim()) {
              setSelection(sel.toString().trim());
          }
      };
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
      if (!config.general.enableShortcuts) return;
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyC') {
              e.preventDefault();
              handleCopy();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);

  // --- ACTIONS: Article Management ---
  const handleMarkdownChange = (newContent: string) => {
      setArticles(prev => prev.map(a => a.id === activeArticleId ? { ...a, content: newContent, lastModified: Date.now() } : a));
  };

  const handleCreateArticle = () => {
      const newArticle: Article = {
          id: `art_${Date.now()}`,
          title: '新文章',
          content: '',
          lastModified: Date.now()
      };
      setArticles(prev => [newArticle, ...prev]);
      setActiveArticleId(newArticle.id);
      setRenamingArticleId(newArticle.id); // Auto start renaming
      setTempTitle('新文章');
  };

  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (articles.length <= 1) {
          showToast("至少保留一篇文章");
          return;
      }
      setDeleteConfirmId(id);
  };

  const executeDeleteArticle = () => {
      if (!deleteConfirmId) return;

      const newArticles = articles.filter(a => a.id !== deleteConfirmId);
      
      // If we are deleting the currently active article, switch to the first available one
      if (deleteConfirmId === activeArticleId && newArticles.length > 0) {
          setActiveArticleId(newArticles[0].id);
      }
      
      setArticles(newArticles);
      setDeleteConfirmId(null);
      showToast("文章已删除");
  };

  const handleDuplicateArticle = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const article = articles.find(a => a.id === id);
      if (!article) return;
      
      const newArticle: Article = {
          ...article,
          id: `art_${Date.now()}`,
          title: `${article.title} (副本)`,
          lastModified: Date.now()
      };
      setArticles(prev => [newArticle, ...prev]);
      showToast("副本已创建");
  };

  const startRenaming = (article: Article, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setRenamingArticleId(article.id);
      setTempTitle(article.title);
  };

  const saveTitle = () => {
      if (renamingArticleId && tempTitle.trim()) {
          setArticles(prev => prev.map(a => a.id === renamingArticleId ? { ...a, title: tempTitle.trim() } : a));
      }
      setRenamingArticleId(null);
  };

  const copyTitle = (title: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(title);
      showToast('标题已复制');
  };

  const handleUpdateTheme = (updatedTheme: Theme) => {
      if (updatedTheme.isCustom) {
          setCustomThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t));
      } else {
          // This case (built-in update) is now handled in ThemeModal via explicit cloning, 
          // but if needed here:
          const newTheme: Theme = {
                 ...updatedTheme,
                 id: `custom_copy_${Date.now()}`,
                 name: `${updatedTheme.name} (Copy)`,
                 isCustom: true
             };
             setCustomThemes(prev => [...prev, newTheme]);
             setConfig(prev => ({ ...prev, preview: { ...prev.preview, themeId: newTheme.id } }));
      }
  };

  // --- COPY LOGIC (Keep existing robust logic) ---
  const handleCopy = () => {
    const previewRoot = document.getElementById('nice');
    if (!previewRoot || !previewRoot.textContent?.trim()) {
        showToast('暂无内容可复制');
        return;
    }
    // ... (Use previous optimized copy logic) ...
    const propertiesToInline = [
        'font-family', 'font-size', 'font-weight', 'font-style', 'color', 
        'text-align', 'line-height', 'letter-spacing', 'text-decoration',
        'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
        'border-top-width', 'border-top-style', 'border-top-color',
        'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left-width', 'border-left-style', 'border-left-color',
        'border-radius', 'border-collapse', 'border-spacing',
        'box-shadow', 'text-shadow', 'opacity',
        'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
        'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
        'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
        'display', 'float', 'clear', 'vertical-align',
        'list-style-type', 'list-style-position', 'text-indent', 'white-space', 'word-break', 'overflow-wrap', 'overflow'
    ];
    const voidElements = new Set(['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);

    const getInlineStyle = (styles: CSSStyleDeclaration) => {
        let styleStr = '';
        propertiesToInline.forEach(p => {
            const val = styles.getPropertyValue(p);
            if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'none' && val !== 'auto' && val !== 'normal' && val !== '0px') {
                styleStr += `${p}:${val};`;
            }
            if ((p.includes('margin') || p.includes('padding')) && val === '0px') styleStr += `${p}:${val};`;
        });
        return styleStr;
    };

    const createPseudoSpan = (styles: CSSStyleDeclaration, type: 'before' | 'after') => {
        const content = styles.getPropertyValue('content');
        if (!content || content === 'none' || content === 'normal' || content === '""') return null;
        const span = document.createElement('span');
        span.innerText = content.replace(/^['"]|['"]$/g, '');
        span.setAttribute('style', getInlineStyle(styles));
        return span;
    };

    const cloneWrapper = document.createElement('section');
    cloneWrapper.setAttribute('data-tool', 'pixel-editor');
    const rootComputed = window.getComputedStyle(previewRoot);
    cloneWrapper.setAttribute('style', `box-sizing: border-box; width: 100%; ${getInlineStyle(rootComputed)}`);

    const processNode = (original: Node): Node => {
        if (original.nodeType === Node.TEXT_NODE) return original.cloneNode(true);
        if (original.nodeType === Node.ELEMENT_NODE) {
            const el = original as HTMLElement;
            const tagName = el.tagName.toUpperCase();
            const styles = window.getComputedStyle(el);
            const clonedEl = el.cloneNode(false) as HTMLElement;
            
            clonedEl.removeAttribute('id');
            clonedEl.removeAttribute('class');
            Object.keys(clonedEl.dataset).forEach(key => delete clonedEl.dataset[key]);
            
            let styleStr = getInlineStyle(styles);
            if (tagName === 'IMG') {
                styleStr += 'max-width: 100% !important; height: auto !important; display: block; visibility: visible !important;';
                if (!styleStr.includes('margin')) styleStr += 'margin: 10px auto;'; 
            }
            if (tagName === 'UL' || tagName === 'OL') {
                styleStr += 'list-style-position: inside; margin-left: 0; padding-left: 20px;';
            }
            clonedEl.setAttribute('style', styleStr);

            if (voidElements.has(tagName)) return clonedEl;

            const beforeSpan = createPseudoSpan(window.getComputedStyle(el, '::before'), 'before');
            if (beforeSpan) clonedEl.appendChild(beforeSpan);

            el.childNodes.forEach(child => {
                const processedChild = processNode(child);
                if(processedChild) clonedEl.appendChild(processedChild);
            });

            const afterSpan = createPseudoSpan(window.getComputedStyle(el, '::after'), 'after');
            if (afterSpan) clonedEl.appendChild(afterSpan);

            return clonedEl;
        }
        return original.cloneNode(true);
    };

    previewRoot.childNodes.forEach(child => cloneWrapper.appendChild(processNode(child)));

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.appendChild(cloneWrapper);
    document.body.appendChild(tempContainer);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(cloneWrapper);
    
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            document.execCommand('copy');
            showToast('已复制 (微信兼容模式)');
        } catch (e) {
            console.error(e);
            alert('复制失败，请重试');
        } finally {
            selection.removeAllRanges();
            document.body.removeChild(tempContainer);
        }
    }
  };

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  // ... (Import/Export handlers remain similar but need to include articles in export)
  const handleExportUserData = () => {
      const data = {
          themes: customThemes,
          snippets: snippets,
          articles: articles // Include articles
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '用户数据备份.json';
      a.click();
      URL.revokeObjectURL(url);
  };
  
  const handleImportUserData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              if(data.themes) setCustomThemes(data.themes);
              if(data.snippets) setSnippets(data.snippets);
              if(data.articles) {
                  setArticles(data.articles);
                  if (data.articles.length > 0) setActiveArticleId(data.articles[0].id);
              }
              showToast('用户数据恢复成功');
          } catch(err) {
              alert('数据文件格式错误');
          }
      };
      reader.readAsText(file);
  };

  const handleImportConfig = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const newConfig = JSON.parse(e.target?.result as string);
              setConfig({...DEFAULT_CONFIG, ...newConfig}); 
              showToast('配置导入成功');
          } catch(err) { alert('配置错误'); }
      };
      reader.readAsText(file);
  };
  
  const handleExportConfig = () => {
      const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '编辑器配置文件.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden text-gray-900 font-sans">
      
      {/* 1. Top Global Toolbar */}
      <div className="h-14 bg-white border-b-2 border-gray-900 flex items-center justify-between px-4 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center text-white font-bold text-lg select-none">M</div>
              <h1 className="font-bold text-lg tracking-tight hidden sm:block">微信公众号编辑器</h1>
          </div>
          <div className="flex items-center gap-3">
              <div className={`hidden md:flex flex-col items-end mr-4 px-3 py-1 border-r-2 border-gray-200 ${wordCount.total > 20000 ? 'text-red-600' : 'text-gray-600'}`}>
                   <span className="text-[10px] font-bold uppercase tracking-wider">{wordCount.total > 20000 ? '字数超标' : '实时字数'}</span>
                   <span className="text-sm font-bold font-mono leading-none">{wordCount.total}</span>
              </div>
              <PixelButton onClick={() => setActiveModal(ModalType.SNIPPET)} className="hidden sm:flex items-center gap-2" variant="secondary">
                  <BookOpen size={16}/> 文案片段
              </PixelButton>
              <PixelButton onClick={() => setActiveModal(ModalType.AI)} className="flex items-center gap-2 !bg-purple-100 hover:!bg-purple-200 border-purple-900 text-purple-900">
                  <MessageSquare size={16}/> AI 助手
              </PixelButton>
              <PixelButton onClick={() => setActiveModal(ModalType.THEME)} className="flex items-center gap-2" variant="secondary">
                  <Palette size={16}/> 主题库
              </PixelButton>
              <PixelButton onClick={() => setActiveModal(ModalType.SETTINGS)} className="flex items-center gap-2" variant="secondary">
                  <Settings size={16}/> 设置
              </PixelButton>
              <PixelButton onClick={handleCopy} className="flex items-center gap-2 !bg-green-100 hover:!bg-green-200 border-green-900 text-green-900" title="快捷键: Ctrl+Shift+C">
                  <Copy size={16}/> 一键复制
              </PixelButton>
          </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* A. Article Sidebar (New) */}
          <div className="w-64 bg-gray-50 border-r-2 border-gray-300 flex flex-col shrink-0 z-10">
              <div className="p-3 border-b-2 border-gray-200 bg-white flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-600">文章列表 ({articles.length})</span>
                  <PixelIconBtn onClick={handleCreateArticle} className="!p-1 bg-blue-100 text-blue-800" title="新建文章">
                      <Plus size={16}/>
                  </PixelIconBtn>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {articles.map(article => (
                      <div 
                          key={article.id}
                          onClick={() => setActiveArticleId(article.id)}
                          className={`group p-2 border-2 cursor-pointer transition-all ${
                              activeArticleId === article.id 
                                ? 'bg-white border-blue-600 shadow-[2px_2px_0_0_#2563eb]' 
                                : 'bg-white border-gray-200 hover:border-gray-400'
                          }`}
                      >
                          <div className="flex items-center gap-2 mb-1">
                              <File size={14} className={activeArticleId === article.id ? 'text-blue-600' : 'text-gray-400'}/>
                              {renamingArticleId === article.id ? (
                                  <input 
                                    className="flex-1 text-sm border-b border-blue-500 outline-none bg-transparent"
                                    value={tempTitle}
                                    onChange={e => setTempTitle(e.target.value)}
                                    onBlur={saveTitle}
                                    onKeyDown={e => e.key === 'Enter' && saveTitle()}
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                  />
                              ) : (
                                  <span className="font-bold text-sm truncate flex-1" title={article.title}>{article.title}</span>
                              )}
                          </div>
                          
                          {/* Article Actions (Visible on Hover/Active) */}
                          <div className={`flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-gray-50 mt-1 ${activeArticleId === article.id ? 'opacity-100' : ''}`}>
                              <button type="button" onClick={(e) => copyTitle(article.title, e)} className="p-1 hover:bg-gray-100 text-gray-500" title="复制标题">
                                  <Copy size={12}/>
                              </button>
                              <button type="button" onClick={(e) => startRenaming(article, e)} className="p-1 hover:bg-gray-100 text-blue-600" title="重命名">
                                  <Edit2 size={12}/>
                              </button>
                              <button type="button" onClick={(e) => handleDuplicateArticle(article.id, e)} className="p-1 hover:bg-gray-100 text-gray-500" title="创建副本">
                                  <FileText size={12}/>
                              </button>
                              <button type="button" onClick={(e) => handleDeleteArticle(article.id, e)} className="p-1 hover:bg-red-50 text-red-500" title="删除">
                                  <Trash2 size={12}/>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* B. Editor */}
          <div style={{ width: `${splitRatio}%` }} className="h-full relative flex flex-col min-w-[300px] border-r border-gray-300">
             <CodeEditor 
                ref={editorRef}
                value={activeArticle?.content || ''} 
                onChange={handleMarkdownChange} 
                fontSize={config.editor.fontSize}
                pastePlainText={config.editor.pastePlainText}
                snippets={snippets}
                onOpenSnippetModal={() => setActiveModal(ModalType.SNIPPET)}
             />
          </div>

          {/* Resizer Handle */}
          <div 
             className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center z-30 active:bg-blue-600 transition-colors border-l border-r border-gray-300"
             onMouseDown={(e) => {
                 e.preventDefault();
                 const startX = e.pageX;
                 const startWidth = splitRatio;
                 const handleMouseMove = (moveEvent: MouseEvent) => {
                     // Need to account for sidebar width (256px approx or calculate dynamically)
                     // Simplifying calculation for relative split between editor/preview
                     const sidebarWidth = 256; 
                     const workspaceWidth = window.innerWidth - sidebarWidth;
                     const relativeX = moveEvent.pageX - sidebarWidth;
                     
                     const newRatio = Math.min(80, Math.max(20, (relativeX / workspaceWidth) * 100));
                     setSplitRatio(newRatio);
                 };
                 const handleMouseUp = () => {
                     document.removeEventListener('mousemove', handleMouseMove);
                     document.removeEventListener('mouseup', handleMouseUp);
                 };
                 document.addEventListener('mousemove', handleMouseMove);
                 document.addEventListener('mouseup', handleMouseUp);
             }}
          >
              <div className="w-0.5 h-8 bg-gray-400 rounded-full"></div>
          </div>

          {/* C. Preview */}
          <div style={{ width: `${100 - splitRatio}%` }} className="h-full min-w-[300px]">
             <Preview ref={previewRef} content={activeArticle?.content || ''} css={activeTheme.css} />
          </div>

      </div>

      {/* 3. Bottom Status Bar */}
      {config.general.showStatusBar && (
          <div className="h-7 bg-white border-t-2 border-gray-900 flex items-center justify-between px-3 select-none text-[11px] font-mono z-20">
              <div className="flex gap-4 items-center">
                  <span className={`font-bold flex items-center gap-1 ${config.editor.autoSave ? 'text-green-700' : 'text-orange-600'}`}>
                      <Check size={12} strokeWidth={3}/> {config.editor.autoSave ? '已自动保存' : '未保存'}
                  </span>
                  <div className="h-3 w-[1px] bg-gray-300"></div>
                  <span className="text-gray-600 font-bold">
                      标题: {wordCount.title} | 正文: {wordCount.content} | 总计: {wordCount.total}
                  </span>
              </div>
              <div className="flex gap-4 text-gray-400">
                  <span className="font-bold text-gray-500">Ctrl+B 加粗 | Ctrl+I 斜体 | Ctrl+Shift+C 复制</span>
              </div>
          </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 border-2 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] z-[100] animate-bounce flex items-center gap-3">
              <CheckCircle size={20} className="text-green-400"/>
              <span className="font-bold">{toastMsg}</span>
          </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deleteConfirmId && (
          <PixelModal 
            isOpen={true} 
            onClose={() => setDeleteConfirmId(null)} 
            title="确认删除"
          >
              <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 bg-red-50 p-3 border border-red-200">
                      <AlertCircle className="text-red-500 shrink-0" size={24}/>
                      <div>
                          <p className="font-bold text-red-900">确定要删除这篇文章吗？</p>
                          <p className="text-sm text-red-700 mt-1">此操作无法撤销。删除后文章内容将永久丢失。</p>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                      <PixelButton variant="secondary" onClick={() => setDeleteConfirmId(null)}>取消</PixelButton>
                      <PixelButton variant="danger" onClick={executeDeleteArticle}>确认删除</PixelButton>
                  </div>
              </div>
          </PixelModal>
      )}

      {/* Modals */}
      <SettingsModal 
        isOpen={activeModal === ModalType.SETTINGS} 
        onClose={() => setActiveModal(ModalType.NONE)}
        config={config}
        onSave={setConfig}
        onImport={handleImportConfig}
        onExport={handleExportConfig}
        onImportUserData={handleImportUserData}
        onExportUserData={handleExportUserData}
      />

      <AIModal 
        isOpen={activeModal === ModalType.AI}
        onClose={() => setActiveModal(ModalType.NONE)}
        config={config}
        selection={selection}
        fullContent={activeArticle?.content || ''}
        onInsertText={(text) => handleMarkdownChange((activeArticle?.content || '') + '\n' + text)}
        onInsertImage={(url) => {
            const imageMarkdown = `\n![AI生成图片](${url})\n`;
            handleMarkdownChange((activeArticle?.content || '') + imageMarkdown);
        }}
        onReplaceContent={(newContent) => handleMarkdownChange(newContent)}
      />

      <ThemeModal 
        isOpen={activeModal === ModalType.THEME}
        onClose={() => setActiveModal(ModalType.NONE)}
        themes={allThemes}
        activeThemeId={activeTheme.id}
        onSelectTheme={(id) => setConfig({...config, preview: {...config.preview, themeId: id}})}
        onAddTheme={(newTheme) => setCustomThemes([...customThemes, newTheme])}
        onUpdateTheme={handleUpdateTheme}
        config={config}
      />

      <SnippetModal 
        isOpen={activeModal === ModalType.SNIPPET}
        onClose={() => setActiveModal(ModalType.NONE)}
        snippets={snippets}
        onAddSnippet={s => setSnippets([...snippets, s])}
        onUpdateSnippet={s => setSnippets(snippets.map(old => old.id === s.id ? s : old))}
        onDeleteSnippet={id => setSnippets(snippets.filter(s => s.id !== id))}
        onInsert={content => {
            handleMarkdownChange((activeArticle?.content || '') + '\n' + content);
            setActiveModal(ModalType.NONE);
        }}
      />
    </div>
  );
};

export default App;