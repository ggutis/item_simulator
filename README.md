# item_simulator
아이템 시뮬레이터 / sparta bootcamp 과제
# 아이템 시뮬레이터

## 설명

RPG 스타일의 캐릭터 및 아이템 관리를 시뮬레이션하는 Node.js 백엔드 서버입니다. 사용자는 계정을 만들고, 계정당 최대 3개의 캐릭터를 관리하며, 아이템 구매, 판매, 장착 및 해제와 같은 작업을 수행할 수 있습니다.

## 주요 기능

*   **계정 관리:**
    *   JWT 기반 인증 (Access Token 및 Refresh Token)을 통한 회원가입 및 로그인.
    *   bcrypt를 사용한 안전한 비밀번호 해싱.
*   **캐릭터 관리:**
    *   계정당 최대 3개의 캐릭터 생성.
    *   캐릭터 삭제.
    *   캐릭터 상세 정보 및 능력치(HP, MP, 공격력, 방어력 등) 조회.
    *   게임 내 재화를 획득하는 간단한 기능.
*   **아이템 관리:**
    *   아이템 정보 생성, 조회 및 업데이트 (가격 제외).
    *   아이템은 능력치, 유형, 희귀도 및 설명을 가집니다.
    *   아이템 업데이트 내역 추적.
*   **인벤토리 및 장비:**
    *   아이템 구매 및 판매.
    *   캐릭터 인벤토리 조회.
    *   아이템 장착 및 해제 시 캐릭터 능력치 동적 업데이트.
    *   현재 장착 중인 아이템 목록 조회.

## 사용된 기술

*   **백엔드:** Node.js, Express.js
*   **데이터베이스:** Prisma ORM을 사용한 MySQL
*   **인증:** JSON Web Tokens (JWT)
*   **의존성:**
    *   `express`: 웹 프레임워크
    *   `prisma`: 데이터베이스 ORM
    *   `bcrypt`: 비밀번호 해싱
    *   `jsonwebtoken`: JWT 구현
    *   `cookie-parser`: 쿠키 처리 미들웨어
    *   `winston`: 로깅
    *   `dotenv`: 환경 변수 관리
    *   `nodemon`: 개발 중 서버 자동 재시작

## 시작하기

### 사전 요구 사항

*   Node.js
*   npm 또는 yarn
*   MySQL

### 설치

1.  저장소 복제:
    ```sh
    git clone https://github.com/your-username/item_sim.git
    ```
2.  의존성 설치:
    ```sh
    npm install
    # 또는
    yarn install
    ```
3.  `.env` 파일에 환경 변수 설정:
    ```
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    ACCESS_TOKEN_SECRET_KEY="your_access_token_secret"
    REFRESH_TOKEN_SECRET_KEY="your_refresh_token_secret"
    ```
4.  Prisma 마이그레이션을 실행하여 데이터베이스 스키마 생성:
    ```sh
    npx prisma migrate dev
    ```
5.  개발 서버 시작:
    ```sh
    npm run dev
    ```

## API 엔드포인트

API는 `/api` 접두사 아래에 다음 라우터로 구성됩니다.

*   **계정:** `/accounts` (회원가입, 로그인, 계정 조회)
*   **캐릭터:** `/character` (생성, 삭제, 상세 조회, 재화 획득)
*   **아이템:** `/items` (생성, 목록 조회, 상세 조회, 업데이트)
*   **구매:** `/character/:characterId/purchase` (아이템 구매)
*   **판매:** `/character/:characterId/sales` (아이템 판매)
*   **토큰:** `/token` (유효성 검사, 갱신)
*   **인벤토리:** `/character/:characterId/inventory` (인벤토리 조회), `/character/:characterId/characterItem` (장착 아이템 조회)
*   **장비:** `/character/:characterId/equip`, `/character/:characterId/detach` (아이템 장착 및 해제)