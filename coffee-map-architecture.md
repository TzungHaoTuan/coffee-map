# Coffee Map — 專案架構文件

> 給 Claude Code 的開發指引文件

---

## 專案定位

「專為咖啡愛好者設計的 Google Maps」— 資料來自 Google Places API（即時、自動更新），介面專為咖啡廳瀏覽和個人打卡優化。不是策展應用，而是讓使用者探索台北各行政區的精品咖啡廳。

---

## 技術棧

| 層級 | 技術 | 說明 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | 前端 + API Routes 合一，API key 保護在 server-side |
| Auth + DB + Storage | Supabase | PostgreSQL、使用者登入、照片儲存三合一 |
| ORM | Drizzle ORM | TypeScript-first，直連 Supabase PostgreSQL |
| 地圖 | Mapbox GL JS + react-map-gl | 支援 cluster、GeoJSON 區域邊界、自訂樣式 |
| 商家資料 | Google Places API (New) | Nearby Search 抓區域咖啡廳，Details 取單店詳情 |
| 菜單 OCR | Claude API (claude-sonnet-4-5) | 照片解析菜單文字，結果 cache 在 DB |
| 部署 | Vercel | push 即部署，與 Next.js 原廠整合 |

---

## 為何選 Next.js 而非 Vite

Google Places API key 不能暴露在瀏覽器端。Next.js API Routes 提供 server-side proxy：

```
瀏覽器 → /api/places/nearby（Next.js server）→ Google Places API
```

Vite 是純前端工具，沒有 server，需要另外架 backend 才能保護 API key。Next.js 把這件事內建了。

環境變數規則：
- `NEXT_PUBLIC_` 前綴 → 前端可讀（會進 bundle，僅用於 Mapbox token）
- 無前綴 → 只有 server 可讀（Google Places key、Anthropic key、Supabase service role key）

---

## 環境變數

```bash
# .env.local（不進 git，不進 bundle）

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Places API — server-side only，無 NEXT_PUBLIC_ 前綴
GOOGLE_PLACES_API_KEY=

# Mapbox — 前端需要，在 Mapbox 後台設定 allowed URLs 限制網域
NEXT_PUBLIC_MAPBOX_TOKEN=

# Anthropic Claude API — server-side only
ANTHROPIC_API_KEY=
```

---

## 地圖使用者流程

```
初始畫面
  → Mapbox zoom 11，台北市中心 [121.535, 25.055]
  → 顯示 12 個行政區 GeoJSON 邊界（藍色半透明）
  → 區域名稱 label 永久顯示
  → 右側側欄顯示提示「選擇一個行政區」

使用者點擊行政區
  → 地圖 fly to 該區，zoom 14
  → 觸發 /api/places/nearby?district=大安區
  → Google Places Nearby Search（該區中心座標 + radius）
  → 回傳最多 20 間咖啡廳，顯示 marker
  → 右側側欄切換為咖啡廳清單

使用者點擊咖啡廳 marker 或清單項目
  → 觸發 /api/places/details?place_id=ChIJ...
  → 右側切換為詳情面板（照片、營業時間、電話）
  → 可執行打卡（需登入）
```

---

## 地圖設計原則

- 底圖：Mapbox `mapbox/light-v11`，簡潔低噪音
- 行政區邊界：GeoJSON 真實邊界，hover 變色，點擊後 fly to
- Marker 樣式（小圓點，非 pin）：
  - 預設：灰色小圓點
  - 已打卡 visited：實心深綠圓點
  - 願望清單 wishlist：空心圓點
- Cluster：zoom < 14 自動群集，zoom ≥ 14 展開個別 marker
- Hover marker 才顯示咖啡廳名稱 tooltip，保持地圖乾淨

---

## 行政區資料

台北市 12 個行政區真實 GeoJSON 邊界，來源：政府開放資料平台（免費）

下載：https://data.gov.tw/dataset/7442

檔案放在：`public/taipei-districts.geojson`

各區中心座標（用於 Nearby Search）：

```typescript
// lib/districts.ts
export const TAIPEI_DISTRICTS = [
  { name: '中山區', center: [121.532, 25.063] as [number, number], radius: 1500 },
  { name: '大安區', center: [121.543, 25.026] as [number, number], radius: 1800 },
  { name: '松山區', center: [121.568, 25.058] as [number, number], radius: 1500 },
  { name: '信義區', center: [121.565, 25.033] as [number, number], radius: 1500 },
  { name: '中正區', center: [121.517, 25.032] as [number, number], radius: 1200 },
  { name: '萬華區', center: [121.499, 25.033] as [number, number], radius: 1200 },
  { name: '大同區', center: [121.513, 25.063] as [number, number], radius: 1000 },
  { name: '內湖區', center: [121.587, 25.083] as [number, number], radius: 2500 },
  { name: '士林區', center: [121.526, 25.094] as [number, number], radius: 2500 },
  { name: '北投區', center: [121.499, 25.132] as [number, number], radius: 3000 },
  { name: '南港區', center: [121.607, 25.055] as [number, number], radius: 2000 },
  { name: '文山區', center: [121.571, 24.998] as [number, number], radius: 2500 },
] as const
```

