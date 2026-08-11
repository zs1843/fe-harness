# Profiles / Platforms / Stacks

Adapters separate different dimensions of variation.

## Product Profile

Product Profile describes product form. Currently supported profiles:

- `consumer-h5` (first): Consumer H5 mobile application
- `admin-web`: Admin dashboard, B-side enterprise application
- `mini-program`: WeChat/Alipay mini-program

### consumer-h5

It focuses on:

- Page structure.
- Requirement closure.
- Input evidence priority.
- Common H5 acceptance paths.

It should not write specific business pages and brands.

### admin-web

It focuses on:

- Desktop viewport layout.
- Data table states (empty/loading/error/pagination).
- Form validation and error display.
- Permission and route guard.
- Batch operations.
- Modal and drawer management.
- Responsive sidebar.

### mini-program

It focuses on:

- Page route stack.
- TabBar navigation.
- Authorization scope.
- Pull-to-refresh.
- Network error recovery.
- Subpackage loading.
- Share and scene values.

## Platform Adapter

Platform Adapter describes runtime platform. Currently supported adapters:

- `web-mobile` (first): Mobile Web platform
- `node-runtime`: Node.js server-side runtime

### web-mobile

It focuses on:

- Mobile Web viewport.
- Browser runtime checks.
- H5 screenshot acceptance.
- Environment blocking classification.

After platform rules are independent, future mini-program, React Native, or desktop web can have their own acceptance models.

### node-runtime

It focuses on:

- Node.js version compatibility.
- Environment variable configuration.
- Process error handling.
- Logs and coverage artifacts.

## Stack Adapter

Stack Adapter describes framework and toolchain. Currently supported stacks:

- `uni-app` (first): uni-app + Vue 3
- `vue3-vite`: Vue 3 + Vite pure Web
- `taro`: Taro 4 + React multi-platform
- `react-vite`: React 18 + Vite pure Web

### uni-app

It focuses on:

- Vue 3.
- Vite.
- `src/pages.json` page registration.
- Playwright.
- Project scripts.

### vue3-vite

It focuses on:

- Vue 3 + Vite + TypeScript.
- `vite.config` configuration files.
- Vue Router integrity.
- Vitest + Playwright test isolation.

### taro

It focuses on:

- Taro 4 + React.
- `src/app.config.ts` page registration.
- Taro request mocking.
- Multi-platform build commands.

### react-vite

It focuses on:

- React 18 + Vite + TypeScript.
- `vite.config` configuration files.
- React Router integrity.
- Vitest + Playwright test isolation.

## Why Split into Three Layers

`consumer-h5` is product form, `web-mobile` is runtime platform, `uni-app` is implementation tech stack. These three often appear together, but are not equivalent.

After separation, it can support such evolutionary combinations:

- Consumer H5 switching to other tech stacks.
- Web Mobile used for other product forms.
- uni-app supporting other platform acceptance.