import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart';

import 'tables.dart';

class AppDatabase {
  static AppDatabase? _instance;
  late final Database _db;

  AppDatabase._() {
    _db = sqlite3.open(_dbPath);
    _runMigrations();
  }

  static AppDatabase get instance {
    _instance ??= AppDatabase._();
    return _instance!;
  }

  static String get _dbPath {
    final dir = _appDocDir.path;
    return p.join(dir, 'lingmeng.db');
  }

  static Directory get _appDocDir {
    // 桌面端使用当前目录
    if (Platform.isLinux || Platform.isMacOS || Platform.isWindows) {
      return Directory.current;
    }
    // 移动端使用应用文档目录
    throw UnimplementedError('Mobile not supported yet');
  }

  void _runMigrations() {
    _db.execute('''
      CREATE TABLE IF NOT EXISTS ${Tables.sessions} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        last_message TEXT,
        backend TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    ''');

    _db.execute('''
      CREATE TABLE IF NOT EXISTS ${Tables.messages} (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES ${Tables.sessions}(id) ON DELETE CASCADE
      );
    ''');

    _db.execute('''
      CREATE INDEX IF NOT EXISTS idx_messages_session_id ON ${Tables.messages}(session_id);
    ''');
  }

  ResultSet select(String sql, [List<Object?> parameters = const []]) {
    return _db.select(sql, parameters);
  }

  void insert(String sql, [List<Object?> parameters = const []]) {
    _db.execute(sql, parameters);
  }

  void update(String sql, [List<Object?> parameters = const []]) {
    _db.execute(sql, parameters);
  }

  void delete(String sql, [List<Object?> parameters = const []]) {
    _db.execute(sql, parameters);
  }
}
