import 'package:dio/dio.dart';

import '../backend_base.dart';

/// DeepSeek 网页端 API 客户端（单例）。
///
/// 当前实现重点模拟网页端会话列表接口：
/// `/chat/sessions`。
class DeepSeek extends BackendBase {
  static const String _baseUrl = 'https://api.deepseek.com';
  static const String _listChatsPath = '/chat/sessions';

  static final DeepSeek _instance = DeepSeek._internal();

  @override
  final String name = 'DeepSeek';

  @override
  String get baseUrl => _baseUrl;

  String? _accessToken;

  /// 生产代码使用的单例入口。
  factory DeepSeek() => _instance;

  DeepSeek._internal();

  /// 测试注入构造：允许传入自定义 [Dio]。
  DeepSeek.test(Dio dio) : super.withDio(dio);

  @override
  String? get accessToken => _accessToken;

  @override
  void setAccessToken(String token) {
    _accessToken = token.trim();
  }

  /// 拉取会话分页数据。
  ///
  /// 参数与网页端协议字段保持一致：
  /// - [pageSize] -> `page_size`
  /// - [pageToken] -> `page_token`
  /// - [query] -> `query`
  Future<DeepSeekChatsPage> getChats({
    int pageSize = 20,
    String pageToken = '',
    String query = '',
  }) async {
    if (pageSize <= 0) {
      throw ArgumentError.value(pageSize, 'pageSize', '必须大于 0');
    }

    return post(
      _listChatsPath,
      <String, dynamic>{
        'page_size': pageSize,
        'page_token': pageToken,
        'query': query,
      },
      DeepSeekChatsPage.fromJson,
    );
  }
}

/// DeepSeek 会话分页结果。
class DeepSeekChatsPage {
  final List<DeepSeekChat> chats;
  final String nextPageToken;

  const DeepSeekChatsPage({required this.chats, required this.nextPageToken});

  factory DeepSeekChatsPage.fromJson(Map<String, dynamic> json) {
    final rawChats = json['chats'];
    if (rawChats is! List) {
      throw const FormatException('字段 chats 必须是数组');
    }

    final chats = rawChats
        .map((item) => DeepSeekChat.fromJson(BackendBase.toStringKeyMap(item)))
        .toList(growable: false);

    final token = json['nextPageToken'];
    if (token != null && token is! String) {
      throw const FormatException('字段 nextPageToken 必须是字符串');
    }

    return DeepSeekChatsPage(chats: chats, nextPageToken: token as String? ?? '');
  }
}

/// DeepSeek 单条会话概要。
class DeepSeekChat {
  final String id;
  final String name;
  final String messageContent;
  final String? createTime;
  final String? updateTime;

  const DeepSeekChat({
    required this.id,
    required this.name,
    required this.messageContent,
    this.createTime,
    this.updateTime,
  });

  factory DeepSeekChat.fromJson(Map<String, dynamic> json) {
    return DeepSeekChat(
      id: BackendBase.readRequiredString(json, 'id'),
      name: BackendBase.readRequiredString(json, 'name'),
      messageContent: BackendBase.readString(json, 'messageContent') ?? '',
      createTime: BackendBase.readString(json, 'createTime'),
      updateTime: BackendBase.readString(json, 'updateTime'),
    );
  }
}
