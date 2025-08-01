# ⚔️ 아이템 시뮬레이터: 나만의 작은 RPG 세계

안녕하세요! 이 프로젝트는 RPG 게임의 핵심적인 백엔드 기능을 구현해본 **아이템 시뮬레이터**입니다. 스파르타코딩클럽 부트캠프 과제로 시작되었지만, Node.js, Express, 그리고 Prisma를 깊이 있게 학습하고 활용하는 좋은 기회가 되었습니다.

사용자는 자신만의 계정을 만들고, 여러 캐릭터를 육성하며 아이템을 사고파는 등 RPG 게임의 기본적인 재미를 경험할 수 있습니다.

## ✨ 주요 기능

이 프로젝트는 다음과 같은 핵심 기능들을 제공합니다.

### 🧑‍🤝‍🧑 계정 및 인증
- **회원가입 및 로그인**: `bcrypt`로 안전하게 암호화된 비밀번호를 통해 계정을 만들고, `JWT(Access/Refresh Token)` 기반으로 인증을 처리하여 안전하게 서비스를 이용할 수 있습니다.
- **내 정보 조회**: 로그인된 사용자는 자신의 계정 정보와 보유한 캐릭터 목록을 확인할 수 있습니다.

### 🧝 캐릭터
- **캐릭터 생성 및 관리**: 계정당 최대 3개의 개성 넘치는 캐릭터를 생성하고 관리할 수 있습니다.
- **상세 스탯 조회**: 캐릭터의 HP, MP, 공격력, 재화 등 상세 정보를 조회하여 성장을 체감할 수 있습니다.
- **캐릭터 삭제**: 애정이 식은 캐릭터는 떠나보내 줄 수 있습니다.

### 💎 아이템 및 경제 활동
- **아이템**: 희귀도(common, rare, epic, legendary)와 능력치가 부여된 다양한 아이템을 생성하고 관리합니다.
- **상점**: 아이템을 구매하거나, 필요 없는 아이템을 판매(정가의 60%)하여 재화를 획득할 수 있습니다.
- **장비 시스템**: 아이템을 장착하거나 해제할 수 있으며, 장착 시 캐릭터의 능력치가 실시간으로 변동됩니다.
- **인벤토리**: 내가 보유한 아이템과 장착 중인 아이템 목록을 한눈에 볼 수 있습니다.

## 🛠️ 기술 스택

이 프로젝트는 아래와 같은 기술들을 활용하여 만들어졌습니다.

- **Backend**: `Node.js`, `Express.js`
- **Database**: `MySQL` with `Prisma` (모던하고 타입-세이프한 ORM)
- **Authentication**: `jsonwebtoken` (JWT)
- **Password Hashing**: `bcrypt`
- **Development**: `nodemon` (개발 환경에서 빠른 서버 재시작)
- **Logging**: `winston` (서버 활동 기록)

## 📂 프로젝트 구조

```
item_sim/
├── prisma/
│   └── schema.prisma       # 데이터베이스 모델 정의
├── src/
│   ├── middlewares/        # 인증, 에러 핸들링 등 미들웨어
│   ├── routes/             # 기능별 API 라우터
│   ├── utils/              # Prisma 클라이언트 등 유틸리티
│   └── app.js              # Express 앱 초기 설정 및 실행
├── .env                    # 환경 변수 (DB 연결 정보, JWT 시크릿 키)
└── package.json
```

## 🚀 시작하기

### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone https://github.com/your-username/item_sim.git
cd item_sim
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 채워주세요.
```env
# 데이터베이스 연결 정보 (MySQL)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT 시크릿 키
ACCESS_TOKEN_SECRET_KEY="your_access_token_secret"
REFRESH_TOKEN_SECRET_KEY="your_refresh_token_secret"
```

### 3. 데이터베이스 마이그레이션
아래 명령어를 실행하여 `prisma/schema.prisma` 파일의 내용을 기반으로 데이터베이스 테이블을 생성합니다.
```bash
npx prisma migrate dev
```

### 4. 서버 실행
```bash
npm run dev
```
서버가 정상적으로 실행되면 `3018`번 포트에서 요청을 받기 시작합니다.

## 🕹️ API 명세 (주요 API 예시)

자세한 내용은 `src/routes` 폴더를 참고해주세요.

#### `POST /api/sign-up` - 회원가입
- **Request Body**: `{ "userId": "testuser", "password": "password123", "confirmPassword": "password123" }`
- **Success Response**: `{ "message": "회원가입이 완료되었습니다." }`

#### `POST /api/sign-in` - 로그인
- **Request Body**: `{ "userId": "testuser", "password": "password123" }`
- **Success Response**: `{ "message": "로그인에 성공했습니다.", "accessToken": "...", "refreshToken": "..." }` (토큰은 쿠키에도 저장됩니다)

#### `POST /api/characters` - 캐릭터 생성 (인증 필요)
- **Request Body**: `{ "charactername": "전사1" }`
- **Success Response**: `{ "message": "캐릭터 생성 완료", "data": { ...생성된 캐릭터 정보 } }`

#### `POST /api/character/:characterId/purchase` - 아이템 구매 (인증 필요)
- **Request Body**: `{ "item_code": 1001, "count": 2 }`
- **Success Response**: `{ "message": "포션 2개를 구매하였습니다.", "구매금액": 200, "남은금액": 9800 }`

#### `POST /api/character/:characterId/equip` - 아이템 장착 (인증 필요)
- **Request Body**: `{ "item_code": 2001 }`
- **Success Response**: `{ "message": "아이템을 장착했습니다.", "data": { ...변경된 캐릭터 스탯 } }`

## 💡 앞으로의 개선 방향

이 프로젝트는 다음과 같은 방향으로 더 발전할 수 있습니다.

- [ ] **테스트 코드 작성**: `Jest`나 `Mocha` 같은 테스팅 프레임워크를 도입하여 안정성 높은 코드를 만들어가고 싶습니다.
- [ ] **실시간 전투**: `WebSocket`을 이용해 유저 간의 간단한 전투 시뮬레이션 기능을 추가해보고 싶습니다.
- [ ] **프론트엔드**: `React`나 `Vue.js`를 사용해 이 백엔드와 통신하는 간단한 웹 애플리케이션을 만들어보고 싶습니다.
- [ ] **퀘스트 시스템**: 유저에게 동기를 부여할 수 있는 간단한 퀘스트 기능을 추가하면 더 재미있을 것 같습니다.

---
이 프로젝트에 관심을 가져주셔서 감사합니다! 😊
