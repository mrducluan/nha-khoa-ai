// Kịch bản dựng 6 video ngắn Nha khoa Tâm Đức Smile (dọc 9:16, 1080×1920, 30 fps).
// Bản đọc dễ duyệt: KICH-BAN-NHA-KHOA.md (cùng thư mục) — sửa lời thì sửa CẢ HAI nơi.
//
// Mỗi cảnh:
//   noi     — lời đọc gửi ElevenLabs v3, mỗi phần tử một câu; tag cảm xúc trong [ngoặc vuông], số đọc bằng chữ.
//   phu_de  — phụ đề của TỪNG câu (cùng số phần tử với noi), đúng từng chữ với lời đọc, số viết bằng chữ số;
//             *chữ* = tô vàng.
//   loai    — kiểu cảnh: minh_hoa (tiêu đề + hình minh hoạ) · danh_sach (thẻ liệt kê) · chu (chữ lớn) · cta.
//
// Ranh giới (data/brand DNA Tâm Đức Smile, mục 9): không "không đau", "vĩnh viễn", "trọn đời", "100%", "số 1",
// "tốt nhất", "rẻ nhất", không cam kết kết quả, không giá / ưu đãi / trả góp / số chi nhánh / số năm kinh nghiệm
// (chưa có xác nhận của doanh nghiệp). Chỉ định điều trị luôn quy về "bác sĩ khám, chụp phim".
// Kiểm tự động: node kiem-tra.mjs

export const THUONG_HIEU = "Nha khoa Tâm Đức Smile";
export const HOTLINE = "1900 8040";
export const CTA_NUT = "INBOX ĐẶT LỊCH";
export const CTA_PHU = "Gặp bác sĩ tư vấn riêng cho bạn";
export const SLOGAN = "Răng tốt – Sức khỏe tốt";
export const MIEN_TRU = "Thông tin tham khảo. Chỉ định điều trị cần bác sĩ thăm khám trực tiếp.";

