# Tasks Document

## 1. 项目初始化和基础设置

- [x] 1.1 创建Monorepo项目结构
  - File: package.json, turbo.json, pnpm-workspace.yaml
  - 设置Turbo monorepo配置
  - 创建packages和apps目录结构
  - Purpose: 建立TypeScript全栈项目基础架构
  - _Requirements: 项目架构设计_

- [x] 1.2 配置共享类型包
  - File: packages/shared-types/src/index.ts
  - 定义所有共享TypeScript接口和类型
  - 配置包导出和构建配置
  - Purpose: 实现前后端类型共享和同步
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.3 设置TypeScript严格配置
  - File: tsconfig.json (root, apps/web, apps/api)
  - 配置strict模式和路径映射
  - 设置shared-types包引用
  - Purpose: 确保最高等级的类型安全
  - _Requirements: TypeScript最佳实践_

## 2. 后端API开发

- [x] 2.1 创建Fastify服务器基础结构
  - File: apps/api/src/server.ts
  - 配置Fastify服务器和基础中间件
  - 设置JSON Schema验证
  - Purpose: 建立TypeScript友好的后端服务基础
  - _Leverage: Fastify TypeScript插件_
  - _Requirements: 后端架构设计_

- [x] 2.2 实现文件上传服务
  - File: apps/api/src/services/fileUploadService.ts
  - 使用@fastify/multipart处理文件上传
  - 添加文件类型和大小验证
  - Purpose: 处理用户场景照片上传
  - _Leverage: Fastify multipart插件_
  - _Requirements: 2.1_

- [x] 2.3 创建Google Nano Banana API客户端
  - File: apps/api/src/services/nanoBananaAPIService.ts
  - 封装Google Gemini API调用逻辑
  - 实现错误重试和响应处理机制
  - Purpose: 集成AI图像生成能力
  - _Leverage: ofetch HTTP客户端_
  - _Requirements: 2.4, 2.5_

- [x] 2.4 实现提示文本生成服务
  - File: apps/api/src/services/promptGenerationService.ts
  - 将用户描述转换为优化的API提示
  - 添加摄影术语和风格转换逻辑
  - Purpose: 优化AI生成效果
  - _Leverage: 文本模板和NLP工具_
  - _Requirements: 2.3, 2.4_

- [x] 2.5 设置Prisma数据库和模型
  - File: prisma/schema.prisma, apps/api/src/db/client.ts
  - 定义数据库模型（ImageUpload, Product, GenerationRequest等）
  - 配置SQLite数据库连接
  - Purpose: 实现数据持久化存储
  - _Leverage: Prisma ORM_
  - _Requirements: 数据模型设计_

- [x] 2.6 创建tRPC路由和类型定义
  - File: apps/api/src/routers/appRouter.ts
  - 实现文件上传、商品获取、图像生成等API
  - 使用Zod进行输入验证
  - Purpose: 提供类型安全的API端点
  - _Leverage: tRPC + Zod_
  - _Requirements: 2.1-2.5_

## 3. 前端应用开发

- [x] 3.1 创建Next.js项目结构
  - File: apps/web/src/app/layout.tsx, page.tsx
  - 设置App Router和基础页面结构
  - 配置Tailwind CSS和shadcn/ui
  - Purpose: 建立现代化前端应用基础
  - _Leverage: Next.js 14 + App Router_
  - _Requirements: 前端架构设计_

- [ ] 3.2 设置tRPC客户端和状态管理
  - File: apps/web/src/utils/trpc.ts, src/store/useStore.ts
  - 配置tRPC客户端连接到后端API
  - 设置Zustand状态管理
  - Purpose: 实现类型安全的前后端通信
  - _Leverage: tRPC client + Zustand_
  - _Requirements: 3.1_

- [ ] 3.3 创建照片上传组件
  - File: apps/web/src/components/PhotoUpload.tsx
  - 实现拖拽上传和文件预览功能
  - 添加类型验证和进度显示
  - Purpose: 处理用户场景照片上传
  - _Leverage: React Hook Form + shadcn/ui_
  - _Requirements: 3.1_

- [ ] 3.4 创建商品选择组件
  - File: apps/web/src/components/ProductSelector.tsx
  - 展示商品网格和选择交互
  - 添加商品预览和分类功能
  - Purpose: 让用户选择要融入的商品
  - _Leverage: shadcn/ui Grid + Card组件_
  - _Requirements: 3.2_

- [ ] 3.5 创建描述输入表单组件
  - File: apps/web/src/components/DescriptionForm.tsx
  - 实现多种描述类型的输入界面
  - 使用React Hook Form + Zod验证
  - Purpose: 收集用户的风格和位置描述
  - _Leverage: React Hook Form + Zod + shadcn/ui_
  - _Requirements: 3.3, 3.4_

- [ ] 3.6 创建结果展示组件
  - File: apps/web/src/components/ResultDisplay.tsx
  - 实现原图和生成图的对比展示
  - 添加下载和重新生成功能
  - Purpose: 展示AI生成的买家秀照片
  - _Leverage: Next.js Image组件_
  - _Requirements: 3.5_

- [ ] 3.7 创建反馈收集组件
  - File: apps/web/src/components/FeedbackForm.tsx
  - 实现星级评分和评论输入
  - 添加反馈提交和数据收集
  - Purpose: 收集用户对生成结果的反馈
  - _Leverage: React Hook Form + shadcn/ui_
  - _Requirements: 3.8_

## 4. 页面和路由实现

