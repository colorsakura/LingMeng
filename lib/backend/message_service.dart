import 'package:lingmeng/backend/kimi/kimi.dart';
import 'package:lingmeng/backend/providers.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:lingmeng/app/storage/token_storage.dart';

/// 消息获取服务
class MessageService {
  /// 从指定后端获取会话消息
  Future<List<ChatMessage>> fetchMessages(
    BackendProvider provider,
    String remoteChatId,
    String sessionId,
  ) async {
    final token = TokenStorage.getToken(provider);
    if (token == null || token.isEmpty) {
      throw Exception('${provider.displayName} 未配置 Token');
    }

    switch (provider) {
      case BackendProvider.kimi:
        final kimi = Kimi();
        kimi.setAccessToken(token);
        final detail = await kimi.getChatDetail(chatId: remoteChatId);
        // Kimi GetChat API 只返回会话概要，不包含消息列表
        // 将 messageContent 作为单条消息返回
        if (detail.messageContent.isNotEmpty) {
          return [
            ChatMessage(
              id: '${provider.name}_${detail.id}_msg',
              sessionId: sessionId,
              role: 'assistant',
              content: detail.messageContent,
              createdAt: _parseTime(detail.updateTime),
            ),
          ];
        }
        return [];

      case BackendProvider.deepseek:
      case BackendProvider.doubao:
      case BackendProvider.qianwen:
        // TODO: 实现其他后端的消息获取
        throw UnimplementedError('${provider.displayName} 消息获取暂未实现');
    }
  }

  DateTime _parseTime(String? timeStr) {
    if (timeStr == null || timeStr.isEmpty) {
      return DateTime.now();
    }
    try {
      return DateTime.parse(timeStr);
    } catch (e) {
      return DateTime.now();
    }
  }
}
