import 'package:mmkv/mmkv.dart';
import 'package:lingmeng/backend/providers.dart';

class TokenStorage {
  static const String _keyPrefix = 'token_';

  static String _key(BackendProvider provider) => '$_keyPrefix${provider.name}';

  static String? getToken(BackendProvider provider) {
    return MMKV.defaultMMKV().decodeString(_key(provider));
  }

  static void setToken(BackendProvider provider, String token) {
    MMKV.defaultMMKV().encodeString(_key(provider), token);
  }

  static void clearToken(BackendProvider provider) {
    MMKV.defaultMMKV().removeValue(_key(provider));
  }

  static bool hasToken(BackendProvider provider) {
    final token = getToken(provider);
    return token != null && token.isNotEmpty;
  }

  static Map<BackendProvider, String?> getAllTokens() {
    final result = <BackendProvider, String?>{};
    for (final provider in BackendProvider.values) {
      result[provider] = getToken(provider);
    }
    return result;
  }
}
