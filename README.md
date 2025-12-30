# Memo Translate

一个能记住你查过的单词的划词翻译插件。

## 为什么做这个

背单词软件一大堆，但我发现自己最容易记住的，反而是那些在真实阅读场景里查过的词。所以就想，能不能把"查词"和"复习"这两件事合在一起？

这个插件做了几件事：
- 双击单词/划选句子，立刻翻译
- 点一下就能存到生词本
- 下次再看到这个词，页面上会自动高亮提醒你
- 生词本可以一键导出到 Anki

后来又加了个后端，接了 AI 来分析长难句的语法结构。现在不仅能查词，还能当个英语私教用。

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

**基础翻译**
- 双击单词 → 弹窗显示翻译、音标、词典释义
- 划选长句 → AI 帮你拆解语法、提炼短语、给助记提示
- 点喇叭图标 → 浏览器朗读（TTS）

**生词管理**
- 点"添加到生词本"保存
- 保存后的词会在页面上高亮（淡黄色）
- 鼠标悬停高亮词 → 显示中文意思
- 单词和句子分开存，互不干扰

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
- Spring AI（其实最后没用上，直接 RestClient 调的）
- 兼容 OpenAI 格式的任意大模型

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
