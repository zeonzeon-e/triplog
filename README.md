# 🌍 나만의 여행일지 (TripLog)

여행의 설레는 계획부터 소중한 순간의 기록, 그리고 한 편의 영화 같은 브이로그 재생까지 한 번에 관리하는 통합 여행 플랫폼입니다.

## ✨ 주요 기능

### 🗓️ 여행 계획 (Planning)
- **날짜 및 동행인 관리:** 여행 이름과 일정, 함께하는 사람들을 기록합니다.
- **스마트 타임테이블:** 장소를 검색하여 추가하면 드래그와 터치로 일정을 자유롭게 조정할 수 있습니다.
- **네이버 지도 연동:** 
  - 검색한 장소의 실시간 위치를 지도에서 확인.
  - 일정 순서에 따른 동선 시각화.
  - 장소 상세 정보(영업시간, 휴무일, 주차 등) 조회.

### 📸 여행 기록 (Logging)
- **실시간 미디어 업로드:** 카메라와 갤러리에 접근하여 사진 및 10초 이내의 영상을 타임스탬프와 함께 남깁니다.
- **일정 기반 위치 매핑:** 등록된 여행 일정을 선택하여 "어디서 찍은 기록인지" 자동으로 연결합니다.
- **풍부한 기록:** 
  - 음식에 대한 별점 및 맛평가.
  - 여행 중 쇼핑한 품목과 가격 리스트 관리.

### 🎬 여행 브이로그 (Vlog)
- **웹 스토리 재생:** 기록된 사진과 영상을 인스타그램 스토리 형식으로 넘겨보며 여행의 감동을 다시 느껴보세요.
- **시간순 자동 정렬:** 여행의 흐름에 따라 자동으로 구성되는 스토리보드.

## 🛠️ 기술 스택

- **Frontend:** Next.js (App Router), TypeScript
- **Backend:** Next.js Server Actions, Supabase
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (Google Login)
- **Storage:** Supabase Storage (Media files)
- **API:** Naver Maps API, Naver Search API
- **Icons:** Lucide React

## 🚀 시작하기

### 1. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
NAVER_CLIENT_ID=your_naver_search_id
NAVER_CLIENT_SECRET=your_naver_search_secret
```

### 2. 데이터베이스 설정
`supabase/migrations/20260527_initial_schema.sql` 파일의 SQL 쿼리를 Supabase의 SQL Editor에서 실행하여 필요한 테이블과 보안 정책(RLS)을 생성합니다.

### 3. 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 🔒 보안 정책 (RLS)
이 프로젝트는 사용자의 소중한 개인 데이터를 보호하기 위해 Supabase의 **Row Level Security**를 사용합니다. 모든 사용자는 본인이 생성한 여행 계획과 기록에만 접근할 수 있습니다.

---
제작: Gemini CLI
