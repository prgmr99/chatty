---
trigger: always_on
---

# Code Style Guide

이 문서는 Simple Chat 프로젝트에서 사용하는 코드 스타일 가이드입니다. AI agent가 일관된 스타일의 코드를 작성할 수 있도록 합니다.

## 📦 패키지 관리

### pnpm 사용 필수

이 프로젝트는 **pnpm**을 패키지 매니저로 사용합니다. npm 대신 항상 pnpm을 사용하세요.

```bash
# ✅ 올바른 예
pnpm install
pnpm add express
pnpm run dev

# ❌ 잘못된 예
npm install
npm install express
npm run dev
```

**이유:**
- 디스크 공간 절약 (심볼릭 링크 사용)
- 빠른 설치 속도
- 엄격한 의존성 관리

## 🎨 JavaScript 스타일

### 1. 들여쓰기 및 공백

- **들여쓰기**: 2칸 스페이스 사용
- **세미콜론**: 항상 사용
- **따옴표**: 작은따옴표(`'`) 사용 (문자열 내 변수가 있을 때는 백틱 사용)

```javascript
// ✅ 올바른 예
const app = express();
const message = 'Hello';
const greeting = `안녕하세요, ${name}님!`;

// ❌ 잘못된 예
const app=express()
const message = "Hello"
const greeting = '안녕하세요, '+name+'님!'
```

### 2. 변수 선언

- `const`를 기본으로 사용
- 재할당이 필요한 경우에만 `let` 사용
- `var`는 사용하지 않음

```javascript
// ✅ 올바른 예
const PORT = 3000;
let counter = 0;

// ❌ 잘못된 예
var port = 3000;
let PORT = 3000; // 상수인데 let 사용
```

### 3. 함수 선언

- 일반 함수는 `function` 키워드 사용
- 콜백 함수는 화살표 함수 사용
- 함수 이름은 camelCase 사용

```javascript
// ✅ 올바른 예
function handleMessage(ws, message) {
  // ...
}

ws.on('message', (data) => {
  // ...
});

// ❌ 잘못된 예
const HandleMessage = (ws, message) => { // 대문자 시작
  // ...
}

ws.on('message', function(data) { // 화살표 함수 사용 권장
  // ...
});
```

### 4. 네이밍 컨벤션

#### 변수 및 함수
- **camelCase**: 일반 변수, 함수
- **PascalCase**: 클래스, 생성자
- **UPPER_SNAKE_CASE**: 상수

```javascript
// ✅ 올바른 예
const userCount = 10;
const MAX_USERS = 100;
function getUserList() { }
class WebSocketServer { }

// ❌ 잘못된 예
const UserCount = 10;
const maxusers = 100;
function GetUserList() { }
class webSocketServer { }
```

#### 특수 네이밍
- **DOM 요소**: 접미사 없이 명확한 이름
- **boolean 변수**: `is`, `has` 등의 접두사 사용

```javascript
// ✅ 올바른 예
const loginScreen = document.getElementById('login-screen');
const sendBtn = document.getElementById('send-btn');
let isConnected = false;
let hasNickname = true;

// ❌ 잘못된 예
const loginScreenElement = document.getElementById('login-screen');
const button = document.getElementById('send-btn');
let connected = false; // boolean임을 알기 어려움
```

### 5. 주석 스타일

#### 섹션 구분 주석
```javascript
// ===== 섹션 제목 =====
// 주요 섹션을 구분할 때 사용
```

#### 설명 주석
```javascript
// 함수 위에 한 줄 설명
function handleJoin(ws, nickname) {
  // 닉네임 유효성 검사
  if (!nickname || nickname.trim().length < 2) {
    return;
  }
  
  // 클라이언트 정보 업데이트
  const client = clients.get(ws);
}
```

#### 타입 힌트 주석
```javascript
// Map<WebSocket, { id: string, nickname: string }>
const clients = new Map();
```

### 6. 에러 처리

- `try-catch`로 감싸기
- 명확한 에러 메시지 사용
- 콘솔 로그에 이모지 활용

```javascript
// ✅ 올바른 예
try {
  const message = JSON.parse(data.toString());
  handleMessage(ws, message);
} catch (error) {
  console.error('❌ 메시지 파싱 에러:', error);
  sendToClient(ws, {
    type: 'error',
    message: '잘못된 메시지 형식입니다.'
  });
}

// ❌ 잘못된 예
const message = JSON.parse(data); // 에러 처리 없음
```

### 7. 콘솔 로그

사용자 친화적인 이모지와 함께 명확한 메시지 작성:

```javascript
console.log('🚀 서버가 http://localhost:3000 에서 실행 중입니다.');
console.log('✅ 새로운 클라이언트 연결:', clientId);
console.log('📩 수신한 메시지:', message);
console.log('💬 Alice: Hello!');
console.log('👋 클라이언트 퇴장:', nickname);
console.error('❌ WebSocket 에러:', error);
```

### 8. 객체 및 배열

- 단일 속성이어도 한 줄로 작성 가능
- 여러 속성은 각 줄에 하나씩

