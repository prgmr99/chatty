const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const RoomManager = require('./roomManager');

const app = express();
const PORT = process.env.PORT || 3001;

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, '../public')));

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// HTTP 서버 시작
const server = app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server });

// 연결된 클라이언트 관리
const clients = new Map(); // Map<WebSocket, { id: string, nickname: string, currentRoom: string }>
let clientIdCounter = 0;

// Room 관리자 초기화
const roomManager = new RoomManager();

console.log('📡 WebSocket 서버가 시작되었습니다.');

// 새로운 클라이언트 연결
wss.on('connection', (ws) => {
  const clientId = `client-${++clientIdCounter}`;
  console.log(`✅ 새로운 클라이언트 연결: ${clientId}`);
  
  // 클라이언트 정보 저장 (닉네임과 룸은 join 메시지에서 설정)
  clients.set(ws, { id: clientId, nickname: null, currentRoom: null });
  
  // 클라이언트로부터 메시지 수신
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📩 수신한 메시지:', message);
      
      handleMessage(ws, message);
    } catch (error) {
      console.error('❌ 메시지 파싱 에러:', error);
      sendToClient(ws, {
        type: 'error',
        message: '잘못된 메시지 형식입니다.'
      });
    }
  });
  
  // 클라이언트 연결 종료
  ws.on('close', () => {
    const client = clients.get(ws);
    if (client && client.nickname) {
      console.log(`👋 클라이언트 퇴장: ${client.nickname} (${client.id})`);
      
      // 현재 룸에서 제거 및 알림
      if (client.currentRoom) {
        roomManager.removeUser(client.currentRoom, ws);
        
        // 룸의 다른 사용자들에게 퇴장 알림 (삭제 전에 전송)
        roomManager.broadcastToRoom(client.currentRoom, {
          type: 'user-left',
          nickname: client.nickname,
          roomId: client.currentRoom,
          users: roomManager.getRoomUsers(client.currentRoom, clients)
        });
      }
      
      // 클라이언트 삭제
      clients.delete(ws);
    } else {
      // 닉네임이 없는 경우 (입장하지 않은 연결)
      clients.delete(ws);
    }
  });
  
  // 에러 처리
  ws.on('error', (error) => {
    console.error('❌ WebSocket 에러:', error);
  });
});

// 메시지 타입별 처리
function handleMessage(ws, message) {
  const client = clients.get(ws);
  
  switch (message.type) {
    case 'join':
      handleJoin(ws, message.nickname);
      break;
      
    case 'message':
      handleChatMessage(ws, message.content);
      break;

    case 'create-room':
      handleCreateRoom(ws, message.roomName);
      break;

    case 'join-room':
      handleJoinRoom(ws, message.roomId);
      break;

    case 'leave-room':
      handleLeaveRoom(ws, message.roomId);
      break;

    case 'list-rooms':
      handleListRooms(ws);
      break;
      
    case 'leave':
      handleLeave(ws);
      break;
      
    default:
      sendToClient(ws, {
        type: 'error',
        message: '알 수 없는 메시지 타입입니다.'
      });
  }
}

// 입장 처리
function handleJoin(ws, nickname) {
  if (!nickname || nickname.trim().length < 2) {
    sendToClient(ws, {
      type: 'error',
      message: '닉네임은 최소 2글자 이상이어야 합니다.'
    });
    return;
  }
  
  // 닉네임 중복 체크
  const existingNickname = Array.from(clients.values()).find(
    c => c.nickname === nickname.trim()
  );
  
  if (existingNickname) {
    sendToClient(ws, {
      type: 'error',
      message: '이미 사용 중인 닉네임입니다.'
    });
    return;
  }
  
  // 클라이언트 정보 업데이트
  const client = clients.get(ws);
  client.nickname = nickname.trim();
  
  // General 룸에 자동 입장
  const generalRoomId = roomManager.getGeneralRoomId();
  if (generalRoomId) {
    client.currentRoom = generalRoomId;
    roomManager.addUser(generalRoomId, ws);
  }
  
  console.log(`🎉 ${client.nickname} 님이 입장했습니다.`);
  
  // 입장한 클라이언트에게 성공 메시지 전송
  sendToClient(ws, {
    type: 'joined',
    userId: client.id,
    currentRoom: client.currentRoom,
    rooms: roomManager.getRoomList(),
    users: client.currentRoom ? roomManager.getRoomUsers(client.currentRoom, clients) : []
  });
  
  // 같은 룸의 다른 클라이언트들에게 입장 알림
  if (client.currentRoom) {
    roomManager.broadcastToRoom(client.currentRoom, {
      type: 'user-joined',
      nickname: client.nickname,
      roomId: client.currentRoom,
      users: roomManager.getRoomUsers(client.currentRoom, clients)
    }, ws);
  }
}

// 채팅 메시지 처리
function handleChatMessage(ws, content) {
  const client = clients.get(ws);
  
  if (!client || !client.nickname) {
    sendToClient(ws, {
      type: 'error',
      message: '먼저 입장해주세요.'
    });
    return;
  }

  if (!client.currentRoom) {
    sendToClient(ws, {
      type: 'error',
      message: '채팅방에 먼저 입장해주세요.'
    });
    return;
  }
  
  if (!content || content.trim().length === 0) {
    return;
  }
  
  console.log(`💬 [${client.currentRoom}] ${client.nickname}: ${content}`);
  
  // 현재 룸의 모든 클라이언트에게 메시지 브로드캐스트
  roomManager.broadcastToRoom(client.currentRoom, {
    type: 'message',
    userId: client.id,
    nickname: client.nickname,
    roomId: client.currentRoom,
    content: content.trim(),
    timestamp: new Date().toISOString()
  });
}

