import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' show ProviderScope;
import 'package:lingmeng/app/app.dart';
import 'package:mmkv/mmkv.dart' show MMKV;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  MMKV.initialize();

  runApp(const ProviderScope(child: App()));
}
