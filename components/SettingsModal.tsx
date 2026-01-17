import React, { useState, useRef } from 'react';
import { PixelModal, PixelButton, PixelInput, PixelSelect, PixelLabel, PixelSwitch } from './PixelComponents';
import { AppConfig } from '../types';
import { generateChatResponse, generateImage } from '../services/geminiService';
import { DEFAULT_CONFIG } from '../constants';
import { Upload, Download, RefreshCw, Save, CheckCircle, AlertTriangle, Terminal, Image as ImageIcon, MessageSquare } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onImportUserData: (file: File) => void;
  onExportUserData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, config, onSave, onImport, onExport, onImportUserData, onExportUserData
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'data'>('data');
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [testStatus, setTestStatus] = useState<{msg: string, type: 'success' | 'error' | 'loading' | ''}>({msg: '', type: ''});
  
  // Refs for file inputs
  const configInputRef = useRef<HTMLInputElement>(null);
  const userDataInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const handleReset = () => {
      if(window.confirm('确定要恢复默认设置吗？所有自定义配置将丢失。')) {
          setTempConfig(DEFAULT_CONFIG);
      }
  };

  const testChat = async () => {
    setTestStatus({msg: '正在测试 Chat 接口...', type: 'loading'});
    try {
        await generateChatResponse(tempConfig.ai.chat, '你好');
        setTestStatus({msg: 'Chat 接口连接成功！', type: 'success'});
    } catch (e: any) {
        setTestStatus({msg: `Chat 测试失败: ${e.message}`, type: 'error'});
    }
  };

  const testImage = async () => {
    setTestStatus({msg: '正在测试绘图接口...', type: 'loading'});
    try {
        await generateImage(tempConfig.ai.image, '一个像素风的盒子');
        setTestStatus({msg: '绘图接口连接成功！', type: 'success'});
    } catch (e: any) {
        setTestStatus({msg: `绘图测试失败: ${e.message}`, type: 'error'});
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'config' | 'user') => {
      if(e.target.files?.[0]) {
          if(type === 'config') onImport(e.target.files[0]);
          if(type === 'user') onImportUserData(e.target.files[0]);
      }
      // Reset input
      if(e.target) e.target.value = '';
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="系统全局设置">
      <div className="flex border-b-2 border-gray-900 mb-4 bg-gray-100">
        <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'data' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            配置与数据
        </button>
        <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'general' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            基础设置
        </button>
        <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'ai' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            AI 全局配置
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto px-1">
        
        {/* TAB 1: DATA */}
        {activeTab === 'data' && (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Save size={16}/> 配置文件管理 (JSON)
                    </h4>
                    <p className="text-xs text-blue-700 mb-4">包含所有设置项、API Key、字数统计规则等系统级配置。</p>
                    <div className="flex gap-4">
                        <PixelButton onClick={onExport} className="flex-1">
                            <Download size={14} className="inline mr-1"/> 导出配置
                        </PixelButton>
                        <PixelButton onClick={() => configInputRef.current?.click()} variant="secondary" className="flex-1">
                            <Upload size={14} className="inline mr-1"/> 导入配置
                        </PixelButton>
                        <input type="file" ref={configInputRef} className="hidden" accept=".json" onChange={e => handleFileChange(e, 'config')} />
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 border-2 border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <Save size={16}/> 用户数据备份 (JSON)
                    </h4>
                    <p className="text-xs text-yellow-800 mb-4">包含所有文章草稿、收藏主题、AI历史记录、自定义片段库。</p>
                    <div className="flex gap-4">
                        <PixelButton onClick={onExportUserData} className="flex-1">
                            <Download size={14} className="inline mr-1"/> 导出用户数据
                        </PixelButton>
                        <PixelButton onClick={() => userDataInputRef.current?.click()} variant="secondary" className="flex-1">
                            <Upload size={14} className="inline mr-1"/> 导入用户数据
                        </PixelButton>
                        <input type="file" ref={userDataInputRef} className="hidden" accept=".json" onChange={e => handleFileChange(e, 'user')} />
                    </div>
                </div>

                <div className="pt-4 border-t-2 border-gray-100">
                    <button onClick={handleReset} className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1">
                        <RefreshCw size={12}/> 恢复编辑器默认出厂设置
                    </button>
                </div>
            </div>
        )}

        {/* TAB 2: GENERAL */}
        {activeTab === 'general' && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <PixelLabel>编辑区字体大小</PixelLabel>
                        <PixelSelect 
                            value={tempConfig.editor.fontSize}
                            onChange={(e) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, fontSize: parseInt(e.target.value)}})}
                        >
                            <option value="12">12px (小)</option>
                            <option value="14">14px (标准)</option>
                            <option value="16">16px (大)</option>
                            <option value="18">18px (特大)</option>
                        </PixelSelect>
                    </div>
                    <div>
                        <PixelLabel>缩进大小 (Tab)</PixelLabel>
                        <PixelSelect 
                            value={tempConfig.editor.tabSize}
                            onChange={(e) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, tabSize: parseInt(e.target.value)}})}
                        >
                            <option value="2">2 个字符</option>
                            <option value="4">4 个字符</option>
                        </PixelSelect>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-sm font-bold">显示行号</span>
                        <PixelSwitch 
                            checked={tempConfig.editor.showLineNumbers}
                            onChange={v => setTempConfig({...tempConfig, editor: {...tempConfig.editor, showLineNumbers: v}})}
                        />
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-sm font-bold">自动保存 (每3秒)</span>
                        <PixelSwitch 
                            checked={tempConfig.editor.autoSave}
                            onChange={v => setTempConfig({...tempConfig, editor: {...tempConfig.editor, autoSave: v}})}
                        />
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-sm font-bold">默认粘贴为纯文本</span>
                        <PixelSwitch 
                            checked={tempConfig.editor.pastePlainText}
                            onChange={v => setTempConfig({...tempConfig, editor: {...tempConfig.editor, pastePlainText: v}})}
                        />
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-sm font-bold">显示底部状态栏</span>
                        <PixelSwitch 
                            checked={tempConfig.general.showStatusBar}
                            onChange={v => setTempConfig({...tempConfig, general: {...tempConfig.general, showStatusBar: v}})}
                        />
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-sm font-bold">启用快捷键 (Ctrl+S等)</span>
                        <PixelSwitch 
                            checked={tempConfig.general.enableShortcuts}
                            onChange={v => setTempConfig({...tempConfig, general: {...tempConfig.general, enableShortcuts: v}})}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* TAB 3: AI CONFIG */}
        {activeTab === 'ai' && (
            <div className="space-y-6">
                
                {/* Chat Config */}
                <div className="border-2 border-gray-200 p-3 bg-gray-50">
                    <h4 className="font-bold mb-3 text-purple-900 border-b border-gray-200 pb-1 flex items-center gap-2">
                        <MessageSquare size={16}/> AI 对话模型配置 (文本/排版)
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <PixelLabel>模型选择 (Model Name)</PixelLabel>
                            <PixelInput 
                                value={tempConfig.ai.chat.chatModel}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, chat: {...tempConfig.ai.chat, chatModel: e.target.value}}})}
                                placeholder="例如: gemini-3-flash-preview"
                            />
                        </div>
                        <div>
                            <PixelLabel>API 密钥 (API Key)</PixelLabel>
                            <PixelInput 
                                type="password"
                                value={tempConfig.ai.chat.apiKey}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, chat: {...tempConfig.ai.chat, apiKey: e.target.value}}})}
                                placeholder="输入您的 API Key..."
                            />
                        </div>
                        <div>
                            <PixelLabel>Base URL (可选 - 用于自定义代理)</PixelLabel>
                            <PixelInput 
                                value={tempConfig.ai.chat.baseUrl}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, chat: {...tempConfig.ai.chat, baseUrl: e.target.value}}})}
                                placeholder="例如: https://my-openai-proxy.com"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <PixelButton onClick={testChat} className="text-xs h-8" variant="secondary">测试对话接口</PixelButton>
                        </div>
                    </div>
                </div>

                {/* Image Config */}
                <div className="border-2 border-gray-200 p-3 bg-gray-50">
                    <h4 className="font-bold mb-3 text-green-900 border-b border-gray-200 pb-1 flex items-center gap-2">
                        <ImageIcon size={16}/> AI 绘图模型配置
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <PixelLabel>绘图模型 (Model Name)</PixelLabel>
                            <PixelInput 
                                value={tempConfig.ai.image.imageModel}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, image: {...tempConfig.ai.image, imageModel: e.target.value}}})}
                                placeholder="例如: imagen-4.0-generate-001 或 gemini-2.5-flash-image"
                            />
                        </div>
                        <div>
                            <PixelLabel>API 密钥 (API Key)</PixelLabel>
                            <PixelInput 
                                type="password"
                                value={tempConfig.ai.image.apiKey}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, image: {...tempConfig.ai.image, apiKey: e.target.value}}})}
                                placeholder="输入绘图专用 Key (如相同可留空)"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">*如果留空，将默认使用上方的对话 API Key</p>
                        </div>
                        <div>
                            <PixelLabel>Base URL (可选)</PixelLabel>
                            <PixelInput 
                                value={tempConfig.ai.image.baseUrl}
                                onChange={e => setTempConfig({...tempConfig, ai: {...tempConfig.ai, image: {...tempConfig.ai.image, baseUrl: e.target.value}}})}
                                placeholder="自定义绘图接口代理地址"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <PixelButton onClick={testImage} className="text-xs h-8" variant="secondary">测试绘图接口</PixelButton>
                        </div>
                    </div>
                </div>

                {/* Test Result Display */}
                {testStatus.msg && (
                    <div className={`p-3 border-2 text-xs font-bold flex items-center gap-2 ${
                        testStatus.type === 'success' ? 'bg-green-100 border-green-600 text-green-800' : 
                        testStatus.type === 'error' ? 'bg-red-100 border-red-600 text-red-800' : 
                        'bg-blue-100 border-blue-600 text-blue-800'
                    }`}>
                        {testStatus.type === 'success' && <CheckCircle size={14}/>}
                        {testStatus.type === 'error' && <AlertTriangle size={14}/>}
                        {testStatus.type === 'loading' && <Terminal size={14} className="animate-spin"/>}
                        {testStatus.msg}
                    </div>
                )}
            </div>
        )}

      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t-2 border-gray-900">
        <PixelButton onClick={onClose} variant="secondary">取消</PixelButton>
        <PixelButton onClick={handleSave} className="!bg-blue-600 !text-white hover:!bg-blue-700">保存设置</PixelButton>
      </div>
    </PixelModal>
  );
};