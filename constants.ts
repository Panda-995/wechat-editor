import { AppConfig, Theme, Snippet } from './types';

/* ---------------- THEMES ---------------- */

export const DEFAULT_THEME_CSS = `
/* 自定义样式，实时生效（双ID兼容：你的编辑器#wemd + 微信#nice） */
#wemd, #nice {
  line-height: 1.25;
  color: #2b2b2b;
  font-family: Optima-Regular, Optima, PingFangTC-Light, PingFangSC-light, PingFangTC-light;
  letter-spacing: 2px;
  word-break: break-word;
  word-wrap: break-word;
  text-align: left;
  border-top: 5px dashed #222;
  border-bottom: 5px dashed #222;
  padding: 8px 22px;
  margin: 0 auto;
  max-width: 677px;
  /* 你的原版纹理背景 */
  background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%);
  background-size: 20px 20px;
  background-position: center center;
}

/* 段落 */
#wemd p, #nice p {
  color: #2b2b2b;
  margin: 10px 0px;
  letter-spacing: 2px;
  font-size: 15px;
  word-spacing: 2px;
  line-height: 1.7;
  text-align: justify;
}

/* 标题系列 */
#wemd h1, #nice h1,
#wemd h2, #nice h2,
#wemd h3, #nice h3,
#wemd h4, #nice h4,
#wemd h5, #nice h5,
#wemd h6, #nice h6 {
  margin: 0;
  padding: 0;
  font-weight: bold;
  color: #2b2b2b;
}
#wemd h1, #nice h1 {
  font-size: 28px;
  margin: 42px 0 32px;
  text-align: center;
  border-top: 2px dashed #222;
  border-bottom: 2px dashed #222;
  padding: 16px 0;
}
#wemd h1 .content, #nice h1 .content {
  display: block;
  font-weight: 900;
  color: #2b2b2b;
  letter-spacing: 2px;
  border: none;
}
#wemd h2, #nice h2 {
  font-size: 20px;
  margin: 32px 0 22px;
  text-align: center;
}
#wemd h2 .content, #nice h2 .content {
  display: block;
  color: #fff;
  background: #2b2b2b;
  padding: 9px 8px;
}
#wemd h3, #nice h3 {
  font-size: 18px;
  margin: 26px 0 12px;
}
#wemd h3 .content, #nice h3 .content {
  display: inline-block;
  font-weight: bold;
  border-bottom: 2px solid #2b2b2b;
  padding-bottom: 3px;
}
#wemd h4, #nice h4 {
  font-size:17px;
  margin:22px 0 12px;
}
#wemd h4 .content, #nice h4 .content {
  font-weight:bold;
  color:#2b2b2b;
  text-decoration:underline;
}
#wemd h5, #nice h5,
#wemd h6, #nice h6 { 
  font-size:16px; 
  margin:18px 0 10px; 
}
/* 隐藏标题前后缀 */
#wemd h1 .prefix, #nice h1 .prefix,
#wemd h1 .suffix, #nice h1 .suffix,
#wemd h2 .prefix, #nice h2 .prefix,
#wemd h2 .suffix, #nice h2 .suffix,
#wemd h3 .prefix, #nice h3 .prefix,
#wemd h3 .suffix, #nice h3 .suffix,
#wemd h4 .prefix, #nice h4 .prefix,
#wemd h4 .suffix, #nice h4 .suffix,
#wemd h5 .prefix, #nice h5 .prefix,
#wemd h5 .suffix, #nice h5 .suffix,
#wemd h6 .prefix, #nice h6 .prefix,
#wemd h6 .suffix, #nice h6 .suffix {
  display:none;
}

/* 列表 */
#wemd ul, #nice ul {
  font-size: 15px;
  color: #595959;
  list-style: none;
  padding-left:10px;
  margin:20px 0;
}
#wemd ul li, #nice ul li {
  margin-bottom:9px;
  border-bottom:1px dotted #ccc;
  padding-bottom:5px;
  line-height:1.65;
}
#wemd ul li::before, #nice ul li::before {
  content:"[*] ";
  font-weight:bold;
  margin-right:5px;
  color:#2b2b2b;
}
#wemd ul ul li::before, #nice ul ul li::before {
  content:"[-] ";
}
#wemd ol, #nice ol {
  font-size: 15px;
  color: #595959;
  padding-left:28px;
  margin:20px 0;
}
#wemd li section, #nice li section {
  font-size: 15px;
  font-weight: normal;
  color: #595959;
  line-height:1.65;
  font-family: PingFangSC-light, Helvetica Neue, sans-serif;
}

/* 引用块 */
#wemd blockquote, #nice blockquote {
  border:none;
}
#wemd .multiquote-1, #nice .multiquote-1 {
  text-size-adjust: 100%;
  line-height: 1.55em;
  font-weight: 400;
  border-radius: 6px;
  color: #2b2b2b;
  font-style: normal;
  text-align: left;
  border-left: none;
  border: 1px dotted #d48806;
  background: #fff9e6;
  padding:15px;
  margin:25px 0;
  font-family: PingFangSC-light, Helvetica Neue, sans-serif;
  font-size:15px !important;
}
#wemd .multiquote-1 p, #nice .multiquote-1 p {
  color: #2b2b2b;
  font-size:15px;
  margin:0;
}
#wemd .multiquote-2, #nice .multiquote-2,
#wemd .multiquote-3, #nice .multiquote-3 {
  border:1px dashed #d48806;
  background:#fff9e6;
  padding:13px;
  margin:22px 0;
  font-family: PingFangSC-light, sans-serif;
  font-size:15px;
}
#wemd .multiquote-3 p, #nice .multiquote-3 p,
#wemd .multiquote-3 h3, #nice .multiquote-3 h3 {
  text-align:center;
}

/* 文本样式 */
#wemd strong, #nice strong {
  color: #d48806;
  font-weight: 900;
  background: #fff9e6;
  padding:0 4px;
}
#wemd em, #nice em {
  font-style:italic;
  color:#d48806;
  font-weight:bold;
}
#wemd del, #nice del {
  text-decoration:line-through;
  color:#888;
  font-style:normal;
}
#wemd mark, #nice mark {
  background:#fff9e6;
  color:#2b2b2b;
  padding:0 4px;
}

/* 链接 */
#wemd a, #nice a {
  color: #2b2b2b;
  font-weight: bold;
  border-bottom:1px solid #2b2b2b;
  text-decoration:none;
}
#wemd figure a, #nice figure a {
  border:none;
  display:flex;
  justify-content:center;
  align-items:center;
}

/* 分隔线 */
#wemd hr, #nice hr {
  height: 1px;
  padding: 0;
  border: none;
  border-top: 2px dashed #2b2b2b;
  margin:30px 0;
}

/* 代码相关 */
#wemd pre, #nice pre {
  margin:20px 0;
  overflow-x:auto;
}
#wemd p code, #nice p code,
#wemd li code, #nice li code {
  font-size:14px;
  padding:2px 6px;
  margin:0 4px;
  color:#fff;
  background:#2b2b2b;
  border-radius:0;
  font-family:Courier New, monospace;
}
#wemd pre code, #nice pre code {
  display:block;
  font-family:Courier New, monospace;
  font-size:13px;
  line-height:1.5;
  white-space:pre;
}

/* 图片+描述 */
#wemd img, #nice img {
  display: block;
  margin: 20px auto;
  max-width: 100%;
  width:100%;
  border:2px dashed #222;
  padding:8px;
  background:#fff;
  border-radius:0;
  object-fit:contain;
  box-shadow:none;
}
#wemd figure, #nice figure {
  margin:0;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:100%;
}
#wemd figcaption, #nice figcaption {
  margin-top: 2px;
  margin-bottom: 8px;
  text-align: center;
  color: #2b2b2b;
  font-size: 13px;
  line-height: 1.6;
  font-family: Courier New, SimSun, monospace;
  border-top: 1px dashed #222;
  padding-top: 6px;
  width:90%;
  letter-spacing:0;
}
#wemd figure a + figcaption, #nice figure a + figcaption {
  margin-top:-32px;
  background:rgba(0,0,0,0.8);
  color:#fff;
  line-height:32px;
  z-index:20;
  width:calc(100% - 16px);
  border-top:none;
  padding:0;
  font-size:12px;
}
#wemd .imageflow-img, #nice .imageflow-img {
  display:inline-block;
  width:100%;
  margin-bottom:0;
  border:2px dashed #222;
  padding:6px;
  background:#fff;
}
#wemd .imageflow-caption, #nice .imageflow-caption {
  margin-top:2px;
  margin-bottom:8px;
  text-align:center;
  color:#2b2b2b;
  font-size:12px;
  border-top:1px dashed #222;
  padding-top:6px;
  width:100%;
}

/* 表格 */
#wemd .table-container, #nice .table-container {
  overflow-x:auto;
}
#wemd table, #nice table {
  width:100%;
  border-collapse:collapse;
  margin:20px 0;
  font-size:14px;
  font-family:monospace;
}
#wemd table tr th, #nice table tr th,
#wemd table tr td, #nice table tr td {
  font-size:14px;
  border:1px solid #ccc;
  padding:8px 5px;
  text-align:left;
}
#wemd table tr th, #nice table tr th {
  font-weight:bold;
  background:#f0f0f0;
  border-bottom:2px dashed #222;
}

/* 脚注 */
#wemd .footnote-word, #nice .footnote-word,
#wemd .footnote-ref, #nice .footnote-ref {
  color:#2b2b2b;
  text-decoration:underline;
  font-weight:bold;
}
#wemd .footnote-item, #nice .footnote-item {
  display:flex;
}
#wemd .footnote-num, #nice .footnote-num {
  display:inline;
  width:10%;
  font-size:80%;
  opacity:0.8;
  line-height:1.65;
  font-family:Courier New, SimSun;
}
#wemd .footnote-item p, #nice .footnote-item p {
  display:inline;
  font-size:14px;
  width:90%;
  padding:0;
  margin:0;
  color:#2b2b2b;
  width:calc(100% - 50px);
}
#wemd .footnotes-sep, #nice .footnotes-sep {
  border-top:2px dashed #222;
  margin-top:30px;
  padding-top:15px;
}
#wemd .footnotes-sep:before, #nice .footnotes-sep:before {
  content:"参考资料";
  display:block;
}

/* 公式/图片流 */
#wemd .block-equation, #nice .block-equation {
  display:block;
  text-align:center;
  overflow:auto;
}
#wemd .block-equation svg, #nice .block-equation svg {
  max-width:100% !important;
}
#wemd .inline-equation, #nice .inline-equation {}
#wemd .imageflow-layer1, #nice .imageflow-layer1 {
  margin-top:1em;
  margin-bottom:0.5em;
  border:0;
  padding:0;
  overflow:hidden;
}
#wemd .imageflow-layer2, #nice .imageflow-layer2 {
  white-space:nowrap;
  width:100%;
  overflow-x:scroll;
}
#wemd .imageflow-layer3, #nice .imageflow-layer3 {
  display:inline-block;
  width:80%;
  margin-right:10px;
  vertical-align:top;
}

/* 提示块 */
#wemd .callout, #nice .callout {
  margin:25px 0;
  padding:15px;
  border-radius:0;
  border:1px dotted #d48806;
  background:#fff9e6;
  box-shadow:none;
  font-family:PingFangSC-light, sans-serif;
  font-size:15px;
}
#wemd .callout-title, #nice .callout-title {
  font-weight:bold;
  margin-bottom:8px;
  display:flex;
  align-items:center;
  font-size:14px;
}
#wemd .callout-icon, #nice .callout-icon {
  margin-right:6px;
  font-size:18px;
}
#wemd .callout-note, #nice .callout-note,
#wemd .callout-tip, #nice .callout-tip,
#wemd .callout-important, #nice .callout-important,
#wemd .callout-warning, #nice .callout-warning,
#wemd .callout-caution, #nice .callout-caution {
  border-left:2px dashed #d48806;
}

/* 任务列表 */
#wemd .task-list-item, #nice .task-list-item {
  list-style:none;
  margin-left:-1.2em;
  margin-bottom:6px;
  display:flex;
  align-items:flex-start;
}
#wemd .task-list-item input[type='checkbox'], #nice .task-list-item input[type='checkbox'] {
  margin-top:4px;
  pointer-events:none;
}
`;

