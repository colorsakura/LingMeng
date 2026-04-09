import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:lingmeng/providers/providers.dart';
import 'session_tile.dart';

class SessionList extends ConsumerWidget {
  final String? selectedSessionId;
  final void Function(ChatSession) onSessionTap;

  const SessionList({
    super.key,
    this.selectedSessionId,
    required this.onSessionTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionsAsync = ref.watch(sessionsProvider);

    return sessionsAsync.when(
      data: (sessions) {
        if (sessions.isEmpty) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                '暂无对话\n点击左上角 + 新建对话',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          );
        }

        return ListView.builder(
          itemCount: sessions.length,
          itemBuilder: (context, index) {
            final session = sessions[index];
            return SessionTile(
              session: session,
              isSelected: session.id == selectedSessionId,
              onTap: () => onSessionTap(session),
              onDelete: () {
                ref.read(sessionsProvider.notifier).deleteSession(session.id);
              },
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('加载失败: $error')),
    );
  }
}
