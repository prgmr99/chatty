/**
 * Message Model
 * SQLite 기반 메시지 저장 및 조회 모듈
 */

const Database = require('better-sqlite3');
const path = require('path');

class MessageModel {
  constructor(dbPath = path.join(__dirname, 'messages.db')) {
    this.db = new Database(dbPath);
    this.initializeDatabase();
    console.log('💾 메시지 데이터베이스 초기화 완료');
  }

  /**
   * 데이터베이스 테이블 초기화
   */
  initializeDatabase() {
    // messages 테이블 생성
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT NOT NULL,
        userId TEXT NOT NULL,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 성능 최적화를 위한 인덱스 생성
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_room_timestamp 
      ON messages(roomId, timestamp DESC)
    `);
  }

  /**
   * 메시지 저장
   * @param {string} roomId - 룸 ID
   * @param {string} userId - 사용자 ID
   * @param {string} nickname - 사용자 닉네임
   * @param {string} content - 메시지 내용
   * @param {string} timestamp - ISO 타임스탬프
   * @returns {Object} 저장된 메시지 정보
   */
  saveMessage(roomId, userId, nickname, content, timestamp) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO messages (roomId, userId, nickname, content, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(roomId, userId, nickname, content, timestamp);

      return {
        id: result.lastInsertRowid,
        roomId,
        userId,
        nickname,
        content,
        timestamp
      };
    } catch (error) {
      console.error('❌ 메시지 저장 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 룸의 메시지 조회 (페이지네이션)
   * @param {string} roomId - 룸 ID
   * @param {number} limit - 조회 개수 (기본: 50)
   * @param {number} offset - 오프셋 (기본: 0)
   * @returns {Array} 메시지 목록
   */
  getMessages(roomId, limit = 50, offset = 0) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, roomId, userId, nickname, content, timestamp
        FROM messages
        WHERE roomId = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      const messages = stmt.all(roomId, limit, offset);

      // 시간순 정렬 (오래된 것부터)
      return messages.reverse();
    } catch (error) {
      console.error('❌ 메시지 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 시각 이후의 메시지 조회 (오프라인 동기화용)
   * @param {string} roomId - 룸 ID
   * @param {string} since - ISO 타임스탬프
   * @returns {Array} 메시지 목록
   */
  getMessagesSince(roomId, since) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, roomId, userId, nickname, content, timestamp
        FROM messages
        WHERE roomId = ? AND timestamp > ?
        ORDER BY timestamp ASC
      `);

      return stmt.all(roomId, since);
    } catch (error) {
      console.error('❌ 메시지 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 룸의 총 메시지 개수 조회
   * @param {string} roomId - 룸 ID
   * @returns {number} 메시지 개수
   */
  getMessageCount(roomId) {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM messages
        WHERE roomId = ?
      `);

      const result = stmt.get(roomId);
      return result.count;
    } catch (error) {
      console.error('❌ 메시지 개수 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 연결 종료
   */
  close() {
    this.db.close();
    console.log('💾 데이터베이스 연결 종료');
  }
}

module.exports = MessageModel;