export const VIDEO = [
  // ===================================================================== IMPLANT 1
  {
    ma: "i01",
    ten: "Mất 1 răng hàm, để lâu có sao không?",
    nhom: "Implant",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "rang_mat",
        tieu_de: ["Mất *1 răng hàm*", "kệ nó được không?"],
        noi: [
          "[curious] Mất một cái răng hàm... bạn có định cứ để vậy luôn không?",
          "[mischievously] Khoan đã, xem hết video này rồi hãy quyết nha.",
        ],
        phu_de: [
          "Mất *1 cái răng hàm*… bạn có định cứ để vậy luôn không?",
          "Khoan đã, xem hết video này rồi hãy quyết nha.",
        ],
      },
      {
        id: "xo-lech", loai: "minh_hoa", hinh: "rang_nghieng",
        tieu_de: ["Chỗ trống *không đứng yên*"],
        noi: [
          "[dramatic] Chỗ trống đó không đứng yên đâu.",
          "Răng bên cạnh có thể nghiêng dần vào khoảng trống.",
          "Còn răng đối diện thì trồi xuống, vì không còn gì để cắn vào.",
        ],
        phu_de: [
          "Chỗ trống đó *không đứng yên* đâu.",
          "Răng bên cạnh có thể *nghiêng dần* vào khoảng trống.",
          "Còn răng đối diện thì *trồi xuống*, vì không còn gì để cắn vào.",
        ],
      },
      {
        id: "xuong", loai: "minh_hoa", hinh: "xuong_tieu",
        tieu_de: ["Bên dưới nướu…"],
        noi: [
          "[curious] Còn bên dưới nướu... mới là chuyện ít ai để ý.",
          "Mất chân răng, xương hàm ở đó không còn được kích thích khi nhai, nên có thể tiêu dần theo thời gian.",
          "Xương càng mỏng, sau này làm răng lại càng phức tạp hơn.",
        ],
        phu_de: [
          "Còn bên dưới nướu… mới là chuyện *ít ai để ý*.",
          "Mất chân răng, xương hàm ở đó không còn được kích thích khi nhai, nên có thể *tiêu dần* theo thời gian.",
          "Xương càng mỏng, sau này làm răng lại *càng phức tạp* hơn.",
        ],
      },
      {
        id: "he-qua", loai: "danh_sach", kieu: "so",
        tieu_de: ["Rồi dần dần…"],
        muc: [{ chu: "Quen nhai một bên" }, { chu: "Thức ăn hay giắt" }, { chu: "Khớp cắn thay đổi" }],
        noi: [
          "[playfully] Rồi dần dần, bạn quen nhai một bên.",
          "Thức ăn hay giắt vào kẽ răng.",
          "Khớp cắn cũng thay đổi theo lúc nào không hay.",
        ],
        phu_de: [
          "Rồi dần dần, bạn *quen nhai một bên*.",
          "Thức ăn *hay giắt* vào kẽ răng.",
          "Khớp cắn cũng *thay đổi theo* lúc nào không hay.",
        ],
      },
      {
        id: "implant", loai: "minh_hoa", hinh: "implant_lap",
        tieu_de: ["Implant: thay *cả chân răng*"],
        noi: [
          "[enthusiastic] Implant là cách thay luôn cả chân răng: một trụ nhỏ đặt vào xương hàm, bên trên là mão sứ.",
          "Có chân răng thay thế, lực nhai được truyền xuống xương, góp phần hạn chế tiêu xương.",
          "[warmly] Nhưng làm được ngay hay chưa thì phải chụp phim, xem xương còn đủ không đã nha.",
        ],
        phu_de: [
          "Implant là cách thay luôn *cả chân răng*: một trụ nhỏ đặt vào xương hàm, bên trên là *mão sứ*.",
          "Có chân răng thay thế, lực nhai được truyền xuống xương, *góp phần hạn chế tiêu xương*.",
          "Nhưng làm được ngay hay chưa thì phải *chụp phim*, xem xương còn đủ không đã nha.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Khám & chụp phim", "Tư vấn phương án"],
        noi: [
          "[cheerfully] Bạn mất răng bao lâu rồi? Comment cho mình biết, bác sĩ Tâm Đức Smile sẽ giải đáp nha!",
          "[excited] Hoặc inbox Tâm Đức Smile, đặt lịch để bác sĩ chụp phim, xem xương hàm của bạn nha!",
        ],
        phu_de: [
          "Bạn mất răng bao lâu rồi? Comment cho mình biết, bác sĩ *Tâm Đức Smile* sẽ giải đáp nha!",
          "Hoặc *inbox Tâm Đức Smile*, đặt lịch để bác sĩ chụp phim, xem xương hàm của bạn nha!",
        ],
      },
    ],
  },

  // ===================================================================== IMPLANT 2
  {
    ma: "i02",
    ten: "Giá trụ Implant có phải giá cả cái răng? 4 câu nên hỏi",
    nhom: "Implant",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "gia_hoi",
        tieu_de: ["Giá *trụ Implant*", "= giá cả cái răng?"],
        noi: [
          "[curious] Thấy giá trụ Implant... rồi tưởng đó là giá của cả một cái răng?",
          "[mischievously] Lưu lại bốn câu hỏi này trước khi làm nha!",
        ],
        phu_de: [
          "Thấy giá *trụ Implant*… rồi tưởng đó là giá của *cả một cái răng*?",
          "Lưu lại *4 câu hỏi* này trước khi làm nha!",
        ],
      },
      {
        id: "cau-tao", loai: "minh_hoa", hinh: "implant_tach",
        tieu_de: ["Một răng Implant = *3 phần*"],
        noi: [
          "[enthusiastic] Một răng Implant hoàn chỉnh có ba phần.",
          "Trụ Implant nằm trong xương, thay cho chân răng.",
          "Khớp nối ở giữa, giữ chặt phần răng bên trên.",
          "Và mão sứ, là phần bạn nhìn thấy khi cười.",
        ],
        phu_de: [
          "Một răng Implant hoàn chỉnh có *3 phần*.",
          "*Trụ Implant* nằm trong xương, thay cho chân răng.",
          "*Khớp nối* ở giữa, giữ chặt phần răng bên trên.",
          "Và *mão sứ*, là phần bạn nhìn thấy khi cười.",
        ],
      },
      {
        id: "bon-cau", loai: "danh_sach", kieu: "check",
        tieu_de: ["*4 câu* nên hỏi bác sĩ"],
        muc: [
          { chu: "Báo giá gồm đủ 3 phần?", phu: "Trụ · khớp nối · mão sứ" },
          { chu: "Có cần ghép xương?", phu: "Chụp phim CT mới biết" },
          { chu: "Bảo hành thế nào?", phu: "Điều kiện tái khám đi kèm" },
          { chu: "Mấy lần hẹn, bao lâu?", phu: "Để sắp xếp lịch của bạn" },
        ],
        noi: [
          "[cheerfully] Một: báo giá đã gồm đủ trụ, khớp nối và mão sứ chưa?",
          "Hai: trường hợp của mình có cần ghép xương không? Cái này phải chụp phim CT mới biết.",
          "[curious] Ba: chính sách bảo hành ra sao, cần tái khám thế nào?",
          "Bốn: cả quá trình cần mấy lần hẹn, kéo dài bao lâu?",
        ],
        phu_de: [
          "Một: báo giá đã gồm đủ *trụ, khớp nối và mão sứ* chưa?",
          "Hai: trường hợp của mình có cần *ghép xương* không? Cái này phải chụp phim CT mới biết.",
          "Ba: chính sách *bảo hành* ra sao, cần tái khám thế nào?",
          "Bốn: cả quá trình cần *mấy lần hẹn*, kéo dài bao lâu?",
        ],
      },
      {
        id: "lat", loai: "chu",
        dong: ["Hỏi kỹ", "*không phải khó tính*"], phu: "Biết rõ từ đầu, yên tâm hơn nhiều",
        noi: [
          "[warmly] Hỏi kỹ không phải là khó tính đâu.",
          "Biết rõ từ đầu thì mình yên tâm hơn nhiều.",
        ],
        phu_de: [
          "Hỏi kỹ *không phải là khó tính* đâu.",
          "Biết rõ từ đầu thì mình *yên tâm hơn nhiều*.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Giải thích từng hạng mục", "Khám & chụp phim"],
        noi: [
          "[cheerfully] Gửi video này cho người nhà đang tính làm Implant nha!",
          "[excited] Inbox Tâm Đức Smile để đặt lịch, bác sĩ giải thích rõ từng hạng mục trước khi bạn quyết định.",
        ],
        phu_de: [
          "Gửi video này cho *người nhà* đang tính làm Implant nha!",
          "*Inbox Tâm Đức Smile* để đặt lịch, bác sĩ giải thích rõ *từng hạng mục* trước khi bạn quyết định.",
        ],
      },
    ],
  },

  // ===================================================================== IMPLANT 3
  {
    ma: "i03",
    ten: "Có những điều mẹ chẳng nói…",
    nhom: "Implant",
    nhac: "am",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "bua_com", loi: "Mẹ ăn vậy được rồi con…",
        tieu_de: ["Có những điều", "*mẹ chẳng nói…*"],
        noi: [
          "[softly] Bữa cơm nào mẹ cũng bảo: mẹ ăn vậy được rồi con.",
          "[curious] Nhưng bạn có để ý... mẹ đang né món gì không?",
        ],
        phu_de: [
          "Bữa cơm nào mẹ cũng bảo: *mẹ ăn vậy được rồi con*.",
          "Nhưng bạn có để ý… mẹ đang *né món gì* không?",
        ],
      },
      {
        id: "dau-hieu", loai: "danh_sach", kieu: "so",
        tieu_de: ["*3 dấu hiệu* con hay bỏ qua"],
        muc: [{ chu: "Chỉ nhai một bên" }, { chu: "Né đồ dai, đồ cứng" }, { chu: "Hàm giả lỏng, phải tháo ra" }],
        noi: [
          "[warmly] Ba dấu hiệu nhỏ mà con cái hay bỏ qua.",
          "Mẹ chỉ nhai một bên.",
          "Mẹ né thịt dai, đồ cứng, chỉ ăn món mềm.",
          "Hoặc hàm giả lỏng, mẹ phải lén tháo ra mới ăn được.",
        ],
        phu_de: [
          "*3 dấu hiệu nhỏ* mà con cái hay bỏ qua.",
          "Mẹ chỉ *nhai một bên*.",
          "Mẹ *né thịt dai, đồ cứng*, chỉ ăn món mềm.",
          "Hoặc *hàm giả lỏng*, mẹ phải lén tháo ra mới ăn được.",
        ],
      },
      {
        id: "ly-do", loai: "chu",
        dong: ["Mẹ không nói", "vì *sợ con lo*"], phu: "Người mở lời… thường phải là mình",
        noi: [
          "[softly] Mẹ không nói, vì sợ con lo, sợ con tốn kém.",
          "[warmly] Nên người mở lời... thường phải là mình.",
        ],
        phu_de: [
          "Mẹ không nói, vì *sợ con lo*, sợ con tốn kém.",
          "Nên người mở lời… *thường phải là mình*.",
        ],
      },
      {
        id: "giai-phap", loai: "danh_sach", kieu: "the",
        tieu_de: ["Mất răng: *nhiều cách* phục hồi"],
        muc: [
          { chu: "Implant", phu: "Thay cả chân răng", cau: 0, tre: 0.42 },
          { chu: "Cầu răng sứ", phu: "Dựa vào răng hai bên", cau: 0, tre: 0.62 },
          { chu: "Hàm tháo lắp", phu: "Tháo ra để vệ sinh", cau: 0, tre: 0.82 },
        ],
        chot: { chu: "Khám, chụp phim → chọn cách phù hợp", cau: 1 },
        noi: [
          "[enthusiastic] Mất răng bây giờ có nhiều cách: Implant, cầu răng sứ, hay hàm tháo lắp.",
          "Chọn cách nào, bác sĩ sẽ khám, chụp phim, xem xương hàm và sức khỏe tổng quát của mẹ trước.",
          "Không phải ai cũng cần làm Implant, cứ đưa mẹ đi khám là biết.",
        ],
        phu_de: [
          "Mất răng bây giờ có nhiều cách: *Implant, cầu răng sứ*, hay *hàm tháo lắp*.",
          "Chọn cách nào, bác sĩ sẽ *khám, chụp phim*, xem xương hàm và sức khỏe tổng quát của mẹ trước.",
          "Không phải ai cũng cần làm Implant, cứ *đưa mẹ đi khám* là biết.",
        ],
      },
      {
        id: "mon-qua", loai: "minh_hoa", hinh: "bua_com", am: true, loi: "Cuối tuần con đưa mẹ đi khám nha!",
        tieu_de: ["Món quà mẹ cần", "*mà chẳng nói ra*"],
        noi: ["[warmly] Một cuộc hẹn khám răng... có khi là món quà mẹ cần nhất, mà chẳng bao giờ nói ra."],
        phu_de: ["Một cuộc hẹn khám răng… có khi là *món quà mẹ cần nhất*, mà chẳng bao giờ nói ra."],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Đặt lịch cho ba mẹ", "Tư vấn phương án"],
        noi: [
          "[cheerfully] Gửi video này cho anh chị em, cuối tuần mình cùng đưa mẹ đi khám nha!",
          "[excited] Inbox Tâm Đức Smile, đặt lịch cho mẹ gặp bác sĩ tư vấn nha!",
        ],
        phu_de: [
          "*Gửi video này cho anh chị em*, cuối tuần mình cùng đưa mẹ đi khám nha!",
          "*Inbox Tâm Đức Smile*, đặt lịch cho mẹ *gặp bác sĩ tư vấn* nha!",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 1
  {
    ma: "s01",
    ten: "Không phải răng xấu nào cũng cần bọc sứ",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "canh_bao_mai",
        tieu_de: ["*Khoan!*", "Đừng vội mài răng"],
        noi: [
          "[dramatic] Khoan! Đừng vội mài răng thật để bọc sứ...",
          "[curious] khi chưa biết răng mình thật ra đang gặp vấn đề gì.",
        ],
        phu_de: [
          "*Khoan!* Đừng vội mài răng thật để bọc sứ…",
          "khi chưa biết răng mình thật ra đang *gặp vấn đề gì*.",
        ],
      },
      {
        id: "truong-hop", loai: "danh_sach", kieu: "doi",
        tieu_de: ["Răng xấu *kiểu nào?*"],
        muc: [
          { chu: "Ố vàng", ra: "Tẩy trắng" },
          { chu: "Mẻ góc nhỏ", ra: "Trám thẩm mỹ" },
          { chu: "Thưa, dáng chưa đẹp", ra: "Cân nhắc veneer" },
          { chu: "Vỡ lớn, đã chữa tủy", ra: "Mão sứ" },
        ],
        noi: [
          "[cheerfully] Răng chỉ ố vàng? Nhiều khi tẩy trắng là đủ.",
          "Mẻ một góc nhỏ? Có thể trám thẩm mỹ.",
          "Răng thưa, dáng chưa đẹp? Có thể cân nhắc veneer, thường mài ít hơn bọc sứ.",
          "Còn răng vỡ lớn hoặc đã chữa tủy, lúc đó mão sứ mới giúp bảo vệ răng.",
        ],
        phu_de: [
          "Răng chỉ *ố vàng*? Nhiều khi *tẩy trắng* là đủ.",
          "*Mẻ một góc nhỏ*? Có thể *trám thẩm mỹ*.",
          "Răng thưa, dáng chưa đẹp? Có thể cân nhắc *veneer*, thường mài ít hơn bọc sứ.",
          "Còn răng *vỡ lớn* hoặc *đã chữa tủy*, lúc đó *mão sứ* mới giúp bảo vệ răng.",
        ],
      },
      {
        id: "vi-sao", loai: "minh_hoa", hinh: "mai_rang",
        tieu_de: ["Men răng *không mọc lại*"],
        noi: [
          "[warmly] Vì men răng đã mài đi thì không mọc lại được.",
          "Nên mài ít hay nhiều, làm hay không làm, phải dựa vào tình trạng thật của răng.",
        ],
        phu_de: [
          "Vì men răng đã mài đi thì *không mọc lại* được.",
          "Nên mài ít hay nhiều, làm hay không làm, phải dựa vào *tình trạng thật* của răng.",
        ],
      },
      {
        id: "quy-trinh", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["Ở *Tâm Đức Smile*"],
        muc: [{ chu: "Khám & chụp phim" }, { chu: "Scan răng" }, { chu: "Giải thích từng phương án" }, { chu: "Bạn chọn, rồi mới làm" }],
        noi: [
          "[enthusiastic] Ở Tâm Đức Smile, bác sĩ khám và chụp phim trước.",
          "Scan răng để quan sát rõ hơn.",
          "Rồi giải thích từng phương án, ưu và nhược điểm.",
          "[warmly] Bạn hiểu rõ, chọn xong, rồi mới bắt đầu làm.",
        ],
        phu_de: [
          "Ở Tâm Đức Smile, bác sĩ *khám và chụp phim* trước.",
          "*Scan răng* để quan sát rõ hơn.",
          "Rồi giải thích *từng phương án*, ưu và nhược điểm.",
          "Bạn hiểu rõ, chọn xong, *rồi mới bắt đầu làm*.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Khám & tư vấn", "Đúng chỉ định"],
        noi: [
          "[mischievously] Răng bạn đang gặp chuyện gì? Comment để bác sĩ giải đáp nha!",
          "[excited] Hoặc inbox Tâm Đức Smile, đặt lịch để bác sĩ xem răng và tư vấn đúng cách cho bạn.",
        ],
        phu_de: [
          "Răng bạn đang gặp chuyện gì? *Comment* để bác sĩ giải đáp nha!",
          "Hoặc *inbox Tâm Đức Smile*, đặt lịch để bác sĩ xem răng và *tư vấn đúng cách* cho bạn.",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 2
  {
    ma: "s02",
    ten: "Viền đen ở chân răng sứ — vì sao?",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "nu_cuoi",
        tieu_de: ["*Viền đen* ở chân răng sứ?"],
        noi: [
          "[curious] Cười lên lại thấy một viền đen mờ ở chân răng sứ?",
          "[playfully] Đừng ngại, chuyện này gặp nhiều lắm.",
        ],
        phu_de: [
          "Cười lên lại thấy một *viền đen mờ* ở chân răng sứ?",
          "Đừng ngại, chuyện này *gặp nhiều lắm*.",
        ],
      },
      {
        id: "cat-lop", loai: "minh_hoa", hinh: "su_cat_lop",
        tieu_de: ["Bên trong *răng sứ kim loại*"],
        noi: [
          "[enthusiastic] Nhiều răng sứ đời cũ có một lớp sườn kim loại bên trong.",
          "Khi nướu co lại theo thời gian, viền ở chân răng có thể lộ ra màu xám tối.",
          "Kim loại cũng cản ánh sáng, nên răng trông đục hơn răng thật.",
        ],
        phu_de: [
          "Nhiều răng sứ đời cũ có một *lớp sườn kim loại* bên trong.",
          "Khi *nướu co lại* theo thời gian, viền ở chân răng có thể lộ ra *màu xám tối*.",
          "Kim loại cũng *cản ánh sáng*, nên răng trông đục hơn răng thật.",
        ],
      },
      {
        id: "toan-su", loai: "minh_hoa", hinh: "anh_sang",
        tieu_de: ["Sườn kim loại vs *toàn sứ*"],
        noi: [
          "[cheerfully] Răng toàn sứ thì không có lớp kim loại đó.",
          "Ánh sáng xuyên qua được một phần, nên màu răng trông tự nhiên hơn, chân răng cũng không bị ánh xám của kim loại.",
        ],
        phu_de: [
          "Răng *toàn sứ* thì không có lớp kim loại đó.",
          "Ánh sáng *xuyên qua được một phần*, nên màu răng trông tự nhiên hơn, chân răng cũng không bị ánh xám của kim loại.",
        ],
      },
      {
        id: "luu-y", loai: "danh_sach", kieu: "so",
        tieu_de: ["Viền tối *còn có thể* do…"],
        muc: [
          { chu: "Mão sứ bị hở", cau: 0, tre: 0.45 },
          { chu: "Sâu ở chân răng", cau: 0, tre: 0.66 },
          { chu: "Nướu bị viêm", cau: 0, tre: 0.86 },
        ],
        chot: { chu: "Đừng tự đoán — đi khám nha!", cau: 1 },
        noi: [
          "[warmly] Nhưng viền tối cũng có thể do mão sứ bị hở, sâu ở chân răng, hay nướu bị viêm.",
          "Vì vậy đừng tự đoán, cũng đừng tự tháo nha. Đi khám để bác sĩ kiểm tra đúng nguyên nhân.",
        ],
        phu_de: [
          "Nhưng viền tối cũng có thể do *mão sứ bị hở*, *sâu ở chân răng*, hay *nướu bị viêm*.",
          "Vì vậy *đừng tự đoán*, cũng đừng tự tháo nha. Đi khám để bác sĩ kiểm tra đúng nguyên nhân.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Kiểm tra răng sứ cũ", "Tìm đúng nguyên nhân"],
        noi: [
          "[cheerfully] Răng sứ của bạn làm được mấy năm rồi? Comment cho mình biết nha!",
          "[excited] Inbox Tâm Đức Smile, đặt lịch để bác sĩ kiểm tra răng sứ cũ cho bạn nha.",
        ],
        phu_de: [
          "Răng sứ của bạn làm được *mấy năm* rồi? Comment cho mình biết nha!",
          "*Inbox Tâm Đức Smile*, đặt lịch để bác sĩ *kiểm tra răng sứ cũ* cho bạn nha.",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 3
  {
    ma: "s03",
    ten: "Răng sứ trắng như gạch men? 3 bí mật nụ cười tự nhiên",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "hai_nu_cuoi",
        tieu_de: ["Răng sứ trắng", "như *gạch men?*"],
        noi: [
          "[playfully] Làm răng sứ xong... cười lên trắng như gạch men nhà tắm?",
          "[laughs] Đẹp kiểu đó thì ai nhìn cũng biết là răng làm liền!",
        ],
        phu_de: [
          "Làm răng sứ xong… cười lên trắng như *gạch men nhà tắm*?",
          "Đẹp kiểu đó thì ai nhìn cũng biết là *răng làm* liền!",
        ],
      },
      {
        id: "mau", loai: "minh_hoa", hinh: "bang_mau",
        tieu_de: ["Bí mật 1: *màu răng*"],
        noi: [
          "[playfully] Bí mật thứ nhất: màu răng.",
          "Răng đẹp là răng hợp với màu da và lòng trắng mắt của bạn, chứ không phải càng trắng càng tốt.",
        ],
        phu_de: [
          "Bí mật thứ nhất: *màu răng*.",
          "Răng đẹp là răng *hợp với màu da* và lòng trắng mắt của bạn, chứ không phải càng trắng càng tốt.",
        ],
      },
      {
        id: "dang", loai: "minh_hoa", hinh: "khuon_mat",
        tieu_de: ["Bí mật 2: *dáng răng*"],
        noi: [
          "[enthusiastic] Thứ hai: dáng răng.",
          "Mặt tròn, mặt vuông hay mặt dài, mỗi người hợp một kiểu dáng và độ dài răng khác nhau.",
        ],
        phu_de: [
          "Thứ hai: *dáng răng*.",
          "Mặt tròn, mặt vuông hay mặt dài, mỗi người hợp *một kiểu dáng* và độ dài răng khác nhau.",
        ],
      },
      {
        id: "trong", loai: "minh_hoa", hinh: "do_trong",
        tieu_de: ["Bí mật 3: *độ trong*"],
        noi: [
          "[cheerfully] Thứ ba: độ trong ở rìa răng.",
          "Răng thật hơi trong ở mép cắn, nên răng sứ đẹp cũng cần có lớp chuyển màu đó.",
        ],
        phu_de: [
          "Thứ ba: *độ trong* ở rìa răng.",
          "Răng thật *hơi trong ở mép cắn*, nên răng sứ đẹp cũng cần có lớp chuyển màu đó.",
        ],
      },
      {
        id: "thu-truoc", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["Nhìn trước, *rồi mới làm*"],
        muc: [
          { chu: "Scan răng", cau: 0, tre: 0.42 },
          { chu: "Thiết kế nụ cười", cau: 0, tre: 0.62 },
          { chu: "Thử mẫu trước", cau: 0, tre: 0.84 },
        ],
        chot: { chu: "Bạn góp ý → rồi mới quyết định", cau: 1 },
        noi: [
          "[enthusiastic] Vì vậy, trước khi làm, bác sĩ sẽ scan răng, thiết kế nụ cười, và có thể cho bạn thử mẫu trước.",
          "[warmly] Bạn được nhìn, được góp ý, rồi mới quyết định.",
        ],
        phu_de: [
          "Vì vậy, trước khi làm, bác sĩ sẽ *scan răng*, *thiết kế nụ cười*, và có thể cho bạn *thử mẫu* trước.",
          "Bạn được nhìn, được góp ý, *rồi mới quyết định*.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["A · Trắng sáng", "B · Tự nhiên"],
        noi: [
          "[mischievously] Bạn thích trắng sáng hay tự nhiên? Comment A hoặc B nha!",
          "[excited] Inbox Tâm Đức Smile, đặt lịch để bác sĩ tư vấn nụ cười hợp với riêng bạn!",
        ],
        phu_de: [
          "Bạn thích *trắng sáng* hay *tự nhiên*? Comment *A* hoặc *B* nha!",
          "*Inbox Tâm Đức Smile*, đặt lịch để bác sĩ tư vấn *nụ cười hợp với riêng bạn*!",
        ],
      },
    ],
  },
];
