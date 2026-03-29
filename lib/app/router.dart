import 'package:go_router/go_router.dart';
import 'package:lingmeng/pages/chat/view.dart';
import 'package:lingmeng/pages/main/view.dart';

abstract final class AppRoute {
  static const String home = "/";
  static const String chat = "/chat";
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
        pageBuilder: (context, state) =>
            const NoTransitionPage(child: ChatPage()),
      ),
    ],
  );
}
