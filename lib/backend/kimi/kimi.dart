import 'package:dio/dio.dart';

/// Kimi Web API 的轻量客户端（单例）。
///
/// 主要能力：
/// 1. 初始化带默认 Header 的 `Dio` 实例。
/// 2. 在请求拦截器中注入 `Authorization`。
/// 3. 调用 ListChats 接口获取会话列表。
///
/// 注意：
/// 1. 该实现当前使用硬编码 Token，仅适用于本地调试。
/// 2. 生产环境请改为安全存储并动态刷新 Token。
class Kimi {
  late final Dio _dio;

  /// Kimi Web 站点基础地址。
  static const String _baseUrl = "https://kimi.com";

  /// 单例实例。
  static final Kimi _instance = Kimi._internal();

  /// 获取全局唯一实例。
  factory Kimi() => _instance;

  /// 私有构造：仅在首次访问时执行一次初始化。
  Kimi._internal() {
    _initDio();
  }

  /// 初始化 `Dio` 客户端及拦截器。
  ///
  /// Header 中的 `Origin`/`Referer` 用于模拟浏览器请求上下文。
  void _initDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          'Origin': 'https://www.kimi.com',
          'Referer': 'https://www.kimi.com',
          "User-Agent": "",
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // TODO: 从安全存储读取并按需刷新 Token，避免硬编码。
          options.headers["Authorization"] =
              "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc3NjY4ODQ3MiwiaWF0IjoxNzc0MDk2NDcyLCJqdGkiOiJkNnY5MG0xdG9vbTJndXNmbm02ZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkMXZwOTM2bjNtazg0dDVvMWplMCIsInNwYWNlX2lkIjoiY3NzdWljZmQwcDgwaWhuNzVwMmciLCJhYnN0cmFjdF91c2VyX2lkIjoiY3NzdWljZmQwcDgwaWhuNzVwMjAiLCJzc2lkIjoiMTczMTM2MzU3Njg5NTI4NTU1NiIsImRldmljZV9pZCI6Ijc1Mzg4NDczMTYwMzIxMTM5MzQiLCJyZWdpb24iOiJjbiIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.igM4hchb97WlCxkyttZvVimDCW_6udCFCgU-bs_TRisSpW6K-v0OoRkvwxXFBdyjHn18e4crSDGKPd82zuVtoQ";
          handler.next(options);
        },
      ),
    );

    _dio.interceptors.add(LogInterceptor(request: true, responseBody: true));
  }

  /// 拉取会话列表。
  ///
  /// [pageSize] 控制每页会话数量，默认 20。
  ///
  /// 返回：
  /// 1. 请求成功（HTTP 200）时返回 `"OK"`。
  ///
  /// 异常：
  /// 1. 非 200 状态码时抛出 [DioException]。
  Future<String> getChats({int pageSize = 20}) async {
    final resp = await _dio.post(
      "https://www.kimi.com/apiv2/kimi.chat.v1.ChatService/ListChats",
      queryParameters: {"page_size": pageSize, "project_id": "", "query": ""},
    );

    print(resp.data);

    if (resp.statusCode == 200) {
      return "OK";
    }

    throw DioException.badResponse(
      statusCode: resp.statusCode ?? -1,
      requestOptions: resp.requestOptions,
      response: resp,
    );
  }
}
