# RackOps React/TypeScript Architecture

이 문서는 현재 정적 MVP를 React + TypeScript + Zustand 기반 웹앱으로 확장하기 위한 구조 설계안입니다.

## 목표

- MVP의 핵심 도메인 규칙을 유지하면서 UI를 컴포넌트 단위로 분리한다.
- 랙 배치, 연결 검증, 전력/발열 계산을 순수 함수 계층으로 분리한다.
- 2D에서 3D, 케이블 자동 정리, AI 추천 기능으로 확장 가능한 상태 구조를 만든다.

## 권장 스택

- React 19 + TypeScript
- Zustand for client state
- React Flow for topology/cable editor
- SVG overlay for rack cable path rendering
- React Three Fiber + Drei for future 3D rack view
- Zod for persisted layout validation
- Vitest + Testing Library for domain/UI tests

## 디렉터리 구조

```text
src/
  app/
    App.tsx
    providers.tsx
    routes.tsx
  components/
    shell/
      TopBar.tsx
      WorkspaceShell.tsx
    inventory/
      DeviceLibrary.tsx
      DeviceCard.tsx
    rack/
      RackCanvas.tsx
      RackSlot.tsx
      RackWarnings.tsx
    topology/
      CableMap.tsx
      CableLegend.tsx
      CableLayer.tsx
    metrics/
      MetricsPanel.tsx
      MetricCard.tsx
      WarningList.tsx
    inspector/
      DeviceInspector.tsx
      DeviceForm.tsx
  domain/
    rack/
      placeDevice.ts
      rackOccupancy.ts
      rackWarnings.ts
    power/
      summarizePower.ts
      estimateUpsRuntime.ts
    thermal/
      estimateHeat.ts
      classifyHeat.ts
    topology/
      validateConnections.ts
      topologyLayout.ts
  store/
    useRackStore.ts
    selectors.ts
  persistence/
    layoutSchema.ts
    exportLayout.ts
    importLayout.ts
  types/
    rack.ts
    device.ts
    topology.ts
```

## 컴포넌트 책임

`TopBar`
- 랙 크기 선택, 저장/불러오기, 전체 리셋.

`DeviceLibrary`
- 장비 템플릿 목록과 검색/필터.
- drag source와 quick-add 액션 제공.

`RackCanvas`
- 현재 선택된 랙 크기와 장비 점유 상태 렌더링.
- 슬롯 클릭 배치와 drag/drop 처리.

`CableMap`
- 배치된 장비와 연결 관계를 기반으로 SVG/React Flow 뷰 렌더링.
- LAN, 전원, 광, 콘솔 케이블 스타일 분리.

`MetricsPanel`
- 전력, 발열, 공간, 비용, UPS 런타임 계산값 표시.

`DeviceInspector`
- 선택된 장비의 editable form.
- 템플릿 복제, 삭제, 연결 대상 지정.

## Zustand 상태 예시

```ts
type RackState = {
  rackSize: 12 | 24 | 42;
  devices: RackDevice[];
  selectedDeviceId: string | null;
  scenario: ScenarioSettings;
  setRackSize: (size: 12 | 24 | 42) => void;
  selectDevice: (deviceId: string | null) => void;
  placeDevice: (deviceId: string, topU: number) => void;
  updateDevice: (deviceId: string, patch: Partial<RackDevice>) => void;
  duplicateDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  importLayout: (payload: ImportedLayout) => void;
  resetScenario: () => void;
};
```

## 파생 selector

- `selectPlacedDevices`
- `selectRackOccupancy`
- `selectSummaryMetrics`
- `selectConnectivityWarnings`
- `selectCableGraph`

이 selector들은 컴포넌트에서 직접 계산하지 않고 메모이즈된 파생값으로 제공하는 편이 낫습니다.

## 도메인 계층 원칙

- UI 컴포넌트 안에서 전력, 발열, 배치 규칙을 계산하지 않는다.
- 모든 계산은 순수 함수로 분리한다.
- import/export payload는 Zod schema로 검증한다.

## 확장 경로

1. `RackCanvas`를 그대로 두고 `ThreeDRackScene`을 병렬 추가한다.
2. `CableMap` 렌더러를 SVG에서 React Flow로 교체하거나 병행한다.
3. 장비 카탈로그를 Supabase 또는 SQLite API로 외부화한다.
4. AI 추천은 `domain/recommendation/` 계층을 추가해 상태와 분리한다.

## 마이그레이션 순서

1. 현재 `app.js`의 순수 계산 함수를 `domain/`으로 먼저 분리한다.
2. 정적 HTML 레이아웃을 React 컴포넌트로 치환한다.
3. 단일 `state` 객체를 Zustand store로 옮긴다.
4. JSON import/export를 Zod 검증과 함께 persistence 계층으로 이동한다.
5. 마지막에 SVG 케이블 맵을 React Flow 또는 전용 SVG component로 대체한다.