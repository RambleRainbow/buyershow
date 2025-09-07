# 买家秀生成 API 测试

这个测试套件用于测试买家秀图像生成 API 的功能。

## 测试内容

测试包含了以下功能：

1. **完整的买家秀生成测试** - 使用场景照片和产品照片生成买家秀
2. **参数验证测试** - 验证 API 对缺失参数的处理
3. **描述长度验证** - 验证用户描述的最小长度要求
4. **最小参数测试** - 使用最少必需参数进行测试

## 测试用例详情

### 1. 完整买家秀生成测试
- 使用 `test/images/scene.jpg` 作为场景照片
- 使用 `test/images/product.jpeg` 作为产品照片
- 包含完整的描述信息：
  - `userDescription`: "请帮我生成一个温馨的生活场景买家秀，展示产品在日常使用中的美好感觉"
  - `productDescription`: "精美的陶瓷花瓶，适合家居装饰"
  - `placementDescription`: "将产品自然地放置在温馨的家居环境中"
  - `styleDescription`: "温馨、自然、生活化的拍摄风格"
  - `temperature`: 0.7

### 2. 错误处理测试
- 测试缺少必需参数时的错误处理
- 测试描述过短时的验证
- 验证 API 返回适当的错误信息

### 3. 最小参数测试
- 仅使用必需的参数进行测试
- 验证默认值的正确应用

## 运行前准备

1. **启动 API 服务器**：
   ```bash
   cd apps/api
   npm run dev
   ```
   确保 API 服务器在 `http://localhost:3001` 运行

2. **安装测试依赖**：
   ```bash
   cd test
   npm install
   ```

## 运行测试

### 方式1：使用脚本运行（推荐）
```bash
./run-test.sh
```

### 方式2：直接运行测试
```bash
npm run test:generation
```

### 方式3：监视模式
```bash
npm run test:watch
```

## 测试配置

- **超时时间**: 3分钟（生成过程可能较长）
- **API 端点**: `http://localhost:3001/api/trpc/generation.generateImage`
- **测试环境**: Node.js
- **测试框架**: Vitest

## 预期结果

成功运行时，测试应该显示：
- ✅ 图像成功加载并转换为 base64
- ✅ API 请求成功发送
- ✅ 返回包含生成请求 ID 和状态的响应
- ✅ 增强提示词已生成
- ✅ 错误处理正常工作

## 故障排除

### 连接被拒绝 (ECONNREFUSED)
- 确保 API 服务器正在运行
- 检查端口 3001 是否被占用
- 确认 API 服务器配置正确

### 测试超时
- 生成过程可能需要较长时间
- 检查 NanoBanana API 是否正常工作
- 确认网络连接稳定

### 图像加载失败
- 确保测试图像文件存在于 `test/images/` 目录
- 检查图像文件权限
- 确认图像格式正确（JPG/JPEG）

## 文件结构

```
test/
├── generation.test.js      # 主测试文件
├── package.json           # 测试依赖配置
├── vitest.config.js       # Vitest 配置
├── run-test.sh            # 测试运行脚本
├── README.md              # 文档（本文件）
└── images/
    ├── scene.jpg          # 场景测试图片
    └── product.jpeg       # 产品测试图片
```

## API 端点详情

测试调用的 tRPC 端点：`generation.generateImage`

**请求参数**：
- `userDescription` (string, required): 用户描述，最少5个字符
- `productDescription` (string, optional): 产品描述
- `placementDescription` (string, optional): 放置描述
- `styleDescription` (string, optional): 风格描述
- `sceneImageBase64` (string, optional): 场景图片的 base64 数据
- `productImageBase64` (string, optional): 产品图片的 base64 数据
- `temperature` (number, optional): 生成温度，默认 0.7

**响应格式**：
```json
{
  "id": "generation-id",
  "status": "COMPLETED|IN_PROGRESS|PENDING",
  "enhancedPrompt": "优化后的提示词",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "generatedImage": {
    "id": "image-id",
    "filename": "generated_xxx.png",
    "imageData": "base64-image-data",
    "mimeType": "image/png",
    "width": 1024,
    "height": 1024,
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```