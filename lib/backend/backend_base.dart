import 'package:dio/dio.dart';

/// 后端 API 异常。
class BackendException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic responseData;
  final Object? cause;

  const BackendException(
    this.message, {
    this.statusCode,
    this.responseData,
    this.cause,
  });

  @override
  String toString() {
    final code = statusCode == null ? '' : ' statusCode=$statusCode';
    return 'BackendException($message$code)';
  }
}

/// 后端 API 客户端抽象基类。
///
/// 子类需要实现 [name]、[baseUrl] 和 [createDio]，并定义各自的业务方法。
abstract class BackendBase {
  /// 子类实现：后端名称（如 'Kimi', 'DeepSeek'）。
  String get name;

  /// 子类实现：API 基础 URL。
  String get baseUrl;

  late final Dio _dio;

  BackendBase() {
    _dio = createDio();
    _installInterceptors();
  }

  /// 测试注入构造：允许传入自定义 [Dio]。
  BackendBase.withDio(Dio dio) : _dio = dio {
    _installInterceptors();
  }

  /// 子类实现：创建 Dio 实例。
  Dio createDio() {
    return Dio(
      BaseOptions(
        baseUrl: baseUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': baseUrl,
          'Referer': '$baseUrl/',
          'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
              '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        responseType: ResponseType.json,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 20),
      ),
    );
  }

  void _installInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  /// 子类覆盖：返回当前 access token。
  String? get accessToken;

  /// 子类覆盖：设置 access token。
  void setAccessToken(String token);

  /// 通用 POST 请求。
  ///
  /// [path] - API 路径
  /// [data] - 请求体数据
  /// [fromJson] - 响应 JSON 解析函数
  Future<T> post<T>(
    String path,
    Map<String, dynamic> data,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    try {
      final response = await _dio.post<dynamic>(path, data: data);

      if (response.statusCode != 200) {
        throw BackendException(
          '$name API 返回非 200 状态',
          statusCode: response.statusCode,
          responseData: response.data,
        );
      }

      final json = requireMap(response.data);
      return fromJson(json);
    } on DioException catch (error) {
      throw BackendException(
        '请求 $name API 失败',
        statusCode: error.response?.statusCode,
        responseData: error.response?.data,
        cause: error,
      );
    }
  }

  /// 校验响应数据是否为有效的 JSON 对象。
  static Map<String, dynamic> requireMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }
    if (value is Map) {
      return value.map((key, val) => MapEntry(key.toString(), val));
    }
    throw const FormatException('响应体不是有效的 JSON 对象');
  }

  /// 校验 JSON 元素是否为有效的 Map。
  static Map<String, dynamic> toStringKeyMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }
    if (value is Map) {
      return value.map((key, val) => MapEntry(key.toString(), val));
    }
    throw const FormatException('字段的元素必须是对象');
  }

  /// 读取必需的非空字符串字段。
  static String readRequiredString(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is String && value.isNotEmpty) {
      return value;
    }
    throw FormatException('字段 $key 必须是非空字符串');
  }

  /// 读取可选字符串字段。
  static String? readString(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value == null) {
      return null;
    }
    if (value is String) {
      return value;
    }
    throw FormatException('字段 $key 必须是字符串');
  }
}
