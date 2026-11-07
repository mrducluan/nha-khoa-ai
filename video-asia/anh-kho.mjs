// Nền thật cho từng cảnh: [tên file trong anh/ HOẶC mảng tên đoạn video trong clip/, object-position, độ che riêng?].
//  as-*.jpg      — ảnh THẬT của Nha khoa Asia, tải từ website nhakhoaasia.com (trang chủ, giới thiệu, dịch vụ),
//                  đã cắt bỏ logo nhỏ, khung chữ, số hotline có sẵn trong ảnh gốc. Xem anh/NGUON.md.
//  pexels-*.jpg  — ảnh kho Pexels (giấy phép thương mại miễn phí, người châu Á), chỉ làm nền không khí.
//  clip/*.mp4    — (chưa có) đoạn quay thật từ kênh YouTube @NhaKhoaAsia: chờ chủ dự án gửi file gốc vì YouTube
//                  chặn tải từ máy cloud. Có clip thì đổi nền cảnh sang mảng tên clip như bộ Tâm Đức.
// Không dùng: ảnh trước/sau, ảnh phim X-quang của khách, ảnh có chữ "không đau", banner có giá/ưu đãi.
// Cảnh cuối (CTA) dùng ảnh sảnh chờ, KHÔNG dùng ảnh bảng hiệu hay tường logo (tránh trùng logo với CTA).
export const ANH = {
  i01: {
    hook: ["as-phong-kinh-1.jpg", "50% 50%"], "noi-lo": ["as-tu-van-3.jpg", "40% 50%"], "hanh-trinh": ["as-chup-ct.jpg", "35% 50%"],
    kinh: ["as-phong-kinh-2.jpg", "45% 50%"], cta: ["as-sanh-2.jpg", "50% 50%"],
  },
  i02: {
    hook: ["as-tu-van-2.jpg", "30% 50%"], "vi-sao": ["as-tu-van-1.jpg", "35% 50%"], "nang-xoang": ["as-bs-lam-2.jpg", "40% 50%"],
    ct: ["as-chup-ct.jpg", "35% 50%"], cta: ["as-sanh-3.jpg", "50% 50%"],
  },
  i03: {
    hook: ["as-bs-lam-1.jpg", "45% 50%"], viem: ["as-bs-lam-5.jpg", "45% 50%"], "thoi-quen": ["as-bs-lam-3.jpg", "45% 50%"],
    chot: ["as-doi-ngu.jpg", "50% 50%"], cta: ["as-sanh-2.jpg", "50% 50%"],
  },
  s01: {
    hook: ["as-bs-lam-6.jpg", "45% 50%"], men: ["pexels-3845745.jpg", "50% 40%"], "muc-do": ["as-bs-lam-4.jpg", "40% 50%"],
    "mock-up": ["pexels-3845738.jpg", "42% 50%"], cta: ["as-sanh-3.jpg", "50% 50%"],
  },
  s02: {
    hook: ["as-scan.jpg", "60% 50%"], "ba-buoc": ["as-tu-van-1.jpg", "30% 50%"], thu: ["as-bs-lam-2.jpg", "40% 50%"],
    "loi-ich": ["as-tu-van-2.jpg", "30% 50%"], cta: ["as-sanh-2.jpg", "50% 50%"],
  },
  s03: {
    hook: ["as-bs-lam-4.jpg", "40% 50%"], "vi-sao": ["as-bs-lam-6.jpg", "45% 50%"], "thu-tu": ["as-tu-van-3.jpg", "40% 50%"],
    "so-mau": ["pexels-3845738.jpg", "42% 50%"], cta: ["as-sanh-3.jpg", "50% 50%"],
  },
  g01: {
    hook: ["as-bs-lam-5.jpg", "45% 50%"], "vi-sao": ["as-tu-van-1.jpg", "30% 50%"], "tan-goc": ["as-bs-lam-3.jpg", "45% 50%"],
    "canh-bao": ["as-tu-van-3.jpg", "40% 50%"], cta: ["as-sanh-2.jpg", "50% 50%"],
  },
  g02: {
    hook: ["as-bs-lam-1.jpg", "45% 50%"], "hieu-lam": ["as-tu-van-2.jpg", "30% 50%"], "bao-ve": ["as-bs-lam-4.jpg", "40% 50%"],
    "het-cach": ["as-bs-lam-6.jpg", "45% 50%"], cta: ["as-sanh-3.jpg", "50% 50%"],
  },
  g03: {
    hook: ["as-bs-lam-2.jpg", "40% 50%"], "ly-do": ["as-tu-van-2.jpg", "30% 50%"], som: ["as-doi-ngu.jpg", "50% 50%"],
    "sau-nho": ["as-bs-lam-5.jpg", "45% 50%"], cta: ["as-sanh-2.jpg", "50% 50%"],
  },
};

/** Độ che của lớp tối giữa khung theo kiểu cảnh (0 = ảnh rõ, 1 = tối hẳn). */
export const DO_CHE = { minh_hoa: 0.8, danh_sach: 0.8, chu: 0.55, cta: 0.68 };