export const DARK_THEME_CSS = `
/* 2. 深色护眼主题 */
#nice {
  line-height: 1.7;
  color: #e0e0e0;
  background-color: #1a1a1a;
  padding: 20px;
  font-family: sans-serif;
}
#nice h1 { 
    font-size: 24px; color: #ff9800; border-bottom: 1px dashed #555; 
    padding-bottom: 15px; margin-bottom: 20px; text-align: center; 
}
#nice h2 { 
    font-size: 18px; color: #ff9800; margin-top: 30px; margin-bottom: 15px; 
    display: inline-block; border-bottom: 2px solid #ff9800; 
}
#nice p { margin-bottom: 16px; font-size: 15px; color: #cccccc; }
#nice blockquote { 
    border-left: 3px solid #ff9800; background: #2a2a2a; color: #999; 
    padding: 15px; margin: 20px 0; 
}
#nice strong { color: #ff9800; }
#nice img { display: block; margin: 20px auto; max-width: 100%; border-radius: 8px; }
`;

export const GREEN_THEME_CSS = `
/* 3. 清新文艺风 */
#nice {
  font-family: "Optima", sans-serif;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  background-color: #fdfdfd;
}
#nice h1 { 
    font-size: 22px; color: #2e7d32; text-align: center; margin-bottom: 30px; 
    font-weight: normal; letter-spacing: 2px; 
}
#nice h2 { 
    font-size: 17px; color: #2e7d32; text-align: center; margin: 30px 0 20px; 
    background: url('https://picsum.photos/20/1') repeat-x bottom; 
    padding-bottom: 10px; display: table; margin-left: auto; margin-right: auto; 
}
#nice p { margin-bottom: 20px; font-size: 15px; color: #555; letter-spacing: 0.5px; }
#nice blockquote { 
    border: 1px solid #a5d6a7; background: #e8f5e9; color: #2e7d32; 
    padding: 15px; border-radius: 4px; margin: 20px 0; 
}
#nice img { display: block; margin: 20px auto; max-width: 100%; border: 6px solid #e8f5e9; }
`;

