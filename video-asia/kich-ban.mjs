// Kịch bản dựng 6 video ngắn Nha khoa Asia (dọc 9:16, 1080×1920, 30 fps) — 3 Implant · 3 Răng sứ.
// Bản đọc dễ duyệt: KICH-BAN-ASIA.md (cùng thư mục) — sửa lời thì sửa CẢ HAI nơi.
// Bộ dựng kế thừa từ bộ 6 video Tâm Đức Smile (cùng giọng Hạnh, cùng bố cục, cùng quy tắc QUY-TAC-BO-CUC.md).
//
// Mỗi cảnh:
//   noi     — lời đọc gửi ElevenLabs v3, mỗi phần tử một câu; tag cảm xúc trong [ngoặc vuông], số đọc bằng chữ.
//   phu_de  — phụ đề của TỪNG câu (cùng số phần tử với noi), đúng từng chữ với lời đọc, số viết bằng chữ số;
//             *chữ* = tô vàng.
//   loai    — kiểu cảnh: minh_hoa (tiêu đề + hình minh hoạ) · danh_sach (thẻ liệt kê) · chu (chữ lớn) · cta.
//
// Ranh giới (docs/marketing/DNA_NHA_KHOA_ASIA.md mục 6, 11): không "không đau", "vĩnh viễn", "trọn đời", "100%",
// "số 1", "tốt nhất", "rẻ nhất", "bậc nhất", không cam kết kết quả; không giá / ưu đãi / trả góp (chủ dự án chọn
// KHÔNG gắn thẻ giá ngày 2026-11-07). Chỉ định điều trị luôn quy về "bác sĩ khám, chụp phim".
// Kiến thức chuyên môn đối chiếu engine (db/05, db/06): NGUON-KIEN-THUC.md. Kiểm tự động: node kiem-tra.mjs

export const THUONG_HIEU = "Nha khoa Asia";
export const HOTLINE = "1900 077 791";
export const CTA_NUT = "INBOX ĐẶT LỊCH";
export const CTA_PHU = "Gặp bác sĩ tư vấn riêng cho bạn";
export const SLOGAN = "Nâng cao chất lượng nụ cười Việt";
export const MIEN_TRU = "Thông tin tham khảo. Chỉ định điều trị cần bác sĩ thăm khám trực tiếp.";

