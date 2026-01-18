import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import { Bold, Italic, Strikethrough, Code, Quote, AlertTriangle, FileText, BookOpen, Plus } from 'lucide-react';
import { PixelIconBtn } from './PixelComponents';
import { Snippet } from '../types';

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  fontSize: number;
  pastePlainText: boolean;
  snippets: Snippet[]; // Received for Context Menu
  onOpenSnippetModal: () => void;
}

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(({ 
    value, onChange, fontSize, pastePlainText, snippets, onOpenSnippetModal 
}, ref) => {
  const [toolbarPos, setToolbarPos] = useState<{top: number, left: number} | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<{line: number, msg: string}[]>([]);

  // Expose localRef to parent via forwardRef
  useImperativeHandle(ref, () => localRef.current!);

  // Close context menu on click anywhere
  useEffect(() => {
      const closeMenu = () => setContextMenu(null);
      document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
  }, []);

  // Robust Syntax Check
  useEffect(() => {
    const lines = value.split('\n');
    const errors: {line: number, msg: string}[] = [];
    
    let inCodeBlock = false;
    let codeBlockStart = -1;

    // Check Code Blocks
    lines.forEach((line, i) => {
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockStart = i;
            } else {
                inCodeBlock = false;
            }
        }
    });

    if (inCodeBlock) {
        errors.push({ line: codeBlockStart + 1, msg: '未闭合的代码块 (```)' });
    }

    // Check Bold/Italic (Simple Heuristic: Odd number of markers in a line)
    lines.forEach((line, i) => {
        if (inCodeBlock) return; // Skip format check in code blocks
        
        // Count ** occurrences
        const boldMatches = line.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            errors.push({ line: i + 1, msg: '未闭合的加粗标记 (**)' });
        }
    });

    setSyntaxErrors(errors);
  }, [value]);

  // Calculate coordinates for toolbar
  const getCaretCoordinates = () => {
      const textarea = localRef.current?.querySelector('textarea');
      if (!textarea) return null;

      const { selectionStart, selectionEnd } = textarea;
      if (selectionStart === selectionEnd) return null; // No selection

      // Create mirror div
      const div = document.createElement('div');
      const styles = window.getComputedStyle(textarea);
      
      // Copy styles relevant to layout
      Array.from(styles).forEach(prop => {
          div.style.setProperty(prop, styles.getPropertyValue(prop));
      });

      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = 'pre-wrap';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = `${textarea.offsetWidth}px`;
      div.style.height = 'auto'; // Let it grow
      
      // Get text up to selection end
      div.textContent = textarea.value.substring(0, selectionEnd);
      
      const span = document.createElement('span');
      span.textContent = '|'; // Marker
      div.appendChild(span);
      
      // Mount to calculate
      document.body.appendChild(div);
      
      const { offsetLeft, offsetTop } = span;
      // Adjust for scroll
      const top = offsetTop - textarea.scrollTop;
      const left = offsetLeft - textarea.scrollLeft;

      document.body.removeChild(div);
      
      return { top, left };
  };

  const handleSelect = () => {
      setTimeout(() => {
          const textarea = localRef.current?.querySelector('textarea');
          if (!textarea || textarea.selectionStart === textarea.selectionEnd) {
              setToolbarPos(null);
              return;
          }

          const coords = getCaretCoordinates();
          if (coords) {
              setToolbarPos({
                  top: coords.top - 45, 
                  left: coords.left - 50 
              });
          }
      }, 10);
  };

  const applyFormat = (type: 'bold' | 'italic' | 'strike' | 'code' | 'quote') => {
      const textarea = localRef.current?.querySelector('textarea');
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = value;
      const selectedText = text.substring(start, end);
      
      let prefix = '';
      let suffix = '';

      switch(type) {
          case 'bold': prefix = '**'; suffix = '**'; break;
          case 'italic': prefix = '*'; suffix = '*'; break;
          case 'strike': prefix = '~~'; suffix = '~~'; break;
          case 'code': prefix = '`'; suffix = '`'; break;
          case 'quote': prefix = '> '; suffix = ''; break;
      }

      const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      onChange(newText);
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
          setToolbarPos(null);
      }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      if (pastePlainText) {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      // Calculate relative position within the editor container or absolute to body
      // Using fixed positioning relative to viewport is easier for menus
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const insertSnippet = (snippetContent: string) => {
      const textarea = localRef.current?.querySelector('textarea');
      if (textarea) {
          textarea.focus();
          document.execCommand('insertText', false, snippetContent);
      }
      setContextMenu(null);
  };

  return (
    <div 
        className="h-full w-full bg-white overflow-y-auto relative font-mono group" 
        ref={localRef}
        onMouseUp={handleSelect}
        onKeyUp={(e) => {
            if (e.key === 'Shift' || e.key.startsWith('Arrow')) handleSelect();
            else setToolbarPos(null);
        }}
        onContextMenu={handleContextMenu}
    >
      {/* Floating Toolbar */}
      {toolbarPos && (
          <div 
            className="absolute z-50 flex items-center bg-gray-800 text-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] px-1 py-1 gap-1 rounded-sm transform transition-all duration-75"
            style={{ top: Math.max(10, toolbarPos.top), left: Math.max(10, toolbarPos.left) }}
            onMouseDown={(e) => e.preventDefault()}
          >
              <PixelIconBtn className="hover:bg-gray-600 text-white" onClick={() => applyFormat('bold')} title="加粗 (Ctrl+B)"><Bold size={14}/></PixelIconBtn>
              <PixelIconBtn className="hover:bg-gray-600 text-white" onClick={() => applyFormat('italic')} title="斜体 (Ctrl+I)"><Italic size={14}/></PixelIconBtn>
              <PixelIconBtn className="hover:bg-gray-600 text-white" onClick={() => applyFormat('strike')} title="删除线"><Strikethrough size={14}/></PixelIconBtn>
              <PixelIconBtn className="hover:bg-gray-600 text-white" onClick={() => applyFormat('code')} title="行内代码"><Code size={14}/></PixelIconBtn>
              <PixelIconBtn className="hover:bg-gray-600 text-white" onClick={() => applyFormat('quote')} title="引用"><Quote size={14}/></PixelIconBtn>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800"></div>
          </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu && (
          <div 
            className="fixed z-[999] bg-white border-2 border-gray-900 shadow-[4px_4px_0_0_#000] py-1 w-48 text-sm"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
              <div className="px-3 py-1 text-xs font-bold text-gray-400 bg-gray-50 border-b border-gray-200 mb-1">
                  常用片段
              </div>
              {snippets.slice(0, 5).map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => insertSnippet(s.content)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-100 truncate flex items-center gap-2"
                  >
                      <FileText size={12}/> {s.title}
                  </button>
              ))}
              <div className="border-t border-gray-200 mt-1 pt-1">
                  <button 
                    onClick={() => { setContextMenu(null); onOpenSnippetModal(); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-blue-800 font-bold"
                  >
                      <BookOpen size={12}/> 管理片段库...
                  </button>
              </div>
          </div>
      )}

      {/* Syntax Error List Overlay */}
      {syntaxErrors.length > 0 && (
          <div className="absolute top-2 right-4 z-20 flex flex-col gap-1 items-end pointer-events-none">
              {syntaxErrors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-red-100 border-2 border-red-500 text-red-600 text-xs font-bold shadow-sm animate-pulse">
                      <AlertTriangle size={12} />
                      <span>第 {err.line} 行: {err.msg}</span>
                  </div>
              ))}
          </div>
      )}
      
      {/* Paste Mode Indicator */}
      {pastePlainText && (
          <div className="absolute bottom-2 right-4 z-10 px-2 py-1 bg-yellow-100 border border-yellow-600 text-yellow-800 text-[10px] font-bold opacity-70 hover:opacity-100 pointer-events-none">
              <span className="flex items-center gap-1"><FileText size={10}/> 纯文本粘贴模式开启</span>
          </div>
      )}

      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages.markdown, 'markdown')}
        padding={20}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: fontSize,
          minHeight: '100%',
        }}
        className="outline-none min-h-full"
        textareaClassName="focus:outline-none"
        onPaste={handlePaste}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';