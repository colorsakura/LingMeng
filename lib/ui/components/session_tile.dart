import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:lingmeng/backend/providers.dart';
import 'package:lingmeng/models/chat.dart';

class SessionTile extends StatelessWidget {
  final ChatSession session;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const SessionTile({
    super.key,
    required this.session,
    required this.isSelected,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(session.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        color: Colors.red,
        child: const Icon(FluentIcons.delete_24_regular, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: ListTile(
        selected: isSelected,
        selectedTileColor: Theme.of(
          context,
        ).colorScheme.primaryContainer.withValues(alpha: 0.3),
        leading: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _getBackendIcon(session.backend),
              size: 20,
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ],
        ),
        title: Text(session.name, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: session.lastMessage != null
            ? Text(
                session.lastMessage!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              )
            : null,
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: _getBackendColor(session.backend).withOpacity(0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            session.backend.displayName,
            style: TextStyle(
              fontSize: 10,
              color: _getBackendColor(session.backend),
            ),
          ),
        ),
        onTap: onTap,
      ),
    );
  }

  IconData _getBackendIcon(BackendProvider provider) {
    switch (provider) {
      case BackendProvider.kimi:
        return FluentIcons.chat_24_filled;
      case BackendProvider.deepseek:
        return FluentIcons.brain_circuit_24_regular;
      case BackendProvider.doubao:
        return FluentIcons.sparkle_24_regular;
      case BackendProvider.qianwen:
        return FluentIcons.lightbulb_24_regular;
    }
  }

  Color _getBackendColor(BackendProvider provider) {
    switch (provider) {
      case BackendProvider.kimi:
        return Colors.blue;
      case BackendProvider.deepseek:
        return Colors.green;
      case BackendProvider.doubao:
        return Colors.orange;
      case BackendProvider.qianwen:
        return Colors.purple;
    }
  }
}