export const VIDEO = [
  // ===================================================================== IMPLANT 1 — phòng kính (đặc sản Asia)
  {
    ma: "i01",
    ten: "Đứng ngoài phòng kính, xem mẹ cắm Implant",
    nhom: "Implant",
    nhac: "am",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "phong_kinh",
        tieu_de: ["Đứng ngoài *phòng kính*", "xem mẹ cắm Implant"],
        noi: [
          "[softly] Mẹ nằm trong phòng phẫu thuật. Còn con... đứng ngay bên ngoài tấm kính.",
          "[curious] Bạn có biết, lúc đó mẹ đang trải qua những bước nào không?",
        ],
        phu_de: [
          "Mẹ nằm trong phòng phẫu thuật. Còn con… đứng ngay *bên ngoài tấm kính*.",
          "Bạn có biết, lúc đó mẹ đang trải qua *những bước nào* không?",
        ],
      },
      {
        id: "noi-lo", loai: "danh_sach", kieu: "so",
        tieu_de: ["Điều *ba mẹ lo* nhất"],
        muc: [{ chu: "Sợ ê, sợ đau" }, { chu: "Không biết bác sĩ đang làm gì" }, { chu: "Sợ làm xong lại phải làm lại" }],
        noi: [
          "[warmly] Người lớn tuổi đi làm răng, ai cũng có nỗi lo riêng.",
          "Sợ ê, sợ đau.",
          "Không biết bác sĩ đang làm gì trong miệng mình.",
          "Và sợ làm xong, lại phải làm lại.",
        ],
        phu_de: [
          "Người lớn tuổi đi làm răng, ai cũng có *nỗi lo riêng*.",
          "*Sợ ê, sợ đau*.",
          "*Không biết* bác sĩ đang làm gì trong miệng mình.",
          "Và sợ làm xong, lại *phải làm lại*.",
        ],
      },
      {
        id: "hanh-trinh", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["Hành trình *1 răng Implant*"],
        muc: [{ chu: "Chụp CT, lên kế hoạch" }, { chu: "Đặt trụ vào xương hàm" }, { chu: "Chờ xương bám chặt trụ" }, { chu: "Gắn mão sứ" }],
        noi: [
          "[enthusiastic] Đầu tiên, chụp phim CT để đo xương và lên kế hoạch.",
          "Sau đó, bác sĩ đặt trụ vào xương hàm.",
          "Rồi chờ vài tháng, để xương bám chặt vào trụ.",
          "Cuối cùng mới gắn mão sứ lên trên.",
        ],
        phu_de: [
          "Đầu tiên, *chụp phim CT* để đo xương và lên kế hoạch.",
          "Sau đó, bác sĩ *đặt trụ* vào xương hàm.",
          "Rồi *chờ vài tháng*, để xương bám chặt vào trụ.",
          "Cuối cùng mới *gắn mão sứ* lên trên.",
        ],
      },
      {
        id: "kinh", loai: "chu",
        dong: ["Phòng kính *trong suốt*", "người nhà *nhìn thấy*"],
        phu: "Bác sĩ làm tới đâu, gia đình thấy tới đó",
        noi: [
          "[warmly] Ở Nha khoa Asia, phòng phẫu thuật Implant có vách kính trong suốt.",
          "Người nhà đứng bên ngoài, thấy bác sĩ làm tới đâu.",
          "Còn mẹ ở bên trong, biết con đang ở ngay đó.",
        ],
        phu_de: [
          "Ở Nha khoa Asia, phòng phẫu thuật Implant có *vách kính trong suốt*.",
          "Người nhà đứng bên ngoài, *thấy bác sĩ làm tới đâu*.",
          "Còn mẹ ở bên trong, biết *con đang ở ngay đó*.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Khám & chụp CT", "Đặt lịch cho ba mẹ"],
        noi: [
          "[cheerfully] Gửi video này cho anh chị em, cuối tuần mình cùng đưa mẹ đi khám nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch để bác sĩ khám và tư vấn cho mẹ nha!",
        ],
        phu_de: [
          "Gửi video này cho anh chị em, cuối tuần mình cùng *đưa mẹ đi khám* nha!",
          "*Inbox Nha khoa Asia*, đặt lịch để bác sĩ khám và tư vấn cho mẹ nha!",
        ],
      },
    ],
  },

  // ===================================================================== IMPLANT 2 — xương mỏng (db/06 nâng xoang)
  {
    ma: "i02",
    ten: "Xương hàm mỏng là hết làm Implant?",
    nhom: "Implant",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "xuong_tieu",
        tieu_de: ["Xương hàm *mỏng*", "là hết làm Implant?"],
        noi: [
          "[curious] Đi khám, bác sĩ bảo: xương hàm của anh chị mỏng quá.",
          "Vậy là hết đường làm Implant rồi sao?",
          "[dramatic] Khoan, chưa chắc đâu!",
        ],
        phu_de: [
          "Đi khám, bác sĩ bảo: xương hàm của anh chị *mỏng quá*.",
          "Vậy là *hết đường* làm Implant rồi sao?",
          "Khoan, *chưa chắc đâu*!",
        ],
      },
      {
        id: "vi-sao", loai: "danh_sach", kieu: "so",
        tieu_de: ["Vì sao *xương mỏng*?"],
        muc: [{ chu: "Mất răng để lâu năm" }, { chu: "Viêm nha chu kéo dài" }, { chu: "Xoang hàm sà xuống thấp" }],
        noi: [
          "[warmly] Xương mỏng thường có ba lý do.",
          "Mất răng để lâu, xương ở chỗ đó tiêu dần.",
          "Viêm nha chu kéo dài, làm tiêu xương quanh chân răng.",
          "Hoặc ở hàm trên, xoang hàm sà xuống, nên phần xương còn lại thấp đi.",
        ],
        phu_de: [
          "Xương mỏng thường có *3 lý do*.",
          "*Mất răng để lâu*, xương ở chỗ đó tiêu dần.",
          "*Viêm nha chu* kéo dài, làm tiêu xương quanh chân răng.",
          "Hoặc ở hàm trên, *xoang hàm sà xuống*, nên phần xương còn lại thấp đi.",
        ],
      },
      {
        id: "nang-xoang", loai: "minh_hoa", hinh: "nang_xoang",
        tieu_de: ["Ghép xương · *nâng xoang*"],
        noi: [
          "[enthusiastic] Xương thiếu thì bác sĩ có thể nâng màng xoang lên, rồi ghép thêm xương vào bên dưới.",
          "Xương còn tương đối cao, nhiều khi đặt trụ được cùng lúc.",
          "Xương quá mỏng, thì ghép trước, chờ vài tháng rồi mới đặt trụ.",
        ],
        phu_de: [
          "Xương thiếu thì bác sĩ có thể *nâng màng xoang* lên, rồi *ghép thêm xương* vào bên dưới.",
          "Xương còn tương đối cao, nhiều khi *đặt trụ được cùng lúc*.",
          "Xương quá mỏng, thì *ghép trước*, chờ vài tháng rồi mới đặt trụ.",
        ],
      },
      {
        id: "ct", loai: "danh_sach", kieu: "check",
        tieu_de: ["Phim CT *quyết định*"],
        muc: [{ chu: "Đo chiều cao, độ dày xương" }, { chu: "Xem xoang hàm có viêm không" }, { chu: "Chọn cách hợp với bạn" }],
        noi: [
          "[warmly] Làm cách nào, là do phim CT quyết định.",
          "Bác sĩ đo chiều cao và độ dày của xương.",
          "Xem xoang hàm có đang viêm không.",
          "Rồi mới chọn cách phù hợp cho riêng bạn.",
        ],
        phu_de: [
          "Làm cách nào, là do *phim CT quyết định*.",
          "Bác sĩ đo *chiều cao và độ dày* của xương.",
          "Xem *xoang hàm* có đang viêm không.",
          "Rồi mới chọn cách *phù hợp cho riêng bạn*.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Chụp phim CT", "Tư vấn ghép xương"],
        noi: [
          "[cheerfully] Bạn đã từng bị nói là xương mỏng chưa? Comment cho mình biết nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch để bác sĩ xem phim CT và tư vấn cho bạn nha!",
        ],
        phu_de: [
          "Bạn đã từng bị nói là *xương mỏng* chưa? Comment cho mình biết nha!",
          "*Inbox Nha khoa Asia*, đặt lịch để bác sĩ *xem phim CT* và tư vấn cho bạn nha!",
        ],
      },
    ],
  },

  // ===================================================================== IMPLANT 3 — chăm sóc trụ (ADA peri-implant, db/06)
  {
    ma: "i03",
    ten: "Răng Implant không sâu — vậy khỏi chăm?",
    nhom: "Implant",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "implant_lap", nhan2: "Không sâu… vẫn cần chăm!",
        tieu_de: ["Implant *không sâu*", "nên khỏi cần chăm?"],
        noi: [
          "[playfully] Răng Implant làm bằng titan với sứ, đâu có sâu được.",
          "Vậy ăn xong khỏi cần chải kỹ luôn ha?",
          "[mischievously] Sai rồi nha! Xem tiếp nè.",
        ],
        phu_de: [
          "Răng Implant làm bằng *titan với sứ*, đâu có sâu được.",
          "Vậy ăn xong *khỏi cần chải kỹ* luôn ha?",
          "*Sai rồi nha!* Xem tiếp nè.",
        ],
      },
      {
        id: "viem", loai: "minh_hoa", hinh: "viem_implant",
        tieu_de: ["Viêm *quanh Implant*"],
        noi: [
          "[dramatic] Mảng bám vẫn bám quanh cổ trụ, y như răng thật.",
          "Để lâu, nướu quanh trụ có thể bị viêm, rồi xương giữ trụ tiêu dần.",
          "Đó là viêm quanh Implant, một lý do khiến trụ bị lung lay.",
        ],
        phu_de: [
          "*Mảng bám* vẫn bám quanh cổ trụ, y như răng thật.",
          "Để lâu, nướu quanh trụ có thể *bị viêm*, rồi xương giữ trụ *tiêu dần*.",
          "Đó là *viêm quanh Implant*, một lý do khiến trụ bị lung lay.",
        ],
      },
      {
        id: "thoi-quen", loai: "danh_sach", kieu: "check",
        tieu_de: ["3 thói quen *giữ trụ*"],
        muc: [{ chu: "Chỉ nha khoa, tăm nước mỗi tối" }, { chu: "Tái khám, làm sạch định kỳ" }, { chu: "Nghiến răng: hỏi về máng bảo vệ" }],
        noi: [
          "[cheerfully] Ba thói quen nhỏ để giữ trụ thật lâu.",
          "Một: dùng chỉ nha khoa hoặc tăm nước quanh trụ mỗi tối.",
          "Hai: tái khám khoảng sáu tháng một lần, để bác sĩ làm sạch và kiểm tra.",
          "Ba: nếu hay nghiến răng ban đêm, hỏi bác sĩ về máng bảo vệ.",
        ],
        phu_de: [
          "*3 thói quen nhỏ* để giữ trụ thật lâu.",
          "1: dùng *chỉ nha khoa* hoặc *tăm nước* quanh trụ mỗi tối.",
          "2: *tái khám* khoảng *6 tháng* 1 lần, để bác sĩ làm sạch và kiểm tra.",
          "3: nếu hay *nghiến răng* ban đêm, hỏi bác sĩ về *máng bảo vệ*.",
        ],
      },
      {
        id: "chot", loai: "chu",
        dong: ["Implant bền hay không", "*một nửa nằm ở bạn*"],
        noi: [
          "[warmly] Implant bền hay không, một nửa nằm ở tay nghề bác sĩ, một nửa nằm ở cách mình chăm sóc mỗi ngày.",
        ],
        phu_de: [
          "Implant bền hay không, một nửa nằm ở tay nghề bác sĩ, *một nửa nằm ở cách mình chăm sóc* mỗi ngày.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Tái khám Implant", "Hướng dẫn vệ sinh"],
        noi: [
          "[cheerfully] Bạn làm Implant được bao lâu rồi? Comment cho mình biết nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch để bác sĩ kiểm tra và làm sạch quanh trụ cho bạn nha!",
        ],
        phu_de: [
          "Bạn làm Implant được *bao lâu rồi*? Comment cho mình biết nha!",
          "*Inbox Nha khoa Asia*, đặt lịch để bác sĩ *kiểm tra và làm sạch* quanh trụ cho bạn nha!",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 1 — mài răng thành cọc? (db/05 veneer, mock-up)
  {
    ma: "s01",
    ten: "Bọc sứ là phải mài răng thành cái cọc?",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "canh_bao_mai",
        tieu_de: ["Bọc sứ là mài răng", "thành *cái cọc*?"],
        noi: [
          "[curious] Nghe nói bọc răng sứ là phải mài răng thật thành cái cọc nhỏ xíu?",
          "[mischievously] Nghe mà sợ ha! Để mình nói rõ nè.",
        ],
        phu_de: [
          "Nghe nói bọc răng sứ là phải mài răng thật thành *cái cọc nhỏ xíu*?",
          "Nghe mà sợ ha! *Để mình nói rõ nè*.",
        ],
      },
      {
        id: "men", loai: "minh_hoa", hinh: "mai_rang",
        tieu_de: ["Men răng *mỏng hơn bạn nghĩ*"],
        noi: [
          "[enthusiastic] Lớp men ở cổ răng chỉ dày chưa tới nửa milimét.",
          "Mài lấn quá lớp men này, răng dễ ê buốt, mà men đã mất thì không mọc lại.",
        ],
        phu_de: [
          "Lớp men ở cổ răng chỉ dày *chưa tới nửa milimét*.",
          "Mài lấn quá lớp men này, răng dễ ê buốt, mà men đã mất thì *không mọc lại*.",
        ],
      },
      {
        id: "muc-do", loai: "danh_sach", kieu: "doi",
        tieu_de: ["Mài bao nhiêu *tùy cách làm*"],
        muc: [
          { chu: "Mặt dán sứ veneer", ra: "Mài rất ít" },
          { chu: "Mão toàn sứ", ra: "Mài vừa đủ" },
          { chu: "Răng lệch nhiều", ra: "Cân nhắc niềng trước" },
        ],
        noi: [
          "[cheerfully] Mài bao nhiêu là tùy cách làm.",
          "Mặt dán sứ veneer mỏng như kính áp tròng, nên mài rất ít.",
          "Mão toàn sứ bọc kín cả răng, nên cần mài nhiều hơn, nhưng vẫn vừa đủ.",
          "Còn răng lệch nhiều, có khi niềng trước một thời gian để đỡ phải mài.",
        ],
        phu_de: [
          "Mài bao nhiêu là *tùy cách làm*.",
          "Mặt dán sứ veneer *mỏng như kính áp tròng*, nên mài rất ít.",
          "Mão toàn sứ bọc kín cả răng, nên cần mài nhiều hơn, nhưng *vẫn vừa đủ*.",
          "Còn răng lệch nhiều, có khi *niềng trước* một thời gian để đỡ phải mài.",
        ],
      },
      {
        id: "mock-up", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["Mài *có định mức*"],
        muc: [{ chu: "Thử mẫu lên răng trước" }, { chu: "Mài xuyên qua lớp mẫu" }, { chu: "Giữ men nhiều nhất có thể" }],
        noi: [
          "[enthusiastic] Bác sĩ sẽ làm thử mẫu lên răng trước.",
          "Rồi mài xuyên qua lớp mẫu đó, với mũi khoan định độ sâu.",
          "[warmly] Nhờ vậy chỉ lấy đi phần thật sự cần, giữ lại men răng nhiều nhất có thể.",
        ],
        phu_de: [
          "Bác sĩ sẽ *làm thử mẫu* lên răng trước.",
          "Rồi mài xuyên qua lớp mẫu đó, với *mũi khoan định độ sâu*.",
          "Nhờ vậy chỉ lấy đi phần thật sự cần, *giữ lại men răng* nhiều nhất có thể.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Khám & tư vấn", "Xem trước nụ cười"],
        noi: [
          "[mischievously] Bạn sợ nhất điều gì khi bọc sứ? Comment cho mình biết nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch để bác sĩ xem răng và tư vấn cách làm hợp với bạn nha!",
        ],
        phu_de: [
          "Bạn *sợ nhất điều gì* khi bọc sứ? Comment cho mình biết nha!",
          "*Inbox Nha khoa Asia*, đặt lịch để bác sĩ xem răng và tư vấn *cách làm hợp với bạn* nha!",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 2 — xem trước nụ cười (scan + DSD + mock-up)
  {
    ma: "s02",
    ten: "Chưa mài răng nào, đã thấy nụ cười mới",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "nu_cuoi", vien_xam: false, nhan: "Nụ cười mới — xem trước", mau_nhan: "ngoc",
        tieu_de: ["Chưa mài răng nào", "đã thấy *nụ cười mới*?"],
        noi: [
          "[curious] Chưa mài cái răng nào, mà đã được nhìn thấy nụ cười mới của mình?",
          "[playfully] Nghe như phép thuật, nhưng là thật đó!",
        ],
        phu_de: [
          "Chưa mài cái răng nào, mà đã được *nhìn thấy nụ cười mới* của mình?",
          "Nghe như phép thuật, nhưng *là thật đó*!",
        ],
      },
      {
        id: "ba-buoc", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["3 bước *xem trước*"],
        muc: [{ chu: "Scan răng 3 chiều" }, { chu: "Thiết kế nụ cười trên máy" }, { chu: "Thử mẫu ngay trên răng" }],
        noi: [
          "[enthusiastic] Bước một: scan răng bằng máy quét, có ngay mô hình ba chiều.",
          "Bước hai: bác sĩ thiết kế dáng răng, độ dài, màu sắc trên máy tính.",
          "Bước ba: làm mẫu bằng nhựa, gắn tạm lên răng để bạn soi gương.",
        ],
        phu_de: [
          "Bước 1: *scan răng* bằng máy quét, có ngay mô hình *3 chiều*.",
          "Bước 2: bác sĩ *thiết kế* dáng răng, độ dài, màu sắc trên máy tính.",
          "Bước 3: làm mẫu bằng nhựa, *gắn tạm lên răng* để bạn soi gương.",
        ],
      },
      {
        id: "thu", loai: "chu",
        dong: ["Nhìn · cười · nói thử", "*rồi mới quyết định*"],
        noi: [
          "[warmly] Bạn được nhìn, được cười, được nói thử với hàm răng mẫu. Chỗ nào chưa ưng thì góp ý để sửa, rồi mới quyết định làm.",
        ],
        phu_de: [
          "Bạn được nhìn, được cười, được nói thử với hàm răng mẫu. Chỗ nào chưa ưng thì góp ý để sửa, *rồi mới quyết định làm*.",
        ],
      },
      {
        id: "loi-ich", loai: "danh_sach", kieu: "check",
        tieu_de: ["Thử mẫu *giúp gì*?"],
        muc: [{ chu: "Biết dáng răng hợp mặt chưa" }, { chu: "Làm thước đo để mài vừa đủ" }, { chu: "Bạn & bác sĩ thống nhất từ đầu" }],
        noi: [
          "[cheerfully] Thử mẫu giúp bạn biết trước dáng răng có hợp gương mặt không.",
          "Mẫu đó còn là thước đo, giúp bác sĩ mài vừa đủ.",
          "Và quan trọng nhất, bạn với bác sĩ thống nhất kết quả mong muốn ngay từ đầu.",
        ],
        phu_de: [
          "Thử mẫu giúp bạn biết trước dáng răng *có hợp gương mặt* không.",
          "Mẫu đó còn là *thước đo*, giúp bác sĩ mài vừa đủ.",
          "Và quan trọng nhất, bạn với bác sĩ *thống nhất kết quả mong muốn* ngay từ đầu.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Scan răng", "Thử mẫu nụ cười"],
        noi: [
          "[mischievously] Nếu được thiết kế lại nụ cười, bạn muốn sửa điều gì nhất? Comment nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch scan răng và xem trước nụ cười của bạn nha!",
        ],
        phu_de: [
          "Nếu được thiết kế lại nụ cười, bạn *muốn sửa điều gì nhất*? Comment nha!",
          "*Inbox Nha khoa Asia*, đặt lịch *scan răng* và xem trước nụ cười của bạn nha!",
        ],
      },
    ],
  },

  // ===================================================================== RĂNG SỨ 3 — tẩy trắng trước hay làm sứ trước?
  {
    ma: "s03",
    ten: "Làm sứ xong mới tẩy trắng — và cái kết lệch màu",
    nhom: "Răng sứ",
    canh: [
      {
        id: "hook", loai: "minh_hoa", hinh: "lech_mau",
        tieu_de: ["Làm sứ xong *mới tẩy trắng*", "và cái kết…"],
        noi: [
          "[playfully] Làm hai răng sứ cửa cho đẹp, xong mới đi tẩy trắng mấy răng còn lại.",
          "[dramatic] Và cái kết: răng thật trắng lên, còn răng sứ thì... vẫn y nguyên màu cũ!",
        ],
        phu_de: [
          "Làm *2 răng sứ cửa* cho đẹp, xong mới đi *tẩy trắng* mấy răng còn lại.",
          "Và cái kết: răng thật trắng lên, còn răng sứ thì… *vẫn y nguyên màu cũ*!",
        ],
      },
      {
        id: "vi-sao", loai: "chu",
        dong: ["Răng sứ *không đổi màu*", "khi tẩy trắng"],
        phu: "Thuốc tẩy chỉ tác động lên răng thật",
        noi: [
          "[enthusiastic] Vì thuốc tẩy trắng chỉ tác động lên răng thật.",
          "Răng sứ thì giữ nguyên màu đã chọn lúc làm, không trắng thêm được.",
        ],
        phu_de: [
          "Vì thuốc tẩy trắng chỉ tác động lên *răng thật*.",
          "Răng sứ thì *giữ nguyên màu* đã chọn lúc làm, không trắng thêm được.",
        ],
      },
      {
        id: "thu-tu", loai: "danh_sach", kieu: "buoc",
        tieu_de: ["Thứ tự *đúng*"],
        muc: [{ chu: "Tẩy trắng răng thật trước" }, { chu: "Chờ màu răng ổn định" }, { chu: "So màu, làm răng sứ sau" }],
        noi: [
          "[cheerfully] Nên thứ tự đúng là: tẩy trắng răng thật trước.",
          "Chờ một thời gian cho màu răng ổn định.",
          "Rồi mới so màu, và làm răng sứ cho khớp.",
        ],
        phu_de: [
          "Nên thứ tự đúng là: *tẩy trắng răng thật trước*.",
          "*Chờ một thời gian* cho màu răng ổn định.",
          "Rồi mới *so màu*, và làm răng sứ cho khớp.",
        ],
      },
      {
        id: "so-mau", loai: "minh_hoa", hinh: "bang_mau",
        tieu_de: ["Không phải *càng trắng càng đẹp*"],
        noi: [
          "[warmly] Lúc so màu, đừng chọn màu trắng nhất bảng.",
          "Bác sĩ sẽ chọn tông hài hòa với răng thật, màu da và gương mặt của bạn.",
        ],
        phu_de: [
          "Lúc so màu, *đừng chọn màu trắng nhất bảng*.",
          "Bác sĩ sẽ chọn tông *hài hòa* với răng thật, màu da và gương mặt của bạn.",
        ],
      },
      {
        id: "cta", loai: "cta",
        chip: ["Tư vấn tẩy trắng", "So màu răng sứ"],
        noi: [
          "[mischievously] Bạn đang định tẩy trắng hay làm sứ trước? Comment cho mình biết nha!",
          "[excited] Inbox Nha khoa Asia, đặt lịch để bác sĩ tư vấn thứ tự làm đúng cho bạn nha!",
        ],
        phu_de: [
          "Bạn đang định *tẩy trắng* hay *làm sứ* trước? Comment cho mình biết nha!",
          "*Inbox Nha khoa Asia*, đặt lịch để bác sĩ tư vấn *thứ tự làm đúng* cho bạn nha!",
        ],
      },
    ],
  },
];
