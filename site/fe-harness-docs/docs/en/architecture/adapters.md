# Profiles / Platforms / Stacks

Adapters separate different dimensions of variation.

## Product Profile

Product Profile describes product form. The first profile is `consumer-h5`.

It focuses on:

- Page structure.
- Requirement closure.
- Input evidence priority.
- Common H5 acceptance paths.

It should not write specific business pages and brands.

## Platform Adapter

Platform Adapter describes runtime platform. The first adapter is `web-mobile`.

It focuses on:

- Mobile Web viewport.
- Browser runtime checks.
- H5 screenshot acceptance.
- Environment blocking classification.

After platform rules are independent, future mini-program, React Native, or desktop web can have their own acceptance models.

## Stack Adapter

Stack Adapter describes framework and toolchain. The first stack is `uni-app`.

It focuses on:

- Vue 3.
- Vite.
- `src/pages.json` page registration.
- Playwright.
- Project scripts.

## Why Split into Three Layers

`consumer-h5` is product form, `web-mobile` is runtime platform, `uni-app` is implementation tech stack. These three often appear together, but are not equivalent.

After separation, it can support such evolutionary combinations:

- Consumer H5 switching to other tech stacks.
- Web Mobile used for other product forms.
- uni-app supporting other platform acceptance.