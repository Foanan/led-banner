# LED 滚动字幕 · PWA 版

把手机变成一块滚动字幕牌。纯静态、无后端、无权限、无广告，离线可用。

## 目录里有什么

| 文件 | 作用 |
|---|---|
| `index.html` | 应用本体（从 `../led-banner.html` 注入 PWA 标签生成，**不要直接改这个文件**） |
| `manifest.json` | 应用身份：名称、图标、全屏方式、方向 |
| `sw.js` | Service Worker：预缓存全部资源，断网也能开 |
| `install.js` | 注册 SW + Android/iOS 两套安装引导 |
| `icons/` | 192 / 512 / maskable / Apple 触摸图标 |


## 手机安装

**Android Chrome**：打开上面的网址 → 页面底部会出现「安装」条 → 点一下，或地址栏右侧的安装图标。

**iOS Safari**：打开网址 → 底部「分享」按钮 → 「添加到主屏幕」。iOS 没有安装 API，只能手动操作；添加后从主屏幕启动才是全屏的。