// 채팅방 생성 처리
function handleCreateRoom(ws, roomName) {
  const client = clients.get(ws);
  
  if (!client || !client.nickname) {
    sendToClient(ws, {
      type: 'error',
      message: '먼저 입장해주세요.'
    });
    return;
  }

  try {
    const room = roomManager.createRoom(roomName, client.id);
    
    // 모든 클라이언트에게 새 룸 알림
    broadcast({
      type: 'room-created',
      room: room
    });
    
    console.log(`✅ ${client.nickname}님이 "${room.name}" 룸을 생성했습니다.`);
  } catch (error) {
    sendToClient(ws, {
      type: 'error',
      message: error.message
    });
  }
}

// 채팅방 입장 처리
function handleJoinRoom(ws, roomId) {
  const client = clients.get(ws);
  
  if (!client || !client.nickname) {
    sendToClient(ws, {
      type: 'error',
      message: '먼저 입장해주세요.'
    });
    return;
  }

  if (!roomManager.hasRoom(roomId)) {
    sendToClient(ws, {
      type: 'error',
      message: '존재하지 않는 채팅방입니다.'
    });
    return;
  }

  try {
    // 이전 룸에서 나가기
    if (client.currentRoom) {
      const oldRoomUsers = roomManager.getRoomUsers(client.currentRoom, clients);
      roomManager.removeUser(client.currentRoom, ws);
      
      // 이전 룸의 사용자들에게 퇴장 알림
      roomManager.broadcastToRoom(client.currentRoom, {
        type: 'user-left-room',
        nickname: client.nickname,
        roomId: client.currentRoom,
        users: roomManager.getRoomUsers(client.currentRoom, clients)
      });
    }
    
    // 새 룸에 입장
    roomManager.addUser(roomId, ws);
    client.currentRoom = roomId;
    
    // 입장한 사용자에게 확인 메시지
    sendToClient(ws, {
      type: 'room-joined',
      roomId: roomId,
      users: roomManager.getRoomUsers(roomId, clients)
    });
    
    // 새 룸의 다른 사용자들에게 입장 알림
    roomManager.broadcastToRoom(roomId, {
      type: 'user-joined-room',
      nickname: client.nickname,
      roomId: roomId,
      users: roomManager.getRoomUsers(roomId, clients)
    }, ws);
    
    console.log(`🚪 ${client.nickname}님이 ${roomId} 룸에 입장했습니다.`);
  } catch (error) {
    sendToClient(ws, {
      type: 'error',
      message: error.message
    });
  }
}

// 채팅방 퇴장 처리 (특정 룸)
function handleLeaveRoom(ws, roomId) {
  const client = clients.get(ws);
  
  if (!client || !client.currentRoom) {
    return;
  }

  try {
    roomManager.removeUser(roomId, ws);
    
    // 룸의 다른 사용자들에게 퇴장 알림
    roomManager.broadcastToRoom(roomId, {
      type: 'user-left-room',
      nickname: client.nickname,
      roomId: roomId,
      users: roomManager.getRoomUsers(roomId, clients)
    });
    
    // General 룸으로 이동
    const generalRoomId = roomManager.getGeneralRoomId();
    if (generalRoomId && roomId !== generalRoomId) {
      client.currentRoom = generalRoomId;
      roomManager.addUser(generalRoomId, ws);
      
      sendToClient(ws, {
        type: 'room-joined',
        roomId: generalRoomId,
        users: roomManager.getRoomUsers(generalRoomId, clients)
      });
    } else {
      client.currentRoom = null;
    }
  } catch (error) {
    console.error('Leave room error:', error);
  }
}

// 채팅방 목록 조회
function handleListRooms(ws) {
  sendToClient(ws, {
    type: 'room-list',
    rooms: roomManager.getRoomList()
  });
}

// 퇴장 처리
function handleLeave(ws) {
  const client = clients.get(ws);
  
  if (client && client.nickname) {
    console.log(`👋 ${client.nickname} 님이 퇴장했습니다.`);
    
    // 현재 룸에서 제거
    if (client.currentRoom) {
      roomManager.removeUser(client.currentRoom, ws);
      
      roomManager.broadcastToRoom(client.currentRoom, {
        type: 'user-left',
        nickname: client.nickname,
        roomId: client.currentRoom,
        users: roomManager.getRoomUsers(client.currentRoom, clients)
      });
    }
  }
  
  ws.close();
}

// 특정 클라이언트에게 메시지 전송
function sendToClient(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// 모든 클라이언트에게 브로드캐스트 (excludeWs 제외)
function broadcast(data, excludeWs = null) {
  const message = JSON.stringify(data);
  
  clients.forEach((client, ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// 활성 사용자 목록 반환
function getActiveUsers() {
  return Array.from(clients.values())
    .filter(client => client.nickname)
    .map(client => client.nickname);
}

module.exports = { app, server, wss };

