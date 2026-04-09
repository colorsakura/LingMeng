import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lingmeng/app/constants.dart';
import 'package:lingmeng/providers/providers.dart';

class SidebarHeader extends ConsumerWidget {
  final VoidCallback onNewChat;

  const SidebarHeader({super.key, required this.onNewChat});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionsAsync = ref.watch(sessionsProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(FluentIcons.chat_24_filled, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  Constants.appName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                onPressed: sessionsAsync.isLoading
                    ? null
                    : () {
                        ref.read(sessionsProvider.notifier).syncFromRemote();
                      },
                icon: sessionsAsync.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(FluentIcons.arrow_sync_24_regular),
                tooltip: '同步会话',
              ),
              IconButton(
                onPressed: () => context.push('/settings'),
                icon: const Icon(FluentIcons.settings_24_regular),
                tooltip: '设置',
              ),
            ],
          ),
          if (sessionsAsync.hasError)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                '同步失败',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
