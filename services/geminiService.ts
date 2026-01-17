import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

// Helper to create client
const createClient = (config: AIConfig) => {
  // We use the provided config apiKey, not process.env, as user inputs it.
  const options: { apiKey: string; baseUrl?: string } = { apiKey: config.apiKey };
  
  if (config.baseUrl && config.baseUrl.trim() !== '') {
    options.baseUrl = config.baseUrl;
  }
  
  return new GoogleGenAI(options);
};

export const generateChatResponse = async (
  config: AIConfig,
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> => {
  if (!config.apiKey) throw new Error("请先在设置中配置 Chat API Key");

  const ai = createClient(config);
  
  try {
    // Replay history
    // We construct a large prompt with history for context since we are stateless here.
    let fullContext = "";
    history.forEach(h => {
        fullContext += `${h.role === 'user' ? 'User' : 'Model'}: ${h.text}\n`;
    });
    fullContext += `User: ${prompt}`;

    const response = await ai.models.generateContent({
      model: config.chatModel || 'gemini-3-flash-preview',
      contents: fullContext,
      config: {
          temperature: config.temperature,
          systemInstruction: "你是一个专业的微信公众号文章编辑助手。请用中文回答。保持回答简洁、专业。",
      }
    });

    return response.text || "AI 未返回内容";
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    throw new Error(error.message || "AI 请求失败");
  }
};

export const generateFormattedContent = async (config: AIConfig, content: string): Promise<string> => {
  if (!config.apiKey) throw new Error("请先配置 Chat API Key");

  const ai = createClient(config);

  const systemPrompt = `你是一个微信公众号排版专家。请对用户提供的文章内容进行自动排版优化，使其符合公众号阅读习惯。
  具体要求：
  1. 结构优化：自动识别文章逻辑，使用 Markdown 标题语法 (#, ##, ###) 划分层级 (H1-H3)。
  2. 段落优化：将过长的段落拆分为简短的段落，适当增加空行，提升移动端阅读体验。
  3. 重点突出：识别关键信息、金句或总结，使用引用块 (>) 包裹；对核心关键词使用加粗 (**)。
  4. 列表优化：将步骤、要点等内容转换为无序列表 (-) 或有序列表 (1.)。
  5. 严禁篡改：保持原文核心意思和文字内容不变，仅做结构和样式的Markdown语法调整。
  6. 输出要求：直接返回优化后的 Markdown 源码，不要包含 "好的"、"优化如下" 等任何解释性废话。`;

  try {
    const response = await ai.models.generateContent({
      model: config.chatModel || 'gemini-3-flash-preview',
      contents: content,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3, // Lower temperature for more deterministic formatting
      }
    });

    return response.text || content;
  } catch (error: any) {
    console.error("AI Formatting Error:", error);
    throw new Error(error.message || "排版请求失败");
  }
};

export const generateImage = async (config: AIConfig, prompt: string, size: string = '1024x1024'): Promise<string> => {
  if (!config.apiKey) throw new Error("请先在设置中配置 绘图 API Key");

  const ai = createClient(config);
  const modelName = config.imageModel || 'imagen-4.0-generate-001';

  try {
    // Note: Aspect ratio and size mapping
    let aspectRatio = '1:1';
    if (size.includes('16:9')) aspectRatio = '16:9';
    if (size.includes('4:3')) aspectRatio = '4:3';
    
    // Check if it's an Imagen model
    if (modelName.toLowerCase().includes('imagen')) {
      const response = await ai.models.generateImages({
          model: modelName,
          prompt: prompt,
          config: {
              numberOfImages: 1,
              aspectRatio: aspectRatio as any,
              outputMimeType: 'image/jpeg'
          }
      });
  
      if (response.generatedImages && response.generatedImages.length > 0) {
          const base64 = response.generatedImages[0].image.imageBytes;
          return `data:image/jpeg;base64,${base64}`;
      }
    } else {
      // Assume Gemini Nano/Flash Image model (e.g. gemini-2.5-flash-image)
      // Use generateContent for these models per guidelines
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            { text: prompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });
      
      // Extract image from response parts
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png'; 
            return `data:${mimeType};base64,${base64}`;
          }
        }
      }
    }
    
    throw new Error("未生成图片");

  } catch (error: any) {
    console.error("AI Image Error:", error);
    throw new Error(error.message || "图片生成失败 (请检查模型权限/BaseURL)");
  }
};

export const generateThemeCSS = async (config: AIConfig, prompt: string): Promise<string> => {
   if (!config.apiKey) throw new Error("请先配置 Chat API Key 以生成主题");
   
   const ai = createClient(config);
   
   const systemPrompt = `你是一个CSS专家。请根据用户的描述，生成一段用于微信公众号文章预览的CSS代码。
   HTML结构在一个 id="preview-root" 的div中。
   请只返回纯CSS代码，不要包含markdown代码块标记（如 \`\`\`css ）。
   必须包含针对 #preview-root h1, h2, p, blockquote, img, li 的样式。
   风格必须符合：${prompt}`;

   const response = await ai.models.generateContent({
       model: config.chatModel || 'gemini-3-flash-preview',
       contents: prompt,
       config: {
           systemInstruction: systemPrompt,
           temperature: 0.7
       }
   });

   let css = response.text || "";
   // Cleanup markdown code blocks if AI ignores instruction
   css = css.replace(/```css/g, '').replace(/```/g, '');
   return css.trim();
};