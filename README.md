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

## 本地测试

Service Worker 只在**安全上下文**里工作：

- ✅ `http://localhost:8765/pwa/` 或 `http://127.0.0.1:8765/pwa/`
- ❌ `http://172.16.30.25:8765/pwa/`（局域网 IP 不算安全上下文，SW 注册会失败，只能当普通网页用）

在电脑上起服务：`python -m http.server 8765 --directory "E:\test\_demo"`，然后开 `http://127.0.0.1:8765/pwa/`。

打开 DevTools → Application → Service Workers，看到 `sw.js` 状态为 activated 即成功；切到 Network 勾选 Offline 再刷新，页面仍能打开才算真的离线可用。

## 部署到 GitHub Pages

1. 新建一个**公开**仓库，名字建议 `led-banner`
2. 把本目录里的所有文件（含 `icons/`）传到仓库**根目录**
3. 仓库 → Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`，保存
4. 等 1–2 分钟，访问 **https://foanan.github.io/led-banner/**

> 页面本身不含任何敏感信息，公开仓库没问题。但**不要**把 `E:\test` 整个推上去——那个工作区里有设备配置和明文口令。

## 手机安装

**Android Chrome**：打开上面的网址 → 页面底部会出现「安装」条 → 点一下，或地址栏右侧的安装图标。

**iOS Safari**：打开网址 → 底部「分享」按钮 → 「添加到主屏幕」。iOS 没有安装 API，只能手动操作；添加后从主屏幕启动才是全屏的。

## 更新版本

改了 `index.html` 之后，**必须同步改 `sw.js` 里的缓存名**：

```js
const CACHE = 'led-banner-v2';   // 原来是 v1
```

否则 Service Worker 会一直返回缓存里的旧页面，用户看到的还是老版本。

## 重新生成

页面是从上级目录的主文件生成的，改完主文件后执行：

```powershell
python E:\test\_demo\make_pwa.py     # 重新注入 PWA 标签
python E:\test\_demo\make_icons.py   # 需要改图标时
```
