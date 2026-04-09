import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:lingmeng/providers/providers.dart';
import 'backend_switcher.dart';
import 'session_list.dart';
import 'sidebar_header.dart';

class SideBar extends ConsumerStatefulWidget {
  const SideBar({super.key});

  @override
  ConsumerState<SideBar> createState() => _SideBarState();
}

class _SideBarState extends ConsumerState<SideBar> {
  String? _selectedSessionId;

  Future<void> _createNewSession() async {
    final session = await ref.read(sessionsProvider.notifier).createSession();
    if (mounted) {
      setState(() {
        _selectedSessionId = session.id;
      });
      ref.read(currentSessionProvider.notifier).setSession(session);
      if (mounted) {
        context.go('/chat/${session.id}');
      }
    }
  }

  void _onSessionTap(ChatSession session) {
    setState(() {
      _selectedSessionId = session.id;
    });
    ref.read(currentSessionProvider.notifier).setSession(session);
    context.go('/chat/${session.id}');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      height: double.infinity,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerLow,
        border: Border(
          right: BorderSide(color: Theme.of(context).dividerColor, width: 1),
        ),
      ),
      child: Column(
        children: [
          SidebarHeader(onNewChat: _createNewSession),
          const Divider(height: 1),
          Expanded(
            child: SessionList(
              selectedSessionId: _selectedSessionId,
              onSessionTap: _onSessionTap,
            ),
          ),
          const Divider(height: 1),
          const Padding(padding: EdgeInsets.all(8.0), child: BackendSwitcher()),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  FluentIcons.info_24_regular,
                  size: 14,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 4),
                Text(
                  '内容由 AI 生成',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
