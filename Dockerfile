# 阶段1：构建前端项目（升级Node到20-alpine，满足所有依赖版本要求）
FROM node:20-alpine AS build-stage
# 安装Alpine缺失的系统依赖（解决crypto/构建相关问题）
RUN apk add --no-cache libc6-compat
# 设置工作目录
WORKDIR /app
# 复制依赖配置文件（优先复制，利用Docker缓存）
COPY package*.json ./
# 国内环境加速（可选，注释可取消）
# RUN npm config set registry https://registry.npm.taobao.org
# 安装依赖（强制安装适配Node 20的版本）
RUN npm install --force
# 复制所有项目文件
COPY . .
# 打包构建（vite构建默认输出到dist目录，需确认项目实际输出目录）
RUN npm run build

# 阶段2：部署静态资源（nginx轻量镜像）
FROM nginx:alpine AS production-stage
# 复制构建产物到nginx静态目录（若项目打包输出是build，替换为/build）
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 复制自定义nginx配置（解决SPA路由）
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露80端口
EXPOSE 80
# 启动nginx前台运行
CMD ["nginx", "-g", "daemon off;"]