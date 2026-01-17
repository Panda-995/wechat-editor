import React, { useState } from 'react';
import { PixelModal, PixelButton, PixelInput, PixelSelect } from './PixelComponents';
import { Snippet } from '../types';
import { Plus, Trash2, Edit2, Copy, Tag, Check, X } from 'lucide-react';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: Snippet[];
  onAddSnippet: (s: Snippet) => void;
  onUpdateSnippet: (s: Snippet) => void;
  onDeleteSnippet: (id: string) => void;
  onInsert: (content: string) => void;
}

export const SnippetModal: React.FC<SnippetModalProps> = ({
  isOpen, onClose, snippets, onAddSnippet, onUpdateSnippet, onDeleteSnippet, onInsert
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempSnippet, setTempSnippet] = useState<Partial<Snippet>>({});
  const [filterCategory, setFilterCategory] = useState<string>('全部');

  const categories = ['全部', ...Array.from(new Set(snippets.map(s => s.category)))];

  const handleEdit = (s: Snippet) => {
      setEditingId(s.id);
      setTempSnippet({ ...s });
  };

  const handleCreate = () => {
      setEditingId('new');
      setTempSnippet({ title: '', content: '', category: '通用' });
  };

  const handleSave = () => {
      if (!tempSnippet.title || !tempSnippet.content) return alert('标题和内容不能为空');
      
      if (editingId === 'new') {
          onAddSnippet({
              id: Date.now().toString(),
              title: tempSnippet.title,
              content: tempSnippet.content,
              category: tempSnippet.category || '通用'
          } as Snippet);
      } else {
          onUpdateSnippet(tempSnippet as Snippet);
      }
      setEditingId(null);
      setTempSnippet({});
  };

  const handleDelete = (id: string) => {
      if (window.confirm('确定要删除这个片段吗？')) {
          onDeleteSnippet(id);
      }
  };

  const filteredSnippets = filterCategory === '全部' 
      ? snippets 
      : snippets.filter(s => s.category === filterCategory);

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="常用文案片段库">
      {/* Top Filter and Add */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-2">
          <div className="flex gap-2 items-center">
             <Tag size={16} className="text-gray-500"/>
             <select 
                className="bg-white border-2 border-gray-900 text-sm py-1 px-2 outline-none w-24 sm:w-auto"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
             >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <PixelButton onClick={handleCreate} className="flex items-center gap-1 !py-1 text-xs whitespace-nowrap">
              <Plus size={14}/> 新增片段
          </PixelButton>
      </div>

      {/* Editor View */}
      {editingId ? (
          <div className="bg-gray-50 p-4 border-2 border-gray-300">
              <h4 className="font-bold mb-3">{editingId === 'new' ? '新建片段' : '编辑片段'}</h4>
              <div className="space-y-3">
                  <div>
                      <label className="text-xs font-bold block mb-1">标题</label>
                      <PixelInput 
                        value={tempSnippet.title} 
                        onChange={e => setTempSnippet({...tempSnippet, title: e.target.value})}
                        placeholder="例如: 文末关注引导"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold block mb-1">分类</label>
                      <div className="flex gap-2">
                          <PixelInput 
                            value={tempSnippet.category} 
                            onChange={e => setTempSnippet({...tempSnippet, category: e.target.value})}
                            placeholder="例如: 引导类"
                          />
                          <select 
                            className="border-2 border-gray-900 bg-white px-2"
                            onChange={e => setTempSnippet({...tempSnippet, category: e.target.value})}
                          >
                              <option value="">常用分类...</option>
                              {categories.filter(c => c!=='全部').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold block mb-1">内容 (支持 Markdown)</label>
                      <textarea 
                        className="w-full h-32 p-2 border-2 border-gray-900 text-sm font-mono outline-none resize-none"
                        value={tempSnippet.content}
                        onChange={e => setTempSnippet({...tempSnippet, content: e.target.value})}
                      />
                  </div>
                  <div className="flex gap-2 justify-end">
                      <PixelButton variant="secondary" onClick={() => setEditingId(null)}>取消</PixelButton>
                      <PixelButton onClick={handleSave}>保存片段</PixelButton>
                  </div>
              </div>
          </div>
      ) : (
          /* List View */
          <div className="h-[400px] overflow-y-auto flex flex-col gap-3">
              {filteredSnippets.length === 0 && (
                  <div className="text-center text-gray-400 py-10">暂无片段，点击右上角新增</div>
              )}
              {filteredSnippets.map(s => (
                  <div key={s.id} className="border-2 border-gray-200 p-3 hover:border-blue-300 bg-white group flex justify-between items-center transition-all">
                      <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="shrink-0 text-[10px] bg-gray-100 text-gray-600 px-1 border border-gray-300 whitespace-nowrap">{s.category}</span>
                              <h4 className="font-bold text-sm truncate">{s.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400 font-mono truncate">{s.content.replace(/\n/g, ' ')}</p>
                      </div>
                      
                      {/* Optimized Buttons Container */}
                      <div className="flex gap-1 shrink-0">
                          <button 
                            onClick={() => onInsert(s.content)} 
                            className="p-1.5 bg-blue-50 hover:bg-blue-200 border border-blue-200 text-blue-800 rounded-sm"
                            title="插入"
                          >
                              <Copy size={14}/>
                          </button>
                          <button 
                            onClick={() => handleEdit(s)} 
                            className="p-1.5 bg-gray-50 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-sm"
                            title="编辑"
                          >
                              <Edit2 size={14}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)} 
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-sm"
                            title="删除"
                          >
                              <Trash2 size={14}/>
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </PixelModal>
  );
};