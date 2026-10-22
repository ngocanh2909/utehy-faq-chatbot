/* ==========================================================================
   APP CONTROLLER - UTEHY FAQ CHATBOT & PORTAL
   Quản lý giao diện, sự kiện tương tác người dùng, chat, tìm kiếm và quản trị.
   ========================================================================== */

(function () {
  "use strict";

  // Trạng thái ứng dụng
  const state = {
    currentTab: "chat",
    currentEngine: "C", // Mặc định là Phương pháp C (Semantic Embedding) - tối ưu nhất theo báo cáo
    chatHistory: [],
    speechRecognition: null,
    isListening: false,
    selectedArticle: null
  };

  // Khởi tạo khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEngine();
    initNavigation();
    initChatInterface();
    initPortalExplorer();
    initBenchmarkView();
    initAdminDashboard();
    initSpeechRecognition();

    // Lời chào mở đầu từ Chatbot
    sendBotGreeting();
  });

  // =========================================================================
  // 1. THEME & GIAO DIỆN SÁNG / TỐI
  // =========================================================================
  function initTheme() {
    const themeBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("UTEHY_THEME") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") || "dark";
        const next = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("UTEHY_THEME", next);
        updateThemeIcon(next);
      });
    }
  }

  function updateThemeIcon(theme) {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (!themeBtn) return;
    themeBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    themeBtn.setAttribute("title", theme === "dark" ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối");
  }

  // =========================================================================
  // 2. KHỞI TẠO CƠ CHẾ NLP & TÌM KIẾM
  // =========================================================================
  function initEngine() {
    if (window.NLPEngine) {
      window.NLPEngine.init();
    }
  }

  // =========================================================================
  // 3. ĐIỀU HƯỚNG TABS
  // =========================================================================
  function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabTarget = btn.getAttribute("data-tab");
        switchTab(tabTarget);
      });
    });
  }

  function switchTab(tabId) {
    state.currentTab = tabId;

    // Cập nhật nút active
    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });

    // Cập nhật tab-pane active
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });

    // Tự động refresh dữ liệu tương ứng nếu cần
    if (tabId === "portal") {
      renderPortalArticles();
    } else if (tabId === "admin") {
      renderAdminFAQList();
    }
  }

  // =========================================================================
  // 4. CHATBOT INTERFACE & TƯƠNG TÁC HỎI ĐÁP
  // =========================================================================
  function initChatInterface() {
    const sendBtn = document.getElementById("sendMsgBtn");
    const chatInput = document.getElementById("chatInput");
    const engineOptions = document.querySelectorAll(".engine-option");

    // Chọn Engine thuật toán (A, B, C, D, E)
    engineOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        engineOptions.forEach((o) => o.classList.remove("active"));
        opt.classList.add("active");
        state.currentEngine = opt.getAttribute("data-engine");
        updateEngineBadge();
      });
    });

    // Gửi tin nhắn qua nút gửi hoặc phím Enter
    if (sendBtn && chatInput) {
      sendBtn.addEventListener("click", () => handleUserSendMessage());
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleUserSendMessage();
        }
      });
    }

    // Câu hỏi gợi ý nhanh ở sidebar
    document.querySelectorAll(".chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-query") || chip.textContent.trim();
        if (chatInput) {
          chatInput.value = q;
          handleUserSendMessage();
        }
      });
    });

    // Nút xóa lịch sử chat
    const clearChatBtn = document.getElementById("clearChatBtn");
    if (clearChatBtn) {
      clearChatBtn.addEventListener("click", () => {
        const msgContainer = document.getElementById("chatMessages");
        if (msgContainer) {
          msgContainer.innerHTML = "";
          sendBotGreeting();
        }
      });
    }
  }

  function updateEngineBadge() {
    const badge = document.getElementById("activeEngineBadge");
    if (!badge) return;
    const names = {
      A: "Phương pháp A: Rule-based (Regex/Từ khóa)",
      B: "Phương pháp B: TF-IDF & BM25",
      C: "Phương pháp C: Semantic Embedding (Tối ưu)",
      D: "Phương pháp D: Intent Classification",
      E: "Phương pháp E: LLM + RAG (qldaotao.utehy.edu.vn)"
    };
    badge.innerHTML = `⚡ ${names[state.currentEngine] || state.currentEngine}`;
  }

  function sendBotGreeting() {
    const welcomeHtml = `
      Chào bạn! Tôi là <strong>Chatbot FAQ UTEHY</strong> (Đề tài nghiên cứu số 25 - Học phần Trí tuệ nhân tạo, Lớp 130251).<br><br>
      Tôi được tích hợp sẵn <strong>2 nguồn tri thức</strong>:<br>
      1. 📚 <strong>FAQ nội bộ môn học:</strong> Lịch thi, hạn nộp BTL, điểm danh, công thức điểm, slide bài giảng.<br>
      2. 🌐 <strong>Cổng đào tạo UTEHY:</strong> Trực tiếp tra cứu 205 thông báo, quyết định học lại, học phí và quy chế từ <code>qldaotao.utehy.edu.vn</code>.<br><br>
      <em>Bạn có thể chọn 1 trong 5 mô hình AI ở bảng bên trái hoặc gõ câu hỏi ngay bên dưới!</em>
    `;
    appendBotMessage(welcomeHtml, {
      method: "Hệ thống",
      confidence: 1.0,
      latency: "0.00"
    });
  }

  function handleUserSendMessage() {
    const chatInput = document.getElementById("chatInput");
    if (!chatInput) return;
    const query = chatInput.value.trim();
    if (!query) return;

    // 1. Hiển thị tin nhắn người dùng
    appendUserMessage(query);
    chatInput.value = "";
    chatInput.focus();

    // 2. Hiển thị trạng thái bot đang suy nghĩ
    const typingId = showTypingIndicator();

    // 3. Gọi NLPEngine thực thi theo phương pháp được chọn
    setTimeout(() => {
      removeTypingIndicator(typingId);
      processQuery(query);
    }, 280);
  }

  function processQuery(query) {
    let result = null;
    const engine = window.NLPEngine;

    switch (state.currentEngine) {
      case "A":
        result = engine.searchMethodA(query);
        break;
      case "B":
        result = engine.searchMethodB(query);
        break;
      case "D":
        result = engine.searchMethodD(query);
        break;
      case "E":
        result = engine.searchMethodE(query);
        break;
      case "C":
      default:
        result = engine.searchMethodC(query);
        break;
    }

    // Định dạng câu trả lời gửi về giao diện
    let answerHtml = "";
    let suggestions = [];

    if (state.currentEngine === "E") {
      answerHtml = result.generatedAnswer;
    } else if (result.match) {
      answerHtml = `<strong>[${result.match.category}] ${result.match.question}</strong><br><br>${result.match.answer}`;

      // Gợi ý top 3 câu hỏi liên quan theo báo cáo Chương 5
      if (result.top3 && result.top3.length > 0) {
        suggestions = result.top3
          .filter((item) => item.id !== result.match.id)
          .slice(0, 3)
          .map((item) => item.question);
      }
    } else {
      // Trường hợp dưới ngưỡng tin cậy (Out-of-Scope)
      answerHtml = `
        <div style="color: #fbbf24;">
          ⚠️ <strong>Không tìm thấy câu trả lời chính xác với ngưỡng tin cậy hiện tại (${result.confidence}).</strong>
        </div>
        <p class="mt-2">Câu hỏi của bạn có thể nằm ngoài dữ liệu môn học hoặc diễn đạt chưa rõ. Bạn có thể:</p>
        <ul style="padding-left: 1.2rem; margin-top: 0.4rem; font-size: 0.85rem;">
          <li>Chuyển sang <strong>Phương pháp E (LLM + RAG)</strong> để quét trên toàn bộ Cổng Đào Tạo UTEHY.</li>
          <li>Xem mục <strong>Cổng Đào Tạo UTEHY</strong> trên thanh menu để tìm thông báo trực tiếp.</li>
          <li>Liên hệ trực tiếp Giảng viên phụ trách lớp 130251 qua nhóm Zalo của lớp.</li>
        </ul>
      `;
    }

    appendBotMessage(answerHtml, {
      method: result.method,
      confidence: result.confidence,
      latency: result.latencyMs,
      suggestions: suggestions
    });
  }

  function appendUserMessage(text) {
    const msgContainer = document.getElementById("chatMessages");
    if (!msgContainer) return;

    const row = document.createElement("div");
    row.className = "message-row user";
    row.innerHTML = `
      <div class="msg-avatar">👤</div>
      <div class="msg-content">
        <div class="msg-bubble">${escapeHtml(text)}</div>
        <div class="msg-meta">
          <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    `;
    msgContainer.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(htmlContent, meta = {}) {
    const msgContainer = document.getElementById("chatMessages");
    if (!msgContainer) return;

    const row = document.createElement("div");
    row.className = "message-row bot";

    let suggestionsHtml = "";
    if (meta.suggestions && meta.suggestions.length > 0) {
      suggestionsHtml = `
        <div class="msg-suggestions">
          <small class="text-muted" style="width: 100%; display: block; font-size: 0.72rem;">💡 Gợi ý câu hỏi liên quan:</small>
          ${meta.suggestions
            .map((s) => `<button class="suggestion-chip" data-query="${escapeHtml(s)}">${escapeHtml(s)}</button>`)
            .join("")}
        </div>
      `;
    }

    row.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-content">
        <div class="msg-bubble">${htmlContent}</div>
        ${suggestionsHtml}
        <div class="msg-meta">
          <span class="method-tag">${meta.method || "AI"}</span>
          <span class="confidence-tag">Độ tin cậy: ${(meta.confidence * 100).toFixed(1)}%</span>
          <span>⚡ ${meta.latency || 0}ms</span>
        </div>
      </div>
    `;

    msgContainer.appendChild(row);

    // Bắt sự kiện click vào gợi ý
    row.querySelectorAll(".suggestion-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chatInput = document.getElementById("chatInput");
        if (chatInput) {
          chatInput.value = btn.getAttribute("data-query");
          handleUserSendMessage();
        }
      });
    });

    scrollToBottom();
  }

  function showTypingIndicator() {
    const msgContainer = document.getElementById("chatMessages");
    if (!msgContainer) return null;
    const id = "typing-" + Date.now();
    const row = document.createElement("div");
    row.id = id;
    row.className = "message-row bot";
    row.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-content">
        <div class="msg-bubble" style="color: var(--text-muted); font-style: italic;">
          Đang truy xuất tri thức và phân tích ngữ nghĩa...
        </div>
      </div>
    `;
    msgContainer.appendChild(row);
    scrollToBottom();
    return id;
  }

  function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    const msgContainer = document.getElementById("chatMessages");
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  // =========================================================================
  // 5. WEB SPEECH API (NHẬN DIỆN GIỌNG NÓI TIẾNG VIỆT)
  // =========================================================================
  function initSpeechRecognition() {
    const micBtn = document.getElementById("micBtn");
    const chatInput = document.getElementById("chatInput");
    if (!micBtn || !chatInput) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      micBtn.style.display = "none";
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "vi-VN";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      state.isListening = true;
      micBtn.classList.add("listening");
      micBtn.setAttribute("title", "Đang nghe... hãy nói câu hỏi của bạn");
    };

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      chatInput.value = transcript;
      handleUserSendMessage();
    };

    rec.onerror = () => {
      state.isListening = false;
      micBtn.classList.remove("listening");
    };

    rec.onend = () => {
      state.isListening = false;
      micBtn.classList.remove("listening");
      micBtn.setAttribute("title", "Nói để tìm kiếm bằng giọng nói");
    };

    micBtn.addEventListener("click", () => {
      if (state.isListening) {
        rec.stop();
      } else {
        try {
          rec.start();
        } catch (err) {
          console.warn(err);
        }
      }
    });
  }

  // =========================================================================
  // 6. CỔNG ĐÀO TẠO UTEHY (PORTAL EXPLORER)
  // =========================================================================
  function initPortalExplorer() {
    const searchInput = document.getElementById("portalSearchInput");
    const catSelect = document.getElementById("portalCategorySelect");

    if (searchInput) {
      searchInput.addEventListener("input", debounce(() => renderPortalArticles(), 250));
    }
    if (catSelect) {
      catSelect.addEventListener("change", () => renderPortalArticles());
    }

    // Modal đóng/mở
    const modalClose = document.getElementById("modalCloseBtn");
    const modalOverlay = document.getElementById("articleModalOverlay");
    if (modalClose && modalOverlay) {
      modalClose.addEventListener("click", () => modalOverlay.classList.remove("active"));
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove("active");
      });
    }
  }

  function renderPortalArticles() {
    const container = document.getElementById("portalArticlesGrid");
    const statsBar = document.getElementById("portalStatsBar");
    const searchInput = document.getElementById("portalSearchInput");
    const catSelect = document.getElementById("portalCategorySelect");
    if (!container) return;

    const query = searchInput ? searchInput.value.trim() : "";
    const cat = catSelect ? catSelect.value : "all";

    const articles = window.NLPEngine ? window.NLPEngine.searchPortal(query, cat) : [];

    if (statsBar) {
      statsBar.innerHTML = `
        <span>Tìm thấy <strong>${articles.length}</strong> bài viết thông báo/quy chế từ Cổng UTEHY</span>
        <span>Nguồn: <code>https://qldaotao.utehy.edu.vn/</code></span>
      `;
    }

    if (articles.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          🔍 Không tìm thấy thông báo hoặc quy chế nào phù hợp với từ khóa "${escapeHtml(query)}".
        </div>
      `;
      return;
    }

    container.innerHTML = articles
      .map((art) => {
        const attCount = (art.attachments || []).length;
        const excerpt = art.content ? art.content.slice(0, 140) + "..." : "Xem chi tiết văn bản và quyết định đính kèm...";
        return `
          <div class="article-card" data-id="${art.id}">
            <div>
              <div class="art-badge-row">
                <span class="art-category-badge">${escapeHtml(art.category || (art.sections && art.sections[0]) || "Thông báo")}</span>
                <span class="art-date">📅 ${art.date || "Mới"}</span>
              </div>
              <h3 class="art-title mt-2">${escapeHtml(art.title)}</h3>
              <p class="art-excerpt mt-1">${escapeHtml(excerpt)}</p>
            </div>
            <div class="art-footer">
              <span class="attachment-count">${attCount > 0 ? `📎 ${attCount} file đính kèm` : "📄 Văn bản"}</span>
              <span class="read-more-btn">Xem chi tiết &rarr;</span>
            </div>
          </div>
        `;
      })
      .join("");

    // Sự kiện mở modal xem bài viết
    container.querySelectorAll(".article-card").forEach((card) => {
      card.addEventListener("click", () => {
        const aid = parseInt(card.getAttribute("data-id"), 10);
        openArticleModal(aid);
      });
    });
  }

  function openArticleModal(aid) {
    const modalOverlay = document.getElementById("articleModalOverlay");
    const modalTitle = document.getElementById("modalArticleTitle");
    const modalBody = document.getElementById("modalArticleBody");
    const modalLink = document.getElementById("modalArticleOriginalLink");
    if (!modalOverlay || !modalTitle || !modalBody) return;

    const allArts = window.UTEHY_SNAPSHOT ? window.UTEHY_SNAPSHOT.articles : [];
    const art = allArts.find((a) => a.id === aid);
    if (!art) return;

    modalTitle.textContent = art.title;

    let attachHtml = "";
    if (art.attachments && art.attachments.length > 0) {
      attachHtml = `
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <strong style="color: #38bdf8;">📎 Văn bản / Quyết định đính kèm (PDF/Word):</strong>
          <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${art.attachments
              .map(
                (att) => `
                <a href="${att.url}" target="_blank" rel="noopener noreferrer" class="badge-link">
                  📥 ${escapeHtml(att.name || "Tải tài liệu")}
                </a>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div style="display: flex; gap: 1.5rem; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
        <span>📅 Ngày đăng: <strong style="color: var(--text-main);">${art.date || "Chưa rõ"}</strong></span>
        <span>👤 Người đăng: <strong style="color: var(--text-main);">${escapeHtml(art.author || "Phòng Đào Tạo UTEHY")}</strong></span>
        <span>🏷️ Chuyên mục: <strong style="color: var(--text-main);">${escapeHtml(art.category || "Thông báo")}</strong></span>
      </div>
      <div style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.7;">
        ${escapeHtml(art.content || "Nội dung đang được cập nhật...")}
      </div>
      ${attachHtml}
    `;

    if (modalLink) {
      modalLink.href = art.url;
    }

    modalOverlay.classList.add("active");
  }

  // =========================================================================
  // 7. BÁO CÁO NGHIÊN CỨU & SO SÁNH 5 PHƯƠNG PHÁP
  // =========================================================================
  function initBenchmarkView() {
    // Tự động kiểm tra và cập nhật các chỉ số tổng hợp
    const btnRunAll = document.getElementById("btnRunBenchmarkTest");
    if (btnRunAll) {
      btnRunAll.addEventListener("click", () => {
        alert("Hệ thống đã nạp sẵn toàn bộ kết quả thực nghiệm 5 phương pháp trên 120 câu hỏi kiểm thử lớp 130251 theo Bảng 4.3 trong Báo cáo Đề tài 25.");
      });
    }
  }

  // =========================================================================
  // 8. DASHBOARD QUẢN TRỊ FAQ (THEO YÊU CẦU CHƯƠNG 5)
  // =========================================================================
  function initAdminDashboard() {
    const addBtn = document.getElementById("btnAddFaq");
    const resetBtn = document.getElementById("btnResetFaq");
    const exportBtn = document.getElementById("btnExportFaq");

    if (addBtn) {
      addBtn.addEventListener("click", () => handleAddNewFAQ());
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn khôi phục về bộ FAQ mặc định ban đầu?")) {
          localStorage.removeItem("UTEHY_CUSTOM_FAQS");
          window.NLPEngine.init();
          renderAdminFAQList();
          alert("Đã khôi phục thành công!");
        }
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.NLPEngine.faqList, null, 2));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = `FAQ_UTEHY_130251_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      });
    }
  }

  function handleAddNewFAQ() {
    const qInput = document.getElementById("faqQuestionInput");
    const aInput = document.getElementById("faqAnswerInput");
    const catInput = document.getElementById("faqCatInput");
    const kwInput = document.getElementById("faqKeywordsInput");

    if (!qInput || !aInput) return;
    const q = qInput.value.trim();
    const a = aInput.value.trim();
    const cat = catInput ? catInput.value : "Chung";
    const kw = kwInput ? kwInput.value.split(",").map((s) => s.trim()).filter(Boolean) : [];

    if (!q || !a) {
      alert("Vui lòng điền đầy đủ Câu hỏi và Câu trả lời.");
      return;
    }

    const newFaq = {
      id: "CUSTOM-" + Date.now().toString().slice(-4),
      category: cat,
      intent: "custom_intent_" + Date.now().toString().slice(-4),
      question: q,
      aliases: [q],
      answer: a,
      keywords: kw
    };

    let customList = [];
    try {
      customList = JSON.parse(localStorage.getItem("UTEHY_CUSTOM_FAQS") || "[]");
    } catch (e) {
      customList = [];
    }

    customList.push(newFaq);
    localStorage.setItem("UTEHY_CUSTOM_FAQS", JSON.stringify(customList));

    // Cập nhật lại NLPEngine
    window.NLPEngine.init();

    // Reset form
    qInput.value = "";
    aInput.value = "";
    if (kwInput) kwInput.value = "";

    renderAdminFAQList();
    alert("Thêm câu hỏi FAQ mới thành công!");
  }

  function renderAdminFAQList() {
    const container = document.getElementById("adminFaqListContainer");
    if (!container) return;

    const list = window.NLPEngine ? window.NLPEngine.faqList : [];
    container.innerHTML = list
      .map(
        (item) => `
        <div class="faq-list-item" data-id="${item.id}">
          <div class="faq-item-info">
            <span class="badge-tag" style="background: var(--primary-light); color: #38bdf8; font-weight: 600;">${escapeHtml(item.category)}</span>
            <h4 class="mt-1">${escapeHtml(item.question)}</h4>
            <p>${item.answer.replace(/<[^>]+>/g, "").slice(0, 110)}...</p>
          </div>
          <div class="faq-item-actions">
            ${
              item.id.startsWith("CUSTOM-")
                ? `<button class="btn-danger-sm delete-faq-btn" data-id="${item.id}">Xóa</button>`
                : `<span class="badge-tag">Mặc định</span>`
            }
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll(".delete-faq-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Xóa câu hỏi tùy chỉnh này?")) {
          deleteCustomFaq(id);
        }
      });
    });
  }

  function deleteCustomFaq(id) {
    let customList = [];
    try {
      customList = JSON.parse(localStorage.getItem("UTEHY_CUSTOM_FAQS") || "[]");
    } catch (e) {
      customList = [];
    }
    customList = customList.filter((item) => item.id !== id);
    localStorage.setItem("UTEHY_CUSTOM_FAQS", JSON.stringify(customList));
    window.NLPEngine.init();
    renderAdminFAQList();
  }

  // =========================================================================
  // TIỆN ÍCH HỖ TRỢ
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
})();
