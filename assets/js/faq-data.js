/* ==========================================================================
   BỘ DỮ LIỆU FAQ HỌC TẬP & NỘI QUY LỚP 130251 - MÔN TRÍ TUỆ NHÂN TẠO
   Đề tài 25: Xây dựng Chatbot FAQ hỗ trợ sinh viên tra cứu thông tin học tập
   Sinh viên thực hiện: Nguyễn Thụy Ngọc Ánh - 13025001 - Lớp 130251
   Trường Đại học Sư phạm Kỹ thuật Hưng Yên (UTEHY)
   ========================================================================== */

window.FAQ_DATA = [
  // --- CHỦ ĐỀ 1: LỊCH THI & ĐÁNH GIÁ ---
  {
    id: "FAQ-001",
    category: "Lịch thi",
    intent: "exam_schedule",
    question: "Khi nào thi cuối kỳ môn Trí tuệ nhân tạo?",
    aliases: [
      "Bao giờ thi hết môn?",
      "Lịch thi kết thúc học phần TTNT",
      "Khi nào thi kết thúc môn trí tuệ nhân tạo?",
      "Lịch thi kthm",
      "Lịch thi ck"
    ],
    answer: "Theo kế hoạch đào tạo của khoa và nhà trường, lịch thi kết thúc học phần môn Trí tuệ nhân tạo dự kiến diễn ra vào <strong>tuần thứ 16</strong> của kỳ học (khoảng giữa tháng 12). Phòng thi, ca thi cụ thể sẽ được cập nhật trên cổng sinh viên UTEHY trước ngày thi 1 tuần.",
    keywords: ["thi cuối kỳ", "thi hết môn", "lịch thi", "kết thúc học phần", "kthp", "ck"]
  },
  {
    id: "FAQ-002",
    category: "Lịch thi",
    intent: "midterm_exam",
    question: "Môn Trí tuệ nhân tạo có kiểm tra giữa kỳ không?",
    aliases: [
      "Thi giữa kỳ môn TTNT như thế nào?",
      "Kiểm tra giữa kỳ vào tuần nào?",
      "Hình thức kiểm tra giữa kỳ TTNT",
      "Lịch kiểm tra gk"
    ],
    answer: "Môn Trí tuệ nhân tạo có 01 bài kiểm tra giữa kỳ vào <strong>tuần thứ 8 hoặc tuần thứ 9</strong> dưới hình thức bài thi trắc nghiệm kết hợp tự luận trên máy tính (hoặc đánh giá tiến độ Báo cáo Bài tập lớn). Điểm giữa kỳ chiếm trọng số 30% tổng điểm môn học.",
    keywords: ["kiểm tra giữa kỳ", "thi giữa kỳ", "gk", "giữa kỳ", "hình thức thi"]
  },
  {
    id: "FAQ-003",
    category: "Quy chế & Điểm danh",
    intent: "attendance_rule",
    question: "Vắng mấy buổi thì bị cấm thi?",
    aliases: [
      "Nghỉ học bao nhiêu phần trăm thì bị học lại?",
      "Điều kiện được dự thi kết thúc học phần?",
      "Nghỉ quá bao nhiêu tiết thì cấm thi?",
      "Vắng học có bị cấm thi không"
    ],
    answer: "Theo Quy chế đào tạo UTEHY (QĐ 1555/QĐ-ĐHCNKTHY), sinh viên <strong>nghỉ quá 20% tổng số tiết</strong> lý thuyết/thực hành của môn học (tương đương nghỉ quá 3 buổi đối với học phần 3 tín chỉ) sẽ <strong>bị cấm thi</strong> và nhận điểm 0 học phần (phải đăng ký học lại).",
    keywords: ["cấm thi", "vắng", "nghỉ học", "điểm danh", "20%", "học lại"]
  },
  {
    id: "FAQ-004",
    category: "Bài tập lớn & Đồ án",
    intent: "assignment_deadline",
    question: "Hạn nộp bài tập lớn môn TTNT là khi nào?",
    aliases: [
      "Deadline project môn trí tuệ nhân tạo?",
      "Hạn chót gửi báo cáo bài tập lớn?",
      "Khi nào phải nộp btl?",
      "Hạn nộp deadline btl"
    ],
    answer: "Hạn nộp toàn bộ Báo cáo và Source Code Bài tập lớn môn Trí tuệ nhân tạo lớp 130251 là trước <strong>23h59 ngày 15/11/2026</strong> qua hệ thống Google Classroom của lớp. Bài nộp muộn sẽ bị trừ 10% số điểm cho mỗi ngày trễ hạn.",
    keywords: ["hạn nộp", "bài tập lớn", "deadline", "project", "btl", "source code", "báo cáo"]
  },
  {
    id: "FAQ-005",
    category: "Bài tập lớn & Đồ án",
    intent: "assignment_format",
    question: "Quy định định dạng và hình thức nộp Bài tập lớn môn TTNT?",
    aliases: [
      "Bài tập lớn nộp gồm những file gì?",
      "Quy cách viết báo cáo BTL TTNT?",
      "Mẫu bìa báo cáo bài tập lớn?",
      "Nộp project gồm những gì"
    ],
    answer: "Hồ sơ nộp BTL bao gồm: 1 file Báo cáo định dạng Word/PDF chuẩn theo mẫu Đề cương của Khoa Sư phạm Kỹ thuật, 1 thư mục chứa mã nguồn (Python/Jupyter Notebook) kèm file README hướng dẫn chạy, và slide thuyết trình. Đóng gói dạng ZIP đặt tên: <code>Nhom_XX_DeTai_YY.zip</code>.",
    keywords: ["mẫu bìa", "định dạng", "format", "hồ sơ nộp", "báo cáo btl", "chuẩn nộp"]
  },

  // --- CHỦ ĐỀ 2: ĐIỂM SỐ & TRỌNG SỐ ---
  {
    id: "FAQ-006",
    category: "Điểm số & Học vụ",
    intent: "grading_formula",
    question: "Công thức tính điểm môn Trí tuệ nhân tạo như thế nào?",
    aliases: [
      "Trọng số điểm môn TTNT tính ra sao?",
      "Cách tính điểm tổng kết môn học?",
      "Điểm chuyên cần, giữa kỳ, cuối kỳ chiếm bao nhiêu %?"
    ],
    answer: "Điểm học phần = <strong>(Điểm chuyên cần x 10%) + (Điểm giữa kỳ / BTL x 30%) + (Điểm thi kết thúc học phần x 60%)</strong>. Sinh viên cần đạt điểm thi cuối kỳ từ 4.0 trở lên (thang điểm 10) và điểm tổng kết học phần từ 4.0 trở lên (tương đương điểm D) để qua môn.",
    keywords: ["công thức tính điểm", "trọng số", "tính điểm", "tổng kết", "chuyên cần", "thang điểm"]
  },
  {
    id: "FAQ-007",
    category: "Điểm số & Học vụ",
    intent: "exam_retake",
    question: "Bị điểm F thì đăng ký học lại hay thi lại như thế nào?",
    aliases: [
      "Quy định thi lại học lại trường UTEHY",
      "Bao giờ có đợt đăng ký học lại học cải thiện?",
      "Cách đăng ký học lại tại UTEHY"
    ],
    answer: "Học phần bị điểm F không tổ chức thi lại mà sinh viên phải đăng ký học lại vào học kỳ tiếp theo hoặc kỳ hè. Theo dõi các thông báo 'Đăng ký học lại, học cải thiện' trên cổng <em>qldaotao.utehy.edu.vn</em> đầu mỗi kỳ (thường có 2-3 đợt/học kỳ) để chọn lớp và nộp học phí theo hạn.",
    keywords: ["học lại", "thi lại", "học cải thiện", "điểm f", "đăng ký học lại", "rớt môn"]
  },

  // --- CHỦ ĐỀ 3: HỌC PHÍ & BIỂU MẪU ---
  {
    id: "FAQ-008",
    category: "Học phí & Thủ tục",
    intent: "tuition_fee",
    question: "Thời hạn nộp học phí học kỳ và cách thức nộp qua ngân hàng?",
    aliases: [
      "Nộp học phí UTEHY qua ngân hàng nào?",
      "Hạn nộp tiền học kỳ này là ngày nào?",
      "Số tài khoản nộp học phí UTEHY",
      "Đóng học phí online"
    ],
    answer: "Sinh viên nộp học phí trực tuyến bằng cách quét mã VNPAY-QR trên cổng thông tin sinh viên UTEHY hoặc chuyển khoản tới tài khoản Agribank/BIDV của Trường Đại học SPKT Hưng Yên. Cú pháp chuyển tiền: <code>[Mã SV] [Họ và tên] [Nộp học phí HK...]</code>. Hạn nộp thường kết thúc sau 4 tuần kể từ đầu kỳ học.",
    keywords: ["học phí", "nộp tiền", "ngân hàng", "vnpay", "tài khoản", "hạn nộp học phí"]
  },
  {
    id: "FAQ-009",
    category: "Học phí & Thủ tục",
    intent: "student_certificate",
    question: "Làm thế nào để xin Giấy xác nhận sinh viên hoặc bảng điểm?",
    aliases: [
      "Xin giấy xác nhận sinh viên để vay vốn / hoãn nghĩa vụ quân sự",
      "Thủ tục cấp bảng điểm tạm thời",
      "Xin giấy chứng nhận sv ở đâu?"
    ],
    answer: "Sinh viên đăng ký trực tuyến tại mục <strong>Dịch vụ hành chính một cửa</strong> trên trang <code>https://qldaotao.utehy.edu.vn/DichVu/Home</code> hoặc đến trực tiếp Phòng Quản lý Đào tạo (tại Cơ sở Khoái Châu, Mỹ Hào hoặc Hải Phòng). Thời gian xử lý từ 1 - 2 ngày làm việc.",
    keywords: ["giấy xác nhận", "chứng nhận sinh viên", "vay vốn", "nghĩa vụ quân sự", "bảng điểm", "dịch vụ sinh viên"]
  },

  // --- CHỦ ĐỀ 4: TÀI LIỆU & MÔI TRƯỜNG THỰC HÀNH ---
  {
    id: "FAQ-010",
    category: "Tài liệu & Công nghệ",
    intent: "course_materials",
    question: "Tài liệu học tập và slide bài giảng môn TTNT lấy ở đâu?",
    aliases: [
      "Sách giáo trình môn Trí tuệ nhân tạo?",
      "Slide bài giảng của giảng viên tải ở đâu?",
      "Tài liệu tham khảo AI UTEHY"
    ],
    answer: "Toàn bộ bài giảng slide (PDF), code mẫu thực hành (Jupyter Notebooks) và đề cương học phần được giảng viên phụ trách tải lên Google Drive / Google Classroom của lớp 130251. Giáo trình chính là: <em>'Giáo trình Trí tuệ nhân tạo' - ĐH Bách Khoa HN</em> và bài giảng điện tử của Khoa Sư phạm Kỹ thuật UTEHY.",
    keywords: ["tài liệu", "slide", "giáo trình", "bài giảng", "sách", "drive", "classroom"]
  },
  {
    id: "FAQ-011",
    category: "Tài liệu & Công nghệ",
    intent: "dev_environment",
    question: "Cần cài đặt phần mềm và thư viện nào để thực hành môn TTNT?",
    aliases: [
      "Môi trường code bài tập môn Trí tuệ nhân tạo?",
      "Cài Python phiên bản nào?",
      "Thư viện AI cần dùng gồm những gì?"
    ],
    answer: "Đề tài môn học sử dụng môi trường <strong>Python 3.10+</strong> (hoặc Google Colab/Anaconda). Các thư viện cần thiết gồm: <code>numpy</code>, <code>scikit-learn</code>, <code>pyvi</code> (xử lý tiếng Việt), <code>sentence-transformers</code> (nếu làm embedding), và <code>fastapi</code> / HTML-CSS-JS để thiết kế giao diện demo.",
    keywords: ["cài đặt", "phần mềm", "python", "môi trường", "thư viện", "anaconda", "colab", "pyvi"]
  },

  // --- CHỦ ĐỀ 5: THÔNG TIN LỚP HỌC & GIẢNG VIÊN ---
  {
    id: "FAQ-012",
    category: "Thông tin lớp học",
    intent: "class_info",
    question: "Thông tin về lớp 130251 và Giảng viên hướng dẫn đề tài 25?",
    aliases: [
      "Ai là giảng viên dạy môn TTNT?",
      "Lớp trưởng lớp 130251 là ai?",
      "Cố vấn học tập lớp 130251?"
    ],
    answer: "Lớp học phần: <strong>130251</strong>, Khoa Sư phạm Kỹ thuật, Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Đề tài 25 'Xây dựng Chatbot FAQ hỗ trợ sinh viên tra cứu học tập' được thực hiện bởi sinh viên <strong>Nguyễn Thụy Ngọc Ánh (MSV: 13025001)</strong> dưới sự hướng dẫn chuyên môn của Giảng viên Bộ môn AI & Công nghệ Phần mềm.",
    keywords: ["giảng viên", "lớp 130251", "ngọc ánh", "13025001", "khoa sư phạm kỹ thuật", "đề tài 25"]
  },
  {
    id: "FAQ-013",
    category: "Thông tin lớp học",
    intent: "contact_teacher",
    question: "Làm thế nào để liên hệ và hỏi bài giảng viên khi gặp vấn đề khó?",
    aliases: [
      "Hỏi bài giảng viên qua kênh nào?",
      "Email giảng viên môn trí tuệ nhân tạo?",
      "Nhóm Zalo lớp học phần TTNT ở đâu?"
    ],
    answer: "Sinh viên có thể nhắn tin trực tiếp trong nhóm Zalo chính thức của lớp học phần 130251, gửi email tới địa chỉ hòm thư nội bộ của giảng viên (đuôi @utehy.edu.vn) hoặc gặp trực tiếp vào giờ trao đổi chuyên môn tại Văn phòng Khoa Sư phạm Kỹ thuật (Tầng 3 Nhà A1).",
    keywords: ["liên hệ", "hỏi bài", "email giảng viên", "zalo", "văn phòng khoa"]
  },
  {
    id: "FAQ-014",
    category: "Quy chế & Điểm danh",
    intent: "graduation_rule",
    question: "Điều kiện chuẩn đầu ra ngoại ngữ và tin học để tốt nghiệp UTEHY?",
    aliases: [
      "Chuẩn đầu ra tiếng Anh UTEHY là bao nhiêu?",
      "Chứng chỉ tin học bắt buộc ra trường?",
      "Quy chế xét tốt nghiệp đại học UTEHY"
    ],
    answer: "Theo Quy chế đào tạo đại học UTEHY, sinh viên đại học chính quy cần đạt: Chuẩn Tiếng Anh B1 (tương đương TOEIC 450+ hoặc VSTEP bậc 3) và Chứng chỉ Ứng dụng Công nghệ thông tin cơ bản. Ngoài ra cần tích lũy đủ số tín chỉ quy định và điểm trung bình tích lũy (CPA) từ 2.00/4.00 trở lên.",
    keywords: ["chuẩn đầu ra", "tiếng anh", "b1", "toeic", "tin học", "tốt nghiệp", "cpa"]
  },
  {
    id: "FAQ-015",
    category: "Bài tập lớn & Đồ án",
    intent: "project_criteria",
    question: "Tiêu chí chấm điểm Bài tập lớn môn Trí tuệ nhân tạo gồm những gì?",
    aliases: [
      "Thang điểm chấm BTL TTNT?",
      "Giảng viên chấm đồ án theo tiêu chí nào?",
      "Tiêu chuẩn đánh giá bài tập lớn"
    ],
    answer: "Thang điểm 10 được đánh giá theo 4 tiêu chí: <strong>1. Báo cáo (30%)</strong>: Đúng bố cục, logic, tài liệu trích dẫn chuẩn; <strong>2. Mã nguồn & Demo (40%)</strong>: Chạy ổn định, ứng dụng đúng thuật toán AI, xử lý ngoại lệ tốt; <strong>3. Trả lời vấn đáp (20%)</strong>: Nắm chắc bản chất mô hình; <strong>4. Tinh thần làm việc nhóm (10%)</strong>: Đóng góp đồng đều.",
    keywords: ["tiêu chí chấm điểm", "thang điểm", "đánh giá btl", "vấn đáp", "báo cáo đồ án"]
  }
];

// Từ điển từ viết tắt / từ lóng sinh viên UTEHY thường dùng
window.VIETNAMESE_STUDENT_SLANG = {
  "sv": "sinh viên",
  "gv": "giảng viên",
  "gvhd": "giảng viên hướng dẫn",
  "cvht": "cố vấn học tập",
  "btl": "bài tập lớn",
  "bt": "bài tập",
  "tl": "tài liệu",
  "kthp": "kết thúc học phần",
  "kthm": "kết thúc môn",
  "ck": "cuối kỳ",
  "gk": "giữa kỳ",
  "hp": "học phí",
  "tc": "tín chỉ",
  "dk": "đăng ký",
  "dkmh": "đăng ký môn học",
  "lich": "lịch",
  "dc": "được",
  "ko": "không",
  "k": "không",
  "khong": "không",
  "cg": "cái gì",
  "thpt": "trung học phổ thông",
  "dh": "đại học",
  "utehy": "đại học sư phạm kỹ thuật hưng yên",
  "spkt": "sư phạm kỹ thuật",
  "ttnt": "trí tuệ nhân tạo",
  "ai": "trí tuệ nhân tạo"
};
