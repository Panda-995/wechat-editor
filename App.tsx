import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Palette, Settings, Check, MoreVertical, Copy, FileText, Split, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { AppConfig, Theme, UserData, ModalType, Snippet } from './types';
import { DEFAULT_CONFIG, DEFAULT_MARKDOWN, BUILT_IN_THEMES, DEFAULT_SNIPPETS } from './constants';
import { CodeEditor } from './components/Editor';
import { Preview } from './components/Preview';
import { SettingsModal } from './components/SettingsModal';
import { AIModal } from './components/AIModal';
import { ThemeModal } from './components/ThemeModal';
import { SnippetModal } from './components/SnippetModal';
import { PixelButton, PixelIconBtn } from './components/PixelComponents';

const App: React.FC = () => {
  // State
  const [markdown, setMarkdown] = useState<string>(() => localStorage.getItem('pixel_md_content') || DEFAULT_MARKDOWN);
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
  
  // Computed
  const allThemes = useMemo(() => [...BUILT_IN_THEMES, ...customThemes], [customThemes]);
  const activeTheme = useMemo(() => allThemes.find(t => t.id === config.preview.themeId) || allThemes[0], [allThemes, config.preview.themeId]);
  
  const wordCount = useMemo(() => {
    const lines = markdown.split('\n');
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

    return {
        title: titleCount,
        content: contentCount,
        total: titleCount + contentCount
    };
  }, [markdown]);

  // Effects
  useEffect(() => {
    if (config.editor.autoSave) {
        localStorage.setItem('pixel_md_content', markdown);
    }
  }, [markdown, config.editor.autoSave]);

  useEffect(() => {
    localStorage.setItem('pixel_md_config', JSON.stringify(config));
  }, [config]);
  
  useEffect(() => {
    localStorage.setItem('pixel_md_themes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem('pixel_md_snippets', JSON.stringify(snippets));
  }, [snippets]);

  // Selection tracking for AI
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
          // Copy Formatted: Ctrl + Shift + C
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyC') {
              e.preventDefault();
              handleCopy();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);

  // Actions
  const handleCopy = () => {
    const previewRoot = document.getElementById('preview-root');
    if (!previewRoot || !previewRoot.textContent?.trim()) {
        showToast('暂无内容可复制');
        return;
    }
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(previewRoot);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    try {
        document.execCommand('copy');
        showToast('公众号格式复制成功！可直接粘贴到后台');
    } catch (e) {
        alert('复制失败，请尝试手动复制');
    }
    
    selection?.removeAllRanges();
  };

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  // Import/Export Handlers
  const handleImportConfig = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const newConfig = JSON.parse(e.target?.result as string);
              setConfig({...DEFAULT_CONFIG, ...newConfig}); // Merge to be safe
              showToast('配置导入成功');
          } catch(err) {
              alert('配置文件格式错误');
          }
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

  const handleImportUserData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              // Expected structure: { themes: [], snippets: [] }
              if(data.themes) setCustomThemes(data.themes);
              if(data.snippets) setSnippets(data.snippets);
              showToast('用户数据恢复成功');
          } catch(err) {
              alert('数据文件格式错误');
          }
      };
      reader.readAsText(file);
  };

  const handleExportUserData = () => {
      const data = {
          themes: customThemes,
          snippets: snippets
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '用户数据备份.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden text-gray-900 font-sans">
      
      {/* 1. Top Global Toolbar */}
      <div className="h-14 bg-white border-b-2 border-gray-900 flex items-center justify-between px-4 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] z-20">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center text-white font-bold text-lg select-none">M</div>
              <h1 className="font-bold text-lg tracking-tight hidden sm:block">微信公众号编辑器</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
              {/* Word Count Indicator */}
              <div className={`hidden md:flex flex-col items-end mr-4 px-3 py-1 border-r-2 border-gray-200 ${wordCount.total > 20000 ? 'text-red-600' : 'text-gray-600'}`}>
                   <span className="text-[10px] font-bold uppercase tracking-wider">
                       {wordCount.total > 20000 ? '字数超标' : '实时字数'}
                   </span>
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

      {/* 2. Main Workspace (Split View) */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left: Editor */}
          <div style={{ width: `${splitRatio}%` }} className="h-full relative flex flex-col min-w-[300px]">
             <CodeEditor 
                value={markdown} 
                onChange={setMarkdown} 
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
                     const totalWidth = window.innerWidth;
                     const delta = moveEvent.pageX - startX;
                     const newRatio = Math.min(80, Math.max(20, startWidth + (delta / totalWidth) * 100));
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

          {/* Right: Preview */}
          <div style={{ width: `${100 - splitRatio}%` }} className="h-full min-w-[300px]">
             <Preview content={markdown} css={activeTheme.css} />
          </div>

      </div>

      {/* 3. Bottom Status Bar */}
      {config.general.showStatusBar && (
          <div className="h-7 bg-white border-t-2 border-gray-900 flex items-center justify-between px-3 select-none text-[11px] font-mono">
              <div className="flex gap-4 items-center">
                  <span className={`font-bold flex items-center gap-1 ${config.editor.autoSave ? 'text-green-700' : 'text-orange-600'}`}>
                      <Check size={12} strokeWidth={3}/> {config.editor.autoSave ? '已自动保存' : '未保存'}
                  </span>
                  <div className="h-3 w-[1px] bg-gray-300"></div>
                  <span className="text-gray-600 font-bold">
                      标题: {wordCount.title} | 正文: {wordCount.content} | 总计: {wordCount.total}
                  </span>
                  {wordCount.total >= 300 && wordCount.total <= 20000 && (
                      <span className="text-green-600 font-bold ml-2">✓ 符合公众号建议字数</span>
                  )}
              </div>
              <div className="flex gap-4 text-gray-400">
                  <span className="hidden sm:inline">Markdown 语法支持中</span>
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
        fullContent={markdown}
        onInsertText={(text) => setMarkdown(prev => prev + '\n' + text)}
        onInsertImage={(url) => {
            const imageMarkdown = `\n![AI生成图片](${url})\n`;
            setMarkdown(prev => prev + imageMarkdown);
        }}
        onReplaceContent={(newContent) => setMarkdown(newContent)}
      />

      <ThemeModal 
        isOpen={activeModal === ModalType.THEME}
        onClose={() => setActiveModal(ModalType.NONE)}
        themes={allThemes}
        activeThemeId={activeTheme.id}
        onSelectTheme={(id) => setConfig({...config, preview: {...config.preview, themeId: id}})}
        onAddTheme={(newTheme) => setCustomThemes([...customThemes, newTheme])}
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
            setMarkdown(prev => prev + '\n' + content);
            setActiveModal(ModalType.NONE);
        }}
      />
    </div>
  );
};

export default App;