---

## 專案目錄結構

```
coffee-map/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # 主頁面：地圖 + 側欄
│   └── api/
│       ├── places/
│       │   ├── nearby/route.ts       # Google Places Nearby Search proxy
│       │   ├── details/route.ts      # Google Places Details proxy
│       │   └── photos/route.ts       # Google Places 照片 proxy
│       ├── checkins/
│       │   └── route.ts              # 打卡 CRUD
│       └── menu/
│           └── parse/route.ts        # Claude OCR pipeline
├── components/
│   ├── map/
│   │   ├── MapView.tsx               # Mapbox 主元件，整合所有圖層
│   │   ├── DistrictLayer.tsx         # 行政區 GeoJSON 邊界圖層
│   │   └── CafeMarkerLayer.tsx       # 咖啡廳 marker 圖層（含 cluster）
│   ├── sidebar/
│   │   ├── Sidebar.tsx               # 側欄容器（清單 ↔ 詳情切換）
│   │   ├── DistrictPrompt.tsx        # 初始提示：請選擇行政區
│   │   ├── CafeList.tsx              # 咖啡廳清單
│   │   ├── CafeCard.tsx              # 單張卡片
│   │   ├── CafeDetail.tsx            # 詳情面板（照片、資訊、打卡）
│   │   └── FilterBar.tsx             # 篩選列
│   └── ui/                           # 共用元件（Button, Badge, Spinner...）
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 前端 Supabase client
│   │   └── server.ts                 # Server-side Supabase client
│   ├── db/
│   │   ├── schema.ts                 # Drizzle schema
│   │   └── index.ts                  # DB 連線
│   ├── google-places.ts              # Google Places API 封裝函式
│   ├── claude.ts                     # Claude API 封裝（菜單 OCR）
│   └── districts.ts                  # 行政區中心座標常數
├── public/
│   └── taipei-districts.geojson      # 台北市行政區真實邊界
├── types/
│   └── index.ts                      # 共用 TypeScript types
└── drizzle.config.ts
```

---

## TypeScript Types

```typescript
// types/index.ts

export type District = {
  name: string
  center: [number, number]
  radius: number
}

export type CafeMarker = {
  placeId: string
  name: string
  lat: number
  lng: number
  rating?: number
  userRatingsTotal?: number
  vicinity?: string
  checkinStatus?: 'visited' | 'wishlist' | null
}

export type CafeDetails = {
  placeId: string
  name: string
  formattedAddress: string
  formattedPhoneNumber?: string
  openingHours?: {
    weekdayText: string[]
    openNow: boolean
  }
  rating?: number
  photos: Array<{ photoReference: string; width: number; height: number }>
  website?: string
}

export type SidebarView = 'prompt' | 'list' | 'detail'

export type CheckinStatus = 'visited' | 'wishlist'
```

---

## API Routes 規格

### `GET /api/places/nearby`

Query params:
- `district` — 行政區名稱，e.g. `大安區`
- `limit` — 數量上限，預設 `20`

流程：
1. 從 `TAIPEI_DISTRICTS` 取得中心座標和 radius
2. 呼叫 Google Places Nearby Search（type: cafe）
3. 若已登入，合併使用者打卡狀態
4. 回傳結果

Response: `CafeMarker[]`

---

### `GET /api/places/details`

Query params:
- `place_id` — Google Places ID

流程：
1. 先查 `place_details_cache` 表（TTL 7 天）
2. Cache miss → 呼叫 Google API → 存入 cache
3. 回傳詳情

Response: `CafeDetails`

---

### `GET /api/places/photos`

Query params:
- `photo_reference`
- `max_width` — 預設 `800`

Response: 圖片 binary stream（隱藏 API key）

---

### `POST /api/checkins`

需登入。Body:
```json
{
  "placeId": "ChIJ...",
  "placeName": "Simple Kaffa",
  "status": "visited" | "wishlist",
  "note": "optional"
}
```

---

### `POST /api/menu/parse`

需登入。一間店只跑一次，已有資料直接回傳。Body:
```json
{ "placeId": "ChIJ..." }
```

