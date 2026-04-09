import 'package:lingmeng/backend/deepseek/deepseek.dart';
import 'package:lingmeng/backend/doubao/doubao.dart';
import 'package:lingmeng/backend/kimi/kimi.dart';
import 'package:lingmeng/backend/providers.dart';
import 'package:lingmeng/backend/qianwen/qianwen.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:lingmeng/app/storage/token_storage.dart';

/// 统一的后端服务
class BackendService {
  /// 获取指定后端的会话列表
  Future<List<ChatSession>> fetchSessions(BackendProvider provider) async {
    final token = TokenStorage.getToken(provider);
    if (token == null || token.isEmpty) {
      return [];
    }

    switch (provider) {
      case BackendProvider.kimi:
        final kimi = Kimi();
        kimi.setAccessToken(token);
        final kimiChats = await kimi.getChats();
        return kimiChats.chats.map((chat) {
          return ChatSession(
            id: '${provider.name}_${chat.id}',
            name: chat.name,
            lastMessage: chat.messageContent,
            backend: provider,
            createdAt: _parseTime(chat.createTime),
            updatedAt: _parseTime(chat.updateTime),
          );
        }).toList();

      case BackendProvider.deepseek:
        final deepseek = DeepSeek();
        deepseek.setAccessToken(token);
        final chats = await deepseek.getChats();
        return chats.chats.map((chat) {
          return ChatSession(
            id: '${provider.name}_${chat.id}',
            name: chat.name,
            lastMessage: chat.messageContent,
            backend: provider,
            createdAt: _parseTime(chat.createTime),
            updatedAt: _parseTime(chat.updateTime),
          );
        }).toList();

      case BackendProvider.doubao:
        final doubao = Doubao();
        doubao.setAccessToken(token);
        final chats = await doubao.getChats();
        return chats.chats.map((chat) {
          return ChatSession(
            id: '${provider.name}_${chat.id}',
            name: chat.name,
            lastMessage: chat.messageContent,
            backend: provider,
            createdAt: _parseTime(chat.createTime),
            updatedAt: _parseTime(chat.updateTime),
          );
        }).toList();

      case BackendProvider.qianwen:
        final qianwen = Qianwen();
        qianwen.setAccessToken(token);
        final chats = await qianwen.getChats();
        return chats.chats.map((chat) {
          return ChatSession(
            id: '${provider.name}_${chat.id}',
            name: chat.name,
            lastMessage: chat.messageContent,
            backend: provider,
            createdAt: _parseTime(chat.createTime),
            updatedAt: _parseTime(chat.updateTime),
          );
        }).toList();
    }
  }

  /// 获取所有后端的会话列表
  Future<List<ChatSession>> fetchAllSessions() async {
    final allSessions = <ChatSession>[];

    for (final provider in BackendProvider.values) {
      try {
        final sessions = await fetchSessions(provider);
        allSessions.addAll(sessions);
      } catch (e) {
        // 忽略单个后端的错误，继续获取其他后端
        continue;
      }
    }

    // 按更新时间排序
    allSessions.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return allSessions;
  }

  DateTime _parseTime(String? timeStr) {
    if (timeStr == null || timeStr.isEmpty) {
      return DateTime.now();
    }
    try {
      // 尝试解析 ISO 8601 格式
      return DateTime.parse(timeStr);
    } catch (e) {
      return DateTime.now();
    }
  }
}