```javascript
// ✅ 올바른 예
const user = { id: 1, name: 'Alice' };

const message = {
  type: 'message',
  userId: client.id,
  nickname: client.nickname,
  content: content.trim(),
  timestamp: new Date().toISOString()
};

// ❌ 잘못된 예
const message = { type: 'message', userId: client.id, nickname: client.nickname, content: content.trim(), timestamp: new Date().toISOString() };
```

### 9. 조건문

- 간단한 조건은 early return 사용
- 복잡한 조건은 변수로 분리

```javascript
// ✅ 올바른 예 - early return
function handleJoin(ws, nickname) {
  if (!nickname || nickname.trim().length < 2) {
    sendToClient(ws, { type: 'error', message: '닉네임이 너무 짧습니다.' });
    return;
  }
  
  // 메인 로직
}

// ✅ 올바른 예 - 복잡한 조건
const isValidNickname = nickname && nickname.trim().length >= 2;
if (!isValidNickname) {
  return;
}

// ❌ 잘못된 예
function handleJoin(ws, nickname) {
  if (nickname && nickname.trim().length >= 2) {
    // 메인 로직이 중첩됨
  } else {
    sendToClient(ws, { type: 'error', message: '닉네임이 너무 짧습니다.' });
  }
}
```

## 🗂 파일 구조

### 파일 구성 순서

```javascript
// 1. Import 문
const express = require('express');
const path = require('path');

// 2. 상수 선언
const PORT = 3000;
const MAX_USERS = 100;

// 3. 변수 선언
const app = express();
let userCount = 0;

// 4. 메인 로직
app.use(express.static('public'));

// 5. 함수 선언
function handleMessage(ws, message) {
  // ...
}

// 6. Export (필요한 경우)
module.exports = { app, server };
```

### 클라이언트 JavaScript 구조

```javascript
// 1. DOM 요소 선택
const loginScreen = document.getElementById('login-screen');

// 2. 상태 관리 변수
let ws = null;
let currentUser = null;

// 3. 주요 기능 함수 (섹션별로 구분)
// ===== WebSocket 연결 =====
function connectWebSocket() { }

// ===== UI 이벤트 핸들러 =====
function handleJoin() { }

// ===== UI 업데이트 함수 =====
function updateUserList() { }

// 4. 이벤트 리스너 등록
joinBtn.addEventListener('click', handleJoin);

// 5. 초기화
connectWebSocket();
```

## 🌐 HTML/CSS

### HTML

- **ID**: kebab-case 사용 (`login-screen`, `send-btn`)
- **Class**: kebab-case 사용 (`message-container`, `user-list`)
- **시맨틱 태그** 우선 사용

```html
<!-- ✅ 올바른 예 -->
<div id="login-screen" class="screen">
  <button id="join-btn" class="btn-primary">입장하기</button>
</div>

<!-- ❌ 잘못된 예 -->
<div id="loginScreen" class="Screen">
  <button id="joinBtn" class="btnPrimary">입장하기</button>
</div>
```

### CSS

- **변수 네이밍**: kebab-case with `--` 접두사
- **클래스 네이밍**: BEM 스타일 권장

```css
/* ✅ 올바른 예 */
:root {
  --primary-color: #667eea;
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message {
  /* ... */
}

.message-header {
  /* ... */
}

.message-content {
  /* ... */
}

/* ❌ 잘못된 예 */
:root {
  --primaryColor: #667eea;
  --BgGradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 📝 Git 커밋 메시지

- **형식**: `타입: 간단한 설명`
- **타입**: feat, fix, docs, style, refactor, test, chore

```bash
# ✅ 올바른 예
feat: WebSocket 서버 추가
fix: 사용자 퇴장 시 목록 업데이트 오류 수정
docs: README에 설치 방법 추가
refactor: 메시지 처리 로직 개선

# ❌ 잘못된 예
added websocket
bug fix
update
```

## 🔍 코드 품질

### 함수 크기

- 한 함수는 **한 가지 일**만 수행
- 20-30줄 이내로 유지 (복잡한 경우 분리)

### DRY (Don't Repeat Yourself)

- 반복되는 코드는 함수로 분리
- 예: `sendToClient()`, `broadcast()`, `escapeHtml()`

### 의미 있는 이름

```javascript
// ✅ 올바른 예
const activeUsers = getActiveUsers();
const isValidNickname = nickname.length >= 2;

// ❌ 잘못된 예
const users = getUsers(); // 어떤 사용자?
const valid = nickname.length >= 2; // 무엇이 valid?
```

## 🚨 금지 사항

1. ❌ `var` 사용 금지
2. ❌ 전역 변수 남용 금지
3. ❌ `eval()` 사용 금지
4. ❌ 인라인 이벤트 핸들러 금지 (`onclick="..."`)
5. ❌ 콘솔 로그 없는 에러 무시 금지

## 📚 참고

이 가이드는 Simple Chat 프로젝트를 기반으로 작성되었으며, 프로젝트가 발전함에 따라 업데이트될 수 있습니다.

**핵심 원칙:**
- **일관성**: 같은 패턴을 반복적으로 사용
- **가독성**: 코드를 읽는 사람을 배려
- **명확성**: 의도가 분명한 코드 작성
