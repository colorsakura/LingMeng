import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lingmeng/app/constants.dart';
import 'package:lingmeng/providers/providers.dart';
import 'package:lingmeng/ui/ui.dart';
import 'package:lingmeng/utils/platform.dart';
import 'widgets/message_list.dart';
import 'widgets/chat_input.dart';

class ChatPage extends ConsumerStatefulWidget {
  final String sessionId;

  const ChatPage({super.key, required this.sessionId});

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  bool _isLoading = false;
  bool _sessionLoaded = false;

  Future<void> _sendMessage(String content) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await ref.read(sendMessageProvider).send(widget.sessionId, content);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('发送失败: $e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _createNewChat() {
    ref.read(sessionsProvider.notifier).createSession().then((session) {
      if (mounted) {
        context.go('/chat/${session.id}');
      }
    });
  }

  @override
  void initState() {
    super.initState();
    // 初次加载会话在首帧后执行，避免构建期修改 provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadSession();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_sessionLoaded) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _loadSession();
      });
    }
  }

  void _loadSession() {
    if (!mounted) return;
    final sessions = ref.read(sessionsProvider).value ?? [];
    final session = sessions.where((s) => s.id == widget.sessionId).firstOrNull;
    if (session != null) {
      _sessionLoaded = true;
      ref.read(currentSessionProvider.notifier).setSession(session);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentSession = ref.watch(currentSessionProvider);
    final sessions = ref.watch(sessionsProvider).value ?? [];
    final sessionExists = sessions.any((s) => s.id == widget.sessionId);

    if (!sessionExists) {
      return Scaffold(
        appBar: AppBar(title: Text(Constants.appName)),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('会话不存在'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('返回主页'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(currentSession?.name ?? Constants.appName),
        actions: [
          IconButton(
            onPressed: _createNewChat,
            icon: const Icon(FluentIcons.chat_add_24_regular),
            tooltip: '新建对话',
          ),
        ],
      ),
      endDrawer: PlatformUtils.isMobile
          ? Drawer(
              child: SafeArea(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.add),
                      title: const Text('新建对话'),
                      onTap: () {
                        Navigator.pop(context);
                        _createNewChat();
                      },
                    ),
                    const Divider(),
                    const Expanded(child: Text('会话列表')),
                  ],
                ),
              ),
            )
          : null,
      body: Row(
        children: [
          if (PlatformUtils.isDesktop) const SideBar(),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: MessageList(
                    sessionId: widget.sessionId,
                    session: currentSession,
                  ),
                ),
                ChatInput(onSend: _sendMessage, isLoading: _isLoading),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    '内容由 AI 生成',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.outline,
                    ),
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
