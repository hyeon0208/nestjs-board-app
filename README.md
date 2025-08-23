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