export const TECH_THEME_CSS = `
/* 4. 极简黑白科技风 */
#nice { font-family: monospace; color: #000; padding: 20px; background: #fff; }
#nice h1 { 
    background: #000; color: #fff; padding: 10px; font-size: 24px; 
    text-align: center; margin-bottom: 20px; 
}
#nice h2 { 
    border: 2px solid #000; padding: 5px 10px; display: inline-block; 
    font-size: 18px; margin-top: 20px; margin-bottom: 15px; 
    box-shadow: 4px 4px 0 0 #ccc; 
}
#nice p { margin-bottom: 15px; line-height: 1.8; }
#nice blockquote { 
    border: 2px solid #000; padding: 10px; background: #eee; 
    margin: 20px 0; font-style: italic; 
}
#nice code { background: #000; color: #fff; padding: 2px 4px; }
`;

export const RETRO_RED_THEME_CSS = `
/* 5. 复古报纸红 */
#nice { font-family: "Georgia", serif; background: #fdf6e3; padding: 20px; color: #4a4a4a; }
#nice h1 { 
    color: #d32f2f; border-bottom: 3px double #d32f2f; padding-bottom: 10px; 
    text-align: center; font-size: 26px; 
}
#nice h2 { 
    color: #b71c1c; border-left: 5px solid #d32f2f; padding-left: 10px; 
    font-size: 20px; margin-top: 30px; 
}
#nice p { line-height: 1.8; font-size: 16px; }
#nice blockquote { 
    border-top: 2px solid #d32f2f; border-bottom: 2px solid #d32f2f; 
    color: #b71c1c; padding: 15px; background: rgba(211, 47, 47, 0.05); 
}
`;

