# Requirements Document - MVP版本

## Introduction

买家秀 (Buyer Show) MVP是一个基于Google Nano Banana API的最小验证性产品。该系统通过文本提示调用Google Gemini图像生成API，将买家提供的场景照片与商品进行智能融合，自动生成"买家秀"照片。MVP版本仅包含核心功能验证，专注于技术可行性和基础用户体验测试。

## Alignment with Product Vision

此MVP系统旨在：
- 验证基于文本提示的AI图像融合技术可行性
- 测试用户对AI生成买家秀的接受度
- 验证Google Nano Banana API的集成可行性
- 为后续产品决策提供基础数据

## Requirements

### Requirement 1: 场景照片上传

**User Story:** 作为用户，我希望能够上传我的场景照片

#### Acceptance Criteria

1. WHEN 用户访问上传页面 THEN 系统 SHALL 提供照片上传功能
2. WHEN 用户上传照片 THEN 系统 SHALL 显示预览
3. WHEN 照片上传成功 THEN 系统 SHALL 允许用户进行下一步操作
4. IF 照片上传失败 THEN 系统 SHALL 显示错误提示

### Requirement 2: 商品选择

**User Story:** 作为用户，我希望选择一个商品融入到我的场景中

#### Acceptance Criteria

1. WHEN 用户完成照片上传 THEN 系统 SHALL 显示商品选择列表
2. WHEN 用户选择商品 THEN 系统 SHALL 显示商品预览
3. WHEN 用户确认选择 THEN 系统 SHALL 准备进行描述输入
4. WHEN 用户想更换商品 THEN 系统 SHALL 允许重新选择

### Requirement 3: 位置和场景描述

**User Story:** 作为用户，我希望能够描述商品在场景中的期望位置和展示方式

#### Acceptance Criteria

1. WHEN 用户选择商品后 THEN 系统 SHALL 提供文本输入框供用户描述商品位置
2. WHEN 用户输入位置描述 THEN 系统 SHALL 接受位置描述（如"放在桌子上"、"靠近窗户"、"在沙发旁边"等）
3. WHEN 用户输入场景描述 THEN 系统 SHALL 接受展示场景（如"自然光照"、"生活化场景"、"温馨家居环境"等）
4. WHEN 用户完成位置和场景描述 THEN 系统 SHALL 允许继续进行风格设定

### Requirement 4: 照片风格描述

**User Story:** 作为用户，我希望能够用语言描述最终生成照片的风格效果

#### Acceptance Criteria

1. WHEN 用户完成位置描述后 THEN 系统 SHALL 提供风格描述输入框
2. WHEN 用户输入风格描述 THEN 系统 SHALL 接受摄影风格（如"小清新"、"ins风"、"简约风格"、"温暖色调"等）
3. WHEN 用户描述拍摄角度 THEN 系统 SHALL 接受角度描述（如"俯视角度"、"侧面特写"、"远景全貌"等）
4. WHEN 用户描述光线效果 THEN 系统 SHALL 接受光线描述（如"柔和自然光"、"温暖黄光"、"明亮白光"等）

### Requirement 5: 智能提示文本生成

**User Story:** 作为系统，我需要将用户的各项描述转换为有效的API提示文本

#### Acceptance Criteria

1. WHEN 用户完成所有描述 THEN 系统 SHALL 分析上传的场景照片内容
2. WHEN 系统处理用户输入 THEN 系统 SHALL 结合商品信息、位置描述、场景描述和风格描述生成优化的API提示文本
3. WHEN 生成提示文本 THEN 系统 SHALL 包含完整的场景、商品、位置、风格和摄影参数描述
4. WHEN 调用API THEN 系统 SHALL 使用生成的综合提示文本请求Google Nano Banana API

### Requirement 6: AI图像融合生成

**User Story:** 作为用户，我希望系统能够根据我的全面描述生成期望风格的买家秀照片

#### Acceptance Criteria

1. WHEN 系统调用API THEN 系统 SHALL 使用Google Nano Banana API的文本到图像生成能力
2. WHEN API处理中 THEN 系统 SHALL 显示处理状态和预估完成时间
3. WHEN API处理完成 THEN 系统 SHALL 返回符合用户风格要求的融合图像
4. IF API处理失败 THEN 系统 SHALL 显示失败提示并允许重试

### Requirement 7: 结果展示和对比

**User Story:** 作为用户，我希望能够查看生成的买家秀照片并与原图对比

#### Acceptance Criteria

1. WHEN 图像生成完成 THEN 系统 SHALL 显示生成的图像和原始场景照片的对比
2. WHEN 用户查看结果 THEN 系统 SHALL 提供下载功能
3. WHEN 用户想调整效果 THEN 系统 SHALL 允许修改风格描述重新生成
4. WHEN 用户完成体验 THEN 系统 SHALL 允许开始新的生成流程

### Requirement 8: 基础用户反馈

**User Story:** 作为用户，我希望能够对生成结果和风格效果给出反馈

#### Acceptance Criteria

1. WHEN 用户查看生成结果 THEN 系统 SHALL 提供满意度评分选项（整体效果、风格符合度、商品融合度）
2. WHEN 用户提交评分 THEN 系统 SHALL 记录详细反馈数据
3. WHEN 用户不满意 THEN 系统 SHALL 提供重新生成和风格调整选项
4. WHEN 收集反馈完成 THEN 系统 SHALL 结束当前会话

## 风格描述功能详细说明

### 支持的风格类别
- **摄影风格**：小清新、ins风、复古风、简约现代、温馨家居、日式极简等
- **色调风格**：温暖色调、冷色调、高饱和度、低饱和度、黑白、暖黄光等
- **拍摄角度**：俯视角度、平视角度、仰视角度、侧面特写、远景全貌、近景细节等
- **光线效果**：自然光、柔光、硬光、黄昏光、清晨光、室内暖光等

### 风格描述处理
- 系统将用户的风格描述转换为专业的摄影术语
- 结合商品特性优化风格表达
- 生成符合API格式要求的综合提示文本

## API技术限制说明

### Google Nano Banana API能力范围
- ✅ 支持文本提示进行图像生成
- ✅ 支持摄影术语和风格描述
- ✅ 支持自然语言描述期望效果
- ❌ **不支持**坐标位置参数
- ❌ **不支持**像素级精确控制
- ❌ **不支持**区域标记或点击定位

### MVP适配方案
- 用文本描述替代位置点击功能
- 通过丰富的风格描述提高生成质量
- 依赖API的自然语言理解能力实现风格化场景融合

## MVP范围限制

### 包含功能
- 照片上传和预览
- 简单商品选择（预设商品列表）
- 文字描述位置和场景
- **详细的照片风格描述功能**
- 智能提示文本生成
- Google Nano Banana API调用和风格化图像生成
- 结果展示、对比和下载
- 详细用户反馈收集

### 暂不包含
- 用户注册和登录
- 支付和计费
- 商家功能
- 复杂商品管理
- 位置点击标记功能
- 精确位置控制
- 用户数据存储
- 系统监控和运维