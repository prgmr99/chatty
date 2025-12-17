// DOM 요소 선택
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const nicknameInput = document.getElementById('nickname-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const usersContainer = document.getElementById('users');
const userCountSpan = document.getElementById('user-count');
const loginError = document.getElementById('login-error');

// Room 관련 DOM 요소
const roomList = document.getElementById('room-list');
const createRoomBtn = document.getElementById('create-room-btn');
const createRoomModal = document.getElementById('create-room-modal');
const newRoomNameInput = document.getElementById('new-room-name');
const confirmCreateRoomBtn = document.getElementById('confirm-create-room');
const cancelCreateRoomBtn = document.getElementById('cancel-create-room');
const currentRoomName = document.getElementById('current-room-name');
const roomUserCount = document.getElementById('room-user-count');

// 상태 관리
let ws = null;
let currentUser = null;
let users = [];
let rooms = []; // Room 목록
let currentRoom = null; // 현재 room ID

// ===== Phase 2: WebSocket 연결 =====

// WebSocket 연결 초기화
function connectWebSocket() {
  // WebSocket 서버 URL (현재 페이지의 호스트 사용)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  console.log('🔌 WebSocket 연결 시도:', wsUrl);
  
  ws = new WebSocket(wsUrl);
  
  // 연결 성공
  ws.onopen = () => {
    console.log('✅ WebSocket 연결 성공');
  };
  
  // 메시지 수신
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📩 수신:', data);
      handleServerMessage(data);
    } catch (error) {
      console.error('❌ 메시지 파싱 에러:', error);
    }
  };
  
  // 연결 종료
  ws.onclose = () => {
    console.log('🔌 WebSocket 연결 종료');
    ws = null;
    
    // 채팅 화면이 표시 중이면 재연결 시도
    if (!chatScreen.classList.contains('hidden')) {
      addSystemMessage('연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
    }
  };
  
  // 에러 처리
  ws.onerror = (error) => {
    console.error('❌ WebSocket 에러:', error);
    showLoginError('서버 연결에 실패했습니다.');
  };
}

// 서버 메시지 처리
function handleServerMessage(data) {
  switch (data.type) {
    case 'joined':
      // 입장 성공
      handleJoinSuccess(data);
      break;
      
    case 'message':
      // 새 메시지
      handleNewMessage(data);
      break;
      
    case 'user-joined':
      // 새 사용자 입장
      handleUserJoined(data);
      break;
      
    case 'user-left':
      // 사용자 퇴장
      handleUserLeft(data);
      break;

    case 'room-list':
      // Room 목록 수신
      updateRoomList(data.rooms);
      break;

    case 'room-created':
      // 새 room 생성됨
      addSystemMessage(`New room "${data.room.name}" has been created`);
      requestRoomList(); // 목록 갱신
      break;

    case 'room-joined':
      // Room 입장 성공
      messagesContainer.innerHTML = ''; // 메시지 초기화
      updateUserList(data.users);
      // Room 정보는 서버에서 roomId로만 보내므로, 목록에서 찾아야 함
      const room = rooms.find(r => r.id === data.roomId);
      if (room) {
        updateCurrentRoomInfo(data.roomId, room.name, data.users.length);
        addSystemMessage(`Joined room: ${room.name}`);
      }
      break;

    case 'user-joined-room':
      // 다른 사용자가 room에 입장
      addSystemMessage(`${data.nickname} joined the room`);
      updateUserList(data.users);
      break;

    case 'user-left-room':
      //  다른 사용자가 room에서 퇴장
      addSystemMessage(`${data.nickname} left the room`);
      updateUserList(data.users);
      break;
      
    case 'error':
      // 에러
      handleServerError(data);
      break;
      
    default:
      console.warn('알 수 없는 메시지 타입:', data.type);
  }
}

// 입장 성공 처리
function handleJoinSuccess(data) {
  console.log('🎉 입장 성공:', data);
  currentUser = { id: data.userId, nickname: nicknameInput.value.trim() };
  
  // 화면 전환
  switchToChat();
  
  // Room 정보 설정
  if (data.rooms) {
    updateRoomList(data.rooms);
  }
  
  if (data.currentRoom) {
    const room = data.rooms ? data.rooms.find(r => r.id === data.currentRoom) : null;
    if (room) {
      updateCurrentRoomInfo(data.currentRoom, room.name, data.users.length);
    }
  }
  
  // 사용자 목록 업데이트
  updateUserList(data.users);
  
  // 환영 메시지
  addSystemMessage(`${currentUser.nickname}님, 환영합니다!`);
}

// 새 메시지 처리
function handleNewMessage(data) {
  const isOwn = currentUser && data.userId === currentUser.id;
  addMessage({
    nickname: data.nickname,
    content: data.content,
    timestamp: data.timestamp,
    isOwn
  });
}

// 새 사용자 입장 처리
function handleUserJoined(data) {
  addSystemMessage(`${data.nickname}님이 입장하셨습니다.`);
  updateUserList(data.users);
}

// 사용자 퇴장 처리
function handleUserLeft(data) {
  addSystemMessage(`${data.nickname}님이 퇴장하셨습니다.`);
  updateUserList(data.users);
}

// 서버 에러 처리
function handleServerError(data) {
  console.error('서버 에러:', data.message);
  showLoginError(data.message);
}

// WebSocket으로 메시지 전송
function sendToServer(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.error('WebSocket이 연결되지 않았습니다.');
    addSystemMessage('서버와 연결이 끊어졌습니다.');
  }
}

// ===== UI 이벤트 핸들러 =====

