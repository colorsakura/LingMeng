import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lingmeng/backend/backend_service.dart';
import 'package:lingmeng/backend/message_service.dart';
import 'package:lingmeng/backend/providers.dart';
import 'package:lingmeng/database/session_dao.dart';
import 'package:lingmeng/database/message_dao.dart';
import 'package:lingmeng/models/chat.dart';

/// 当前选中的 AI 后端
final currentBackendProvider =
    NotifierProvider<CurrentBackendNotifier, BackendProvider>(
      CurrentBackendNotifier.new,
    );

class CurrentBackendNotifier extends Notifier<BackendProvider> {
  @override
  BackendProvider build() {
    return BackendProvider.kimi;
  }

  void setBackend(BackendProvider backend) {
    state = backend;
  }
}

/// 会话列表
final sessionsProvider =
    AsyncNotifierProvider<SessionsNotifier, List<ChatSession>>(
      SessionsNotifier.new,
    );

class SessionsNotifier extends AsyncNotifier<List<ChatSession>> {
  final SessionDao _dao = SessionDao();
  final BackendService _backendService = BackendService();

  @override
  Future<List<ChatSession>> build() async {
    return _dao.getAll();
  }

  Future<ChatSession> createSession() async {
    final session = ChatSession(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: '新对话',
      backend: ref.read(currentBackendProvider),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    _dao.insert(session);
    state = AsyncValue.data([session, ...state.value ?? []]);
    return session;
  }

  Future<void> deleteSession(String id) async {
    _dao.delete(id);
    final dao = MessageDao();
    dao.deleteBySessionId(id);
    state = AsyncValue.data(
      (state.value ?? []).where((s) => s.id != id).toList(),
    );
  }

  Future<void> updateSession(ChatSession session) async {
    _dao.update(session);
    state = AsyncValue.data(
      (state.value ?? []).map((s) {
        return s.id == session.id ? session : s;
      }).toList(),
    );
  }

  void updateLastMessage(String sessionId, String message) {
    _dao.updateLastMessage(sessionId, message);
    state = AsyncValue.data(
      (state.value ?? []).map((s) {
        if (s.id == sessionId) {
          return s.copyWith(lastMessage: message, updatedAt: DateTime.now());
        }
        return s;
      }).toList(),
    );
  }

  void refresh() {
    state = AsyncValue.data(_dao.getAll());
  }

  /// 从远程同步会话
  Future<void> syncFromRemote() async {
    state = const AsyncValue.loading();

    try {
      // 获取所有远程会话
      final remoteSessions = await _backendService.fetchAllSessions();

      // 获取本地会话
      final localSessions = _dao.getAll();

      // 合并会话：远程会话优先，但保留本地会话
      final mergedSessions = <String, ChatSession>{};

      // 先添加远程会话
      for (final session in remoteSessions) {
        mergedSessions[session.id] = session;
        // 写入或更新数据库
        final existing = localSessions
            .where((s) => s.id == session.id)
            .firstOrNull;
        if (existing != null) {
          _dao.update(session);
        } else {
          _dao.insert(session);
        }
      }

      // 保留本地创建的会话（以数字开头的 ID）
      for (final session in localSessions) {
        if (!mergedSessions.containsKey(session.id) &&
            RegExp(r'^\d').hasMatch(session.id)) {
          mergedSessions[session.id] = session;
        }
      }

      // 排序并更新状态
      final sortedSessions = mergedSessions.values.toList()
        ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

      state = AsyncValue.data(sortedSessions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// 从指定后端同步会话
  Future<void> syncFromBackend(BackendProvider backend) async {
    try {
      final remoteSessions = await _backendService.fetchSessions(backend);
      final localSessions = _dao.getAll();

      for (final session in remoteSessions) {
        final merged = <String, ChatSession>{};
        merged[session.id] = session;
        final existing = localSessions
            .where((s) => s.id == session.id)
            .firstOrNull;
        if (existing != null) {
          _dao.update(session);
        } else {
          _dao.insert(session);
        }
      }

      // 重新加载所有会话
      final allSessions = _dao.getAll()
        ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
      state = AsyncValue.data(allSessions);
    } catch (e) {
      // 忽略错误
    }
  }
}

/// 当前选中的会话
final currentSessionProvider =
    NotifierProvider<CurrentSessionNotifier, ChatSession?>(
      CurrentSessionNotifier.new,
    );

class CurrentSessionNotifier extends Notifier<ChatSession?> {
  @override
  ChatSession? build() => null;

  void setSession(ChatSession? session) {
    state = session;
  }
}

/// 消息列表 - 使用 map 存储多个会话的消息
final messagesMapProvider =
    NotifierProvider<MessagesMapNotifier, Map<String, List<ChatMessage>>>(
      MessagesMapNotifier.new,
    );

class MessagesMapNotifier extends Notifier<Map<String, List<ChatMessage>>> {
  final MessageDao _dao = MessageDao();
  final MessageService _messageService = MessageService();

  @override
  Map<String, List<ChatMessage>> build() {
    return {};
  }

  List<ChatMessage> getMessages(String sessionId) {
    return state[sessionId] ?? [];
  }

  void loadMessages(String sessionId) {
    final messages = _dao.getBySessionId(sessionId);
    state = {...state, sessionId: messages};
  }

  /// 从远程加载会话消息
  Future<void> loadRemoteMessages(ChatSession session) async {
    // 先标记为加载中
    state = {...state, session.id: []};

    try {
      // 从 remote ID 中提取实际的 chat ID (格式: kimi_xxxxxx -> xxxxxx)
      final remoteId = session.id.contains('_')
          ? session.id.substring(session.id.indexOf('_') + 1)
          : session.id;

      final messages = await _messageService.fetchMessages(
        session.backend,
        remoteId,
        session.id,
      );

      // 保存到本地数据库
      for (final msg in messages) {
        _dao.insert(msg);
      }

      state = {...state, session.id: messages};
    } catch (e) {
      // 加载失败，保留空列表
      state = {...state, session.id: []};
      rethrow;
    }
  }

  void addMessage(String sessionId, ChatMessage message) {
    _dao.insert(message);
    final currentMessages = state[sessionId] ?? [];
    state = {
      ...state,
      sessionId: [...currentMessages, message],
    };
  }

  void refresh(String sessionId) {
    final messages = _dao.getBySessionId(sessionId);
    state = {...state, sessionId: messages};
  }
}

/// 发送消息
final sendMessageProvider = Provider((ref) {
  return SendMessageService(ref);
});

class SendMessageService {
  final Ref _ref;
  SendMessageService(this._ref);

  Future<ChatMessage> send(String sessionId, String content) async {
    final backend = _ref.read(currentBackendProvider);

    // 添加用户消息
    final userMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      sessionId: sessionId,
      role: 'user',
      content: content,
      createdAt: DateTime.now(),
    );
    _ref.read(messagesMapProvider.notifier).addMessage(sessionId, userMessage);

    // 更新会话最后消息
    _ref.read(sessionsProvider.notifier).updateLastMessage(sessionId, content);

    // TODO: 调用 AI 后端获取回复
    // 这里暂时返回模拟回复
    await Future.delayed(const Duration(seconds: 1));

    final assistantMessage = ChatMessage(
      id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
      sessionId: sessionId,
      role: 'assistant',
      content: '这是来自 ${backend.displayName} 的回复: $content',
      createdAt: DateTime.now(),
    );
    _ref
        .read(messagesMapProvider.notifier)
        .addMessage(sessionId, assistantMessage);

    // 更新会话最后消息
    _ref
        .read(sessionsProvider.notifier)
        .updateLastMessage(sessionId, assistantMessage.content);

    return assistantMessage;
  }
}
