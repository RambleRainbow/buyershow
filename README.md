# 买家秀 (Buyer Show) MVP

基于AI图像生成技术的智能电商服务平台，利用Google Nano Banana API将买家场景照片与商品智能融合。

## 🏗️ 项目架构

这是一个基于TypeScript的Monorepo项目，使用现代化的全栈技术：

### 📁 项目结构

```
buyershow/
├── apps/
│   ├── web/          # Next.js 前端应用
│   └── api/          # Fastify 后端API
├── packages/
│   ├── shared-types/ # 共享TypeScript类型
│   └── config/       # 共享配置
├── docs/             # 项目文档
└── tools/            # 开发工具
```

### 🚀 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Fastify + TypeScript + tRPC + Prisma
- **AI集成**: Google Nano Banana API (Gemini)
- **状态管理**: Zustand
- **构建工具**: Turbo (Monorepo)
- **包管理**: pnpm

## 🛠️ 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 📦 安装和启动

```bash
# 安装依赖
pnpm install

# 开发环境启动
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test
```

## 🎯 MVP功能

1. **场景照片上传** - 用户上传个人场景照片
2. **商品选择** - 从预设商品列表中选择
3. **风格描述** - 用户描述期望的位置、场景和风格
4. **AI图像生成** - 调用Google Nano Banana API生成融合图像
5. **结果展示** - 展示生成结果并提供下载
6. **用户反馈** - 收集用户满意度和改进建议

## 🔧 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建所有应用
- `pnpm lint` - 代码检查
- `pnpm type-check` - TypeScript类型检查
- `pnpm test` - 运行测试
- `pnpm clean` - 清理构建产物

## 📄 许可证

MIT License