import 'package:dio/dio.dart';

import '../backend_base.dart';

/// Kimi 网页端 API 客户端（单例）。
///
/// API 文档：
/// - 会话列表: POST /apiv2/kimi.gateway.chat.v1.ChatService/ListChats
/// - 会话详情: POST /apiv2/kimi.gateway.chat.v1.ChatService/GetChat
class Kimi extends BackendBase {
  static const String _baseUrl = 'https://www.kimi.com';
  static const String _listChatsPath =
      '/apiv2/kimi.gateway.chat.v1.ChatService/ListChats';
  static const String _getChatPath =
      '/apiv2/kimi.gateway.chat.v1.ChatService/GetChat';

  static final Kimi _instance = Kimi._internal();

  @override
  final String name = 'Kimi';

  @override
  String get baseUrl => _baseUrl;

  String? _accessToken;

  /// 生产代码使用的单例入口。
  factory Kimi() => _instance;

  Kimi._internal();

  /// 测试注入构造：允许传入自定义 [Dio]。
  Kimi.test(Dio dio) : super.withDio(dio);

  @override
  String? get accessToken => _accessToken;

  @override
  void setAccessToken(String token) {
    _accessToken = token.trim();
  }

  /// 拉取会话分页数据。
  ///
  /// 参数与网页端协议字段保持一致：
  /// - [projectId] -> `project_id`
  /// - [pageSize] -> `page_size`
  /// - [pageToken] -> `page_token`
  /// - [query] -> `query`
  Future<KimiChatsPage> getChats({
    int pageSize = 20,
    String pageToken = '',
    String projectId = '',
    String query = '',
  }) async {
    if (pageSize <= 0) {
      throw ArgumentError.value(pageSize, 'pageSize', '必须大于 0');
    }

    return post(_listChatsPath, <String, dynamic>{
      'project_id': projectId,
      'page_size': pageSize,
      'page_token': pageToken,
      'query': query,
    }, KimiChatsPage.fromJson);
  }

  /// 发送消息并获取回复。
  ///
  /// [messages] - 对话历史消息
  /// [model] - 模型名称
  Future<LlmResponse> sendMessage({
    required List<LlmMessage> messages,
    String model = 'moonshot-v1-8k',
  }) async {
    // TODO: 实现实际的 Kimi 聊天 API 调用
    // 当前为占位实现
    throw UnimplementedError('Kimi sendMessage not implemented yet');
  }

  /// 获取会话详情（包含消息列表）。
  ///
  /// [chatId] - 会话 ID
  Future<KimiChatDetail> getChatDetail({required String chatId}) async {
    return post(_getChatPath, <String, dynamic>{
      'chat_id': chatId,
    }, KimiChatDetail.fromJson);
  }
}

/// Kimi LLM 消息格式。
class LlmMessage {
  final String role;
  final String content;

  const LlmMessage({required this.role, required this.content});

  Map<String, dynamic> toJson() => {'role': role, 'content': content};
}

/// Kimi LLM 响应。
class LlmResponse {
  final String content;
  final String? reasoning;

  const LlmResponse({required this.content, this.reasoning});
}

/// Kimi 会话分页结果。
class KimiChatsPage {
  final List<KimiChat> chats;
  final String nextPageToken;

  const KimiChatsPage({required this.chats, required this.nextPageToken});

  factory KimiChatsPage.fromJson(Map<String, dynamic> json) {
    final rawChats = json['chats'];
    if (rawChats is! List) {
      throw const FormatException('字段 chats 必须是数组');
    }

    final chats = rawChats
        .map((item) => KimiChat.fromJson(BackendBase.toStringKeyMap(item)))
        .toList(growable: false);

    final token = json['nextPageToken'];
    if (token != null && token is! String) {
      throw const FormatException('字段 nextPageToken 必须是字符串');
    }

    return KimiChatsPage(chats: chats, nextPageToken: token as String? ?? '');
  }
}

/// Kimi 单条会话概要。
class KimiChat {
  final String id;
  final String name;
  final String messageContent;
  final String? createTime;
  final String? updateTime;

  const KimiChat({
    required this.id,
    required this.name,
    required this.messageContent,
    this.createTime,
    this.updateTime,
  });

  factory KimiChat.fromJson(Map<String, dynamic> json) {
    return KimiChat(
      id: BackendBase.readRequiredString(json, 'id'),
      name: BackendBase.readRequiredString(json, 'name'),
      messageContent: BackendBase.readString(json, 'messageContent') ?? '',
      createTime: BackendBase.readString(json, 'createTime'),
      updateTime: BackendBase.readString(json, 'updateTime'),
    );
  }
}

/// Kimi 会话详情（包含消息列表）。
class KimiChatDetail {
  final String id;
  final String name;
  final String messageContent; // 最后一条消息的摘要
  final Map<String, dynamic>? lastRequest; // 最后请求对象
  final String? createTime;
  final String? updateTime;

  const KimiChatDetail({
    required this.id,
    required this.name,
    required this.messageContent,
    this.lastRequest,
    this.createTime,
    this.updateTime,
  });

  factory KimiChatDetail.fromJson(Map<String, dynamic> json) {
    // 响应格式是 { "chat": {...} }
    final chat = json['chat'] ?? json;

    Map<String, dynamic>? lastRequest;
    if (chat['lastRequest'] != null && chat['lastRequest'] is Map) {
      lastRequest = Map<String, dynamic>.from(chat['lastRequest']);
    }

    return KimiChatDetail(
      id: BackendBase.readRequiredString(chat, 'id'),
      name: BackendBase.readRequiredString(chat, 'name'),
      messageContent: BackendBase.readString(chat, 'messageContent') ?? '',
      lastRequest: lastRequest,
      createTime: BackendBase.readString(chat, 'createTime'),
      updateTime: BackendBase.readString(chat, 'updateTime'),
    );
  }
}
