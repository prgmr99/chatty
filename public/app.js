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

// 상태 관리
let ws = null; // WebSocket 연결 (Phase 2에서 구현)
let currentUser = null;
let users = [];

// ===== Phase 1: 기본 UI 이벤트 핸들러 =====

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

// 입장 처리 (Phase 2에서 WebSocket 연결 추가 예정)
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
  
  // Phase 2에서 WebSocket 연결을 추가할 예정
  console.log('입장 시도:', nickname);
  
  // 임시로 화면 전환만 테스트 (Phase 2에서 제거)
  currentUser = { nickname };
  switchToChat();
  addSystemMessage(`${nickname}님이 입장하셨습니다.`);
}

// 메시지 전송 처리 (Phase 2에서 WebSocket 전송 추가 예정)
function handleSendMessage() {
  const content = messageInput.value.trim();
  
  if (!content) {
    return;
  }
  
  // Phase 3에서 WebSocket으로 메시지 전송 구현 예정
  console.log('메시지 전송:', content);
  
  // 임시로 로컬에만 메시지 표시 (Phase 3에서 제거)
  addMessage({
    nickname: currentUser.nickname,
    content,
    timestamp: new Date().toISOString(),
    isOwn: true
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

// ===== 초기화 =====
console.log('✅ Simple Chat App 클라이언트 로딩 완료');
console.log('Phase 1: 기본 UI 구현 완료');
console.log('다음 단계: Phase 2에서 WebSocket 연결을 추가할 예정입니다.');