export const CUTE_PINK_THEME_CSS = `
/* 6. 少女粉彩风 */
#nice { font-family: sans-serif; background: #fff0f5; padding: 20px; color: #555; }
#nice h1 { 
    color: #ec407a; text-align: center; font-size: 22px; 
    border: 2px dashed #ec407a; padding: 10px; border-radius: 10px; 
    background: #fff; 
}
#nice h2 { 
    color: #f06292; font-size: 18px; margin-top: 25px; 
    display: flex; align-items: center; gap: 8px; 
}
#nice h2::before { content: '🌸'; }
#nice p { line-height: 1.7; font-size: 15px; }
#nice blockquote { 
    background: #fff; border-radius: 8px; padding: 15px; 
    border: 2px solid #f8bbd0; color: #880e4f; 
}
`;

export const ELEGANT_GRAY_THEME_CSS = `
/* 7. 优雅高级灰 */
#nice { font-family: "Segoe UI", sans-serif; background: #f5f5f5; padding: 20px; color: #424242; }
#nice h1 { 
    color: #212121; font-weight: 300; font-size: 28px; text-align: center; 
    letter-spacing: 3px; margin-bottom: 40px; 
}
#nice h2 { 
    color: #616161; font-weight: 600; font-size: 18px; 
    border-bottom: 1px solid #bdbdbd; padding-bottom: 8px; margin-top: 30px; 
}
#nice p { line-height: 2; font-size: 14px; text-align: justify; }
#nice blockquote { 
    border-left: 2px solid #757575; color: #616161; 
    padding-left: 15px; font-style: italic; 
}
`;

