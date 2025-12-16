# Simple Chat

실시간 WebSocket 기반 채팅 애플리케이션

## 개요

Simple Chat은 Express와 WebSocket(ws)을 활용한 경량 실시간 채팅 플랫폼입니다. 최소한의 의존성으로 실시간 양방향 통신을 구현하며, 향후 엔터프라이즈급 협업 도구로 확장 가능한 아키텍처를 제공합니다.

### 핵심 가치

- **실시간성**: WebSocket 기반 저지연 메시징
- **확장성**: 모듈형 구조로 쉬운 기능 추가
- **간결성**: 외부 프레임워크 의존성 최소화
- **생산성**: 빠른 프로토타이핑과 배포

## 설치 및 실행

### 요구사항

- Node.js 14.x 이상
- pnpm 6.x 이상

### 설치

```bash
# pnpm이 설치되지 않은 경우
npm install -g pnpm

# 프로젝트 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
pnpm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다. 포트는 환경변수 `PORT`로 변경 가능합니다.

```bash
PORT=3000 pnpm start
```

## 아키텍처

### 디렉토리 구조

```
simple-chat/
├── server/
│   └── index.js          # Express + WebSocket 서버
├── public/
│   ├── index.html        # 클라이언트 UI
│   ├── styles.css        # 스타일시트
│   └── app.js            # 클라이언트 로직
├── .agent/
│   └── rules/
│       └── code-style-guide.md
└── package.json
```

### 기술 스택

**Backend**
- Express 5.2.1 - HTTP 서버
- ws 8.18.3 - WebSocket 서버
- Node.js - 런타임 환경

**Frontend**
- Vanilla JavaScript
- CSS3 - 모던 스타일링 (Grid, Flexbox, Animations)
- WebSocket API - 실시간 통신

**개발 도구**
- pnpm - 빠르고 효율적인 패키지 관리

## 주요 기능

### 현재 구현된 기능 (v1.0)

1. **사용자 관리**
   - 닉네임 기반 인증
   - 중복 닉네임 방지
   - 실시간 접속자 목록

2. **메시징**
   - 실시간 메시지 송수신
   - 브로드캐스팅
   - 타임스탬프 표시
   - XSS 방지 (HTML 이스케이프)

3. **사용자 경험**
   - 반응형 디자인 (모바일/데스크톱)
   - Enter 키 지원
   - 자동 스크롤
   - 입장/퇴장 알림
   - 에러 처리 및 사용자 피드백