// 입장 버튼 클릭 이벤트
joinBtn.addEventListener('click', handleJoin);

// Enter 키로 입장
nicknameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleJoin();
  }
});

// 메시지 전송 버튼 클릭 이벤트
sendBtn.addEventListener('click', handleSendMessage);

// Enter 키로 메시지 전송
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSendMessage();
  }
});

// ===== 함수 정의 =====

// 입장 처리
function handleJoin() {
  const nickname = nicknameInput.value.trim();
  
  // 유효성 검사
  if (!nickname) {
    showLoginError('닉네임을 입력해주세요.');
    return;
  }
  
  if (nickname.length < 2) {
    showLoginError('닉네임은 최소 2글자 이상이어야 합니다.');
    return;
  }
  
  // 입장 버튼 비활성화
  joinBtn.disabled = true;
  joinBtn.textContent = '입장 중...';
  
  // 서버로 입장 요청
  console.log('📤 입장 요청:', nickname);
  sendToServer({
    type: 'join',
    nickname: nickname
  });
  
  // 3초 후 버튼 다시 활성화 (타임아웃)
  setTimeout(() => {
    joinBtn.disabled = false;
    joinBtn.textContent = '입장하기';
  }, 3000);
}

// 메시지 전송 처리
function handleSendMessage() {
  const content = messageInput.value.trim();
  
  if (!content) {
    return;
  }
  
  if (!currentUser) {
    console.error('로그인되지 않았습니다.');
    return;
  }
  
  // 서버로 메시지 전송
  console.log('📤 메시지 전송:', content);
  sendToServer({
    type: 'message',
    content: content
  });
  
  messageInput.value = '';
  messageInput.focus();
}

// ===== UI 업데이트 함수 =====

// 로그인 화면에서 채팅 화면으로 전환
function switchToChat() {
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

// 로그인 에러 표시
function showLoginError(message) {
  loginError.textContent = message;
  setTimeout(() => {
    loginError.textContent = '';
  }, 3000);
}

// 메시지 추가
function addMessage({ nickname, content, timestamp, isOwn = false }) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
  
  const time = new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="message-nickname">${nickname}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-content">${escapeHtml(content)}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// 시스템 메시지 추가
function addSystemMessage(content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system';
  
  messageDiv.innerHTML = `
    <div class="message-content">${escapeHtml(content)}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// 사용자 목록 업데이트
function updateUserList(userList) {
  users = userList;
  usersContainer.innerHTML = '';
  
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersContainer.appendChild(li);
  });
  
  userCountSpan.textContent = `접속자 (${users.length})`;
}

// 메시지 영역을 최하단으로 스크롤
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Phase 1: Room 기능 =====

// Room 목록 업데이트
function updateRoomList(roomsData) {
  rooms = roomsData;
  roomList.innerHTML = '';
  
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.dataset.roomId = room.id;
    
    // 현재 room이면 active 클래스 추가
    if (room.id === currentRoom) {
      li.classList.add('active');
    }
    
    li.innerHTML = `
      <div class="room-name">${escapeHtml(room.name)}</div>
      <div class="room-users">${room.userCount} users</div>
    `;
    
    // Room 클릭 시 입장
    li.addEventListener('click', () => {
      joinRoom(room.id);
    });
    
    roomList.appendChild(li);
  });
}

// Room 생성
function createRoom() {
  const roomName = newRoomNameInput.value.trim();
  
  if (!roomName) {
    alert('Please enter a room name');
    return;
  }
  
  if (roomName.length < 2 || roomName.length > 50) {
    alert('Room name must be between 2 and 50 characters');
    return;
  }
  
  sendToServer({
    type: 'create-room',
    roomName: roomName
  });
  
  // 모달 닫기
  closeCreateRoomModal();
}

// Room 입장
function joinRoom(roomId) {
  if (roomId === currentRoom) {
    return; // 이미 현재 room
  }
  
  sendToServer({
    type: 'join-room',
    roomId: roomId
  });
}

// Room 리스트 요청
function requestRoomList() {
  sendToServer({
    type: 'list-rooms'
  });
}

// Room 생성 모달 열기
function openCreateRoomModal() {
  createRoomModal.classList.remove('hidden');
  newRoomNameInput.value = '';
  newRoomNameInput.focus();
}

// Room 생성 모달 닫기
function closeCreateRoomModal() {
  createRoomModal.classList.add('hidden');
  newRoomNameInput.value = '';
}

// 현재 room 정보 업데이트
function updateCurrentRoomInfo(roomId, roomName, userCount) {
  currentRoom = roomId;
  currentRoomName.textContent = roomName || 'Unknown Room';
  roomUserCount.textContent = `${userCount} users`;
  
  // Room 목록에서 active 업데이트
  roomList.querySelectorAll('li').forEach(li => {
    if (li.dataset.roomId === roomId) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

// Room 이벤트 리스너
createRoomBtn.addEventListener('click', openCreateRoomModal);
confirmCreateRoomBtn.addEventListener('click', createRoom);
cancelCreateRoomBtn.addEventListener('click', closeCreateRoomModal);

// Enter 키로 room 생성
newRoomNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createRoom();
  }
});

// 모달 바깥 클릭 시 닫기
createRoomModal.addEventListener('click', (e) => {
  if (e.target === createRoomModal) {
    closeCreateRoomModal();
  }
});

// ===== 초기화 =====
console.log('✅ Simple Chat App 클라이언트 로딩 완료');
console.log('🔌 WebSocket 연결 시작...');

// 페이지 로드 시 WebSocket 연결
connectWebSocket();

