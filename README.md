# Memo Translate

一个能记住你查过的单词的划词翻译插件。

## 为什么做这个

背单词软件一大堆，但我发现自己最容易记住的，反而是那些在真实阅读场景里查过的词。所以就想，能不能把"查词"和"复习"这两件事合在一起？

这不仅是一个翻译工具，更是你的英语学习助手。

这个插件做了几件事：
- **即划即译**：双击单词或划选句子，立刻获得精准翻译。
- **生词本**：一键保存生词，自动同步到后台。
- **记忆增强**：下次在网页上看到已收藏的单词，会自动高亮提醒。
- **Anki 集成**：支持一键导出到 Anki，利用间隔重复算法持久记忆。
- **AI 语法私教**：接入大模型，深度分析长难句语法结构，解释地道用法。

## 快速开始

### 前端（Chrome 插件）

1. 打开 Chrome，进入 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点"加载已解压的扩展程序"，选择 `memo-translate-frontend` 文件夹
4. 刷新你正在看的网页，双击任意单词试试

### 后端（可选，用于 AI 解析）

如果你想用 AI 分析句子语法，需要跑一下后端。

**方式一：本地运行**
```bash
cd memo-translate-backend
cp src/main/resources/application.yml.example src/main/resources/application.yml
# 编辑 application.yml，填入你的 OpenAI API Key
mvn spring-boot:run
```

**方式二：Docker 部署（推荐）**
```bash
cd memo-translate
cp .env.example .env
# 编辑 .env，填入你的 API Key
docker-compose up -d
```

支持任何兼容 OpenAI 格式的 API（DeepSeek、Kimi、各种中转都行）。

## 功能

**实时 AI 助手**
- **语法拆解**：划选长难句 → AI 自动拆解句子结构，提炼核心成分，帮你攻克长难句。
- **深度释义**：解释单词在当前网页上下文中的精确含义，提供地道搭配、词义辨析及助记建议。
- **流式响应**：采用 SSE (Server-Sent Events) 技术，AI 分析实时打字机式展现，无需漫长等待。

**生词管理**
- **一键收藏**：点击"添加到生词本"即可跨设备保存。
- **网页高亮**：收藏后的词在后续浏览中会以淡黄色高亮（Marker 效果），鼠标悬停即可查看释义。
- **智能区分**：单词和句子分类存储，互不干扰，方便后续复习。

**导出复习**
- 点插件图标 → 打开生词本
- 点"导出 Anki" → 下载 CSV 文件
- 导入 Anki 后就能在手机上背了

## 技术栈

**前端**
- Vanilla JS（没用框架，就是纯手写）
- Chrome Extension Manifest V3
- Google Translate API（非官方，有被封风险）

**后端**
- Kotlin + Spring Boot 3.3
- SSE (Server-Sent Events) 实时流式传输
- 实现了一个轻量级的 SSE Parser 处理流式输出
- 兼容 OpenAI 格式的任意大模型接口（DeepSeek, OpenAI, Claude 等）

## 已知问题

- Google 翻译接口是 hack 的，可能哪天就挂了
- Alt+S 快捷键有时候不生效（焦点问题）
- 页面高亮逻辑比较暴力，复杂网页可能会卡

## 后续想做的

- [ ] 云端同步（Chrome Sync API）
- [ ] 右键菜单支持
- [ ] PDF 阅读器支持
- [ ] 换成正经的翻译 API

## License

随便用，改了记得告诉我一声。