export const BLUE_BUSINESS_THEME_CSS = `
/* 8. 商务蓝调风 */
#nice { font-family: sans-serif; padding: 20px; color: #37474f; }
#nice h1 { 
    color: #0277bd; font-size: 24px; text-align: left; 
    border-left: 8px solid #0277bd; padding-left: 15px; 
    background: #e1f5fe; padding-top: 10px; padding-bottom: 10px; 
}
#nice h2 { 
    color: #01579b; font-size: 18px; margin-top: 30px; 
    background: linear-gradient(to right, #e1f5fe, transparent); 
    padding: 5px 10px; 
}
#nice p { line-height: 1.7; font-size: 15px; }
#nice blockquote { 
    background: #eceff1; border-top: 3px solid #0277bd; 
    padding: 15px; color: #455a64; 
}
`;

export const BUILT_IN_THEMES: Theme[] = [
  { id: 'default', name: '简约像素风', css: DEFAULT_THEME_CSS, isCustom: false },
  { id: 'dark', name: '深色护眼', css: DARK_THEME_CSS, isCustom: false },
  { id: 'green', name: '清新文艺', css: GREEN_THEME_CSS, isCustom: false },
  { id: 'tech', name: '极简科技', css: TECH_THEME_CSS, isCustom: false },
  { id: 'retro', name: '复古红报', css: RETRO_RED_THEME_CSS, isCustom: false },
  { id: 'pink', name: '粉彩少女', css: CUTE_PINK_THEME_CSS, isCustom: false },
  { id: 'gray', name: '优雅高级灰', css: ELEGANT_GRAY_THEME_CSS, isCustom: false },
  { id: 'blue', name: '商务蓝调', css: BLUE_BUSINESS_THEME_CSS, isCustom: false },
];

export const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 's_01',
    title: '文末引导关注',
    category: '引导类',
    content: '> 如果觉得文章对你有帮助，欢迎点赞、在看、关注！\n> 你的支持是我持续更新的动力。'
  },
  {
    id: 's_02',
    title: '免责声明',
    category: '声明类',
    content: '**免责声明：**\n本文内容仅供参考，不构成任何投资建议。如需转载请联系后台授权。'
  },
  {
    id: 's_03',
    title: '往期推荐',
    category: '引导类',
    content: '### 📚 往期推荐\n\n- [文章标题1](#)\n- [文章标题2](#)\n- [文章标题3](#)'
  },
  {
    id: 's_04',
    title: '分割线组合',
    category: '装饰类',
    content: '---\n\n<center>✦  +  +  ✦</center>\n\n---'
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  ai: {
    chat: {
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      chatModel: 'gemini-3-flash-preview',
      imageModel: 'gemini-2.5-flash-image', 
      temperature: 0.7,
    },
    image: {
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      chatModel: '',
      imageModel: 'imagen-4.0-generate-001',
      temperature: 0.7,
    },
  },
  editor: {
    fontSize: 14,
    showLineNumbers: false,
    tabSize: 2,
    autoSave: true,
    pastePlainText: false, // Default false
  },
  preview: {
    themeId: 'default',
    showPlaceholder: true,
  },
  general: {
    showStatusBar: true,
    enableShortcuts: true
  }
};

export const DEFAULT_MARKDOWN = `# 欢迎使用公众号编辑器

这是一个**极致像素风**的编辑器。

## 功能介绍

1. **实时预览**：左侧编辑，右侧实时显示公众号排版。
2. **AI助手**：点击上方“AI助手”，支持文章润色与AI绘图。
3. **一键复制**：点击右上角，直接复制为公众号兼容格式。
4. **主题库**：内置8款+主题，支持拖拽排序与AI定制。
5. **片段库**：右键点击编辑区，或点击上方“常用片段”，快速插入重复文案。

> 提示：配置您的 API Key 后即可使用强大的 AI 功能。

试试插入图片：

![示例图片](https://picsum.photos/600/300)`;