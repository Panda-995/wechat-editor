import React, { useState, useRef } from 'react';
import { PixelModal, PixelButton, PixelInput, PixelSelect, PixelLabel, PixelSwitch } from './PixelComponents';
import { AppConfig, AIConfig } from '../types';
import { generateChatResponse, generateImage } from '../services/geminiService';
import { DEFAULT_CONFIG } from '../constants';
import { Upload, Download, RefreshCw, Save, CheckCircle, AlertTriangle, Terminal, Image as ImageIcon, MessageSquare, Server, Key, Cpu, Globe } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'data'>('ai');
  const [tempConfig, setTempConfig] = useState<AppConfig>(JSON.parse(JSON.stringify(config)));
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

  const updateAiConfig = (type: 'chat' | 'image', field: keyof AIConfig, value: any) => {
      setTempConfig(prev => ({
          ...prev,
          ai: {
              ...prev.ai,
              [type]: {
                  ...prev.ai[type],
                  [field]: value
              }
          }
      }));
  };

  const handleProviderChange = (type: 'chat' | 'image', provider: 'gemini' | 'openai') => {
      const isChat = type === 'chat';
      const defaults = {
          gemini: {
              baseUrl: '',
              model: isChat ? 'gemini-3-flash-preview' : 'gemini-2.5-flash-image'
          },
          openai: {
              baseUrl: 'https://api.openai.com/v1',
              model: isChat ? 'gpt-4o-mini' : 'dall-e-3'
          }
      };

      setTempConfig(prev => ({
          ...prev,
          ai: {
              ...prev.ai,
              [type]: {
                  ...prev.ai[type],
                  provider: provider,
                  baseUrl: defaults[provider].baseUrl,
                  [isChat ? 'chatModel' : 'imageModel']: defaults[provider].model
              }
          }
      }));
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
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'ai' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            AI 全局配置
        </button>
        <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'general' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            基础设置
        </button>
        <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 font-bold text-sm ${activeTab === 'data' ? 'bg-white border-b-2 border-white text-blue-800' : 'text-gray-500 hover:bg-gray-200'}`}
        >
            数据管理
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto px-1">
        
        {/* TAB: AI CONFIGURATION */}
        {activeTab === 'ai' && (
            <div className="space-y-6">
                
                {/* Chat Config Section */}
                <div className="bg-purple-50 p-4 border-2 border-purple-200 shadow-sm relative">
                    <div className="absolute top-2 right-2 text-purple-200">
                        <MessageSquare size={48} strokeWidth={1} />
                    </div>
                    <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg border-b border-purple-200 pb-2">
                        <MessageSquare size={18}/> 对话模型 (Chat)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <PixelLabel>服务提供商 (Provider)</PixelLabel>
                            <PixelSelect 
                                value={tempConfig.ai.chat.provider} 
                                onChange={(e) => handleProviderChange('chat', e.target.value as any)}
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI / Compatible</option>
                            </PixelSelect>
                        </div>
                         <div className="col-span-1">
                            <PixelLabel>API Key</PixelLabel>
                            <div className="relative">
                                <Key size={14} className="absolute left-2 top-3 text-gray-400"/>
                                <PixelInput 
                                    type="password"
                                    value={tempConfig.ai.chat.apiKey}
                                    onChange={(e) => updateAiConfig('chat', 'apiKey', e.target.value)}
                                    placeholder="sk-..."
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <PixelLabel>Base URL (接口地址)</PixelLabel>
                            <div className="relative">
                                <Globe size={14} className="absolute left-2 top-3 text-gray-400"/>
                                <PixelInput 
                                    value={tempConfig.ai.chat.baseUrl}
                                    onChange={(e) => updateAiConfig('chat', 'baseUrl', e.target.value)}
                                    placeholder={tempConfig.ai.chat.provider === 'gemini' ? '默认空 (使用 Google SDK)' : 'https://api.openai.com/v1'}
                                    className="pl-8"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {tempConfig.ai.chat.provider === 'gemini' 
                                    ? 'Gemini 默认留空即可。如需反代请填写完整地址。' 
                                    : 'OpenAI 默认为 https://api.openai.com/v1，支持 DeepSeek 等兼容接口。'}
                            </p>
                        </div>
                        <div className="col-span-1">
                            <PixelLabel>模型名称 (Model Name)</PixelLabel>
                            <div className="relative">
                                <Cpu size={14} className="absolute left-2 top-3 text-gray-400"/>
                                <PixelInput 
                                    value={tempConfig.ai.chat.chatModel}
                                    onChange={(e) => updateAiConfig('chat', 'chatModel', e.target.value)}
                                    placeholder="gemini-3-flash-preview"
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="col-span-1">
                             <PixelLabel>随机性 (Temperature): {tempConfig.ai.chat.temperature}</PixelLabel>
                             <input 
                                type="range" 
                                min="0" max="1" step="0.1"
                                value={tempConfig.ai.chat.temperature}
                                onChange={(e) => updateAiConfig('chat', 'temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-gray-900"
                             />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <PixelButton onClick={testChat} variant="secondary" className="flex items-center gap-1 text-xs">
                            <Terminal size={14}/> 测试对话连接
                        </PixelButton>
                    </div>
                </div>

                {/* Image Config Section */}
                <div className="bg-green-50 p-4 border-2 border-green-200 shadow-sm relative">
                    <div className="absolute top-2 right-2 text-green-200">
                        <ImageIcon size={48} strokeWidth={1} />
                    </div>
                    <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg border-b border-green-200 pb-2">
                        <ImageIcon size={18}/> 绘图模型 (Image)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <PixelLabel>服务提供商</PixelLabel>
                            <PixelSelect 
                                value={tempConfig.ai.image.provider} 
                                onChange={(e) => handleProviderChange('image', e.target.value as any)}
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI / Compatible</option>
                            </PixelSelect>
                        </div>
                        <div className="col-span-1">
                            <PixelLabel>API Key (可选)</PixelLabel>
                            <PixelInput 
                                type="password"
                                value={tempConfig.ai.image.apiKey}
                                onChange={(e) => updateAiConfig('image', 'apiKey', e.target.value)}
                                placeholder="留空则使用对话模型的Key"
                            />
                        </div>
                        <div className="col-span-2">
                             <PixelLabel>Base URL</PixelLabel>
                             <PixelInput 
                                value={tempConfig.ai.image.baseUrl}
                                onChange={(e) => updateAiConfig('image', 'baseUrl', e.target.value)}
                                placeholder="留空则使用默认配置"
                             />
                        </div>
                         <div className="col-span-1">
                            <PixelLabel>模型名称</PixelLabel>
                            <PixelInput 
                                value={tempConfig.ai.image.imageModel}
                                onChange={(e) => updateAiConfig('image', 'imageModel', e.target.value)}
                                placeholder="gemini-2.5-flash-image"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <PixelButton onClick={testImage} variant="secondary" className="flex items-center gap-1 text-xs">
                            <Terminal size={14}/> 测试绘图连接
                        </PixelButton>
                    </div>
                </div>

                {/* Test Status Display */}
                {testStatus.msg && (
                    <div className={`p-3 border-2 text-sm font-bold flex items-center gap-2 animate-pulse ${
                        testStatus.type === 'success' ? 'bg-green-100 border-green-600 text-green-800' :
                        testStatus.type === 'error' ? 'bg-red-100 border-red-600 text-red-800' :
                        'bg-blue-100 border-blue-600 text-blue-800'
                    }`}>
                        {testStatus.type === 'success' ? <CheckCircle size={16}/> : 
                         testStatus.type === 'error' ? <AlertTriangle size={16}/> : 
                         <RefreshCw className="animate-spin" size={16}/>}
                        {testStatus.msg}
                    </div>
                )}
            </div>
        )}

        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
            <div className="space-y-6 p-2">
                <div>
                    <h4 className="font-bold text-gray-700 mb-3 border-b-2 border-gray-200 pb-1">编辑器显示</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-200">
                            <span className="text-sm font-bold">显示行号</span>
                            <PixelSwitch 
                                checked={tempConfig.editor.showLineNumbers} 
                                onChange={(c) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, showLineNumbers: c}})} 
                            />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-200">
                            <span className="text-sm font-bold">底部状态栏</span>
                            <PixelSwitch 
                                checked={tempConfig.general.showStatusBar} 
                                onChange={(c) => setTempConfig({...tempConfig, general: {...tempConfig.general, showStatusBar: c}})} 
                            />
                        </div>
                        <div className="col-span-2">
                            <PixelLabel>字体大小 (px)</PixelLabel>
                            <PixelSelect 
                                value={tempConfig.editor.fontSize} 
                                onChange={(e) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, fontSize: parseInt(e.target.value)}})}
                            >
                                <option value="12">12px - 小</option>
                                <option value="14">14px - 标准</option>
                                <option value="16">16px - 大</option>
                                <option value="18">18px - 特大</option>
                            </PixelSelect>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-700 mb-3 border-b-2 border-gray-200 pb-1">行为偏好</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-200">
                            <span className="text-sm font-bold">自动保存</span>
                            <PixelSwitch 
                                checked={tempConfig.editor.autoSave} 
                                onChange={(c) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, autoSave: c}})} 
                            />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 border-2 border-gray-200">
                            <span className="text-sm font-bold">启用快捷键</span>
                            <PixelSwitch 
                                checked={tempConfig.general.enableShortcuts} 
                                onChange={(c) => setTempConfig({...tempConfig, general: {...tempConfig.general, enableShortcuts: c}})} 
                            />
                        </div>
                         <div className="col-span-2 flex items-center justify-between bg-white p-3 border-2 border-gray-200">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">强制纯文本粘贴</span>
                                <span className="text-[10px] text-gray-500">粘贴时自动去除原格式</span>
                            </div>
                            <PixelSwitch 
                                checked={tempConfig.editor.pastePlainText} 
                                onChange={(c) => setTempConfig({...tempConfig, editor: {...tempConfig.editor, pastePlainText: c}})} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: DATA */}
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
                        <Server size={16}/> 用户数据备份 (JSON)
                    </h4>
                    <p className="text-xs text-yellow-800 mb-4">包含所有自定义主题、AI历史记录、自定义片段库。</p>
                    <div className="flex gap-4">
                        <PixelButton onClick={onExportUserData} className="flex-1">
                            <Download size={14} className="inline mr-1"/> 导出数据
                        </PixelButton>
                        <PixelButton onClick={() => userDataInputRef.current?.click()} variant="secondary" className="flex-1">
                            <Upload size={14} className="inline mr-1"/> 导入数据
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

      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-end gap-3">
          <PixelButton onClick={onClose} variant="secondary">取消</PixelButton>
          <PixelButton onClick={handleSave} className="!bg-blue-600 !text-white !border-black">保存设置</PixelButton>
      </div>
    </PixelModal>
  );
};
