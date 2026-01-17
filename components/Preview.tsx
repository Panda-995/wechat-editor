import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface PreviewProps {
  content: string;
  css: string;
}

export const Preview: React.FC<PreviewProps> = ({ content, css }) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 border-l-2 border-gray-900">
      {/* Device Toolbar */}
      <div className="flex-none h-10 border-b-2 border-gray-900 bg-white flex items-center justify-start px-4 gap-4 z-10 relative">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">模拟设备</span>
            <div className="flex border-2 border-gray-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                <button 
                    onClick={() => setDevice('mobile')}
                    className={`p-1.5 flex items-center justify-center hover:bg-blue-50 border-r-2 border-gray-900 last:border-r-0 transition-none ${device === 'mobile' ? 'bg-blue-100 text-blue-900' : 'text-gray-400'}`}
                    title="手机 (375px)"
                >
                    <Smartphone size={14} strokeWidth={device === 'mobile' ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => setDevice('tablet')}
                    className={`p-1.5 flex items-center justify-center hover:bg-blue-50 border-r-2 border-gray-900 last:border-r-0 transition-none ${device === 'tablet' ? 'bg-blue-100 text-blue-900' : 'text-gray-400'}`}
                    title="平板 (768px)"
                >
                    <Tablet size={14} strokeWidth={device === 'tablet' ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => setDevice('desktop')}
                    className={`p-1.5 flex items-center justify-center hover:bg-blue-50 border-r-0 border-gray-900 last:border-r-0 transition-none ${device === 'desktop' ? 'bg-blue-100 text-blue-900' : 'text-gray-400'}`}
                    title="桌面 (100%)"
                >
                    <Monitor size={14} strokeWidth={device === 'desktop' ? 2.5 : 2} />
                </button>
            </div>
        </div>
      </div>

      {/* Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100/50 relative">
         <style>{css}</style>
         
         <div className={`min-h-full w-full flex ${device !== 'desktop' ? 'justify-center py-8' : ''}`}>
             
             {/* Dynamic Device Container */}
             <div className={`
                 transition-all duration-200 bg-white relative
                 ${device === 'mobile' ? 'w-[375px] border-x-[8px] border-t-[8px] border-b-[8px] border-gray-800 rounded-lg shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]' : ''}
                 ${device === 'tablet' ? 'w-[768px] border-[8px] border-gray-800 rounded-lg shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]' : ''}
                 ${device === 'desktop' ? 'w-full min-h-full' : ''}
             `}>
                 {/* Decorative Notch for Phone */}
                 {device === 'mobile' && (
                     <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-24 h-[8px] bg-gray-900 rounded-b-sm z-20"></div>
                 )}

                 <div id="preview-root" className={`${device !== 'desktop' ? 'h-full' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};