# 📃 obsidian-community-list

This repository fetches the [community themes and plugins catalog](https://github.com/obsidianmd/obsidian-releases) and turns it into Markdown tables with native `fetch`, Bun, and a dependency-free Markdown table renderer.

- [🎀 Themes](lists/themes.md)
- [🔌 Plugins](lists/plugins.md)

## Usage

```bash
git clone https://github.com/konhi/obsidian-community-list.git
cd obsidian-community-list
npm install # or bun install
bun run start   # generates lists from TypeScript directly
bun test        # runs the Bun test suite
bun run build   # emits dist/ via tsc for consumers that need JS output
```

Bun executes the TypeScript entrypoint directly (no `tsx` shim required). The `npm start` / `npm run generate` aliases still work as long as Bun is on your `PATH`.

## CI

The scheduled GitHub Action runs on Bun but still installs Node.js 20 because the `tsc` CLI is a Node script (the compiled output lives in `dist/` for consumers that need JavaScript builds).
