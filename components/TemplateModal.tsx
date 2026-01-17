import React, { useState } from 'react';
import { PixelModal, PixelButton, PixelInput } from './PixelComponents';
import { ArticleTemplate } from '../types';
import { LayoutTemplate, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ArticleTemplate[];
  currentContent: string;
  onApplyTemplate: (content: string) => void;
  onSaveAsTemplate: (template: ArticleTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen, onClose, templates, currentContent, onApplyTemplate, onSaveAsTemplate, onDeleteTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const builtinTemplates = templates.filter(t => !t.isCustom);
  const customTemplates = templates.filter(t => t.isCustom);

  const handleApply = (content: string) => {
    if (window.confirm('套用模板将覆盖当前编辑区内容，确定吗？')) {
      onApplyTemplate(content);
      onClose();
    }
  };

  const handleSave = () => {
    if (!newTemplateName.trim()) {
      alert('请输入模板名称');
      return;
    }
    const newTemplate: ArticleTemplate = {
      id: `custom_t_${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc || '用户自定义模板',
      content: currentContent,
      category: '自定义',
      isCustom: true
    };
    onSaveAsTemplate(newTemplate);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setIsSaving(false);
    setActiveTab('custom');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个自定义模板吗？')) {
      onDeleteTemplate(id);
    }
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="公众号专属模板库">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-2">
        <div className="flex space-x-2">
           <button
             onClick={() => setActiveTab('builtin')}
             className={`px-3 py-1 text-sm font-bold ${activeTab === 'builtin' ? 'bg-blue-100 border-2 border-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             内置模板 ({builtinTemplates.length})
           </button>
           <button
             onClick={() => setActiveTab('custom')}
             className={`px-3 py-1 text-sm font-bold ${activeTab === 'custom' ? 'bg-yellow-100 border-2 border-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             自定义 ({customTemplates.length})
           </button>
        </div>
        {!isSaving && (
          <PixelButton onClick={() => setIsSaving(true)} className="flex items-center gap-1 !py-1 text-xs">
              <Plus size={14}/> 保存当前为模板
          </PixelButton>
        )}
      </div>

      {/* Save Template Form */}
      {isSaving && (
        <div className="bg-yellow-50 p-4 border-2 border-gray-900 mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
          <h4 className="font-bold mb-2 flex justify-between items-center">
             <span>保存当前文章为模板</span>
             <button onClick={() => setIsSaving(false)} className="text-gray-500 hover:text-black">&times;</button>
          </h4>
          <div className="space-y-2">
             <div className="flex gap-2">
               <PixelInput 
                  placeholder="模板名称 (如: 我的周报模板)" 
                  value={newTemplateName} 
                  onChange={e => setNewTemplateName(e.target.value)}
                  className="flex-1"
               />
               <PixelInput 
                  placeholder="简单描述 (可选)" 
                  value={newTemplateDesc} 
                  onChange={e => setNewTemplateDesc(e.target.value)}
                  className="flex-1"
               />
             </div>
             <div className="flex justify-end">
               <PixelButton onClick={handleSave}>确认保存</PixelButton>
             </div>
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="h-[400px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
         {(activeTab === 'builtin' ? builtinTemplates : customTemplates).length === 0 && (
            <div className="col-span-2 text-center text-gray-400 py-10">暂无模板</div>
         )}
         
         {(activeTab === 'builtin' ? builtinTemplates : customTemplates).map(tpl => (
            <div key={tpl.id} className="border-2 border-gray-200 bg-white p-4 hover:border-gray-400 group flex flex-col relative transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
               <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 border-2 border-gray-900 ${tpl.isCustom ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                      <LayoutTemplate size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-sm">{tpl.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{tpl.description}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-[10px] text-gray-600 font-mono border border-gray-300">
                          {tpl.category}
                      </span>
                  </div>
               </div>

               <div className="flex-1"></div>
               
               <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                   <button 
                      onClick={() => handleApply(tpl.content)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-1.5 text-xs font-bold hover:bg-gray-700 active:scale-95 transition-transform"
                   >
                      <CheckCircle size={14}/> 套用模板
                   </button>
                   {tpl.isCustom && (
                     <button 
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200"
                        title="删除模板"
                     >
                        <Trash2 size={16}/>
                     </button>
                   )}
               </div>
            </div>
         ))}
      </div>
    </PixelModal>
  );
};
