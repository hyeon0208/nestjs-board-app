<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Nest JS default structure

```
├── 📂 node_modules/ # 설치된 외부 라이브러리
├── 📂 src/ # 애플리케이션 메인 소스 코드
│ └── ... # (모듈, 컨트롤러, 서비스 작성)
├── 📂 test/ # 테스트 코드 (e2e 테스트 포함)
│ └── ...
│
├── 📄 .gitignore # Git에 포함하지 않을 파일/폴더 정의
├── 📄 .prettierrc # Prettier 코드 포맷팅 규칙
├── 📄 eslint.config.mjs # ESLint 코드 스타일/린트 규칙 (주로 TypeScript를 가이드 라인 제시 및 문법 에러 검사)
├── 📄 nest-cli.json # NestJS 프로젝트를 위한 설정 파일 (빌드, 경로 alias 등)
├── 📄 package.json # 프로젝트 메타 정보 및 실행/의존성 관리
├── 📄 pnpm-lock.yaml # pnpm 의존성 버전 고정 파일
├── 📄 tsconfig.json # 어떻게 TypeScript를 컴파일할지 설정
└── 📄 tsconfig.build.json # TypeScript를 빌드 시 사용하는 설정 "exclude"에 빌드에 필요 없는 파일 명시.
```

> - **코드 관련**: `src/`, `test/`
> - **패키지 관리**: `package.json`, `pnpm-lock.yaml`, `node_modules/`
> - **코드 품질**: `.prettierrc`, `eslint.config.mjs`, `.gitignore`
> - **빌드/설정**: `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`
> - **문서**: `README.md`

<br>

## Nest CLI commands

📑 공식문서 : https://docs.nestjs.com/cli/usages

> - nest new|n → 프로젝트 생성
> - nest build → 빌드
> - nest start → 실행
> - nest info|i → 환경 정보 확인
> - nest add → 라이브러리 추가
> - nest generate|g → 모듈/서비스/컨트롤러 등 코드 자동 생성 (단축어 포함)

### 📦 `nest new|n [name]`

- 새로운 NestJS 애플리케이션 생성

```bash
nest new my-app
nest n my-app
```

### 🛠️ nest build [app]

애플리케이션을 빌드하여 dist/ 디렉토리에 결과물을 생성한다.
모노레포(monorepo) 구조에서는 특정 앱만 지정해 빌드할 수도 있다.

```bash
nest build
nest build user-service
```

### 🚀 nest start [app]

애플리케이션을 실행한다.
개발 환경에서는 --watch 옵션을 사용하여 파일 변경 시 자동으로 재시작할 수 있다.

```bash
nest start
nest start --watch
```

### ℹ️ nest info|i

현재 프로젝트의 환경 정보를 출력한다.
Nest 버전, Node.js 버전, OS, 패키지 매니저 등을 확인할 수 있다.

```bash
nest info
nest i
```

### ➕ nest add <library>

NestJS 애플리케이션에 새로운 기능을 추가하거나 기존의 라이브러리(예: GraphQL, Mongoose 등)를 연동할 때 사용한다.
이 명령어는 npm install 또는 yarn add와 유사하지만, NestJS의 스키매틱(schematic)을 실행하여 해당 패키지와 관련된 설정이나 파일 생성 등의 추가 작업을 자동으로 처리해준다.
(실제로 실행했을 때 아직은 잘 동작하지 않는 것 같다. schematics를 지원하는 라이브러리만 가능해보임.)

```bash
nest add @nestjs/graphql
nest add @nestjs/mongoose
nest add @nestjs/typeorm
```

=> Swagger 공식 문서 (통합 잘 돼 있음) : https://docs.nestjs.com/openapi/introduction

## Nest CLI `generate` command list

| name              | alias       | 설명                                                                                                                                                                                              |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **application**   | application | 새 NestJS 애플리케이션 워크스페이스를 만든다. 프로젝트를 시작할 때 전체 뼈대를 자동 생성.                                                                                                         |
| **class**         | cl          | 단순한 클래스 파일을 만든다. DTO, 헬퍼 유틸 등 자유롭게 활용 가능.                                                                                                                                |
| **configuration** | config      | CLI 실행에 필요한 설정 파일(`nest-cli.json`)을 만든다. 빌드/경로 설정 관리용.                                                                                                                     |
| **controller**    | co          | 요청을 받는 컨트롤러를 만든다. 라우팅 처리 담당 (`@Get`, `@Post` 등).                                                                                                                             |
| **decorator**     | d           | 커스텀 데코레이터를 만든다. 메서드나 파라미터에 붙여서 동작을 추가할 때 사용.                                                                                                                     |
| **gateway**       | ga          | WebSocket 게이트웨이를 만든다. 실시간 채팅이나 알림 같은 기능에 사용.                                                                                                                             |
| **interface**     | itf         | TypeScript 인터페이스를 만든다. 객체 구조를 정의할 때 사용.                                                                                                                                       |
| **library**       | lib         | 모노레포(monorepo)에서 공유 라이브러리 모듈 만든다. 여러 앱이 같이 쓰는 코드 모듈.                                                                                                                |
| **module**        | mo          | 모듈을 만든다. 컨트롤러, 서비스 등을 묶어 기능 단위로 관리하는 Nest의 기본 단위.                                                                                                                  |
| **pipe**          | pi          | 파이프를 만든다. 요청 데이터 유효성 검사(validation)나 타입 변환 처리 담당.                                                                                                                       |
| **provider**      | pr          | 프로바이더를 만든다. 주로 서비스나 리포지토리처럼 DI 컨테이너에 주입되는 객체. Spring으로 치면 Component 개념                                                                                     |
| **resolver**      | r           | GraphQL 리졸버를 만든다. GraphQL 쿼리/뮤테이션을 처리하는 역할.                                                                                                                                   |
| **resource**      | res         | 도메인에 대한 컨트롤러, 서비스, DTO, 엔티티, 리포지토리를 세트로 자동 생성.                                                                                                                       |
| **service**       | s           | 서비스 레이어를 만든다. 비즈니스 로직을 담당하며 컨트롤러와 분리.                                                                                                                                 |
| **sub-app**       | app         | 모노레포(monorepo)에서 서브 애플리케이션을 만든다. 멀티 앱 구조에서 사용.                                                                                                                         |
| **middleware**    | mi          | 라우터에 도달하기 전에 동작하는 모듈을 만든다. 요청과 응답 객체(req, res)를 직접 다룸. (요청/응답 스트림 레벨 (Express 기반) - 요청을 컨트롤러로 보내기 전에 실행됨 → Spring으로 치면 Filter 개념 |
| **guard**         | gu          | 가드를 만든다. 요청이 컨트롤러에 도달하기 전에 인증·인가 로직 실행.                                                                                                                               |
| **interceptor**   | itc         | 컨트롤러 실행 전/후를 가로채서 동작하는 인터셉터를 만든다. NestJS 핸들러/리턴값 레벨 - Spring으로 치면 인터셉터와 동일                                                                            |
| **filter**        | f           | 예외 필터를 만든다. 에러를 잡아 응답을 통일된 형식으로 변환하는 역할. Spring의 Filter와 헷갈릴 수 있지만 이건 ExceptionHandler 개념                                                               |

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.
