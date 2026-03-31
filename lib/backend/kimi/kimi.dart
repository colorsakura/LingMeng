import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kDebugMode;

class Kimi {
  late final Dio _dio;

  static const String _baseUrl = "https://kimi.com";

  static final Kimi _instance = Kimi._internal();

  factory Kimi() => _instance;

  Kimi._internal() {
    _initDio();
  }

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
          options.headers["Authorization"] =
              "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc3NjY4ODQ3MiwiaWF0IjoxNzc0MDk2NDcyLCJqdGkiOiJkNnY5MG0xdG9vbTJndXNmbm02ZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkMXZwOTM2bjNtazg0dDVvMWplMCIsInNwYWNlX2lkIjoiY3NzdWljZmQwcDgwaWhuNzVwMmciLCJhYnN0cmFjdF91c2VyX2lkIjoiY3NzdWljZmQwcDgwaWhuNzVwMjAiLCJzc2lkIjoiMTczMTM2MzU3Njg5NTI4NTU1NiIsImRldmljZV9pZCI6Ijc1Mzg4NDczMTYwMzIxMTM5MzQiLCJyZWdpb24iOiJjbiIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.igM4hchb97WlCxkyttZvVimDCW_6udCFCgU-bs_TRisSpW6K-v0OoRkvwxXFBdyjHn18e4crSDGKPd82zuVtoQ";
        },
      ),
    );

    _dio.interceptors.add(
      LogInterceptor(
        request: true,
        responseBody: true,
      )
    );
  }

  Future<String> getChats({int pageSize = 20}) async {
    final resp = await _dio.post(
      "https://www.kimi.com/apiv2/kimi.chat.v1.ChatService/ListChats",
      queryParameters: {"page_size": pageSize, "project_id": "", "query": ""},
    );

    print(resp.data);

    if (resp.statusCode == 200) {
      return "OK";
    }
    return "Bad";
  }
}
