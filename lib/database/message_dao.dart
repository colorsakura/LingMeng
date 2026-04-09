import 'package:lingmeng/database/database.dart';
import 'package:lingmeng/database/tables.dart';
import 'package:lingmeng/models/chat.dart';
import 'package:sqlite3/sqlite3.dart';

class MessageDao {
  final AppDatabase _db = AppDatabase.instance;

  List<ChatMessage> getBySessionId(String sessionId) {
    final results = _db.select(
      '''
      SELECT * FROM ${Tables.messages}
      WHERE session_id = ?
      ORDER BY created_at ASC
    ''',
      [sessionId],
    );

    return results.map((Row row) => _rowToMessage(row)).toList();
  }

  ChatMessage _rowToMessage(Row row) {
    return ChatMessage.fromMap({
      'id': row[0],
      'session_id': row[1],
      'role': row[2],
      'content': row[3],
      'created_at': row[4],
    });
  }

  void insert(ChatMessage message) {
    _db.insert(
      '''
      INSERT INTO ${Tables.messages} (id, session_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    ''',
      [
        message.id,
        message.sessionId,
        message.role,
        message.content,
        message.createdAt.millisecondsSinceEpoch,
      ],
    );
  }

  void delete(String id) {
    _db.delete(
      '''
      DELETE FROM ${Tables.messages} WHERE id = ?
    ''',
      [id],
    );
  }

  void deleteBySessionId(String sessionId) {
    _db.delete(
      '''
      DELETE FROM ${Tables.messages} WHERE session_id = ?
    ''',
      [sessionId],
    );
  }
}
