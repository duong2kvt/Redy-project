# Redy 🦊 — healthy eating with your virtual pet

Ứng dụng di động được dựng từ file Figma **DUA_B1U25 – Dương Vy Quyên (Final)** và **Redy Design System**.
Mã nguồn dùng **Expo SDK 58 · React Native 0.88 · React 19 · Expo Router · Reanimated 4**, chạy trên iOS, Android và Web từ cùng một codebase.

## Chạy thử

```bash
npm install
npx expo start          # quét QR bằng app Expo Go (iOS/Android) để chạy trên điện thoại thật
npm run web             # bản web: hiển thị trong khung iPhone + bảng chọn 3 flow prototype
```

Kiểm tra:

```bash
npm run typecheck && npm run lint
npm run build:web       # xuất bản web tĩnh vào dist/
```

## Đưa lên GitHub

```bash
git remote add origin https://github.com/duong2kvt/Redy-project.git
git push -u origin main
```

Repo có sẵn workflow `.github/workflows/deploy-web.yml`. Sau khi push, vào **Settings → Pages → Source: GitHub Actions**: mỗi lần push lên `main`, bản demo web sẽ được build và deploy tự động tại `https://duong2kvt.github.io/Redy-project/`.

Để build app native (cài lên máy thật / TestFlight / Play Store): `npx eas-cli@latest build --profile preview`.

## Các flow (theo 3 prototype trong Figma)

| Flow | Màn hình |
| --- | --- |
| **1 · Onboarding** | intro → walkthrough (3 slide) → meet pet → nhập tên → setup goals (giới tính, năm sinh, chiều cao, cân nặng, mức vận động, BMI, cân nặng mục tiêu, tốc độ) → eating habits (chế độ ăn, số bữa, nơi ăn, dị ứng, thói quen muốn đổi) → personalize (plan, loading, plan ready) |
| **2 · Log meal + reward** | Home → nút **+** → Log meal → camera → AI scanning → bottom sheet nguyên liệu → chi tiết món → reward huy hiệu +3 coin → streak → Home sau khi log |
| **3 · Buy item** | Home → cửa hàng → tab Hat → Viking Hat → Buy now → toast "Purchase success" → nón rơi xuống đầu Redy |

## Motion & interaction

Mỗi chuyển cảnh và trigger trong prototype được map sang code:

- **DISSOLVE 300 ms** → fade giữa các màn hình (`Screen` + Stack `animation: 'fade'`).
- **SMART_ANIMATE** → animation thuộc tính bằng Reanimated (thanh progress, slider tốc độ, sheet, popup…).
- **AFTER_TIMEOUT** → chuỗi tự động: scanning loop 0.8 s, reward (0.8 s → thanh đầy 600 ms → +3 coin 400 ms → nút Next), toast mua hàng.
- **"Hoping anim"** (Sneaky Default ⇄ Move, 1 s delay, 600 ms ease-out) → linh vật ló lên khỏi hố ở màn nhập tên.
- **Video linh vật nhảy ra** (trang Draft) → dựng lại bằng squash & stretch + vòng sóng (`src/components/mascot-intro.tsx`).
  Có thể thay bằng file MP4 gốc: xem `src/components/mascot-video.ts` (expo-video đã cài sẵn).
- Thêm micro-interaction: haptics, nút nhún khi bấm, wheel picker có snap, số đếm tăng dần, vòng/gauge vẽ dần, lá rơi ở Home, chạm vào Redy để nó nhảy, navbar kính mờ, menu + xoay thành ×, sheet kéo xuống để đóng.

## Cấu trúc

```
src/
  app/                 # mỗi file = 1 màn hình (Expo Router)
    index.tsx          # intro
    onboarding/ goals/ habits/ plan/ log/
    home.tsx reward.tsx streak.tsx
  components/
    ui/                # primitives, Screen/Header/Footer, câu hỏi, wheel picker, ring/gauge
    home/              # hero scene, cards, navbar, store sheet
    icons/duotone.ts   # icon duotone xuất SVG từ Figma
    phone-frame.tsx    # khung iPhone + bảng chọn flow cho bản web
  store/app-store.ts   # state (zustand): hồ sơ, bữa ăn, nước, coin, streak, đồ của pet
  theme/tokens.ts      # token từ Redy Design System (màu, spacing, radius, typography, shadow, motion)
  theme/assets.ts      # danh sách ảnh xuất từ Figma
assets/redy/           # minh hoạ xuất từ Figma
scripts/figma-assets.* # xuất lại ảnh @2x/@3x từ Figma
```

## Ghi chú

- **Font**: headline dùng **SK Seren** (`assets/fonts`, khai báo trong `src/app/_layout.tsx`), nội dung dùng **Poppins**, khớp với text style trong Figma. Lưu ý license của SK Seren khi phát hành app.
- **Ảnh độ phân giải cao**: ảnh trong `assets/redy` đang ở mật độ 1x (đúng kích thước artboard). Để ảnh sắc nét trên màn hình Retina, tạo token Figma rồi chạy
  `FIGMA_TOKEN=figd_xxx npm run assets:hd`. Script sẽ tạo `@2x`/`@3x` cạnh file gốc và React Native tự chọn bản phù hợp.
- Camera và AI nhận diện món ăn đang được mô phỏng bằng ảnh trong design. Có thể nối `expo-camera` và API nhận diện thật sau.
