# 📃 obsidian-community-list

This repository fetches the [community themes and plugins catalog](https://github.com/obsidianmd/obsidian-releases) and turns it into Markdown tables using a modern TypeScript pipeline powered by [`markdown-table`](https://github.com/wooorm/markdown-table) and [`undici`](https://github.com/nodejs/undici).

- [🎀 Themes](lists/themes.md)
- [🔌 Plugins](lists/plugins.md)

## Usage

```bash
git clone https://github.com/konhi/obsidian-community-list.git
cd obsidian-community-list
npm install
npm start
```

`npm start` runs the TypeScript entrypoint directly via [`tsx`](https://github.com/esbuild-kit/tsx). Use `npm run build` to emit `dist/` and execute the compiled script (the CI job relies on this).
