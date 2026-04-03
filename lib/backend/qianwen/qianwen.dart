import 'package:dio/dio.dart';

import '../backend_base.dart';

/// Qianwen (千问) 网页端 API 客户端（单例）。
///
/// 当前实现重点模拟网页端会话列表接口：
/// `/api/chat/sessions`。
class Qianwen extends BackendBase {
  static const String _baseUrl = 'https://qianwen.aliyun.com';
  static const String _listChatsPath = '/api/chat/sessions';

  static final Qianwen _instance = Qianwen._internal();

  @override
  final String name = 'Qianwen';

  @override
  String get baseUrl => _baseUrl;

  String? _accessToken;

  /// 生产代码使用的单例入口。
  factory Qianwen() => _instance;

  Qianwen._internal();

  /// 测试注入构造：允许传入自定义 [Dio]。
  Qianwen.test(Dio dio) : super.withDio(dio);

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
  Future<QianwenChatsPage> getChats({
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
      QianwenChatsPage.fromJson,
    );
  }
}

/// Qianwen 会话分页结果。
class QianwenChatsPage {
  final List<QianwenChat> chats;
  final String nextPageToken;

  const QianwenChatsPage({required this.chats, required this.nextPageToken});

  factory QianwenChatsPage.fromJson(Map<String, dynamic> json) {
    final rawChats = json['chats'];
    if (rawChats is! List) {
      throw const FormatException('字段 chats 必须是数组');
    }

    final chats = rawChats
        .map((item) => QianwenChat.fromJson(BackendBase.toStringKeyMap(item)))
        .toList(growable: false);

    final token = json['nextPageToken'];
    if (token != null && token is! String) {
      throw const FormatException('字段 nextPageToken 必须是字符串');
    }

    return QianwenChatsPage(chats: chats, nextPageToken: token as String? ?? '');
  }
}

/// Qianwen 单条会话概要。
class QianwenChat {
  final String id;
  final String name;
  final String messageContent;
  final String? createTime;
  final String? updateTime;

  const QianwenChat({
    required this.id,
    required this.name,
    required this.messageContent,
    this.createTime,
    this.updateTime,
  });

  factory QianwenChat.fromJson(Map<String, dynamic> json) {
    return QianwenChat(
      id: BackendBase.readRequiredString(json, 'id'),
      name: BackendBase.readRequiredString(json, 'name'),
      messageContent: BackendBase.readString(json, 'messageContent') ?? '',
      createTime: BackendBase.readString(json, 'createTime'),
      updateTime: BackendBase.readString(json, 'updateTime'),
    );
  }
}
