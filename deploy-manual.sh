#!/bin/bash

# Sea-Saw Frontend 手动部署脚本 (Option 1)
# 用法: ./deploy-manual.sh <server-user@server-ip> [server-path]
# 示例: ./deploy-manual.sh appuser@123.456.789.0 /home/sea-saw/sea-saw-app

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供服务器地址${NC}"
    echo "用法: ./deploy-manual.sh <server-user@server-ip> [server-path]"
    echo "示例: ./deploy-manual.sh appuser@123.456.789.0 /home/sea-saw/sea-saw-app"
    exit 1
fi

SERVER=$1
SERVER_PATH=${2:-/home/sea-saw/sea-saw-app}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Sea-Saw Frontend 手动部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo "服务器: $SERVER"
echo "服务器路径: $SERVER_PATH"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在 sea-saw-app 目录下运行此脚本${NC}"
    exit 1
fi

# 检查 .env.production 是否存在
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}警告: .env.production 不存在${NC}"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤 1: 构建前端
echo -e "${GREEN}[1/4] 正在构建前端...${NC}"
npx expo export -p web

if [ ! -d "dist" ]; then
    echo -e "${RED}错误: dist/ 目录未生成${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 步骤 2: 压缩 dist 文件夹（加快传输速度）
echo -e "${GREEN}[2/4] 正在压缩文件...${NC}"
tar -czf dist.tar.gz dist/
echo -e "${GREEN}✓ 文件压缩完成${NC}"
echo ""

# 步骤 3: 上传到服务器
echo -e "${GREEN}[3/4] 正在上传到服务器...${NC}"
scp dist.tar.gz "$SERVER:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 文件上传完成${NC}"
else
    echo -e "${RED}错误: 文件上传失败${NC}"
    rm dist.tar.gz
    exit 1
fi

# 清理本地压缩文件
rm dist.tar.gz
echo ""

# 步骤 4: 在服务器上解压并部署
echo -e "${GREEN}[4/4] 正在服务器上部署...${NC}"
ssh "$SERVER" << EOF
    set -e
    cd $SERVER_PATH

    # 解压文件
    echo "解压文件..."
    tar -xzf dist.tar.gz
    rm dist.tar.gz

    # 停止旧容器
    echo "停止旧容器..."
    docker-compose down || true

    # 构建并启动新容器
    echo "构建并启动新容器..."
    docker-compose up --build -d

    # 检查容器状态
    echo "检查容器状态..."
    docker-compose ps

    echo "部署完成！"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 部署成功完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}错误: 服务器部署失败${NC}"
    exit 1
fi
