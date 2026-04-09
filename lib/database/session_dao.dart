import 'package:lingmeng/database/database.dart';
import 'package:lingmeng/database/tables.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:sqlite3/sqlite3.dart';

class SessionDao {
  final AppDatabase _db = AppDatabase.instance;

  List<ChatSession> getAll() {
    final results = _db.select('''
      SELECT * FROM ${Tables.sessions}
      ORDER BY updated_at DESC
    ''');

    return results.map((Row row) => _rowToSession(row)).toList();
  }

  ChatSession? getById(String id) {
    final results = _db.select(
      '''
      SELECT * FROM ${Tables.sessions} WHERE id = ?
    ''',
      [id],
    );

    if (results.isEmpty) return null;
    return _rowToSession(results.first);
  }

  ChatSession _rowToSession(Row row) {
    return ChatSession.fromMap({
      'id': row[0],
      'name': row[1],
      'last_message': row[2],
      'backend': row[3],
      'created_at': row[4],
      'updated_at': row[5],
    });
  }

  void insert(ChatSession session) {
    _db.insert(
      '''
      INSERT INTO ${Tables.sessions} (id, name, last_message, backend, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    ''',
      [
        session.id,
        session.name,
        session.lastMessage,
        session.backend.name,
        session.createdAt.millisecondsSinceEpoch,
        session.updatedAt.millisecondsSinceEpoch,
      ],
    );
  }

  void update(ChatSession session) {
    _db.update(
      '''
      UPDATE ${Tables.sessions}
      SET name = ?, last_message = ?, backend = ?, updated_at = ?
      WHERE id = ?
    ''',
      [
        session.name,
        session.lastMessage,
        session.backend.name,
        session.updatedAt.millisecondsSinceEpoch,
        session.id,
      ],
    );
  }

  void delete(String id) {
    _db.delete(
      '''
      DELETE FROM ${Tables.sessions} WHERE id = ?
    ''',
      [id],
    );
  }

  void updateLastMessage(String sessionId, String lastMessage) {
    _db.update(
      '''
      UPDATE ${Tables.sessions}
      SET last_message = ?, updated_at = ?
      WHERE id = ?
    ''',
      [lastMessage, DateTime.now().millisecondsSinceEpoch, sessionId],
    );
  }
}
