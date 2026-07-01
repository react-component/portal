<div align="center">
  <h1>@rc-component/portal</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Part of the Ant Design ecosystem.</sub></p>
  <p>🌀 React portal primitive with lifecycle-friendly container handling.</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/portal"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/portal.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/portal"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/portal.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/portal/actions/workflows/test.yml"><img alt="build status" src="https://github.com/react-component/portal/actions/workflows/test.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/portal"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/portal/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/portal"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/portal?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center">English | <a href="./README.zh-CN.md">简体中文</a></p>

## Highlights

| Area    | Support                                                            |
| ------- | ------------------------------------------------------------------ |
| Purpose | React portal primitive with lifecycle-friendly container handling. |
| Package | `@rc-component/portal`                                             |
| Release | `@rc-component/np` / `rc-np`                                       |

## Install

```bash
npm install @rc-component/portal
```

## Usage

```tsx | pure
import Portal from '@rc-component/portal';

export default () => <Portal open>Hello World</Portal>;
```

## API

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| `getContainer` | Customize portal container. | `Element \| () => Element \| string \| false` | `document.body` |
| `open` | Whether to render portal content. | `boolean` | `false` |
| `autoLock` | Lock page scroll when the portal is open. | `boolean` | `false` |

## Development

```bash
ut install
npm start
npm test
npm run lint
npm run tsc
npm run compile
```

The dumi site runs at `http://localhost:8000`.

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command when the package uses the shared release flow.

## License

@rc-component/portal is released under the [MIT](./LICENSE) license.
