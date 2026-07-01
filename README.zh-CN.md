<div align="center">
  <h1>@rc-component/portal</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Ant Design 生态的一部分。</sub></p>
  <p>🌀 支持生命周期与容器管理的 React Portal 基础组件。</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/portal"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/portal.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/portal"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/portal.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/portal/actions/workflows/test.yml"><img alt="build status" src="https://github.com/react-component/portal/actions/workflows/test.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/portal"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/portal/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/portal"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/portal?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>

## 亮点

| 方向 | 支持                                             |
| ---- | ------------------------------------------------ |
| 定位 | 支持生命周期与容器管理的 React Portal 基础组件。 |
| 包名 | `@rc-component/portal`                           |
| 发布 | `@rc-component/np` / `rc-np`                     |

## 安装

```bash
npm install @rc-component/portal
```

## 用法

```tsx | pure
import Portal from '@rc-component/portal';

export default () => <Portal open>Hello World</Portal>;
```

## API

| 名称 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `getContainer` | 自定义 Portal 容器。 | `Element \| () => Element \| string \| false` | `document.body` |
| `open` | 是否渲染 Portal 内容。 | `boolean` | `false` |
| `autoLock` | Portal 打开时锁定页面滚动。 | `boolean` | `false` |

## 本地开发

```bash
ut install
npm start
npm test
npm run lint
npm run tsc
npm run compile
```

本地 dumi 站点默认运行在 `http://localhost:8000`.

## 发布

```bash
npm run prepublishOnly
```

发布流程通过 `@rc-component/np` 提供的 `rc-np` 命令处理。

## 许可证

@rc-component/portal 基于 [MIT](./LICENSE) 协议发布。
