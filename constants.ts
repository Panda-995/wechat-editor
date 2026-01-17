import { AppConfig, Theme, Snippet } from './types';

/* ---------------- THEMES ---------------- */

export const DEFAULT_THEME_CSS = `
/* 1. 简约像素风 (默认) */
#preview-root {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  padding: 20px;
}
#preview-root h1 { font-size: 22px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
#preview-root h2 { font-size: 18px; font-weight: bold; border-left: 4px solid #000; padding-left: 10px; margin-top: 25px; margin-bottom: 15px; background: #f0f0f0; line-height: 1.4; padding-top: 5px; padding-bottom: 5px; }
#preview-root h3 { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
#preview-root p { margin-bottom: 16px; text-align: justify; font-size: 15px; }
#preview-root img { display: block; margin: 20px auto; max-width: 100%; border: 2px solid #000; box-shadow: 4px 4px 0 0 #000; }
#preview-root blockquote { border-left: 4px solid #000; background: #f9f9f9; color: #555; padding: 10px 15px; margin: 20px 0; font-size: 14px; }
#preview-root ul, #preview-root ol { margin-bottom: 20px; padding-left: 20px; }
#preview-root li { margin-bottom: 8px; font-size: 15px; }
#preview-root pre { background: #f0f0f0; padding: 10px; border: 1px solid #ccc; overflow-x: auto; font-size: 13px; margin: 20px 0; border-radius: 4px; }
#preview-root code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 14px; color: #d63384; }
#preview-root table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
#preview-root th, #preview-root td { border: 1px solid #ccc; padding: 8px; text-align: left; }
#preview-root th { background-color: #f0f0f0; font-weight: bold; }
`;

export const DARK_THEME_CSS = `
/* 2. 深色护眼主题 */
#preview-root {
  font-family: sans-serif;
  line-height: 1.7;
  color: #e0e0e0;
  background-color: #1a1a1a;
  padding: 20px;
}
#preview-root h1 { font-size: 24px; color: #ff9800; border-bottom: 1px dashed #555; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
#preview-root h2 { font-size: 18px; color: #ff9800; margin-top: 30px; margin-bottom: 15px; display: inline-block; border-bottom: 2px solid #ff9800; }
#preview-root p { margin-bottom: 16px; font-size: 15px; color: #cccccc; }
#preview-root blockquote { border-left: 3px solid #ff9800; background: #2a2a2a; color: #999; padding: 15px; margin: 20px 0; }
#preview-root strong { color: #ff9800; }
#preview-root img { display: block; margin: 20px auto; max-width: 100%; border-radius: 8px; }
`;

export const GREEN_THEME_CSS = `
/* 3. 清新文艺风 */
#preview-root {
  font-family: "Optima", sans-serif;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  background-color: #fdfdfd;
}
#preview-root h1 { font-size: 22px; color: #2e7d32; text-align: center; margin-bottom: 30px; font-weight: normal; letter-spacing: 2px; }
#preview-root h2 { font-size: 17px; color: #2e7d32; text-align: center; margin: 30px 0 20px; background: url('https://picsum.photos/20/1') repeat-x bottom; padding-bottom: 10px; display: table; margin-left: auto; margin-right: auto; }
#preview-root p { margin-bottom: 20px; font-size: 15px; color: #555; letter-spacing: 0.5px; }
#preview-root blockquote { border: 1px solid #a5d6a7; background: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 4px; margin: 20px 0; }
#preview-root img { display: block; margin: 20px auto; max-width: 100%; border: 6px solid #e8f5e9; }
`;

export const TECH_THEME_CSS = `
/* 4. 极简黑白科技风 */
#preview-root { font-family: monospace; color: #000; padding: 20px; background: #fff; }
#preview-root h1 { background: #000; color: #fff; padding: 10px; font-size: 24px; text-align: center; margin-bottom: 20px; }
#preview-root h2 { border: 2px solid #000; padding: 5px 10px; display: inline-block; font-size: 18px; margin-top: 20px; margin-bottom: 15px; box-shadow: 4px 4px 0 0 #ccc; }
#preview-root p { margin-bottom: 15px; line-height: 1.8; }
#preview-root blockquote { border: 2px solid #000; padding: 10px; background: #eee; margin: 20px 0; font-style: italic; }
#preview-root code { background: #000; color: #fff; padding: 2px 4px; }
`;

export const RETRO_RED_THEME_CSS = `
/* 5. 复古报纸红 */
#preview-root { font-family: "Georgia", serif; background: #fdf6e3; padding: 20px; color: #4a4a4a; }
#preview-root h1 { color: #d32f2f; border-bottom: 3px double #d32f2f; padding-bottom: 10px; text-align: center; font-size: 26px; }
#preview-root h2 { color: #b71c1c; border-left: 5px solid #d32f2f; padding-left: 10px; font-size: 20px; margin-top: 30px; }
#preview-root p { line-height: 1.8; font-size: 16px; }
#preview-root blockquote { border-top: 2px solid #d32f2f; border-bottom: 2px solid #d32f2f; color: #b71c1c; padding: 15px; background: rgba(211, 47, 47, 0.05); }
`;

export const CUTE_PINK_THEME_CSS = `
/* 6. 少女粉彩风 */
#preview-root { font-family: sans-serif; background: #fff0f5; padding: 20px; color: #555; }
#preview-root h1 { color: #ec407a; text-align: center; font-size: 22px; border: 2px dashed #ec407a; padding: 10px; border-radius: 10px; background: #fff; }
#preview-root h2 { color: #f06292; font-size: 18px; margin-top: 25px; display: flex; align-items: center; gap: 8px; }
#preview-root h2::before { content: '🌸'; }
#preview-root p { line-height: 1.7; font-size: 15px; }
#preview-root blockquote { background: #fff; border-radius: 8px; padding: 15px; border: 2px solid #f8bbd0; color: #880e4f; }
`;

export const ELEGANT_GRAY_THEME_CSS = `
/* 7. 优雅高级灰 */
#preview-root { font-family: "Segoe UI", sans-serif; background: #f5f5f5; padding: 20px; color: #424242; }
#preview-root h1 { color: #212121; font-weight: 300; font-size: 28px; text-align: center; letter-spacing: 3px; margin-bottom: 40px; }
#preview-root h2 { color: #616161; font-weight: 600; font-size: 18px; border-bottom: 1px solid #bdbdbd; padding-bottom: 8px; margin-top: 30px; }
#preview-root p { line-height: 2; font-size: 14px; text-align: justify; }
#preview-root blockquote { border-left: 2px solid #757575; color: #616161; padding-left: 15px; font-style: italic; }
`;

export const BLUE_BUSINESS_THEME_CSS = `
/* 8. 商务蓝调风 */
#preview-root { font-family: sans-serif; padding: 20px; color: #37474f; }
#preview-root h1 { color: #0277bd; font-size: 24px; text-align: left; border-left: 8px solid #0277bd; padding-left: 15px; background: #e1f5fe; padding-top: 10px; padding-bottom: 10px; }
#preview-root h2 { color: #01579b; font-size: 18px; margin-top: 30px; background: linear-gradient(to right, #e1f5fe, transparent); padding: 5px 10px; }
#preview-root p { line-height: 1.7; font-size: 15px; }
#preview-root blockquote { background: #eceff1; border-top: 3px solid #0277bd; padding: 15px; color: #455a64; }
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