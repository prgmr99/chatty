/**
 * Room Manager
 * 채팅방 생성, 삭제, 사용자 관리를 담당하는 모듈
 */

class RoomManager {
  constructor() {
    // Map<roomId, RoomInfo>
    this.rooms = new Map();
    this.roomIdCounter = 0;
    
    // 기본 "General" 룸 생성
    this.createRoom('General', 'system');
  }

  /**
   * 새로운 채팅방 생성
   * @param {string} name - 룸 이름
   * @param {string} createdBy - 생성자 ID
   * @returns {Object} 생성된 룸 정보
   */
  createRoom(name, createdBy) {
    // 룸 이름 검증
    if (!name || name.trim().length < 2) {
      throw new Error('Room name must be at least 2 characters');
    }

    if (name.trim().length > 50) {
      throw new Error('Room name must be at most 50 characters');
    }

    const roomId = `room-${++this.roomIdCounter}`;
    const room = {
      id: roomId,
      name: name.trim(),
      createdBy,
      createdAt: new Date().toISOString(),
      users: new Set() // Set<WebSocket>
    };

    this.rooms.set(roomId, room);
    console.log(`🏠 새 채팅방 생성: ${room.name} (${roomId})`);
    
    return {
      id: room.id,
      name: room.name,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      userCount: 0
    };
  }

  /**
   * 채팅방 삭제
   * @param {string} roomId - 룸 ID
   * @param {string} userId - 삭제 요청자 ID
   * @returns {boolean} 삭제 성공 여부
   */
  deleteRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }

    // General 룸은 삭제 불가
    if (room.name === 'General') {
      throw new Error('Cannot delete General room');
    }

    // 생성자만 삭제 가능
    if (room.createdBy !== userId && userId !== 'system') {
      throw new Error('Only room creator can delete the room');
    }

    // 모든 사용자에게 알림 (호출자가 처리)
    this.rooms.delete(roomId);
    console.log(`🗑️  채팅방 삭제: ${room.name} (${roomId})`);
    
    return true;
  }

  /**
   * 사용자를 채팅방에 추가
   * @param {string} roomId - 룸 ID
   * @param {WebSocket} ws - WebSocket 연결
   */
  addUser(roomId, ws) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }

    room.users.add(ws);
    console.log(`👤 사용자가 ${room.name}에 입장 (현재 ${room.users.size}명)`);
  }

  /**
   * 사용자를 채팅방에서 제거
   * @param {string} roomId - 룸 ID
   * @param {WebSocket} ws - WebSocket 연결
   */
  removeUser(roomId, ws) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return;
    }

    room.users.delete(ws);
    console.log(`👤 사용자가 ${room.name}에서 퇴장 (현재 ${room.users.size}명)`);
  }

  /**
   * 사용자를 모든 채팅방에서 제거
   * @param {WebSocket} ws - WebSocket 연결
   */
  removeUserFromAllRooms(ws) {
    this.rooms.forEach((room, roomId) => {
      if (room.users.has(ws)) {
        this.removeUser(roomId, ws);
      }
    });
  }

  /**
   * 특정 룸의 모든 사용자에게 메시지 브로드캐스트
   * @param {string} roomId - 룸 ID
   * @param {Object} data - 전송할 데이터
   * @param {WebSocket} excludeWs - 제외할 WebSocket (선택)
   */
  broadcastToRoom(roomId, data, excludeWs = null) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return;
    }

    const message = JSON.stringify(data);
    
    room.users.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === 1) { // 1 = OPEN
        ws.send(message);
      }
    });
  }

  /**
   * 채팅방 목록 조회
   * @returns {Array} 룸 목록
   */
  getRoomList() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      userCount: room.users.size
    }));
  }

  /**
   * 특정 룸의 사용자 목록 조회
   * @param {string} roomId - 룸 ID
   * @param {Map} clients - 클라이언트 정보 Map
   * @returns {Array} 사용자 닉네임 목록
   */
  getRoomUsers(roomId, clients) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return [];
    }

    const users = [];
    room.users.forEach((ws) => {
      const client = clients.get(ws);
      if (client && client.nickname) {
        users.push(client.nickname);
      }
    });
    
    return users;
  }

  /**
   * 룸이 존재하는지 확인
   * @param {string} roomId - 룸 ID
   * @returns {boolean}
   */
  hasRoom(roomId) {
    return this.rooms.has(roomId);
  }

  /**
   * General 룸 ID 조회
   * @returns {string} General 룸 ID
   */
  getGeneralRoomId() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.name === 'General') {
        return roomId;
      }
    }
    return null;
  }
}

module.exports = RoomManager;
