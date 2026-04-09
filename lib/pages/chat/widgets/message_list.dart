import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:lingmeng/providers/providers.dart';
import 'message_bubble.dart';

class MessageList extends ConsumerStatefulWidget {
  final String sessionId;
  final ChatSession? session;

  const MessageList({super.key, required this.sessionId, this.session});

  @override
  ConsumerState<MessageList> createState() => _MessageListState();
}

class _MessageListState extends ConsumerState<MessageList> {
  final ScrollController _scrollController = ScrollController();
  bool _isLoadingRemote = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadMessages();
    });
  }

  @override
  void didUpdateWidget(MessageList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sessionId != widget.sessionId) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadMessages();
      });
    }
  }

  Future<void> _loadMessages() async {
    final session = widget.session;

    ref.read(messagesMapProvider.notifier).loadMessages(widget.sessionId);

    if (session != null && !_isLocalSession(session)) {
      await _loadRemoteMessages(session);
    }
  }

  bool _isLocalSession(ChatSession session) {
    return RegExp(r'^\d').hasMatch(session.id);
  }

  Future<void> _loadRemoteMessages(ChatSession session) async {
    setState(() {
      _isLoadingRemote = true;
      _loadError = null;
    });

    try {
      await ref
          .read(messagesMapProvider.notifier)
          .loadRemoteMessages(session);
    } catch (e) {
      setState(() {
        _loadError = e.toString();
      });
    } finally {
      setState(() {
        _isLoadingRemote = false;
      });
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesMap = ref.watch(messagesMapProvider);
    final messages = messagesMap[widget.sessionId] ?? [];

    ref.listen(messagesMapProvider, (_, next) {
      _scrollToBottom();
    });

    // 显示加载状态
    if (_isLoadingRemote) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              '正在加载会话内容...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
      );
    }

    // 显示错误
    if (_loadError != null && messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text('加载失败', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _loadError!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: widget.session != null
                  ? () => _loadRemoteMessages(widget.session!)
                  : null,
              icon: const Icon(Icons.refresh),
              label: const Text('重试'),
            ),
          ],
        ),
      );
    }

    if (messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              '开始对话吧',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '发送消息开始聊天',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(vertical: 16),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        return MessageBubble(message: messages[index]);
      },
    );
  }
}
