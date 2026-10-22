# Chatbot FAQ Hỗ Trợ Sinh Viên Tra Cứu Thông Tin Học Tập Trong Lớp
> **Báo cáo nghiên cứu Đề tài 25 - Học phần Trí tuệ nhân tạo**  
> **Khoa Sư phạm Kỹ thuật - Trường Đại học Sư phạm Kỹ thuật Hưng Yên (UTEHY)**  
> **Sinh viên thực hiện:** Nguyễn Thụy Ngọc Ánh - MSV: 13025001 - Lớp: 130251  

---

## 🌟 Giới Thiệu Đề Tài
Phần mềm Chatbot FAQ được thiết kế dựa trên cấu trúc báo cáo nghiên cứu **Đề tài 25**, giải quyết bài toán tra cứu thông tin học tập (lịch thi, hạn nộp bài tập lớn, quy chế cấm thi, học phí, slide bài giảng) và **tích hợp tìm kiếm trực tiếp dữ liệu chính thức từ Cổng Quản lý Đào tạo UTEHY ([https://qldaotao.utehy.edu.vn/](https://qldaotao.utehy.edu.vn/))**.

Toàn bộ ứng dụng chạy hoàn toàn **phía Client (HTML5, Vanilla CSS3, Javascript)**, không yêu cầu cài đặt backend hay trả phí API, tối ưu 100% để triển khai (deploy) trực tiếp lên **GitHub Pages**.

---

## 🚀 Các Tính Năng Nổi Bật

1. **Hỏi Đáp AI với 5 Phương Pháp Nghiên Cứu:**
   - **Phương pháp A (Rule-based / Regex):** So khớp từ khóa và tập luật 120 quy tắc.
   - **Phương pháp B (TF-IDF & BM25):** Truy xuất theo tần suất từ và thuật toán xếp hạng BM25.
   - **Phương pháp C (Semantic Embedding & Cosine Similarity - *Khuyên dùng*):** Đạt điểm đánh giá cao nhất trong báo cáo (**Top-1: 88.3%**, F1: 0.88, độ trễ < 0.2s).
   - **Phương pháp D (Intent Classification):** Phân loại ý định người dùng và trích xuất thực thể.
   - **Phương pháp E (LLM + RAG):** Truy xuất thông minh kết hợp dữ liệu toàn trường từ Cổng Đào Tạo UTEHY.
2. **Tích Hợp Dữ Liệu Cổng Đào Tạo UTEHY (`qldaotao.utehy.edu.vn`):**
   - Đã thu thập và lập chỉ mục **205 bài viết thông báo, kế hoạch giảng dạy, quy chế đào tạo Đại học/Thạc sĩ/Tiến sĩ**.
   - Hỗ trợ tải văn bản quyết định và file PDF đính kèm.
3. **Báo Cáo Nghiên Cứu & Benchmark Trực Quan:**
   - Trực quan hóa Bảng 4.2 (So sánh định tính), Bảng 4.3 (So sánh định lượng), Bảng 4.4 (Đánh giá theo trọng số) và Bảng 6.1 (Khảo sát 45 sinh viên lớp 130251).
4. **Dashboard Quản Trị FAQ (Chương 5 Báo Cáo):**
   - Thêm, sửa, xóa câu hỏi FAQ tùy chỉnh; lưu trữ cục bộ bằng `localStorage`; hỗ trợ xuất/nhập file JSON.
5. **Tiện Ích Trải Nghiệm:**
   - Tìm kiếm bằng giọng nói tiếng Việt (Web Speech API).
   - Tự động chuẩn hóa từ viết tắt của sinh viên (`sv`, `gv`, `btl`, `kthp`, `ck`, `gk`, `hp`...).
   - Chế độ giao diện Sáng / Tối (Dark / Light Theme).

---

## 📁 Cấu Trúc Thư Mục
```text
D:/FAQ/
├── index.html                   # Giao diện chính của ứng dụng
├── .nojekyll                    # Đảm bảo GitHub Pages nhận đầy đủ assets
├── README.md                    # Tài liệu hướng dẫn sử dụng và triển khai
├── crawl_utehy.py               # Script crawler thu thập dữ liệu từ qldaotao.utehy.edu.vn
├── server.py                    # Server proxy python dự phòng khi chạy localhost
├── Bao_cao_de_tai_25_Chatbot_FAQ.docx # Báo cáo đề tài gốc của sinh viên
└── assets/
    ├── css/
    │   └── style.css            # Stylesheet chuẩn Rich Aesthetics, Responsive
    └── js/
        ├── utehy-data.js        # Dữ liệu snapshot 205 thông báo/quy chế từ Cổng UTEHY
        ├── faq-data.js          # Kho FAQ học tập lớp 130251 & từ điển tiếng lóng sinh viên
        ├── nlp-engine.js        # Thuật toán xử lý ngôn ngữ tự nhiên & 5 mô hình AI
        └── app.js               # Logic điều khiển giao diện, chat và tìm kiếm
```

---

## 🌐 Hướng Dẫn Deploy Lên GitHub Pages (3 Bước)

### Bước 1: Khởi tạo Git repository trong thư mục `D:\FAQ`
Mở PowerShell hoặc Git Bash tại thư mục `D:\FAQ` và chạy các lệnh:
```bash
git init
git add .
git commit -m "Khoi tao Chatbot FAQ UTEHY - De tai 25"
```

### Bước 2: Tạo Repository trên GitHub và đẩy mã nguồn lên
1. Truy cập [https://github.com/new](https://github.com/new) tạo một repository mới (ví dụ: `utehy-faq-chatbot`).
2. Liên kết remote và đẩy code lên:
```bash
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/utehy-faq-chatbot.git
git branch -M main
git push -u origin main
```

### Bước 3: Bật GitHub Pages
1. Trên trang repository GitHub, vào mục **Settings** -> chọn tab **Pages** (ở cột bên trái).
2. Tại mục **Build and deployment** -> **Source**, chọn **Deploy from a branch**.
3. Tại mục **Branch**, chọn `main` và thư mục `/ (root)`, sau đó nhấn **Save**.
4. Chờ 1–2 phút, trang web của bạn sẽ hoạt động trực tiếp tại địa chỉ:
   ```text
   https://<tai-khoan-github-cua-ban>.github.io/utehy-faq-chatbot/
   ```

---

## 💻 Cách Chạy Thử Trên Máy Tính (Local)
Bạn có thể mở trực tiếp file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Cốc Cốc) mà không cần cài thêm phần mềm.

Hoặc nếu muốn chạy qua máy chủ cục bộ:
```bash
python server.py
```
Sau đó truy cập: `http://localhost:8000`

---
*Khoa Sư phạm Kỹ thuật - Trường Đại học Sư phạm Kỹ thuật Hưng Yên (UTEHY)*
