# Kỳ Đạo Tiên Duyên - Cờ Tướng Tu Tiên (Xiangqi Cultivation)

Trò chơi Cờ Tướng Tu Tiên kết hợp phong cách Tiên Hiệp (Tu Chân), đấu cờ với AI, thi đấu xếp hạng ELO, hệ thống Cảnh Giới, Tiên Các Shop, Pháp Tướng Thần Thông, Pháp Bảo Thượng Cổ, Danh Hiệu Độc Tôn và Bảng Quản Trị Viên (Admin Panel).

---

## ☁️ Hướng Dẫn Deploy Lên Cloudflare Pages (Miễn Phí, Tốc Độ Biên Cực Nhanh)

Cloudflare Pages là nền tảng máy chủ biên (Edge Network) hàng đầu thế giới, hoàn toàn miễn phí băng thông, chịu tải lớn và có tốc độ tải trang cực nhanh tại Việt Nam.

### Cách 1: Kết Nối GitHub Với Cloudflare Pages (Khuyên Dùng - Tự Động CI/CD)

#### Bước 1: Đẩy mã nguồn lên GitHub
1. Trên giao diện Google AI Studio, bạn có thể xuất mã nguồn bằng cách nhấn vào menu cài đặt (**Settings**) -> **Export to GitHub** (hoặc tải file **ZIP** về máy).
2. Nếu tải ZIP, giải nén và mở terminal tại thư mục dự án để đẩy lên GitHub:
```bash
git init
git add .
git commit -m "feat: Xiangqi Cultivation App"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

#### Bước 2: Tạo dự án trên Cloudflare Dashboard
1. Truy cập [dash.cloudflare.com](https://dash.cloudflare.com) và đăng nhập vào tài khoản Cloudflare của bạn.
2. Tại thanh điều hướng bên trái, chọn **Workers & Pages** -> bấm nút **Create application** (hoặc **Create**).
3. Chọn thẻ **Pages** -> chọn **Connect to Git**.
4. Cấp quyền truy cập GitHub, chọn repository chứa dự án cờ tướng của bạn và bấm **Begin setup**.

#### Bước 3: Cấu hình Build Settings trên Cloudflare Pages
Tại màn hình cài đặt:
- **Project name**: Đặt tên dự án (ví dụ: `ky-dao-tien-duyen`). Trang web sẽ có tên miền mặc định là `https://<ten-du-an>.pages.dev`.
- **Production branch**: `main`
- **Framework preset**: Chọn **None** (hoặc **Next.js (Static HTML Export)**)
- **Build command**: 
  ```bash
  npm run build
  ```
- **Build output directory**: 
  ```
  out
  ```
  *(⚠️ **LƯU Ý QUAN TRỌNG**: Dự án đã được cấu hình `output: 'export'` sẵn trong `next.config.ts`. Khi build, toàn bộ file trang web sẽ được tạo ra trong thư mục `out`. TUYỆT ĐỐI KHÔNG điền là `.next` vì trong `.next` có chứa file cache webpack `0.pack` nặng 39MB sẽ bị Cloudflare chặn lỗi > 25MB! Điền `out` là hoàn tất 100%!).*

#### Bước 4: Thiết lập Biến Môi Trường & Compatibility Flag
Nhấn vào mục **Environment variables (advanced)** và thêm:
- `NODE_VERSION` = `20`
- `GEMINI_API_KEY` = `<Khóa API Gemini của bạn>` *(nếu dùng tính năng AI tiên tri hoặc canh chỉnh khung viền)*

> 💡 **Lưu ý quan trọng về Runtime**:
> Sau khi tạo dự án xong, hãy vào mục **Settings** -> **Functions** -> **Compatibility Flags** -> thêm cờ `nodejs_compat` cho cả **Production** và **Preview** để kích hoạt đầy đủ thư viện Node.js trên Cloudflare Edge.

#### Bước 5: Hoàn tất & Nhận Link Public
- Bấm **Save and Deploy**. Cloudflare sẽ tự động tải mã nguồn, build và xuất bản trong vòng 1-2 phút.
- Bạn sẽ nhận được đường link công khai: 👉 `https://ky-dao-tien-duyen.pages.dev`

---

## 🚀 Hướng Dẫn Deploy Lên Render (Lựa Chọn Dự Phòng)

### Bước 1: Tải mã nguồn về máy hoặc đẩy lên GitHub
1. Trên giao diện Google AI Studio, bạn có thể xuất mã nguồn bằng cách nhấn vào menu cài đặt (Settings) -> **Export to GitHub** hoặc tải file **ZIP** về máy.
2. Nếu tải ZIP về máy, hãy giải nén và mở terminal tại thư mục dự án:
```bash
git init
git add .
git commit -m "feat: Kỳ Đạo Tiên Duyên Xiangqi Cultivation App"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

---

### Bước 2: Deploy Miễn Phí Lên Render (Web Service)

1. Đăng nhập vào [Render.com](https://render.com) (bằng tài khoản GitHub của bạn).
2. Nhấn nút **New +** ở góc trên bên phải và chọn **Web Service**.
3. Chọn Repository GitHub chứa dự án cờ tướng vừa tạo và bấm **Connect**.
4. Thiết lập các thông số triển khai như sau:
   - **Name**: `ky-dao-tien-duyen` (hoặc tên bạn tùy chọn)
   - **Region**: Singapore (hoặc Oregon / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: Để trống (mặc định là thư mục gốc)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Thiết lập Biến Môi Trường (**Environment Variables**):
   - Nhấn vào mục **Environment** hoặc **Advanced**:
   - Thêm biến:
     - `NODE_VERSION` = `20`
     - `PORT` = `3000` (hoặc Render sẽ tự động gán port tương thích)
     - `GEMINI_API_KEY` = *(Nếu bạn có dùng trợ lý thiên cơ / gợi ý nước cờ bằng AI Gemini)*
6. Nhấn nút **Create Web Service** ở cuối trang.
7. Render sẽ tự động kéo code từ GitHub, chạy build Next.js và cấp cho bạn một đường link công khai (ví dụ: `https://ky-dao-tien-duyen.onrender.com`).

---

## 🛠️ Chạy Thử Ở Môi Trường Local (Localhost)

```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại địa chỉ [http://localhost:3000](http://localhost:3000).

---

## ✨ Tính Năng Nổi Bật

- ♟️ **Bàn cờ Tướng Ngọc Bích (Imperial Jade Board)**: Bố cục chuẩn mực, chạm khắc ngọc cẩm thạch và viền gỗ óc chó hoàng gia.
- 📱 **Hỗ trợ cảm ứng đa điểm & Màn hình di động**: Tích hợp thao tác thu phóng pinch-to-zoom và các nút điều chỉnh tỉ lệ 85% - 160% giúp người chơi trên điện thoại và máy tính bảng không bị che khuất quân hay mất hiệu ứng kỹ năng.
- 🔮 **Pháp Tướng Thần Thông & Pháp Bảo Động (GIF / WebP)**: Hỗ trợ ảnh động tu tiên, vầng sáng hào quang và hiệu ứng kỹ năng chân thực.
- 🎖️ **Danh Hiệu Huy Hiệu Ảnh**: Admin có thể tải ảnh động / ảnh huy hiệu độc quyền để người chơi thọ nhận và sắc phong.
- 👑 **Bảng Quản Trị Admin**: Thêm và chỉnh sửa linh hoạt Khung Viền, Pháp Tướng, Pháp Bảo, Danh Hiệu, Đột Phá Cảnh Giới và ban thưởng Linh Thạch.
