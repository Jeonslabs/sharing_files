# Recurring Contracts & Renewals Management App (MVP)

이 프로젝트는 계약 및 갱신 관리(보험, 임대차, 예금 만기 등)를 위한 내부 웹 애플리케이션입니다.
NestJS(백엔드), Next.js(프론트엔드), PostgreSQL(데이터베이스)로 구성되어 있으며 Docker Compose를 통해 실행됩니다.

## 사전 요구사항 (Prerequisites)

- [Docker](https://www.docker.com/) 및 Docker Compose가 설치되어 있어야 합니다.

## 설치 및 실행 방법 (Installation & Running)

1. 저장소를 클론합니다.
   ```bash
   git clone <repository-url>
   cd app
   ```

2. 애플리케이션을 빌드하고 실행합니다.
   ```bash
   docker-compose build
   docker-compose up
   ```
   (백그라운드에서 실행하려면 `-d` 옵션을 사용하세요: `docker-compose up -d`)

3. 웹 브라우저에서 프론트엔드에 접속합니다.
   - URL: http://localhost:3000

4. 초기 관리자 계정으로 로그인합니다.
   - **Username**: `admin`
   - **Password**: `admin1234`

## 주요 기능 (Features)

- **대시보드**: 만기 예정 항목 요약 확인
- **항목 관리**: 계약/보험/예금 등의 항목 등록, 수정, 삭제
- **파일 첨부**: 각 항목에 관련 파일(PDF, 이미지 등) 업로드 및 다운로드
- **캘린더 뷰**: 월별 만기 일정 확인
- **알림 설정**: 만기일 기준 알림 설정 (이메일/웹)

## 데이터 저장소 (Data Storage)

- **데이터베이스**: `../data/db` (PostgreSQL 데이터)
- **파일**: `../data/files` (업로드된 파일)
  - 이 경로는 NAS 등의 외부 스토리지와 마운트하여 사용할 수 있습니다.

## 개발 환경 설정 (Development)

### Backend (.env)
`/app/backend/.env` 파일에 설정됩니다.
- `DB_HOST`: db
- `DB_PORT`: 5432
- `DB_USER`: appuser
- `DB_PASSWORD`: app_pass
- `DB_NAME`: schedule_db
- `JWT_SECRET`: (보안을 위해 변경 권장)
- `FILES_BASE_PATH`: /data/files

### Frontend (.env.local)
`/app/frontend/.env.local` 파일에 설정됩니다.
- `NEXT_PUBLIC_API_BASE_URL`: http://localhost:3001 (클라이언트 브라우저에서 접근 시)
- **NAS 배포 시 주의**: 외부(다른 PC)에서 접속하려면 이 값을 `localhost` 대신 NAS의 IP 주소(예: `http://192.168.1.100:3001`)로 변경하고 이미지를 다시 빌드해야 합니다.

## 라이선스 (License)
Private / Internal Use Only
