# 行政區邊界資料處理流程

台北市 12 個行政區的 GeoJSON 邊界，從政府開放資料下載後，經 mapshaper 處理，最終以 `.json` 模組形式嵌入 Next.js bundle。

---

## 1. 取得原始資料

**來源：** [政府開放資料平台 — 臺北市行政區域界線](https://data.gov.tw/dataset/7442)

下載格式通常為 Shapefile（`.shp` + 附屬檔），或直接提供 GeoJSON。

---

## 2. mapshaper 處理

[mapshaper](https://mapshaper.org) 是地理資料轉換工具，用途：

- **格式轉換**：Shapefile → GeoJSON
- **幾何簡化**：`-simplify 5%` 大幅縮減座標點數，原始 Shapefile 精度遠超地圖顯示所需
- **欄位過濾**：`-filter-fields TOWNNAME` 只保留行政區名稱，去除其他不需要的屬性欄位
- **座標系統**：確認輸出為 WGS84（EPSG:4326），即 `[lng, lat]` 格式

指令範例：
```bash
mapshaper taipei-districts.shp \
  -simplify 5% \
  -filter-fields TOWNNAME \
  -o format=geojson taipei-districts.geojson
```

---

## 3. GeoJSON → `.json`（副檔名轉換）

GeoJSON 本身就是合法的 JSON，內容不需要改動。只需將副檔名從 `.geojson` 改為 `.json`，再放入 `lib/` 目錄：

```
lib/taipei-districts.json
```

**為何不用 `.geojson`？**

Next.js 支援直接 `import` `.json` 檔作為 ES 模組（TypeScript 也能靜態分析）。`.geojson` 則需要額外 webpack 設定，或改用 `fetch()` 在 runtime 載入。

**為何放 `lib/` 而非 `public/`？**

放 `lib/` 表示由 webpack 在 build time 打包進 JS bundle，不需要額外的網路請求。放 `public/` 則需要 `fetch('/taipei-districts.geojson')`，在 runtime 才載入，多一次網路往返。

---

## 4. TypeScript 型別宣告

`types/geojson.d.ts` 告訴 TypeScript 如何解讀這個 import：

```typescript
// types/geojson.d.ts
import type { FeatureCollection } from 'geojson'

declare module '*/taipei-districts.json' {
  const value: FeatureCollection
  export default value
}
```

這讓 `import taipeiDistricts from '@/lib/taipei-districts.json'` 得到完整的 `FeatureCollection` 型別，`features`、`geometry`、`properties` 都有型別檢查。

---

## 5. 在程式碼中使用

### `lib/districts.ts` — 計算各區中心與半徑

```typescript
import geojson from './taipei-districts.json'

type TaipeiFeature = Feature<Polygon | MultiPolygon, { TOWNNAME: string }>

export const TAIPEI_DISTRICTS = (geojson.features as TaipeiFeature[]).map(f => {
  // 取最大 polygon 的外環，計算幾何中心與最大半徑
  // 用於 Google Places Nearby Search 的 center + radius 參數
  return { name: properties.TOWNNAME, center, radius }
})
```

### `components/map/MapView.tsx` — Mapbox 邊界圖層

```typescript
import taipeiDistricts from '@/lib/taipei-districts.json'

<Source id="districts" type="geojson" data={taipeiDistricts as GeoJSON.FeatureCollection}>
  <Layer id="district-fill" type="fill" ... />
  <Layer id="district-line" type="line" ... />
  <Layer id="district-label" type="symbol" ... />
</Source>
```

---

## 流程總覽

```
data.gov.tw
  ↓ 下載 Shapefile / GeoJSON
mapshaper
  ↓ simplify + filter-fields TOWNNAME + 輸出 GeoJSON
lib/taipei-districts.json
  ├─→ lib/districts.ts
  │     ├─ TAIPEI_DISTRICTS        計算各區 center + radius（供 Google Places Nearby Search 使用）
  │     └─ TAIPEI_DISTRICT_FEATURES  district name → GeoJSON feature 查找表
  ├─→ lib/geo-filter.ts
  │     └─ filterByDistrict()      Places API 結果的 point-in-polygon 過濾
  └─→ components/map/MapView.tsx   Mapbox Source 邊界渲染
```

### Places API 搜尋 + PIP 過濾

`center + radius` 是圓形，行政區是多邊形，圓一定超出邊界。必須在拿到 Places API 結果後，用 `filterByDistrict` 做 point-in-polygon 二次過濾，確保只保留真正落在該行政區內的店家。詳見 [coffee-map-architecture.md](../coffee-map-architecture.md) 的「為何需要 Point-in-Polygon 過濾」章節。
