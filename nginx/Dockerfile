# 使用 Nginx 官方镜像
FROM nginx:alpine

# 复制自定义的 Nginx 配置文件
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

# 复制前端构建后的静态文件到 Nginx 默认路径
COPY dist/ /usr/share/nginx/html/

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

