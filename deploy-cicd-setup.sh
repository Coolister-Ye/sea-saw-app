#!/bin/bash

# Sea-Saw Frontend CI/CD 设置脚本
# 用于配置 GitHub Secrets 和触发自动部署

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Sea-Saw Frontend CI/CD 设置向导${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 gh CLI 是否安装
if ! command -v gh &> /dev/null; then
    echo -e "${RED}错误: 未找到 GitHub CLI (gh)${NC}"
    echo "请先安装 GitHub CLI: https://cli.github.com/"
    echo ""
    echo "macOS: brew install gh"
    echo "Linux: 参考 https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}请先登录 GitHub CLI${NC}"
    gh auth login
fi

echo -e "${BLUE}请提供以下信息来配置 GitHub Secrets:${NC}"
echo ""

# 腾讯云服务器信息
read -p "服务器 IP 地址: " SERVER_IP
read -p "服务器用户名 (默认: appuser): " SERVER_USER
SERVER_USER=${SERVER_USER:-appuser}
read -p "部署路径 (默认: /home/sea-saw/sea-saw-app): " DEPLOY_PATH
DEPLOY_PATH=${DEPLOY_PATH:-/home/sea-saw/sea-saw-app}

echo ""
echo -e "${YELLOW}请提供 SSH 私钥路径 (用于 GitHub Actions 连接服务器):${NC}"
read -p "SSH 私钥路径 (默认: ~/.ssh/id_rsa): " SSH_KEY_PATH
SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}

# 展开 ~ 路径
SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

if [ ! -f "${SSH_KEY_PATH}" ]; then
    echo -e "${RED}错误: SSH 私钥文件不存在: ${SSH_KEY_PATH}${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}是否需要配置腾讯云容器镜像服务? (用于 registry 模式)${NC}"
echo "如果选择 'local' 模式部署，可以跳过"
read -p "配置 TCR? (y/n, 默认: n): " CONFIGURE_TCR
CONFIGURE_TCR=${CONFIGURE_TCR:-n}

if [[ $CONFIGURE_TCR =~ ^[Yy]$ ]]; then
    read -p "腾讯云容器镜像服务用户名: " TCR_USERNAME
    read -sp "腾讯云容器镜像服务密码: " TCR_PASSWORD
    echo ""
fi

echo ""
echo -e "${YELLOW}企业微信 Webhook URL (可选，用于部署通知):${NC}"
read -p "Webhook URL (留空跳过): " WECHAT_WEBHOOK

echo ""
echo -e "${GREEN}开始设置 GitHub Secrets...${NC}"

# 设置必需的 secrets
echo "设置 TENCENT_SERVER_IP..."
gh secret set TENCENT_SERVER_IP --body "${SERVER_IP}"

echo "设置 TENCENT_SERVER_USER..."
gh secret set TENCENT_SERVER_USER --body "${SERVER_USER}"

echo "设置 DEPLOY_PATH..."
gh secret set DEPLOY_PATH --body "${DEPLOY_PATH}"

echo "设置 TENCENT_SSH_PRIVATE_KEY..."
gh secret set TENCENT_SSH_PRIVATE_KEY < "${SSH_KEY_PATH}"

# 设置可选的 TCR secrets
if [[ $CONFIGURE_TCR =~ ^[Yy]$ ]]; then
    echo "设置 TCR_USERNAME..."
    gh secret set TCR_USERNAME --body "${TCR_USERNAME}"

    echo "设置 TCR_PASSWORD..."
    gh secret set TCR_PASSWORD --body "${TCR_PASSWORD}"
fi

# 设置可选的 WeChat webhook
if [ -n "$WECHAT_WEBHOOK" ]; then
    echo "设置 WECHAT_WEBHOOK_URL..."
    gh secret set WECHAT_WEBHOOK_URL --body "${WECHAT_WEBHOOK}"
fi

echo ""
echo -e "${GREEN}✓ GitHub Secrets 设置完成！${NC}"
echo ""

# 确认 SSH 公钥已添加到服务器
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}重要提醒: SSH 密钥配置${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "请确保您的 SSH 公钥已添加到服务器的 authorized_keys:"
echo ""
echo "1. 查看公钥内容:"
echo "   cat ${SSH_KEY_PATH}.pub"
echo ""
echo "2. 在服务器上添加公钥:"
echo "   ssh ${SERVER_USER}@${SERVER_IP}"
echo "   echo '您的公钥内容' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""

read -p "SSH 密钥已配置完成? (y/n): " SSH_CONFIRMED
if [[ ! $SSH_CONFIRMED =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}请先配置 SSH 密钥再继续${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "后续使用方式:"
echo ""
echo "1. 自动部署 (推送到 main 或 production 分支时自动触发):"
echo "   git push origin main"
echo ""
echo "2. 手动触发部署:"
echo "   gh workflow run deploy-production.yml"
echo ""
echo "3. 手动触发并选择模式:"
echo "   gh workflow run deploy-production.yml -f build_mode=local"
echo "   gh workflow run deploy-production.yml -f build_mode=registry"
echo ""
echo "4. 查看部署状态:"
echo "   gh run list --workflow=deploy-production.yml"
echo "   gh run watch"
echo ""
