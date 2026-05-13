# RackOps Simulator MVP

서버랙/홈랩 배치 시뮬레이터의 정적 웹 MVP입니다.

## 포함된 기능

- 12U / 24U / 42U 랙 선택
- 장비 드래그 앤 드롭 배치
- 선택 후 빈 슬롯 클릭 배치
- U 공간 자동 계산
- 전력 합산, 월 전기요금 추정, UPS 런타임 계산
- 발열 상태 표시
- SVG 케이블 토폴로지 시각화
- 네트워크/전원 연결 경고
- JSON 저장/불러오기

## 실행 방법

브라우저에서 `index.html`을 열거나 아래처럼 간단한 정적 서버로 실행할 수 있습니다.

```powershell
cd c:\lsy\study\ai\RackOps
python -m http.server 8000
```

그 다음 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 설계 메모

- 프론트엔드: 순수 HTML/CSS/JavaScript
- 상태 모델: `app.js` 내부 단일 상태 객체
- 랙 배치 규칙: `topU` 기준으로 장비 시작 위치를 저장하고 겹침 여부를 계산
- 발열 계산: `W * 3.412 * heatFactor` 기반의 단순화된 BTU/h 추정
- 전력 경고: UPS/PDU 허용 전력과 비교
- React/TypeScript 확장 구조는 `ARCHITECTURE.md` 참고

## 다음 확장 추천

1. 케이블을 시각적 라인으로 표현하는 SVG 레이어 추가
2. 장비 템플릿 외부 JSON 로딩 지원
3. 비용/전력/발열 기반 미션 모드 추가
4. Three.js 기반 3D 랙 뷰 추가