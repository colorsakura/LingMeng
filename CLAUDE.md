# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands
- **Install deps**: `flutter pub get`
- **Analyze** (lints from `analysis_options.yaml`): `flutter analyze`
- **Run app**
  - Desktop: `flutter run -d linux|macos|windows`
  - Web preview: `flutter run -d chrome`
- **Build release artifacts**: `flutter build linux|macos|windows|web`
- **Full test suite**: `flutter test`
- **Manual backend smoke**: `dart run test/kimi_test.dart` (requires a valid Kimi bearer token via `Kimi.setAccessToken` before hitting the live API; see `test/kimi_test.dart`).

## Architecture overview
- **Entry + globals**: `lib/main.dart`:1-11 boots Flutter, initializes MMKV, and wraps the widget tree in Riverpod's `ProviderScope` before instantiating `App`.
- **App shell**: `lib/app/app.dart`:1-17 defines `MaterialApp.router`, supplies the seed theme, and defers navigation to `AppRouter`.
- **Routing**: `lib/app/router.dart`:1-28 configures GoRouter with two routes—`/` (desktop/mobile launcher) and `/chat/:id` (chat surface). Navigation uses `context.go` (e.g., `lib/pages/main/view.dart`:23-26).
- **UI layers**
  - `lib/pages/main/view.dart`:8-35 orchestrates desktop vs. mobile scaffolds, embedding `SideBar` for large screens and exposing an AppBar/drawer on mobile.
  - `lib/pages/chat/view.dart`:6-63 renders the chat session scaffold plus a basic composer stub.
  - Shared desktop chrome lives in `lib/ui/components/sidebar.dart`:4-21, exported via `lib/ui/ui.dart`.
  - Platform checks centralize through `lib/utils/platform.dart`:3-10 for layout branching.
- **Backend abstraction**
  - `lib/backend/backend_base.dart`:3-164 provides a Dio-based base client with interceptor-driven bearer injection, uniform POST helper, and JSON validators.
  - Provider-specific clients (e.g., `lib/backend/kimi/kimi.dart`:5-118 plus peers under `lib/backend/{deepseek,doubao,qianwen}`) extend `BackendBase` to implement LLM-provider APIs such as `Kimi.getChats`.
  - Credentials are currently managed in-memory per client via `setAccessToken`; UI layers are expected to call these before invoking API methods.
- **State & storage**
  - Riverpod's `ProviderScope` is already in place even though app-level providers are not yet defined.
  - MMKV (`main.dart`:6-10) is initialized for key-value storage; sqlite3 is declared as a dependency but not yet exercised in code.

## Testing notes
- Only `test/kimi_test.dart` exists today; it talks to real Kimi servers and prints chat summaries. Treat it as an opt-in smoke test because it needs valid credentials and network access.
