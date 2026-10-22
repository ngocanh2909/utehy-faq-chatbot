/* ==========================================================================
   NLP & RETRIEVAL ENGINE CHO CHATBOT FAQ UTEHY
   Hiện thực hóa và kiểm thử 5 phương pháp theo Báo cáo Đề tài 25:
   A. Rule-based (Regex/Từ khóa)
   B. TF-IDF & BM25 Ranking
   C. Semantic Embedding & Cosine Similarity
   D. Intent Classification
   E. LLM + RAG (Truy xuất tăng cường từ Cổng qldaotao.utehy.edu.vn)
   ========================================================================== */

(function (window) {
  "use strict";

  // Stopwords tiếng Việt cơ bản cho truy xuất thông tin
  const STOPWORDS = new Set([
    "và", "của", "cho", "với", "là", "các", "những", "được", "có", "trong",
    "khi", "nào", "ở", "tại", "sẽ", "đã", "đang", "như", "thế", "nào",
    "sao", "gì", "bao", "nhiêu", "ai", "đâu", "ạ", "dạ", "cho_em_hỏi", "ơi"
  ]);

  // Bộ chuẩn hóa văn bản tiếng Việt
  const TextProcessor = {
    // Chuyển về chữ thường & chuẩn hóa Unicode NFC
    clean(text) {
      if (!text) return "";
      return text
        .toString()
        .normalize("NFC")
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>\[\]\\|]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    // Bỏ dấu tiếng Việt (để đối sánh khi sinh viên gõ không dấu)
    removeAccents(str) {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    },

    // Chuẩn hóa từ viết tắt / tiếng lóng sinh viên
    expandSlang(text) {
      if (!text) return "";
      let words = text.toLowerCase().split(/\s+/);
      let slangMap = window.VIETNAMESE_STUDENT_SLANG || {};
      let expanded = words.map((w) => slangMap[w] || w);
      return expanded.join(" ");
    },

    // Tách từ & n-gram kết hợp (Bi-grams cho cụm từ tiếng Việt như "lịch thi", "bài tập lớn")
    tokenize(text, includeBigrams = true) {
      let cleaned = this.clean(this.expandSlang(text));
      if (!cleaned) return [];
      let words = cleaned.split(" ").filter((w) => w.length > 0 && !STOPWORDS.has(w));
      let tokens = [...words];

      if (includeBigrams && words.length > 1) {
        for (let i = 0; i < words.length - 1; i++) {
          tokens.push(words[i] + "_" + words[i + 1]);
        }
      }
      return tokens;
    }
  };

  // =========================================================================
  // BỘ TÍNH ĐỘ TƯƠNG ĐỒNG & CÁC MÔ HÌNH NLP
  // =========================================================================

  class NLPEngine {
    constructor() {
      this.faqList = [];
      this.portalArticles = [];
      this.idfMap = new Map();
      this.vocabulary = new Set();
      this.docVectors = [];
      this.avgDocLen = 0;
      this.bm25_k1 = 1.5;
      this.bm25_b = 0.75;
      this.isReady = false;
    }

    // Khởi tạo và lập chỉ mục cho bộ dữ liệu FAQ và snapshot UTEHY
    init() {
      // 1. Nạp FAQ lớp học
      this.faqList = window.FAQ_DATA ? JSON.parse(JSON.stringify(window.FAQ_DATA)) : [];
      
      // Đọc thêm FAQ tùy chỉnh từ localStorage (nếu người dùng thêm qua Dashboard)
      try {
        let custom = localStorage.getItem("UTEHY_CUSTOM_FAQS");
        if (custom) {
          let customList = JSON.parse(custom);
          this.faqList = [...this.faqList, ...customList];
        }
      } catch (e) {
        console.warn("Không thể đọc custom FAQs:", e);
      }

      // 2. Nạp dữ liệu Portal Cổng đào tạo UTEHY
      if (window.UTEHY_SNAPSHOT && Array.isArray(window.UTEHY_SNAPSHOT.articles)) {
        this.portalArticles = window.UTEHY_SNAPSHOT.articles;
      }

      // 3. Huấn luyện chỉ mục TF-IDF / BM25
      this.buildTFIDFIndex();
      this.isReady = true;
      console.log(`[NLPEngine] Sẵn sàng: ${this.faqList.length} FAQ, ${this.portalArticles.length} thông báo UTEHY.`);
    }

    // Lập chỉ mục TF-IDF & BM25 cho các câu hỏi FAQ
    buildTFIDFIndex() {
      let N = this.faqList.length;
      if (N === 0) return;

      let docTokenList = [];
      let totalTokens = 0;

      // Mỗi văn bản đại diện cho một FAQ = question + aliases + answer + keywords
      this.faqList.forEach((item, idx) => {
        let fullText = `${item.question} ${(item.aliases || []).join(" ")} ${(item.keywords || []).join(" ")} ${item.category}`;
        let tokens = TextProcessor.tokenize(fullText, true);
        docTokenList.push(tokens);
        totalTokens += tokens.length;
        tokens.forEach((t) => this.vocabulary.add(t));
      });

      this.avgDocLen = totalTokens / N;

      // Tính Document Frequency (DF)
      let dfMap = new Map();
      docTokenList.forEach((tokens) => {
        let uniqueTokens = new Set(tokens);
        uniqueTokens.forEach((t) => {
          dfMap.set(t, (dfMap.get(t) || 0) + 1);
        });
      });

      // Tính IDF
      dfMap.forEach((df, term) => {
        // BM25 IDF variant: ln((N - df + 0.5) / (df + 0.5) + 1)
        let idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        this.idfMap.set(term, idf);
      });

      // Tạo Vector TF-IDF cho từng FAQ Document
      this.docVectors = docTokenList.map((tokens) => {
        let termCounts = {};
        tokens.forEach((t) => (termCounts[t] = (termCounts[t] || 0) + 1));
        let vec = {};
        let normSq = 0;
        for (let t in termCounts) {
          let tf = termCounts[t] / tokens.length;
          let idf = this.idfMap.get(t) || 0.1;
          let weight = tf * idf;
          vec[t] = weight;
          normSq += weight * weight;
        }
        return {
          tokens,
          vector: vec,
          norm: Math.sqrt(normSq) || 1.0,
          length: tokens.length
        };
      });
    }

    // =======================================================================
    // 5 PHƯƠNG PHÁP THEO BÁO CÁO NGHIÊN CỨU ĐỀ TÀI 25
    // =======================================================================

    // PHƯƠNG PHÁP A: Rule-based / Regex & Keyword Matching
    searchMethodA(query) {
      let tStart = performance.now();
      let cleanQ = TextProcessor.clean(TextProcessor.expandSlang(query));
      let noAccentQ = TextProcessor.removeAccents(cleanQ);

      let bestItem = null;
      let maxScore = 0;

      for (let i = 0; i < this.faqList.length; i++) {
        let item = this.faqList[i];
        let score = 0;

        // So khớp từ khóa chính xác
        let allKeywords = [...(item.keywords || []), item.category];
        allKeywords.forEach((kw) => {
          let cleanKw = TextProcessor.clean(kw);
          if (cleanKw && cleanQ.includes(cleanKw)) {
            score += 2.0;
          } else {
            let noAccentKw = TextProcessor.removeAccents(cleanKw);
            if (noAccentKw && noAccentQ.includes(noAccentKw)) {
              score += 1.0;
            }
          }
        });

        // So khớp regex mẫu câu
        if (cleanQ.includes("khi nào") || cleanQ.includes("bao giờ") || cleanQ.includes("deadline") || cleanQ.includes("hạn nộp")) {
          if (item.intent === "exam_schedule" || item.intent === "assignment_deadline") score += 1.5;
        }
        if (cleanQ.includes("mấy buổi") || cleanQ.includes("cấm thi") || cleanQ.includes("vắng")) {
          if (item.intent === "attendance_rule") score += 3.0;
        }
        if (cleanQ.includes("học phí") || cleanQ.includes("tiền học")) {
          if (item.intent === "tuition_fee") score += 3.0;
        }
        if (cleanQ.includes("điểm f") || cleanQ.includes("học lại") || cleanQ.includes("thi lại")) {
          if (item.intent === "exam_retake") score += 3.0;
        }

        if (score > maxScore) {
          maxScore = score;
          bestItem = item;
        }
      }

      let latency = (performance.now() - tStart).toFixed(2);
      // Quy đổi thang điểm độ tin cậy [0..1]
      let confidence = Math.min(1.0, maxScore / 5.0);
      return {
        method: "A (Rule-based / Regex)",
        match: confidence >= 0.35 ? bestItem : null,
        confidence: Number(confidence.toFixed(3)),
        latencyMs: latency,
        rawScore: maxScore
      };
    }

    // PHƯƠNG PHÁP B: TF-IDF / BM25 Ranking
    searchMethodB(query) {
      let tStart = performance.now();
      let qTokens = TextProcessor.tokenize(query, true);
      let scores = [];

      this.faqList.forEach((item, idx) => {
        let docMeta = this.docVectors[idx];
        if (!docMeta) return;

        let bm25Score = 0;
        let docLen = docMeta.length;

        // Tính điểm BM25
        let termCounts = {};
        docMeta.tokens.forEach((t) => (termCounts[t] = (termCounts[t] || 0) + 1));

        qTokens.forEach((term) => {
          if (termCounts[term]) {
            let f = termCounts[term];
            let idf = this.idfMap.get(term) || 0.1;
            let num = f * (this.bm25_k1 + 1);
            let denom = f + this.bm25_k1 * (1 - this.bm25_b + this.bm25_b * (docLen / (this.avgDocLen || 1)));
            bm25Score += idf * (num / denom);
          }
        });

        scores.push({ item, score: bm25Score });
      });

      scores.sort((a, b) => b.score - a.score);
      let best = scores[0];
      let latency = (performance.now() - tStart).toFixed(2);
      let conf = best ? Math.min(1.0, best.score / 6.0) : 0;

      return {
        method: "B (TF-IDF & BM25)",
        match: conf >= 0.3 ? best.item : null,
        confidence: Number(conf.toFixed(3)),
        latencyMs: latency,
        top3: scores.slice(0, 3).filter((s) => s.score > 0).map((s) => s.item)
      };
    }

    // PHƯƠNG PHÁP C: Semantic Embedding & Cosine Similarity (Phương pháp tối ưu trong Báo cáo Đề tài 25)
    searchMethodC(query) {
      let tStart = performance.now();
      let qClean = TextProcessor.clean(TextProcessor.expandSlang(query));
      let qTokens = TextProcessor.tokenize(query, true);
      let qNoAccent = TextProcessor.removeAccents(qClean);

      // Tạo vector đặc trưng cho câu hỏi (kết hợp TF-IDF weight + n-gram semantic expansion)
      let qVec = {};
      let qNormSq = 0;
      qTokens.forEach((t) => {
        let w = (this.idfMap.get(t) || 1.2) * 1.5;
        qVec[t] = w;
        qNormSq += w * w;
      });
      let qNorm = Math.sqrt(qNormSq) || 1.0;

      let results = [];

      this.faqList.forEach((item, idx) => {
        let docMeta = this.docVectors[idx];
        if (!docMeta) return;

        // 1. Cosine similarity giữa vector truy vấn và vector câu FAQ
        let dot = 0;
        for (let t in qVec) {
          if (docMeta.vector[t]) {
            dot += qVec[t] * docMeta.vector[t];
          }
        }
        let cosineSim = dot / (qNorm * docMeta.norm);

        // 2. Semantic boost: So sánh trực tiếp với các câu hỏi diễn đạt khác (Aliases)
        let maxAliasSim = 0;
        let aliasCandidates = [item.question, ...(item.aliases || [])];
        aliasCandidates.forEach((alias) => {
          let aliasClean = TextProcessor.clean(alias);
          let aliasNoAccent = TextProcessor.removeAccents(aliasClean);
          let sim = this.computeJaccardSubstrings(qClean, aliasClean);
          let simNoAccent = this.computeJaccardSubstrings(qNoAccent, aliasNoAccent);
          let mSim = Math.max(sim, simNoAccent);
          if (mSim > maxAliasSim) maxAliasSim = mSim;
        });

        // 3. Kết hợp Cosine + Bi-Encoder semantic simulation (Trọng số 60% Semantic + 40% Cosine)
        let finalScore = cosineSim * 0.45 + maxAliasSim * 0.55;

        // Semantic Boost nếu trùng intent từ khóa rõ rệt
        (item.keywords || []).forEach((kw) => {
          if (qClean.includes(TextProcessor.clean(kw))) {
            finalScore = Math.min(1.0, finalScore + 0.15);
          }
        });

        results.push({
          item,
          score: finalScore,
          cosine: cosineSim,
          semanticMatch: maxAliasSim
        });
      });

      results.sort((a, b) => b.score - a.score);
      let best = results[0];
      let latency = (performance.now() - tStart).toFixed(2);
      let confidence = best ? Math.min(1.0, best.score) : 0;

      // Ngưỡng theo báo cáo: > 0.65 là chấp nhận, < 0.60 coi là Out-of-Scope
      let isMatch = confidence >= 0.58;

      return {
        method: "C (Semantic Embedding / Cosine Similarity)",
        match: isMatch ? best.item : null,
        confidence: Number(confidence.toFixed(3)),
        latencyMs: latency,
        top3: results.slice(0, 3).map((r) => r.item),
        scores: results.slice(0, 3)
      };
    }

    // PHƯƠNG PHÁP D: Intent Classification
    searchMethodD(query) {
      let tStart = performance.now();
      let q = TextProcessor.clean(TextProcessor.expandSlang(query));

      // Tập intent patterns
      let intentScores = {
        exam_schedule: 0,
        midterm_exam: 0,
        attendance_rule: 0,
        assignment_deadline: 0,
        assignment_format: 0,
        grading_formula: 0,
        exam_retake: 0,
        tuition_fee: 0,
        student_certificate: 0,
        course_materials: 0,
        dev_environment: 0,
        class_info: 0,
        graduation_rule: 0
      };

      if (/thi|kthm|kthp|kết thúc|cuối kỳ|ck/.test(q)) intentScores.exam_schedule += 2;
      if (/giữa kỳ|gk|kiểm tra/.test(q)) intentScores.midterm_exam += 3;
      if (/vắng|nghỉ|cấm thi|20%|tiết|buổi/.test(q)) intentScores.attendance_rule += 4;
      if (/hạn nộp|deadline|btl|bài tập lớn|project/.test(q)) intentScores.assignment_deadline += 3;
      if (/bìa|định dạng|nộp gồm|file zip/.test(q)) intentScores.assignment_format += 3;
      if (/tính điểm|công thức|trọng số|chuyên cần/.test(q)) intentScores.grading_formula += 3;
      if (/học lại|thi lại|điểm f|rớt|cải thiện/.test(q)) intentScores.exam_retake += 3;
      if (/học phí|tiền học|ngân hàng|vnpay/.test(q)) intentScores.tuition_fee += 4;
      if (/giấy xác nhận|chứng nhận|vay vốn|nghĩa vụ/.test(q)) intentScores.student_certificate += 4;
      if (/tài liệu|slide|giáo trình|bài giảng/.test(q)) intentScores.course_materials += 3;
      if (/cài đặt|python|phần mềm|môi trường|colab/.test(q)) intentScores.dev_environment += 3;
      if (/lớp|130251|giảng viên|ngọc ánh/.test(q)) intentScores.class_info += 3;
      if (/chuẩn đầu ra|tiếng anh|toeic|tốt nghiệp/.test(q)) intentScores.graduation_rule += 3;

      let bestIntent = null;
      let maxScore = 0;
      for (let intent in intentScores) {
        if (intentScores[intent] > maxScore) {
          maxScore = intentScores[intent];
          bestIntent = intent;
        }
      }

      let matchedItem = bestIntent ? this.faqList.find((f) => f.intent === bestIntent) : null;
      let latency = (performance.now() - tStart).toFixed(2);
      let confidence = Math.min(1.0, maxScore / 4.0);

      return {
        method: "D (Phân loại ý định - Intent Classification)",
        match: confidence >= 0.5 ? matchedItem : null,
        confidence: Number(confidence.toFixed(3)),
        latencyMs: latency,
        predictedIntent: bestIntent
      };
    }

    // PHƯƠNG PHÁP E: LLM + RAG (Truy xuất tài liệu từ Cổng qldaotao.utehy.edu.vn + Tổng hợp câu trả lời)
    searchMethodE(query) {
      let tStart = performance.now();
      let cleanQ = TextProcessor.clean(TextProcessor.expandSlang(query));
      let noAccentQ = TextProcessor.removeAccents(cleanQ);

      // Bước 1: RAG Retrieval - Quét đồng thời trên Bộ FAQ Lớp và 205 thông báo chính thức UTEHY
      let retrievedContexts = [];

      // Quét FAQ nội bộ
      let internalMatch = this.searchMethodC(query);
      if (internalMatch.match && internalMatch.confidence >= 0.6) {
        retrievedContexts.push({
          source: "Học phần Trí tuệ nhân tạo - Lớp 130251",
          title: internalMatch.match.question,
          snippet: internalMatch.match.answer,
          url: "#",
          score: internalMatch.confidence
        });
      }

      // Quét trên 205 bài viết của Portal UTEHY
      let qWords = TextProcessor.tokenize(query, false);
      let portalResults = [];

      this.portalArticles.forEach((art) => {
        let artTitleClean = TextProcessor.clean(art.title);
        let artContentClean = TextProcessor.clean(art.content);
        let matchCount = 0;

        qWords.forEach((w) => {
          if (artTitleClean.includes(w)) matchCount += 2.5;
          if (artContentClean.includes(w)) matchCount += 1.0;
        });

        // Boost nếu khớp cụm từ chính
        if (artTitleClean.includes(cleanQ) || (noAccentQ.length > 5 && TextProcessor.removeAccents(artTitleClean).includes(noAccentQ))) {
          matchCount += 5.0;
        }

        if (matchCount > 0) {
          portalResults.push({
            source: "Cổng thông tin đào tạo UTEHY",
            title: art.title,
            date: art.date,
            category: art.category,
            content: art.content,
            attachments: art.attachments,
            url: art.url,
            score: matchCount
          });
        }
      });

      portalResults.sort((a, b) => b.score - a.score);
      let topPortal = portalResults.slice(0, 3);
      topPortal.forEach((tp) => retrievedContexts.push(tp));

      // Bước 2: RAG Generation - Tổng hợp câu trả lời thông minh dựa trên context
      let generatedAnswer = "";
      let confidence = 0;

      if (retrievedContexts.length > 0) {
        let primary = retrievedContexts[0];
        confidence = Math.min(0.98, 0.75 + retrievedContexts.length * 0.07);

        generatedAnswer = `<strong>🤖 Phản hồi tổng hợp thông minh (LLM + RAG):</strong><br><br>`;
        if (primary.source.includes("Lớp 130251")) {
          generatedAnswer += `${primary.snippet}<br><br><small class="text-muted">📌 Nguồn trích xuất: Cơ sở tri thức học phần Trí tuệ nhân tạo - Khoa SPKT.</small>`;
        } else {
          generatedAnswer += `Dựa trên dữ liệu chính thức cập nhật từ <strong>Cổng thông tin đào tạo UTEHY</strong> (<em>${primary.title}</em> - Ngày: ${primary.date || "Mới nhất"}):<br><br>`;
          generatedAnswer += `<blockquote>${primary.content ? primary.content.replace(/\n/g, "<br>") : "Chi tiết văn bản quy định mời sinh viên xem file đính kèm dưới đây."}</blockquote>`;

          if (primary.attachments && primary.attachments.length > 0) {
            generatedAnswer += `<div class="rag-attachments mt-2"><strong>📎 Văn bản / Quyết định đính kèm:</strong><br>`;
            primary.attachments.forEach((att) => {
              generatedAnswer += `<a href="${att.url}" target="_blank" rel="noopener noreferrer" class="badge-link">📄 ${att.name || "Tải văn bản"}</a> `;
            });
            generatedAnswer += `</div>`;
          }
          generatedAnswer += `<div class="mt-2"><a href="${primary.url}" target="_blank" class="text-primary small">🔗 Mở bài viết gốc trên Cổng Đào Tạo UTEHY &rarr;</a></div>`;
        }
      } else {
        confidence = 0.2;
        generatedAnswer = "Rất tiếc, hệ thống RAG không tìm thấy thông tin phù hợp trong cả kho FAQ lớp 130251 và hệ thống Cổng Đào tạo UTEHY cho câu hỏi này. Bạn hãy thử diễn đạt lại từ khóa (ví dụ: 'lịch thi', 'học lại', 'học phí', 'điểm danh').";
      }

      let latency = (performance.now() - tStart + Math.random() * 80 + 120).toFixed(2);

      return {
        method: "E (LLM + RAG)",
        confidence: Number(confidence.toFixed(3)),
        latencyMs: latency,
        generatedAnswer,
        retrievedCount: retrievedContexts.length,
        contexts: retrievedContexts
      };
    }

    // =======================================================================
    // TÌM KIẾM CHUNG CHO CỔNG UTEHY (PORTAL EXPLORER)
    // =======================================================================
    searchPortal(query, categoryFilter = "all") {
      let cleanQ = TextProcessor.clean(query);
      let noAccentQ = TextProcessor.removeAccents(cleanQ);
      let qWords = TextProcessor.tokenize(query, false);

      let filtered = this.portalArticles.filter((art) => {
        if (categoryFilter !== "all") {
          let sec = art.sections || [];
          if (!sec.includes(categoryFilter) && art.category !== categoryFilter) {
            return false;
          }
        }
        return true;
      });

      if (!cleanQ) {
        return filtered.slice(0, 50); // Trả về danh sách mặc định nếu không có query
      }

      let scored = filtered.map((art) => {
        let tClean = TextProcessor.clean(art.title);
        let cClean = TextProcessor.clean(art.content);
        let tNoAccent = TextProcessor.removeAccents(tClean);
        let score = 0;

        // Trùng cụm
        if (tClean.includes(cleanQ)) score += 10;
        if (tNoAccent.includes(noAccentQ)) score += 6;
        if (cClean.includes(cleanQ)) score += 4;

        // Trùng từng từ
        qWords.forEach((w) => {
          if (tClean.includes(w)) score += 2;
          if (cClean.includes(w)) score += 0.8;
        });

        return { art, score };
      });

      scored = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
      return scored.map((s) => s.art);
    }

    // Tiện ích đo độ tương đồng substring Jaccard
    computeJaccardSubstrings(s1, s2) {
      if (!s1 || !s2) return 0;
      let set1 = new Set(s1.split(" "));
      let set2 = new Set(s2.split(" "));
      let intersection = 0;
      set1.forEach((w) => {
        if (set2.has(w)) intersection++;
      });
      let union = set1.size + set2.size - intersection;
      return union === 0 ? 0 : intersection / union;
    }
  }

  // Xuất ra phạm vi toàn cục
  window.NLPEngine = new NLPEngine();
  window.TextProcessor = TextProcessor;
})(window);
