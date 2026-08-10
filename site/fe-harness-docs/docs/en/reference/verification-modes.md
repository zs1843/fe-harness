# Verification Modes

## quick

Fast feedback, suitable for small-scope changes. Typically runs unit tests and version checks.

## feature

Complete feature acceptance. In Consumer H5, feature includes requirement closure, which cannot be substituted by build success alone.

## runtime

Browser or runtime checks. Currently, minimal fixture uses Playwright to verify H5 page responsiveness, core content, console errors, and page errors.

## interaction

Critical interaction checks. By default, it may be unconfigured, but must be explicitly reported; it should not pretend to pass.

## visual

Visual regression. Reports `not_configured` when baseline is missing. Executes screenshot comparison after baseline is available.

## audit

Audit mode attempts to collect complete results and typically does not fail-fast. Suitable for pre-release, pre-handover, or diagnosing complex issues.

## Environment Blocking

Toolchain limitations such as local port listening failures are classified as environment blocking rather than business failures. This prevents misinterpreting sandbox or machine limitations as project issues.