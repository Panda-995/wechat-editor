import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

// --- Google Gemini Helper ---
const createGeminiClient = (config: AIConfig) => {
  const options: { apiKey: string; baseUrl?: string } = { apiKey: config.apiKey };
  if (config.baseUrl && config.baseUrl.trim() !== '') {
    options.baseUrl = config.baseUrl;
  }
  return new GoogleGenAI(options);
};

// --- OpenAI Helpers ---
const callOpenAIChat = async (config: AIConfig, messages: any[], systemInstruction?: string) => {
    const baseUrl = config.baseUrl ? config.baseUrl.replace(/\/$/, '') : 'https://api.openai.com/v1';
    
    // Inject system instruction if provided
    let finalMessages = [...messages];
    if (systemInstruction) {
        finalMessages.unshift({ role: 'system', content: systemInstruction });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.chatModel || 'gpt-3.5-turbo',
            messages: finalMessages,
            temperature: config.temperature
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || `OpenAI Request Failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI returned empty response";
};

const callOpenAIImage = async (config: AIConfig, prompt: string, size: string) => {
    const baseUrl = config.baseUrl ? config.baseUrl.replace(/\/$/, '') : 'https://api.openai.com/v1';
    
    let sizeStr = "1024x1024";
    // Basic mapping for OpenAI supported sizes
    if (size.includes('1024')) sizeStr = "1024x1024";
    // OpenAI DALL-E 3 specific rectangular sizes
    else if (size === '16:9') sizeStr = "1792x1024"; 
    
    const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
             'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.imageModel || "dall-e-3",
            prompt: prompt,
            n: 1,
            size: sizeStr,
            response_format: "b64_json"
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || `OpenAI Image Request Failed: ${response.status}`);
    }

    const data = await response.json();
    const b64 = data.data[0]?.b64_json;
    if (b64) {
        return `data:image/png;base64,${b64}`;
    }
    return data.data[0]?.url || "";
};

// --- Exported Services ---

export const generateChatResponse = async (
  config: AIConfig,
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> => {
  if (!config.apiKey) throw new Error("请先在设置中配置 Chat API Key");

  // OpenAI Logic
  if (config.provider === 'openai') {
      const messages = history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text }));
      messages.push({ role: 'user', content: prompt });
      return await callOpenAIChat(config, messages, "你是一个专业的微信公众号文章编辑助手。请用中文回答。保持回答简洁、专业。");
  }

  // Gemini Logic (Default)
  const ai = createGeminiClient(config);
  try {
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

  const systemPrompt = `你是一个微信公众号排版专家。请对用户提供的文章内容进行自动排版优化，使其符合公众号阅读习惯。
  具体要求：
  1. 结构优化：自动识别文章逻辑，使用 Markdown 标题语法 (#, ##, ###) 划分层级 (H1-H3)。
  2. 段落优化：将过长的段落拆分为简短的段落，适当增加空行，提升移动端阅读体验。
  3. 重点突出：识别关键信息、金句或总结，使用引用块 (>) 包裹；对核心关键词使用加粗 (**)。
  4. 列表优化：将步骤、要点等内容转换为无序列表 (-) 或有序列表 (1.)。
  5. 严禁篡改：保持原文核心意思和文字内容不变，仅做结构和样式的Markdown语法调整。
  6. 输出要求：直接返回优化后的 Markdown 源码，不要包含 "好的"、"优化如下" 等任何解释性废话。`;

  // OpenAI Logic
  if (config.provider === 'openai') {
      return await callOpenAIChat(config, [{ role: 'user', content: content }], systemPrompt);
  }

  // Gemini Logic
  const ai = createGeminiClient(config);
  try {
    const response = await ai.models.generateContent({
      model: config.chatModel || 'gemini-3-flash-preview',
      contents: content,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
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

  // OpenAI Logic
  if (config.provider === 'openai') {
      return await callOpenAIImage(config, prompt, size);
  }

  // Gemini Logic
  const ai = createGeminiClient(config);
  const modelName = config.imageModel || 'imagen-4.0-generate-001';

  try {
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
      // Gemini Nano/Flash Image model
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
   
   const systemPrompt = `你是一个CSS专家。请根据用户的描述，生成一段用于微信公众号文章预览的CSS代码。
   HTML结构在一个 id="preview-root" 的div中。
   请只返回纯CSS代码，不要包含markdown代码块标记（如 \`\`\`css ）。
   必须包含针对 #preview-root h1, h2, p, blockquote, img, li 的样式。
   风格必须符合：${prompt}`;

   // OpenAI Logic
   if (config.provider === 'openai') {
       let css = await callOpenAIChat(config, [{ role: 'user', content: prompt }], systemPrompt);
       css = css.replace(/```css/g, '').replace(/```/g, '');
       return css.trim();
   }
   
   // Gemini Logic
   const ai = createGeminiClient(config);
   const response = await ai.models.generateContent({
       model: config.chatModel || 'gemini-3-flash-preview',
       contents: prompt,
       config: {
           systemInstruction: systemPrompt,
           temperature: 0.7
       }
   });

   let css = response.text || "";
   css = css.replace(/```css/g, '').replace(/```/g, '');
   return css.trim();
};