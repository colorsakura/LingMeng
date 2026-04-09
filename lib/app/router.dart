import 'package:go_router/go_router.dart';
import 'package:lingmeng/pages/chat/view.dart';
import 'package:lingmeng/pages/main/view.dart';
import 'package:lingmeng/pages/settings/view.dart';

abstract final class AppRoute {
  static const String home = "/";
  static const String chat = "/chat/:id";
  static const String settings = "/settings";
}

abstract final class AppRouter {
  static final config = GoRouter(
    routes: [
      GoRoute(
        path: AppRoute.home,
        pageBuilder: (context, state) =>
            const NoTransitionPage(child: MainPage()),
      ),

      GoRoute(
        path: AppRoute.chat,
        pageBuilder: (context, state) {
          final sessionId = state.pathParameters['id'] ?? '';
          return NoTransitionPage(child: ChatPage(sessionId: sessionId));
        },
      ),

      GoRoute(
        path: AppRoute.settings,
        pageBuilder: (context, state) =>
            const NoTransitionPage(child: SettingsPage()),
      ),
    ],
  );
}