- [ ] 4.1 创建主页和用户流程页面
  - File: apps/web/src/app/page.tsx, generate/page.tsx
  - 实现完整的用户生成流程页面
  - 添加步骤导航和进度显示
  - Purpose: 提供完整的用户体验流程
  - _Leverage: Next.js App Router_
  - _Requirements: 4.1-4.8_

- [ ] 4.2 添加页面间状态管理
  - File: apps/web/src/hooks/useGenerationFlow.ts
  - 实现跨页面的状态持久化
  - 添加步骤验证和导航逻辑
  - Purpose: 管理多步骤生成流程的状态
  - _Leverage: Zustand + React Query_
  - _Requirements: 4.1_

- [ ] 4.3 实现响应式设计和移动适配
  - File: apps/web/src/styles/globals.css, component styles
  - 优化移动端用户体验
  - 添加触摸友好的交互设计
  - Purpose: 确保多设备兼容性
  - _Leverage: Tailwind CSS响应式类_
  - _Requirements: UI/UX设计_

## 5. 错误处理和用户体验优化

- [ ] 5.1 实现全局错误处理
  - File: apps/web/src/components/ErrorBoundary.tsx, apps/api/src/utils/errorHandler.ts
  - 添加前后端统一的错误处理机制
  - 实现用户友好的错误信息展示
  - Purpose: 提供良好的错误处理体验
  - _Leverage: React Error Boundary + Fastify错误插件_
  - _Requirements: 错误处理设计_

- [ ] 5.2 添加加载状态和进度指示
  - File: apps/web/src/components/LoadingStates.tsx
  - 实现各种加载状态的UI组件
  - 添加AI生成进度的实时反馈
  - Purpose: 改善用户等待体验
  - _Leverage: shadcn/ui Skeleton + Progress_
  - _Requirements: 用户体验优化_

- [ ] 5.3 实现文件大小和格式优化
  - File: apps/api/src/utils/imageProcessor.ts
  - 添加图片压缩和格式转换功能
  - 优化上传和下载的文件大小
  - Purpose: 提升应用性能和用户体验
  - _Leverage: Sharp图像处理库_
  - _Requirements: 性能优化_

## 6. 测试实现

- [ ] 6.1 设置测试环境和配置
  - File: vitest.config.ts, apps/web/vitest.config.ts, apps/api/vitest.config.ts
  - 配置Vitest测试环境
  - 设置测试数据库和Mock
  - Purpose: 建立完整的测试基础设施
  - _Leverage: Vitest + Testing Library_
  - _Requirements: 测试策略_

- [ ] 6.2 编写核心服务单元测试
  - File: apps/api/src/services/__tests__/*.test.ts
  - 测试NanoBananaAPIService和PromptGenerationService
  - 添加文件上传服务测试
  - Purpose: 确保后端核心逻辑正确性
  - _Leverage: Vitest + Mock_
  - _Requirements: 6.1_

- [ ] 6.3 编写React组件测试
  - File: apps/web/src/components/__tests__/*.test.tsx
  - 测试各个UI组件的渲染和交互
  - 添加表单验证和状态管理测试
  - Purpose: 确保前端组件功能正确
  - _Leverage: React Testing Library_
  - _Requirements: 6.1_

- [ ] 6.4 编写E2E用户流程测试
  - File: apps/web/e2e/*.spec.ts
  - 测试完整的用户生成流程
  - 添加多浏览器兼容性测试
  - Purpose: 验证整体用户体验
  - _Leverage: Playwright_
  - _Requirements: 6.2, 6.3_

## 7. 部署和优化

- [ ] 7.1 配置生产环境构建
  - File: Dockerfile, docker-compose.yml, deployment scripts
  - 设置Docker容器化部署
  - 配置环境变量和秘钥管理
  - Purpose: 准备生产环境部署
  - _Leverage: Docker + 环境配置_
  - _Requirements: 部署策略_

- [ ] 7.2 实现API使用量监控
  - File: apps/api/src/middleware/rateLimiting.ts, monitoring.ts
  - 添加Google Nano Banana API使用量跟踪
  - 实现请求频率限制
  - Purpose: 控制API成本和使用量
  - _Leverage: Redis + 监控中间件_
  - _Requirements: 成本控制_

- [ ] 7.3 性能优化和缓存策略
  - File: apps/web/next.config.js, apps/api/src/cache/
  - 优化图片加载和页面性能
  - 实现API响应缓存
  - Purpose: 提升应用整体性能
  - _Leverage: Next.js优化 + Redis缓存_
  - _Requirements: 性能要求_

## 8. 文档和收尾

- [ ] 8.1 编写API文档和使用说明
  - File: docs/api.md, README.md
  - 生成tRPC API文档
  - 编写部署和开发指南
  - Purpose: 提供完整的项目文档
  - _Leverage: TypeScript类型生成文档_
  - _Requirements: 文档要求_

- [ ] 8.2 代码审查和重构优化
  - File: 全项目代码Review
  - 检查TypeScript类型覆盖率
  - 优化代码结构和性能
  - Purpose: 确保代码质量和可维护性
  - _Leverage: TypeScript编译器 + ESLint_
  - _Requirements: 代码质量_

- [ ] 8.3 最终集成测试和部署验证
  - File: 部署验证脚本
  - 在生产环境进行完整功能测试
  - 验证所有API集成和用户流程
  - Purpose: 确保MVP功能完整可用
  - _Leverage: 自动化测试套件_
  - _Requirements: 所有功能需求_