流程：
1. 檢查 `menus` 表是否已有資料
2. 若無：抓 Photos → Claude Vision 分類菜單照片 → OCR 解析 → 存 DB
3. 回傳 `MenuItem[]`

---

## 資料庫 Schema（Drizzle）

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'

export const checkinStatusEnum = pgEnum('checkin_status', ['visited', 'wishlist'])

// Google Places 詳情 cache（避免重複計費，TTL 7 天）
export const placeDetailsCache = pgTable('place_details_cache', {
  placeId: text('place_id').primaryKey(),
  data: jsonb('data').notNull(),
  cachedAt: timestamp('cached_at').defaultNow(),
})

// 菜單 OCR 結果（一間店一筆）
export const menus = pgTable('menus', {
  id: uuid('id').defaultRandom().primaryKey(),
  placeId: text('place_id').notNull().unique(),
  items: jsonb('items'),
  parsedAt: timestamp('parsed_at').defaultNow(),
})

// 使用者打卡紀錄
export const checkins = pgTable('checkins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),       // Supabase Auth user.id
  placeId: text('place_id').notNull(),     // Google Places ID
  placeName: text('place_name').notNull(), // 冗餘存名稱，避免每次查 Google
  status: checkinStatusEnum('status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

---

## 篩選功能規格

| 篩選項目 | 類型 | 預設 | 說明 |
|----------|------|------|------|
| 數量上限 | select | 20 | 10 / 20 / 40 |
| Google 評分門檻 | slider | 4.0 | 只顯示評分 ≥ N 的咖啡廳 |
| 打卡狀態 | toggle | 全部 | 全部 / 未去過 / 已去過 / 願望清單 |
| 標籤（Phase 2） | multi-select | — | 需 OCR 資料才能啟用 |
| 豆子產地（Phase 2） | multi-select | — | 需 OCR 資料才能啟用 |

---

## 費用說明

Google Places API 每月有 $200 USD 免費額度：

| API | 費用 | 月免費額度換算 |
|-----|------|--------------|
| Nearby Search | $0.032 / 次 | 約 6,250 次 |
| Place Details | $0.017 / 次 | 約 11,700 次（cache 後大幅減少） |
| Place Photos | $0.007 / 張 | 約 28,500 張 |

個人使用完全在免費額度內。

---

## 開發順序

### Step 1 — 專案初始化

```bash
npx create-next-app@latest coffee-map --typescript --tailwind --app
cd coffee-map
npm install react-map-gl mapbox-gl
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm drizzle-kit postgres
```

`next.config.ts` 加入：
```typescript
transpilePackages: ['react-map-gl', 'mapbox-gl']
```

### Step 2 — 地圖 MVP（假資料）

目標：版型正確、行政區互動可用，不需要真實 API

- 左地圖右側欄，全螢幕版型
- Mapbox 地圖，初始 zoom 11，中心 `[121.535, 25.055]`
- 載入 `public/taipei-districts.geojson`
- 行政區 hover 變色、點擊 fly to zoom 14
- 側欄：初始顯示提示 → 點擊區域後顯示假咖啡廳清單
- 假 marker 顯示在地圖上

### Step 3 — Google Places 串接

- 建立 `/api/places/nearby` route
- 點擊行政區觸發真實 API，地圖和清單顯示真實資料
- 建立 `/api/places/details` + cache 邏輯
- 建立 `/api/places/photos` proxy
- 點擊咖啡廳展開詳情面板

### Step 4 — Supabase Auth + 打卡

- Supabase Email / Google 登入
- Drizzle schema migration
- `/api/checkins` CRUD
- 打卡後 marker 顏色更新、詳情面板顯示狀態

### Step 5 — 篩選功能

- FilterBar 元件
- 評分門檻 slider、數量 select、打卡狀態 toggle

### Step 6 — 菜單 OCR（選配）

- `/api/menu/parse` route
- Claude Vision pipeline
- 詳情面板顯示菜單 / 豆子資訊

---

## 注意事項

- `GOOGLE_PLACES_API_KEY` 絕對不能加 `NEXT_PUBLIC_` 前綴
- Place Details 使用前先檢查 cache（`cachedAt` + 7 天 TTL）
- Supabase RLS policy：`checkins` 表加 `user_id = auth.uid()` 確保資料隔離
- Mapbox token 在 Mapbox 後台 Tokens 頁面設定 allowed URLs
- GeoJSON 放 `public/` 目錄，前端直接 fetch，不需要 API Route
- `react-map-gl` v7+ 使用 mapbox-gl v2，需在 `next.config.ts` 加 `transpilePackages`
- Supabase 免費 tier 閒置 7 天會暫停，開發期間無所謂，上線後升 Pro（$25/月）
