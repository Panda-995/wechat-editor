# 🎮 微信公众号像素风编辑器 (WeChat Pixel Editor)

> 专为微信公众号创作者打造的**极致像素风** Markdown 编辑器，内置 Google Gemini AI 强大助手。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini-purple)

## ✨ 项目亮点

### 🎨 极致像素美学
- 全站采用复古像素风格设计（8-bit/16-bit 视觉体验）。
- 精心调教的像素组件：按钮、弹窗、输入框均带有复古阴影与交互反馈。
- **纯中文界面**，操作直观友好。

### 🤖 强大的 AI 赋能 (Google Gemini)
- **AI 写作助手**：润色文章、检查错别字、修正病句、生成摘要、扩写段落。
- **AI 智能排版**：一键分析 Markdown 结构，自动优化标题层级、段落间距和列表样式。
- **AI 绘图**：支持文生图（DALL·E 3 / Gemini Image），生成后**一键插入**文章。
- **AI 主题生成**：用自然语言描述（如"赛博朋克风"），AI 自动生成专属 CSS 排版主题。

### 📱 公众号深度适配
- **所见即所得**：左侧 Markdown 编辑，右侧实时预览（支持手机/平板/桌面多端模拟）。
- **一键复制**：完美转换 Markdown 为微信公众号兼容的 HTML/CSS 格式，带样式直接粘贴。
- **排版主题库**：内置 8+ 款精美主题（简约、深色、文艺、科技等），支持自定义和 CSS 源码修改。
- **字数统计**：精准统计标题、正文及总字数，提供公众号篇幅建议。

### 🛠️ 实用工具箱
- **常用片段库**：一键插入引导语、免责声明、分割线等高频文案。
- **本地化存储**：文章草稿、配置项、历史记录均存储在浏览器本地 (Local Storage)，**无隐私泄露风险**。
- **数据导入导出**：支持 JSON 格式备份与恢复用户数据。

## 🚀 快速开始

### 1. 环境准备
确保您的环境已安装 [Node.js](https://nodejs.org/) (推荐 v16+)。

### 2. 安装依赖
```bash
npm install
# 或者
yarn install
```

### 3. 启动项目
```bash
npm start
# 或者
yarn start
```
项目将在 `http://localhost:3000` 启动。

## 🐳 Docker 部署

无需配置本地环境，直接使用 Docker 镜像启动：

```bash
docker run -d -p 3000:80 --name wechat-editor ghcr.io/panda-995/wechat-editor:latest
```

启动后访问 `http://localhost:3000` 即可使用。

## ⚙️ AI 功能配置指南

本编辑器利用 Google Gemini API 实现智能化功能。使用前请按以下步骤配置：

1. 获取 API Key：前往 [Google AI Studio](https://aistudio.google.com/) 申请。
2. 打开编辑器，点击顶部 **"设置"** 按钮。
3. 切换到 **"AI 全局配置"** 标签页。
4. 在 **AI 对话模型配置** 中填写您的 `API Key`（推荐模型：`gemini-3-flash-preview`）。
5. (可选) 配置 **AI 绘图模型**，如需使用绘图功能。
6. 点击 "测试接口" 确保连接成功。

> **注意**：所有 API Key 仅保存在您本地浏览器的 LocalStorage 中，不会上传至任何第三方服务器。

## 📖 操作快捷键

| 功能 | Windows/Linux | Mac |
| --- | --- | --- |
| **加粗** | `Ctrl + B` | `Cmd + B` |
| **斜体** | `Ctrl + I` | `Cmd + I` |
| **保存** | `Ctrl + S` | `Cmd + S` |
| **复制公众号格式** | `Ctrl + Shift + C` | `Cmd + Shift + C` |

## 📅 更新日志

### v1.1.0 - 2025-02-23
- **✨ 文章列表管理**：新增左侧文章列表栏，支持多篇文章管理、快速切换、重命名及一键创建副本。
- **🔄 同步滚动**：实现了编辑器与预览区的双向同步滚动，长文对照更轻松。
- **🗑️ 删除功能修复**：优化了文章删除逻辑，新增自定义像素风确认弹窗，解决了无法删除的问题。
- **📋 纯文本粘贴**：设置中增加“强制纯文本粘贴”开关，粘贴时自动清除格式。
- **🛠️ 体验优化**：优化了 UI 布局，修复了部分已知 Bug。

## 📂 项目结构

```
src/
├── components/        # UI 组件
│   ├── Editor.tsx     # Markdown 编辑器核心
│   ├── Preview.tsx    # 实时预览组件
│   ├── AIModal.tsx    # AI 助手弹窗 (对话/绘图/排版)
│   ├── ThemeModal.tsx # 主题管理弹窗
│   └── PixelComponents.tsx # 基础像素风组件库
├── services/          # 业务逻辑
│   └── geminiService.ts # Google Gemini API 调用封装
├── types.ts           # TypeScript 类型定义
├── constants.ts       # 默认配置、内置主题 CSS、预设片段
├── App.tsx            # 主应用入口
└── index.css          # 全局样式 (Tailwind 引入)
```

## 📄 许可证

MIT License. 

---
*Created with ❤️ for WeChat Creators.*