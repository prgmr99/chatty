const express = require('express');
const path = require('path');
const WebSocket = require('ws');

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
const clients = new Map(); // Map<WebSocket, { id: string, nickname: string }>
let clientIdCounter = 0;

console.log('📡 WebSocket 서버가 시작되었습니다.');

// 새로운 클라이언트 연결
wss.on('connection', (ws) => {
  const clientId = `client-${++clientIdCounter}`;
  console.log(`✅ 새로운 클라이언트 연결: ${clientId}`);
  
  // 클라이언트 정보 저장 (닉네임은 join 메시지에서 설정)
  clients.set(ws, { id: clientId, nickname: null });
  
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
      
      // 클라이언트 삭제 (먼저 삭제해야 정확한 사용자 목록 전송)
      clients.delete(ws);
      
      // 다른 클라이언트들에게 퇴장 알림 (삭제 후 사용자 목록)
      broadcast({
        type: 'user-left',
        nickname: client.nickname,
        users: getActiveUsers()
      });
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
  
  console.log(`🎉 ${client.nickname} 님이 입장했습니다.`);
  
  // 입장한 클라이언트에게 성공 메시지 전송
  sendToClient(ws, {
    type: 'joined',
    userId: client.id,
    users: getActiveUsers()
  });
  
  // 다른 클라이언트들에게 입장 알림
  broadcast({
    type: 'user-joined',
    nickname: client.nickname,
    users: getActiveUsers()
  }, ws);
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
  
  if (!content || content.trim().length === 0) {
    return;
  }
  
  console.log(`💬 ${client.nickname}: ${content}`);
  
  // 모든 클라이언트에게 메시지 브로드캐스트
  broadcast({
    type: 'message',
    userId: client.id,
    nickname: client.nickname,
    content: content.trim(),
    timestamp: new Date().toISOString()
  });
}

// 퇴장 처리
function handleLeave(ws) {
  const client = clients.get(ws);
  
  if (client && client.nickname) {
    console.log(`👋 ${client.nickname} 님이 퇴장했습니다.`);
    
    broadcast({
      type: 'user-left',
      nickname: client.nickname,
      users: getActiveUsers()
    }, ws);
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

