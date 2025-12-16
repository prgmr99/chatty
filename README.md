# Simple Chat App

Express와 WebSocket을 사용한 간단한 실시간 채팅 애플리케이션입니다.

## 📦 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

## 🚀 실행

```bash
# 서버 시작
pnpm start

# 브라우저에서 접속
# http://localhost:3000
```

## 📁 프로젝트 구조

```
simple-chat/
├── server/
│   └── index.js          # Express + WebSocket 서버
├── public/
│   ├── index.html        # 메인 페이지
│   ├── styles.css        # 스타일시트
│   └── app.js            # 클라이언트 로직
├── .agent/
│   └── rules/
│       └── code-style-guide.md  # 코드 스타일 가이드
├── package.json
└── README.md
```

## 🎯 구현 완료 기능

- ✅ **Phase 1**: 기본 설정 (Express 서버, 정적 파일 제공)
- ✅ **Phase 2**: WebSocket 연결 (실시간 양방향 통신)
- ✅ **Phase 3**: 채팅 기능 (메시지 송수신, 브로드캐스트, 타임스탬프)
- ✅ **Phase 4**: 사용자 관리 (목록 관리, 입장/퇴장 알림, 닉네임 중복 방지)

## ✨ 주요 기능

- 🔐 닉네임 기반 입장 (중복 방지)
- 💬 실시간 메시지 전송/수신
- 👥 접속자 목록 실시간 업데이트
- 🔔 입장/퇴장 알림
- ⏰ 메시지 타임스탬프
- 🎨 모던한 그라데이션 UI

## 🛠 기술 스택

- **Backend**: Node.js, Express, ws (WebSocket)
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Package Manager**: pnpm

## 📖 스타일 가이드

프로젝트의 코드 스타일 가이드는 [.agent/rules/code-style-guide.md](.agent/rules/code-style-guide.md)를 참고하세요.

**핵심 사항:**
- 패키지 관리: **pnpm** 사용 필수
- 들여쓰기: 2칸 스페이스
- 변수: `const` 우선, 재할당 필요 시 `let`
- 네이밍: camelCase (변수/함수), PascalCase (클래스)
- 에러 처리: try-catch 필수, 명확한 에러 메시지

## 🧪 테스트

여러 브라우저 창을 열어 동시에 접속하여 실시간 채팅을 테스트할 수 있습니다.

```bash
# 서버 실행
pnpm start

# 브라우저에서 여러 탭으로 http://localhost:3000 접속
# 각각 다른 닉네임으로 입장하여 채팅 테스트
```

## 📝 개발 가이드

1. 코드 작성 전 [스타일 가이드](.agent/rules/code-style-guide.md) 확인
2. 패키지 설치는 항상 `pnpm` 사용
3. 커밋 메시지는 `타입: 설명` 형식 사용
4. 함수는 한 가지 일만 수행하도록 작성

## 🚀 향후 확장 아이디어

- 📁 채팅 히스토리 저장
- 🏠 여러 채팅방 지원
- 🖼️ 프로필 이미지
- 🌙 다크 모드
- 📱 모바일 최적화

---

**chatty** - Express와 WebSocket을 배우기 위한 실시간 채팅 앱
