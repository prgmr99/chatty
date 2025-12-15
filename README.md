# Simple Chat App

Express와 WebSocket을 사용한 간단한 실시간 채팅 애플리케이션입니다.

## 📦 설치

```bash
# 의존성 설치
npm install

# 또는 권한 문제가 있을 경우
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
npm install
```

## 🚀 실행

```bash
# 서버 시작
npm start

# 브라우저에서 접속
# http://localhost:3000
```

## 📁 프로젝트 구조

```
simple-chat/
├── server/
│   └── index.js          # Express 서버
├── public/
│   ├── index.html        # 메인 페이지
│   ├── styles.css        # 스타일시트
│   └── app.js            # 클라이언트 로직
├── package.json
└── README.md
```

## 🎯 현재 진행 상황

- ✅ Phase 1: 기본 설정 완료
  - 프로젝트 구조 생성
  - Express 서버 설정
  - 기본 HTML/CSS/JS 작성
  
- ⏳ Phase 2: WebSocket 연결 (다음 단계)

## 🛠 기술 스택

- **Backend**: Node.js, Express, ws
- **Frontend**: HTML, CSS, Vanilla JavaScript

## 📝 학습 내용

Phase 1에서 배운 내용:
- Express 서버 기본 설정
- 정적 파일 제공 미들웨어
- 기본적인 라우팅
- HTML/CSS를 사용한 UI 구성
# chatty
