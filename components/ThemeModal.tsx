import React, { useState, useEffect } from 'react';
import { PixelModal, PixelButton, PixelInput } from './PixelComponents';
import { Theme, AppConfig } from '../types';
import { generateThemeCSS } from '../services/geminiService';
import { Code, Check, Sparkles, X, Star, GripVertical, Save, Copy } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  onAddTheme: (theme: Theme) => void;
  onUpdateTheme: (theme: Theme) => void;
  config: AppConfig;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen, onClose, themes, activeThemeId, onSelectTheme, onAddTheme, onUpdateTheme, config
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewCssId, setViewCssId] = useState<string | null>(null);
  const [editingCss, setEditingCss] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  
  // Reset editing CSS when switching themes
  useEffect(() => {
    if (viewCssId) {
        const theme = themes.find(t => t.id === viewCssId);
        if (theme) setEditingCss(theme.css);
    }
  }, [viewCssId, themes]);

  const sortedThemes = [...themes].sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Then custom
      if (a.isCustom && !b.isCustom) return -1;
      return 0;
  });

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
        const css = await generateThemeCSS(config.ai.chat, prompt);
        const newTheme: Theme = {
            id: `custom-${Date.now()}`,
            name: `AI: ${prompt.slice(0, 10)}...`,
            css: css,
            isCustom: true,
            isFavorite: false
        };
        onAddTheme(newTheme);
        setPrompt('');
        setIsAiMode(false);
    } catch (e: any) {
        alert(`生成失败: ${e.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveCss = (originalTheme: Theme) => {
      if (originalTheme.isCustom) {
          // Update existing custom theme
          onUpdateTheme({
              ...originalTheme,
              css: editingCss
          });
          alert('样式已更新');
      } else {
          // Clone built-in theme
          const newTheme: Theme = {
              ...originalTheme,
              id: `custom_clone_${Date.now()}`,
              name: `${originalTheme.name} (Copy)`,
              css: editingCss,
              isCustom: true,
              isFavorite: false
          };
          onAddTheme(newTheme);
          setViewCssId(newTheme.id); // Switch view to new theme
          alert('内置主题已另存为自定义主题');
      }
  };

  const toggleFavorite = (theme: Theme) => {
      onUpdateTheme({
          ...theme,
          isFavorite: !theme.isFavorite
      });
  };
  
  // Drag and Drop State (Placeholder logic preserved from previous implementation)
  const [draggedItem, setDraggedItem] = useState<Theme | null>(null);

  const handleDragStart = (e: React.DragEvent, theme: Theme) => {
      setDraggedItem(theme);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetTheme: Theme) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTheme: Theme) => {
      e.preventDefault();
      setDraggedItem(null);
  };

  const copyCSS = () => {
      navigator.clipboard.writeText(editingCss);
      alert('CSS 代码已复制');
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="主题样式库">
      {/* Header / Actions */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-2">
        <p className="text-xs text-gray-500">内置 {sortedThemes.filter(t=>!t.isCustom).length} 款 / 自定义 {sortedThemes.filter(t=>t.isCustom).length} 款</p>
        {!isAiMode && (
          <PixelButton 
            onClick={() => setIsAiMode(true)} 
            className="flex items-center gap-1 text-xs !bg-yellow-50 hover:!bg-yellow-100 border-yellow-800 text-yellow-900"
          >
            <Sparkles size={14} className="text-yellow-600"/> AI生成新主题
          </PixelButton>
        )}
      </div>

      {/* AI Generation Panel */}
      {isAiMode && (
        <div className="bg-gray-50 p-4 border-2 border-gray-900 mb-6 shadow-[4px_4px_0_0_#000]">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase flex items-center gap-2">
                    <Sparkles size={14} /> 描述主题风格
                </label>
                <button onClick={() => setIsAiMode(false)} className="hover:bg-gray-200 p-1">
                    <X size={14}/>
                </button>
            </div>
            <div className="flex gap-2">
                <PixelInput 
                    value={prompt} 
                    onChange={e => setPrompt(e.target.value)} 
                    placeholder="例如: 赛博朋克风, 极简黑白, 适合科技类文章..." 
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <PixelButton onClick={handleGenerate} disabled={loading} className="whitespace-nowrap min-w-[80px]">
                    {loading ? '生成中...' : '生成'}
                </PixelButton>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">AI将自动生成CSS代码并应用到列表中</p>
        </div>
      )}

      {/* Theme List */}
      <div className="h-[350px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start pr-1">
        {sortedThemes.map(theme => (
            <div 
                key={theme.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, theme)}
                onDragOver={(e) => handleDragOver(e, theme)}
                onDrop={(e) => handleDrop(e, theme)}
                className={`p-4 border-2 relative transition-all flex flex-col group ${activeThemeId === theme.id ? 'border-blue-600 bg-blue-50 shadow-[4px_4px_0_0_#2563eb]' : 'border-gray-300 bg-white hover:border-gray-400'}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <GripVertical size={14} className="text-gray-400 cursor-move opacity-50 group-hover:opacity-100"/>
                        <h4 className="font-bold truncate pr-1 text-sm">{theme.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => toggleFavorite(theme)} className="text-gray-400 hover:text-yellow-500">
                            <Star size={16} fill={theme.isFavorite ? "gold" : "none"} className={theme.isFavorite ? "text-yellow-500" : ""}/>
                        </button>
                        {activeThemeId === theme.id && <Check size={18} className="text-blue-600"/>}
                    </div>
                </div>
                
                <div className="flex-1 min-h-[10px]"></div>

                <div className="flex gap-2 mt-2">
                    <PixelButton 
                        variant={activeThemeId === theme.id ? 'primary' : 'secondary'} 
                        className="flex-1 text-xs"
                        onClick={() => onSelectTheme(theme.id)}
                    >
                        {activeThemeId === theme.id ? '已应用' : '应用'}
                    </PixelButton>
                    <button 
                        onClick={() => setViewCssId(viewCssId === theme.id ? null : theme.id)}
                        className={`p-2 border-2 ${viewCssId === theme.id ? 'bg-gray-800 text-white border-black' : 'border-gray-800 bg-gray-100 hover:bg-gray-200'}`}
                        title="编辑 CSS"
                    >
                        <Code size={14}/>
                    </button>
                </div>

                {viewCssId === theme.id && (
                    <div className="mt-3 relative border-t-2 border-gray-200 pt-2 animate-in fade-in slide-in-from-top-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-gray-500">
                                {theme.isCustom ? '编辑 CSS' : '预览 (保存将自动复制)'}
                            </span>
                        </div>
                        <textarea 
                            value={editingCss} 
                            onChange={(e) => setEditingCss(e.target.value)}
                            className="w-full h-32 text-[10px] font-mono border-2 border-gray-300 p-2 bg-gray-50 resize-none leading-tight outline-none focus:border-blue-500 focus:bg-white"
                            spellCheck={false}
                        />
                        <div className="flex gap-2 mt-2 justify-end">
                            <button 
                                onClick={copyCSS}
                                className="text-[10px] flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 hover:bg-gray-200"
                            >
                                <Copy size={10}/> 复制
                            </button>
                            <button 
                                onClick={() => handleSaveCss(theme)}
                                className="text-[10px] flex items-center gap-1 bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 font-bold"
                            >
                                <Save size={10}/> 保存
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </PixelModal>
  );
};