// Nền thật cho từng cảnh: [tên file trong anh/ HOẶC mảng tên đoạn video trong clip/, object-position, độ che riêng?].
//  clip/*.mp4    — đoạn quay THẬT cắt từ video truyền thông của Tâm Đức Smile (khách đã đồng ý dùng hình ảnh),
//                  chỉ lấy cảnh sạch: không chữ giá/ưu đãi, không ảnh trước/sau. dung.mjs ghép, chiếu chậm 1,4×, lặp đủ cảnh.
//  td-*.jpg      — ảnh THẬT của Nha khoa Tâm Đức Smile (kho Drive truyền thông do chủ dự án cung cấp):
//                  quầy lễ tân, sảnh, phòng điều trị, máy CT Cone Beam, mặt tiền chi nhánh, bác sĩ làm Implant.
//  pexels-*.jpg  — ảnh kho Pexels (giấy phép thương mại miễn phí), chỉ làm nền không khí. Xem anh/NGUON.md.
// Không dùng: ảnh trước/sau, ảnh trong miệng khách, ảnh phẫu thuật có máu, banner có giá/ưu đãi.
// Cảnh không có trong bảng → giữ nền xanh đậm (vd. i03 kể chuyện gia đình: giữ minh hoạ ấm).
export const ANH = {
  i01: {
    hook: ["pexels-3845735.jpg", "45% 50%"], "xo-lech": ["pexels-3845738.jpg", "42% 50%"], xuong: ["pexels-3845745.jpg", "50% 40%"],
    "he-qua": ["pexels-3845766.jpg", "45% 50%"], implant: [["bac-si-implant", "tru-implant", "bac-si-implant"], "50% 40%"], cta: ["td-le-tan-1.jpg", "38% 50%"],
  },
  i02: {
    hook: ["td-phong-3.jpg", "55% 50%"], "cau-tao": [["tru-implant", "bac-si-implant", "tru-implant"], "50% 45%"], "bon-cau": ["td-may-ct-1.jpg", "70% 50%"],
    lat: [["ong-tu-van"], "50% 40%"], cta: ["td-le-tan-2.jpg", "45% 50%"],
  },
  i03: { "giai-phap": [["ong-tu-van", "ba-cuoi"], "50% 40%"], "mon-qua": [["ba-cuoi"], "50% 35%", 0.62], cta: ["td-mat-tien.jpg", "50% 50%"] },
  s01: {
    hook: ["pexels-3845686.jpg", "60% 50%"], "truong-hop": [["an-nhai", "nu-cuoi-can"], "50% 40%"], "vi-sao": ["pexels-3845710.jpg", "50% 40%"],
    "quy-trinh": [["bac-si-kham", "thiet-ke-cadcam", "bac-si-lam"], "50% 45%"], cta: ["td-le-tan-1.jpg", "38% 50%"],
  },
  s02: {
    hook: ["pexels-3845853.jpg", "50% 45%"], "cat-lop": ["pexels-3845856.jpg", "50% 50%"], "toan-su": ["pexels-3845757.jpg", "50% 50%"],
    "luu-y": [["bac-si-kham", "bac-si-lam"], "50% 45%"], cta: ["td-le-tan-2.jpg", "45% 50%"],
  },
  s03: {
    hook: [["nu-cuoi-can", "hai-nu-cuoi"], "50% 40%"], mau: [["so-mau-nam", "so-mau-nu"], "50% 40%"], dang: [["hai-nu-cuoi", "cuoi-ghe"], "50% 40%"],
    trong: ["pexels-3845625.jpg", "48% 50%"], "thu-truoc": [["thiet-ke-cadcam", "so-mau-nu"], "50% 45%"], cta: ["td-sanh-1.jpg", "45% 50%"],
  },
};

/** Độ che của lớp tối giữa khung theo kiểu cảnh (0 = ảnh rõ, 1 = tối hẳn). */
export const DO_CHE = { minh_hoa: 0.8, danh_sach: 0.8, chu: 0.55, cta: 0.68 };
