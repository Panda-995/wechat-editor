import React, { useState, useRef, useEffect } from 'react';
import { PixelModal, PixelButton, PixelInput, PixelSelect } from './PixelComponents';
import { AppConfig, ChatMessage } from '../types';
import { generateChatResponse, generateImage, generateFormattedContent } from '../services/geminiService';
import { Send, Image as ImageIcon, Copy, Sparkles, RefreshCw, ArrowDown, Check, Trash2, Download, LayoutTemplate } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  selection: string;
  fullContent: string;
  onInsertText: (text: string) => void;
  onInsertImage: (url: string) => void;
  onReplaceContent: (content: string) => void;
}

const PRESET_COMMANDS = [
  "检查错别字",
  "修正病句",
  "润色文章",
  "生成文章摘要",
  "提取要点",
  "扩写段落",
  "生成公众号标题",
  "转换为正式风格"
];

const IMAGE_SIZES = [
  { label: '1024x1024 (方形 - 通用)', value: '1024x1024' },
  { label: '16:9 (横版 - 视频/封面)', value: '16:9' },
  { label: '4:3 (标准 - 插图)', value: '4:3' }
];

export const AIModal: React.FC<AIModalProps> = ({
  isOpen, onClose, config, selection, fullContent, onInsertText, onInsertImage, onReplaceContent
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'draw' | 'layout'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Layout State
  const [layoutResult, setLayoutResult] = useState<string | null>(null);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init chat with selection if available
  useEffect(() => {
    if (isOpen && selection) {
      setChatInput(`请帮我优化这段文字：\n"${selection}"`);
    } else if (isOpen && !selection && messages.length === 0) {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: '你好！我是你的 AI 写作助手。我可以帮你润色文章、检查错别字、生成标题，或者创作配图。\n请在下方输入指令，或选择预设指令。',
            timestamp: Date.now()
        }]);
    }
  }, [isOpen, selection]);

  /* --- CHAT HANDLERS --- */
  const handleSendMessage = async (text: string = chatInput) => {
    if (!text.trim()) return;
    
    // Check Config
    if (!config.ai.chat.apiKey) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: '错误：请先在“设置”中配置 AI 对话模型的 API Key。', timestamp: Date.now() }]);
        return;
    }

    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const historyForService = messages.map(m => ({ role: m.role, text: m.text }));
        const responseText = await generateChatResponse(config.ai.chat, text, historyForService);
        
        const newAiMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
        setMessages(prev => [...prev, newAiMsg]);
    } catch (error: any) {
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: `请求失败: ${error.message}`, timestamp: Date.now() }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleCommandClick = (cmd: string) => {
      let prompt = cmd;
      if (selection) {
          prompt = `${cmd}：\n"${selection}"`;
      } else if (fullContent.length < 500) {
          prompt = `${cmd}，针对以下全文：\n"${fullContent}"`;
      } else {
          prompt = `${cmd} (请先在编辑器中选中需要处理的文字)`;
          if(!selection) {
              alert('请先在左侧编辑器选中需要处理的文字');
              return;
          }
      }
      setChatInput(prompt);
  };

  /* --- IMAGE HANDLERS --- */
  const handleGenerateImage = async () => {
      if (!imagePrompt.trim()) return;

      if (!config.ai.image.apiKey && !config.ai.chat.apiKey) {
          alert('请先在“设置”中配置绘图 API Key');
          return;
      }

      setIsImageLoading(true);
      setGeneratedImageUrl(null);

      try {
          // Use image config if available, fallback to chat config (common key)
          const aiConfig = config.ai.image.apiKey ? config.ai.image : { ...config.ai.chat, imageModel: config.ai.image.imageModel || 'gemini-2.5-flash-image' };
          
          const url = await generateImage(aiConfig, imagePrompt, imageSize);
          setGeneratedImageUrl(url);
      } catch (error: any) {
          alert(`绘图失败: ${error.message}`);
      } finally {
          setIsImageLoading(false);
      }
  };

  /* --- LAYOUT HANDLERS --- */
  const handleAutoLayout = async () => {
      if (!fullContent || fullContent.trim().length < 10) {
          alert('编辑器内容太少，请先输入文章内容');
          return;
      }
      
      if (!config.ai.chat.apiKey) {
          alert('请先在“设置”中配置 AI API Key');
          return;
      }

      setIsLayoutLoading(true);
      try {
          const formatted = await generateFormattedContent(config.ai.chat, fullContent);
          setLayoutResult(formatted);
      } catch (e: any) {
          alert(`排版失败: ${e.message}`);
      } finally {
          setIsLayoutLoading(false);
      }
  };

  const applyLayout = () => {
      if (layoutResult) {
          onReplaceContent(layoutResult);
          onClose();
          setLayoutResult(null);
      }
  };

  /* --- UTILS --- */
  const clearHistory = () => {
      if(window.confirm('确定清空对话历史吗？')) setMessages([]);
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="AI 智能助手">
      {/* TABS */}
      <div className="flex border-b-2 border-gray-900 mb-4 bg-gray-100">
        <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-white border-b-2 border-white text-purple-900' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            <Sparkles size={16}/> 对话助手
        </button>
        <button 
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'layout' ? 'bg-white border-b-2 border-white text-blue-900' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            <LayoutTemplate size={16}/> 智能排版
        </button>
        <button 
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'draw' ? 'bg-white border-b-2 border-white text-green-900' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            <ImageIcon size={16}/> AI 绘图
        </button>
      </div>

      {/* --- CHAT TAB CONTENT --- */}
      {activeTab === 'chat' && (
          <div className="flex flex-col h-[500px]">
              
              {/* Chat History Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 border-2 border-gray-200 mb-4 font-sans space-y-4">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 text-sm relative border-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] ${
                              msg.role === 'user' 
                                ? 'bg-blue-100 border-blue-800 text-blue-900' 
                                : 'bg-white border-gray-800 text-gray-800'
                          }`}>
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                              
                              {/* Action Buttons for AI Responses */}
                              {msg.role === 'model' && (
                                  <div className="mt-3 pt-2 border-t border-gray-200/50 flex flex-wrap gap-2 justify-end">
                                      <button 
                                        onClick={() => { navigator.clipboard.writeText(msg.text); alert('已复制'); }}
                                        className="text-[10px] flex items-center gap-1 px-2 py-1 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-colors"
                                      >
                                          <Copy size={12}/> 复制
                                      </button>
                                      {selection && (
                                        <button 
                                            onClick={() => onReplaceContent(fullContent.replace(selection, msg.text))}
                                            className="text-[10px] flex items-center gap-1 px-2 py-1 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 transition-colors"
                                        >
                                            <RefreshCw size={12}/> 替换选中
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => onInsertText(msg.text)}
                                        className="text-[10px] flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 transition-colors"
                                      >
                                          <ArrowDown size={12}/> 插入文末
                                      </button>
                                  </div>
                              )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                              {msg.role === 'user' ? '我' : 'AI 助手'}
                          </span>
                      </div>
                  ))}
                  {isChatLoading && (
                      <div className="flex items-start">
                          <div className="bg-gray-100 border-2 border-gray-400 p-3 text-sm text-gray-500 animate-pulse">
                              AI 正在思考中...
                          </div>
                      </div>
                  )}
                  <div ref={chatEndRef}></div>
              </div>

              {/* Preset Commands */}
              <div className="mb-3 overflow-x-auto pb-2">
                  <div className="flex gap-2">
                      {PRESET_COMMANDS.map(cmd => (
                          <button 
                            key={cmd}
                            onClick={() => handleCommandClick(cmd)}
                            className="px-3 py-1 bg-white border border-gray-400 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 whitespace-nowrap transition-colors"
                          >
                              {cmd}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                      <textarea
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="输入你的需求（Shift+Enter 换行）..."
                        className="w-full h-20 p-2 border-2 border-gray-900 bg-white text-sm outline-none resize-none focus:bg-gray-50"
                      />
                      {messages.length > 0 && (
                          <button 
                            onClick={clearHistory}
                            className="absolute bottom-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                            title="清空历史"
                          >
                              <Trash2 size={14}/>
                          </button>
                      )}
                  </div>
                  <PixelButton onClick={() => handleSendMessage()} disabled={isChatLoading} className="h-20 w-20 flex flex-col items-center justify-center gap-1">
                      <Send size={20}/>
                      <span className="text-xs">发送</span>
                  </PixelButton>
              </div>
          </div>
      )}

      {/* --- LAYOUT TAB CONTENT --- */}
      {activeTab === 'layout' && (
           <div className="h-[500px] flex flex-col">
              {!layoutResult ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                     <div className="p-6 bg-blue-50 border-2 border-blue-200 shadow-[4px_4px_0_0_#93c5fd]">
                        <LayoutTemplate size={64} className="text-blue-600" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-bold">AI 智能排版优化</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                            自动识别文章结构，优化标题层级 (H1-H2)，拆分过长段落，
                            添加引用块与列表，并调整符合公众号阅读习惯的间距。
                        </p>
                     </div>
                     <PixelButton 
                        onClick={handleAutoLayout} 
                        disabled={isLayoutLoading}
                        className="!py-3 !px-8 text-lg flex items-center gap-2 mt-4"
                     >
                        {isLayoutLoading ? <RefreshCw className="animate-spin"/> : <Sparkles/>} 
                        {isLayoutLoading ? '正在分析排版中...' : '开始一键排版'}
                     </PixelButton>
                 </div>
              ) : (
                 <div className="flex flex-col h-full">
                     <div className="flex justify-between items-center mb-2 px-1 border-b-2 border-gray-100 pb-2">
                         <span className="font-bold text-sm text-gray-600 flex items-center gap-2">
                             <Check className="text-green-500" size={16}/> 排版预览
                         </span>
                         <button onClick={() => setLayoutResult(null)} className="text-xs text-blue-600 hover:underline font-bold">
                             &lt; 返回重新排版
                         </button>
                     </div>
                     
                     <div className="flex-1 border-2 border-gray-900 bg-gray-50 overflow-y-auto mb-4 relative">
                         <div className="p-6 bg-white min-h-full">
                             {/* Preview Render: Using Tailwind Typography (prose) */}
                             <div className="prose prose-sm max-w-none prose-p:my-4 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic">
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {layoutResult}
                                 </ReactMarkdown>
                             </div>
                         </div>
                     </div>

                     <div className="flex gap-4">
                         <PixelButton onClick={handleAutoLayout} disabled={isLayoutLoading} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                            <RefreshCw size={16}/> 重新生成
                         </PixelButton>
                         <PixelButton onClick={applyLayout} className="flex-1 flex items-center justify-center gap-2 !bg-green-100 border-green-800 text-green-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                            <Check size={16}/> 确认应用到编辑器
                         </PixelButton>
                     </div>
                 </div>
              )}
           </div>
      )}

      {/* --- DRAW TAB CONTENT --- */}
      {activeTab === 'draw' && (
          <div className="h-[500px] flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Left: Controls */}
                  <div className="col-span-1 flex flex-col gap-4 border-r-2 border-gray-100 pr-4">
                      <div>
                          <label className="text-xs font-bold block mb-1 text-gray-600">画面描述 (Prompt)</label>
                          <textarea 
                             className="w-full h-32 p-2 border-2 border-gray-900 text-sm resize-none focus:bg-blue-50 outline-none"
                             placeholder="例如：一张像素风的公众号封面，画面中有书桌、咖啡和电脑，暖色调..."
                             value={imagePrompt}
                             onChange={e => setImagePrompt(e.target.value)}
                          />
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold block mb-1 text-gray-600">图片比例</label>
                          <PixelSelect value={imageSize} onChange={e => setImageSize(e.target.value)}>
                              {IMAGE_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </PixelSelect>
                      </div>

                      <PixelButton 
                        onClick={handleGenerateImage} 
                        disabled={isImageLoading || !imagePrompt}
                        className="mt-2 py-3 !bg-green-100 hover:!bg-green-200 border-green-800 text-green-900"
                      >
                          {isImageLoading ? 'AI 正在绘图中...' : '立即生成图片'}
                      </PixelButton>
                      
                      <div className="mt-auto bg-yellow-50 p-3 border border-yellow-200 text-xs text-yellow-800 leading-relaxed">
                          <p className="font-bold mb-1">💡 提示：</p>
                          推荐使用 Gemini 或 DALL·E 3 模型。描述越详细，效果越好。支持中文描述。
                      </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="col-span-2 bg-gray-100 border-2 border-gray-300 border-dashed flex items-center justify-center relative overflow-hidden group">
                      {isImageLoading ? (
                          <div className="text-center animate-pulse">
                              <Sparkles size={48} className="mx-auto text-gray-400 mb-2"/>
                              <p className="text-gray-500 font-bold">正在精心绘制...</p>
                          </div>
                      ) : generatedImageUrl ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                              <img src={generatedImageUrl} alt="AI Generated" className="max-w-full max-h-full shadow-lg border-2 border-white"/>
                              
                              {/* Overlay Actions */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PixelButton 
                                    onClick={() => { onInsertImage(generatedImageUrl); onClose(); }} 
                                    className="!bg-white shadow-lg flex items-center gap-1"
                                  >
                                      <Check size={16}/> 插入到文章
                                  </PixelButton>
                                  <PixelButton 
                                    onClick={() => window.open(generatedImageUrl, '_blank')} 
                                    variant="secondary"
                                    className="!bg-white shadow-lg flex items-center gap-1"
                                  >
                                      <Download size={16}/> 查看原图
                                  </PixelButton>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center text-gray-400">
                              <ImageIcon size={48} className="mx-auto mb-2 opacity-20"/>
                              <p className="text-xs">在此处预览 AI 生成的图片</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </PixelModal>
  );
};