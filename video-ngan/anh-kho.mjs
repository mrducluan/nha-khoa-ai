// Ảnh nền thật cho từng cảnh — ảnh kho Pexels (giấy phép Pexels: dùng thương mại miễn phí, không bắt ghi nguồn),
// bộ ảnh nha khoa của Anna Shvets, tải về anh/pexels-<id>.jpg (bản 1400 px). Nguồn: https://www.pexels.com/photo/<id>/
// [id, object-position] — vị trí cắt khung dọc cho ảnh ngang (giữ người trong khung).
// Cảnh không có trong bảng → giữ nền xanh đậm như cũ (vd. i03 kể chuyện gia đình: giữ minh hoạ ấm, không dùng ảnh người lạ).
export const ANH = {
  i01: { hook: [3845735, "45% 50%"], "xo-lech": [3845738, "42% 50%"], xuong: [3845745, "50% 40%"], "he-qua": [3845766, "45% 50%"], implant: [3845734, "50% 35%"], cta: [3845983, "62% 50%"] },
  i02: { hook: [3845981, "50% 50%"], "cau-tao": [3845723, "50% 50%"], "bon-cau": [3845807, "55% 50%"], lat: [3845809, "56% 50%"], cta: [3845983, "62% 50%"] },
  i03: { "giai-phap": [3845808, "50% 35%"], cta: [3845983, "62% 50%"] },
  s01: { hook: [3845686, "60% 50%"], "truong-hop": [3845744, "33% 50%"], "vi-sao": [3845710, "50% 40%"], "quy-trinh": [3845747, "55% 50%"], cta: [3845840, "50% 40%"] },
  s02: { hook: [3845853, "50% 45%"], "cat-lop": [3845856, "50% 50%"], "toan-su": [3845757, "50% 50%"], "luu-y": [3845766, "45% 50%"], cta: [3845841, "50% 40%"] },
  s03: { hook: [3845840, "50% 40%"], mau: [3845623, "45% 50%"], dang: [3845627, "56% 50%"], trong: [3845625, "48% 50%"], "thu-truoc": [3845807, "55% 50%"], cta: [3845843, "50% 40%"] },
};

/** Độ che của lớp tối giữa khung theo kiểu cảnh (0 = ảnh rõ, 1 = tối hẳn). */
export const DO_CHE = { minh_hoa: 0.8, danh_sach: 0.82, chu: 0.6, cta: 0.66 };
