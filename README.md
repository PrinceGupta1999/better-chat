# Better Chat Chrome Extension

Better Google Chat™ Home – Stay Organized with Smart Filters

Tired of a cluttered Google Chat™ Home? This extension enhances your experience by adding powerful filters, so you can quickly find the conversations that matter.

🔹 Features:
- ✅ Filter by Chat Type - Easily view Direct Messages, Spaces, @all mentions, and more.
- ✅ Stay Focused - Reduce noise and see only what’s important.
- ✅ Improve Productivity - Navigate your chats faster and never miss key updates.

Perfect for professionals, teams, and anyone who wants a cleaner, more efficient Google Chat™ experience. Try it now! 🚀

## Table of Contents

- [Features](#features)
- [Structure](#structure)
    - [ChromeExtension](#structure-chrome-extension)
    - [Packages](#structure-packages)
    - [Pages](#structure-pages)
- [Getting started](#getting-started)
    - [Chrome](#getting-started-chrome)
    - [Firefox](#getting-started-firefox)
- [Install dependency](#install-dependency)
    - [For root](#install-dependency-for-root)
    - [For module](#install-dependency-for-module)
- [Community](#community)
- [Reference](#reference)
- [Star History](#star-history)
- [Contributors](#contributors)

## Features

- [React18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwindcss](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/) with [Rollup](https://rollupjs.org/)
- [Turborepo](https://turbo.build/repo)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Chrome Extensions Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Custom i18n package](/packages/i18n/)
- [Custom HMR (Hot Module Rebuild) plugin](/packages/hmr/)
- [End-to-end testing with WebdriverIO](https://webdriver.io/)

## Getting started

1. Clone this repository: `git clone https://github.com/PrinceGupta1999/better-chat`
2. Ensure your node version is >= the version in `.nvmrc`, recommend using [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#intro)
3. Edit `/packages/i18n/locales/{your locale(s)}/messages.json`
4. In the objects `extensionDescription` and `extensionName`, change the `message` fields (leave `description` alone)
5. In `/package.json`, change the `version` to the desired version of your extension.
6. Install pnpm globally: `npm install -g pnpm` (ensure your node version >= 22.12.0)
7. Run `pnpm install`

Then, depending on the target browser:

### For Chrome: <a name="getting-started-chrome"></a>

1. Run:
    - Dev: `pnpm dev` (on Windows, you should run as administrator; see [issue#456](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/456))
    - Prod: `pnpm build`
2. Open in browser - `chrome://extensions`
3. Check - <kbd>Developer mode</kbd>
4. Click - <kbd>Load unpacked</kbd> in the upper left corner
5. Select the `dist` directory from the boilerplate project

### For Firefox: <a name="getting-started-firefox"></a>

1. Run:
    - Dev: `pnpm dev:firefox`
    - Prod: `pnpm build:firefox`
2. Open in browser - `about:debugging#/runtime/this-firefox`
3. Click - <kbd>Load Temporary Add-on...</kbd> in the upper right corner
4. Select the `./dist/manifest.json` file from the boilerplate project

> [!NOTE]
> In Firefox, you load add-ons in temporary mode. That means they'll disappear after each browser close. You have to load the add-on on every browser launch.

## Install dependency for turborepo: <a name="install-dependency"></a>

### For root: <a name="install-dependency-for-root"></a>

1. Run `pnpm i <package> -w`

### For module: <a name="install-dependency-for-module"></a>

1. Run `pnpm i <package> -F <module name>`

`package` - Name of the package you want to install e.g. `nodemon` \
`module-name` - You can find it inside each `package.json` under the key `name`, e.g. `@extension/content-script`, you can use only `content-script` without `@extension/` prefix

## Environment variables

To add an environment variable:

1. Copy `.example.env` to `.env` (in the same directory)
2. Add a new record inside `.env`, prefixed with `VITE_`, e.g. `VITE_MY_API_KEY=...`
3. Edit `./vite-env.d.ts` and in the `ImportMetaEnv` interface, add your variable with the appropriate type, e.g.

   `readonly VITE_MY_API_KEY: string;`
4. Then you can read the variable via `import.meta.env.VITE_MY_API_KEY` (learn more at [Env Variables and Modes](https://vite.dev/guide/env-and-mode))

#### If you want to set it for each package independently:

1. Create `.env` inside that package
2. Open related `vite.config.mts` and add `envDir: '.'` at the end of this config
3. Rest steps like above

#### Remember you can't use global and local at the same time for the same package(It will be overwritten)

## Boilerplate structure <a name="structure"></a>

### Chrome extension <a name="structure-chrome-extension"></a>

The extension lives in the `chrome-extension` directory and includes the following files:

- [`manifest.js`](chrome-extension/manifest.js) - script that outputs the `manifest.json`
- [`src/background`](chrome-extension/src/background) - [background script](https://developer.chrome.com/docs/extensions/mv3/background_pages/)
  (`background.service_worker` in manifest.json)
- [`public`](chrome-extension/public/) - icons referenced in the manifest; content CSS for user's page injection

> [!IMPORTANT]
> To facilitate development, the boilerplate is configured to "Read and change all your data on all websites".
> In production, it's best practice to limit the premissions to only the strictly necessary websites. See
> [Declaring permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
> and edit `manifest.js` accordingly.

### Pages <a name="structure-pages"></a>

Code that is transpiled to be part of the extension lives in the [pages](pages/) directory.

- [`content`](pages/content/) - [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
  (`content_scripts` in manifest.json)
- [`content-ui`](pages/content-ui) - React UI rendered in the current page (you can see it at the very bottom when you get started)
  (`content_scripts` in manifest.json)
- [`content-runtime`](pages/content-runtime/src/) - [injected content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#functionality);
  this can be injected from `popup` like standard `content`
- [`devtools`](pages/devtools/) - [extend the browser DevTools](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools#creating)
  (`devtools_page` in manifest.json)
- [`devtools-panel`](pages/devtools-panel/) - [DevTools panel](https://developer.chrome.com/docs/extensions/reference/api/devtools/panels)
  for [devtools](pages/devtools/src/index.ts)
- [`new-tab`](pages/new-tab/) - [override the default New Tab page](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
  (`chrome_url_overrides.newtab` in manifest.json)
- [`options`](pages/options/) - [options page](https://developer.chrome.com/docs/extensions/develop/ui/options-page)
  (`options_page` in manifest.json)
- [`popup`](pages/popup/) - [popup](https://developer.chrome.com/docs/extensions/reference/api/action#popup) shown when clicking the extension in the toolbar
  (`action.default_popup` in manifest.json)
- [`side-panel`](pages/side-panel/) - [sidepanel (Chrome 114+)](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
  (`side_panel.default_path` in manifest.json)

### Packages <a name="structure-packages"></a>

Some shared packages:

- `dev-utils` - utilities for Chrome extension development (manifest-parser, logger)
- `i18n` - custom internationalization package; provides i18n function with type safety and other validation
- `hmr` - custom HMR plugin for Vite, injection script for reload/refresh, HMR dev-server
- `shared` - shared code for the entire project (types, constants, custom hooks, components etc.)
- `storage` - helpers for easier integration with [storage](https://developer.chrome.com/docs/extensions/reference/api/storage), e.g. local/session storages
- `tailwind-config` - shared Tailwind config for entire project
- `tsconfig` - shared tsconfig for the entire project
- `ui` - function to merge your Tailwind config with the global one; you can save components here
- `vite-config` - shared Vite config for the entire project
- `zipper` - run `pnpm zip` to pack the `dist` folder into `extension-YYYYMMDD-HHmmss.zip` inside the newly created `dist-zip`
- `e2e` - run `pnpm e2e` for end-to-end tests of your zipped extension on different browsers

## Troubleshooting

### Hot module reload seems to have frozen

If saving source files doesn't cause the extension HMR code to trigger a reload of the browser page, try this:

1. Ctrl+C the development server and restart it (`pnpm run dev`)
2. If you get a [`grpc` error](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/612),
   [kill the `turbo` process](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/612#issuecomment-2518982339) and run `pnpm dev` again.

## Community

To chat with other community members, you can join the [Discord](https://discord.gg/4ERQ6jgV9a) server.
You can ask questions on that server, and you can also help others.

Also, suggest new features or share any challenges you've faced while developing Chrome extensions!

## Reference

- [Chrome Extensions](https://developer.chrome.com/docs/extensions)
- [Vite Plugin](https://vitejs.dev/guide/api-plugin.html)
- [Rollup](https://rollupjs.org/guide/en/)
- [Turborepo](https://turbo.build/repo/docs)
- [Rollup-plugin-chrome-extension](https://www.extend-chrome.dev/rollup-plugin)
