# Kỳ Đạo Tiên Duyên - Cờ Tướng Tu Tiên (Xiangqi Cultivation)

Trò chơi Cờ Tướng Tu Tiên kết hợp phong cách Tiên Hiệp (Tu Chân), đấu cờ với AI, thi đấu xếp hạng ELO, hệ thống Cảnh Giới, Tiên Các Shop, Pháp Tướng Thần Thông, Pháp Bảo Thượng Cổ, Danh Hiệu Độc Tôn và Bảng Quản Trị Viên (Admin Panel).

---

## 🚀 Các Phương Thức Triển Khai (Deployment Guide)

Dự án **Tiên Kỳ Đạo (Xiangqi Cultivation)** hỗ trợ đầy đủ 3 phương án triển khai tùy theo nhu cầu hạ tầng của bạn:

---

### Phương Án 1: Deploy Lên Vercel (Khuyên Dùng Nhất Cho Next.js Full-Stack)
Vercel là nền tảng máy chủ chính chủ của Next.js, hỗ trợ tự động 100% cả giao diện Frontend lẫn Serverless API (`/api/gemini/align-frame`, `/api/multiplayer`, `/api/sync`):

1. Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Bấm **Add New...** -> **Project** -> Chọn repository `Xingqi`.
3. Vercel tự động nhận diện:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `next build` (hoặc `npm run build`)
   - **Output Directory**: `.next` (Vercel tự xử lý, không cần `out`)
4. Cấu hình biến môi trường (**Environment Variables**):
   - `GEMINI_API_KEY`: Điền API key Google AI của bạn (nếu dùng tính năng AI tiên tri hoặc canh chỉnh khung viền).
5. Bấm **Deploy**. Sau ~1 phút, bạn nhận được tên miền `https://<ten-du-an>.vercel.app`.

---

### Phương Án 2: Deploy Lên Cloudflare Pages (Miễn Phí CDN Toàn Cầu, Static HTML Export)
Dự án đã tích hợp cơ chế `Smart-Build` tự động. Khi phát hiện môi trường Cloudflare Pages (`CF_PAGES=1`), hệ thống sẽ tự động xuất bản toàn bộ trang web thành Static HTML vào thư mục `out`:

#### Các bước cài đặt trên Cloudflare Pages:
1. Truy cập [dash.cloudflare.com](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Chọn repository GitHub chứa dự án và bấm **Begin setup**.
3. Cấu hình Build Settings:
   - **Framework preset**: Chọn `Next.js (Static HTML Export)` (hoặc `None`)
   - **Build command**: `npm run build` (hoặc `npm run build:export`)
   - **Build output directory**: `out`
4. Cấu hình Environment Variables (Quan trọng):
   - `NODE_VERSION` = `20`
   - `GEMINI_API_KEY` = `<Khóa API Gemini của bạn>`
5. Bấm **Save and Deploy**. Cloudflare Pages sẽ biên dịch và xuất dữ liệu vào thư mục `out` thành công 100%!

*Lưu ý khi chạy Static trên Cloudflare Pages: Mọi tính năng chơi cờ tướng với người chơi cục bộ, chơi với Bot AI, hệ thống Cảnh Giới tu tiên, danh hiệu, âm thanh, pháp bảo và lưu trữ tài khoản đều hoạt động hoàn hảo và lưu trữ an toàn trong `localStorage` của trình duyệt.*

---

### Phương Án 3: Deploy Lên Render / Railway / VPS (Tối Ưu Cho Multiplayer SSE Dài Hạn)
Nếu bạn muốn máy chủ duy trì phòng chơi trực tiếp thời gian thực liên tục qua Server-Sent Events (SSE):
1. Đăng nhập [Render.com](https://render.com) -> **New +** -> **Web Service** -> Kết nối GitHub.
2. Thiết lập:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Node Version**: `>= 20.0.0`
3. Nhấn **Create Web Service**. Render sẽ chạy máy chủ Node.js trên cổng 3000, duy trì kết nối SSE và bộ nhớ phòng chơi liên tục.

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
