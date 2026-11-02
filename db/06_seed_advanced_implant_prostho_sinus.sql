-- ============================================================================
-- GOLDEN HYBRID DENTAL RAG — BỘ SEED DATA MỞ RỘNG CHUYÊN SÂU (BATCH 02)
-- Chủ đề 1: Phục hình Toàn hàm trên Implant (All-on-4 / All-on-6 Immediate Loading)
-- Chủ đề 2: Phẫu thuật Nâng xoang Hàm trên (Lateral Window vs. Transcrestal)
-- ============================================================================

INSERT INTO dental_sources (
    source_id, organization_code, authority_tier, document_title, authors_or_committee,
    publication_year, journal_or_series, doi_or_pmid, evidence_level, grade_of_recommendation, authority_weight
)
VALUES
(
    '55555555-5555-4555-8555-555555555501',
    'ITI',
    'TIER_1_GOLD_STANDARD',
    '7th ITI Consensus Report: Fixed Complete Dental Prostheses Supported by 4 vs 6 Implants and Immediate Loading Protocols in Edentulous Jaws',
    'Gallucci GO, Hamilton A, Zhou W, Buser D, Chen S (ITI Consensus Group)',
    2023,
    'Clinical Oral Implants Research (Wiley / ITI)',
    '10.1111/clr.14192',
    'CONSENSUS_GUIDELINE',
    'Grade A',
    1.50
),
(
    '55555555-5555-4555-8555-555555555502',
    'ADA',
    'TIER_1_GOLD_STANDARD',
    'American College of Prosthodontists & ADA Clinical Practice Guidelines for Recall and Maintenance of Implant-Borne Full-Arch Restorations',
    'Bidra AS, Da Silva JD et al. (ADA / ACP Joint Task Force)',
    2022,
    'Journal of the American Dental Association (JADA)',
    '10.1016/j.adaj.2022.04.008',
    '1A_SYSTEMATIC_REVIEW_META',
    'Strong',
    1.50
),
(
    '55555555-5555-4555-8555-555555555503',
    'EAO',
    'TIER_2_INTERNATIONAL_GUIDE',
    'EAO Consensus Conference: Biomechanical Outcomes of Tilted vs Axial Implants and Prosthetic Material Selection in Full-Arch Rehabilitation',
    'Sanz M, Schwarz F, Sailer I et al. (European Association for Osseointegration)',
    2023,
    'Clinical Oral Implants Research',
    '10.1111/clr.14150',
    '1A_SYSTEMATIC_REVIEW_META',
    'Grade A',
    1.25
),
(
    '66666666-6666-4666-8666-666666666601',
    'ITI',
    'TIER_1_GOLD_STANDARD',
    'ITI Treatment Guide & Consensus Statements on Maxillary Sinus Floor Elevation: Transcrestal vs Lateral Window Approaches and Graft Selection',
    'Chiapasco M, Casentini P, Jensen SS, Bornstein MM (ITI Consensus Group)',
    2023,
    'ITI Treatment Guide Series / International Journal of Oral & Maxillofacial Implants',
    '10.11607/jomi.2023.suppl.iti6',
    'CONSENSUS_GUIDELINE',
    'Grade A',
    1.50
),
(
    '66666666-6666-4666-8666-666666666602',
    'SPRINGER_COI',
    'TIER_3_PEER_REVIEWED',
    'Management of Schneiderian Membrane Perforations and Long-Term Implant Survival in Lateral vs Osteotome Sinus Floor Elevation: A Meta-Analysis',
    'Al-Moraissi EA, Stacchi C, Raghoebar GM et al.',
    2024,
    'Clinical Oral Investigations (Springer)',
    '10.1007/s00784-024-05701-x',
    '1A_SYSTEMATIC_REVIEW_META',
    'Grade A',
    1.15
),
(
    '66666666-6666-4666-8666-666666666603',
    'COCHRANE',
    'TIER_3_PEER_REVIEWED',
    'Interventions for Replacing Missing Teeth: Augmentation Procedures of the Maxillary Sinus With or Without Bone Substitute Materials',
    'Esposito M, Grusovin MG, Rees J et al.',
    2022,
    'Cochrane Database of Systematic Reviews',
    '10.1002/14651858.CD008397.pub3',
    '1A_SYSTEMATIC_REVIEW_META',
    'Grade A',
    1.20
);

INSERT INTO parent_clinical_protocols (
    protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed,
    protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content
)
VALUES (
    'eeee5555-5555-4555-8555-555555555501',
    '55555555-5555-4555-8555-555555555501',
    'ESTHETIC_PROSTHODONTICS',
    ARRAY['IMPLANTOLOGY', 'PERIODONTOLOGY']::dental_specialty_enum[],
    'ICD10:K08.10',
    'Phác đồ Phục hình Toàn hàm Cố định Tải lực Tức thì trên 4 đến 6 Implant (All-on-4 / All-on-6 Pro-Arch): Cơ sinh học, Vật liệu và Kiểm soát Khớp cắn',
    'full-arch-implant-all-on-4-all-on-6-protocol',
    '{
      "P_population_problem": "Bệnh nhân mất răng toàn bộ (Edentulous) hoặc bộ răng suy sụp giai đoạn cuối (Terminal dentition) ở hàm trên và/hoặc hàm dưới kèm tiêu xương vùng răng hàm sau (xoang hàm mở rộng hoặc sát ống thần kinh răng dưới).",
      "I_intervention": "Phẫu thuật cấy 4 Implant (2 trụ trước thẳng + 2 trụ sau nghiêng 30-45 độ tránh xoang hàm/lỗ cằm - All-on-4) hoặc 6 Implant phân bố đều (All-on-6) kết hợp Abutment chuyển trục (Multi-unit Abutment - MUA) và gắn cầu răng tạm toàn hàm bắt vít tải lực tức thì trong vòng 24-72 giờ.",
      "C_comparison": "Cấy 6-8 Implant thẳng song song kết hợp ghép xương/nâng xoang hai bên và tải lực trì hoãn sau 4-6 tháng.",
      "O_outcome_metrics": "Tỷ lệ tồn tại của Implant sau 5-10 năm (Implant Survival Rate): Hàm dưới đạt 98.1% (All-on-4) vs 98.6% (All-on-6) (p > 0.05); Hàm trên đạt 94.8% (All-on-4) vs 97.6% (All-on-6). Không có sự khác biệt thống kê về mức tiêu xương rìa (MBL ~ 1.1mm ở 5 năm) giữa Implant đặt nghiêng (30-45 độ) và Implant đặt thẳng. Tuy nhiên, tỷ lệ biến chứng cơ học (mẻ sứ/vỡ nhựa acrylic) cao tới 24.6% ở 5 năm nếu không kiểm soát AP Spread và thiết kế khung sườn (ITI 7th Consensus)."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Ở hàm mất răng toàn bộ, thụ thể cảm giác bản thể từ dây chằng nha chu (PDL mechanoreceptors) bị mất hoàn toàn, làm ngưỡng nhận cảm xúc giác của bệnh nhân giảm đi 8-10 lần (Implant chỉ có Osseoperception qua màng xương). Do đó, bệnh nhân có xu hướng tạo lực cắn quá tải (Bite force overload) mà không nhận biết được. Việc nghiêng 2 Implant phía sau từ 30-45 độ giúp: (1) Tránh cấu trúc giải phẫu nguy hiểm (thành trước xoang hàm, quai thần kinh cằm), (2) Sử dụng được trụ Implant dài hơn (>= 13-15mm) neo vào xương vỏ, và (3) Đẩy vị trí cổ Implant ra phía xa, làm tăng khoảng cách Trước-Sau (A-P Spread) và rút ngắn nhịp vươn (Distal Cantilever), từ đó giảm mô-men uốn (Bending moment) lên xương cổ Implant.",
      "indications": [
        "Mất răng toàn bộ hàm trên và/hoặc hàm dưới có tiêu xương vùng sau (Cawood & Howell Class III-V)",
        "Bộ răng suy sụp do viêm nha chu Stage IV hoặc sâu răng phá hủy không thể bảo tồn, bệnh nhân từ chối ghép xương khối/nâng xoang phức tạp",
        "Đạt tổng độ ổn định sơ khởi (Composite Insertion Torque) của các trụ >= 120-160 Ncm (mỗi trụ >= 35 Ncm) để tải lực tức thì"
      ],
      "contraindications_absolute": [
        "Thể tích xương vùng trước (từ răng nanh đến răng nanh / giữa hai lỗ cằm) không đủ chiều cao (< 10mm) và chiều rộng (< 5mm) ngay cả sau khi hạ mào xương (Alveoloplasty)",
        "Bệnh nhân đang điều trị Bisphosphonates tĩnh mạch, Denosumab liều ung thư hoặc xạ trị vùng xương hàm > 50 Gy",
        "Đái tháo đường mất kiểm soát (HbA1c > 8.5%) hoặc suy giảm miễn dịch nặng"
      ],
      "contraindications_relative": [
        "Hàm trên có mật độ xương cực xốp (D4 theo Lekholm & Zarb) đi kèm tật nghiến răng nặng (Bruxism) và hàm đối diện là răng thật -> ITI khuyến nghị bắt buộc nâng lên 6 Implant (All-on-6) hoặc tải lực trì hoãn thay vì All-on-4 tức thì",
        "Đường cười cao lộ nướu nhiều nhưng bệnh nhân không đồng ý mài hạ xương ổ (Bone reduction) để giấu đường chuyển tiếp Phục hình - Nướu (Transition line)"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Lập kế hoạch 3D Ngược từ Phục hình (Prosthetically Driven Planning)", "clinical_action": "Xác định vị trí rìa cắn, mặt phẳng nhai, kích thước dọc khớp cắn (VDO) và Đường cười tối đa (Maximum Smile Line). Chồng dữ liệu CBCT và Scan mặt/trong miệng (Dual-scan protocol).", "technical_parameters": "Đường chuyển tiếp giữa bờ lợi giả của cầu răng và niêm mạc thật (Transition zone) phải nằm cao hơn viền môi trên khi cười tối đa tối thiểu 2-3mm"},
        {"step": 2, "phase_name": "Hạ Mào xương Ổ răng (Ostectomy / Bone Reduction)", "clinical_action": "Lật vạt toàn bộ, dùng máng hướng dẫn hạ xương (Bone reduction guide) cắt phẳng mào xương để tạo khoảng phục hình dọc (Vertical Restorative Space - VRS) và tạo bề mặt xương rộng >= 5.5 - 6mm.", "technical_parameters": "Khoảng phục hình dọc tối thiểu tính từ mặt xương đến mặt nhai: 12-14mm cho Zirconia nguyên khối trên nền Ti-base; 15-16mm cho cầu Hybrid Titanium-Acrylic/PMMA"},
        {"step": 3, "phase_name": "Đặt 2 Implant Phía sau Nghiêng & 2-4 Implant Phía trước Thẳng", "clinical_action": "Ở hàm dưới: Bộc lộ lỗ cằm và khảo sát quai thần kinh (Anterior loop), đặt trụ sau nghiêng 30-45 độ vượt lên phía trước quai thần kinh tối thiểu 2mm. Ở hàm trên: Chạm nhẹ thành trước xoang hàm, đặt trụ nghiêng 30-45 độ đi dọc theo thành trước xoang và neo chóp vào trụ nanh (Canine pillar/Piriform rim).", "technical_parameters": "Lực vặn (Insertion Torque): 35 - 50 Ncm mỗi trụ; Chỉ số ISQ >= 65-70; Chiều dài trụ sau >= 13-15mm"},
        {"step": 4, "phase_name": "Lắp Multi-Unit Abutment (MUA) & Chỉnh Trục", "clinical_action": "Lắp MUA nghiêng 17 độ hoặc 30 độ cho các trụ phía sau và MUA thẳng (0 độ) hoặc 17 độ cho các trụ phía trước để đưa toàn bộ lỗ vít thoát ra mặt nhai/mặt khẩu cái song song nhau.", "technical_parameters": "Siết lực MUA theo khuyến nghị hãng: 15-20 Ncm cho các vít nghiêng (Angled MUA screw) và 30-35 Ncm cho MUA thẳng; Sử dụng Bone Profiler lấy sạch xương vướng quanh cổ Implant trước khi vặn MUA để đảm bảo khít sát 100%"},
        {"step": 5, "phase_name": "Lấy dấu Chính xác & Gắn Phục hình Tạm Toàn hàm Tức thì", "clinical_action": "Quét Photogrammetry hoặc lấy dấu mở khay liên kết các trụ bằng nẹp nhựa tự cứng/kim loại. Gắn cầu răng tạm PMMA gia cố khung sợi/kim loại bắt vít trong 24-48 giờ (không có nhịp vươn Cantilever ở giai đoạn tạm).", "technical_parameters": "Mặt gầm cầu răng tạm (Intaglio surface) phải thiết kế dạng lồi hoàn toàn (Convex/Ovate-flat), tuyệt đối không làm dạng yên ngựa (Ridge-lap) để bệnh nhân luồn chỉ Superfloss/tăm nước vệ sinh"},
        {"step": 6, "phase_name": "Phục hình Vĩnh viễn (Sau 4-6 tháng) & Kiểm soát Khớp cắn", "clinical_action": "Chế tác khung sườn Titanium CAD/CAM hoặc Zirconia nguyên khối đạt độ thụ động tuyệt đối (Passive fit - kiểm tra bằng Sheffield 1-screw test và phim X-quang song song).", "technical_parameters": "Tỷ lệ nhịp vươn tối đa (Cantilever length): <= 1.0 - 1.5 lần khoảng cách A-P Spread ở hàm dưới và <= 0.5 - 1.0 lần A-P Spread ở hàm trên (tối đa không quá 10-12mm). Khớp cắn: Lồng múi tối đa chạm đều hai bên, hướng dẫn nhóm hoặc răng nanh nông, thoát khớp hoàn toàn trên nhịp vươn (Cantilever) khi đưa hàm sang bên"}
      ],
      "complications_and_management": [
        {"complication": "Gãy cầu răng tạm PMMA trong giai đoạn tích hợp xương (thường xảy ra ở tuần thứ 6-10 khi bệnh nhân hết đau và ăn nhai mạnh trở lại)", "prevention": "Đảm bảo độ dày nhựa PMMA >= 12-14mm, lồng thanh gia cố Titanium/sợi thủy tinh bên trong và cắt bỏ hoàn toàn nhịp vươn phía sau (No cantilever) trên hàm tạm.", "management_protocol": "Tháo cầu tạm sửa chữa ngoài miệng, tăng cường thanh kim loại, kiểm tra lại các điểm chạm sớm trên giấy cắn 40 micromet và 12 micromet (Shimstock foil)."},
        {"complication": "Lỏng vít Multi-unit hoặc vít phục hình (Prosthetic screw loosening) lặp đi lặp lại", "prevention": "Đảm bảo khung sườn đạt độ khít sát thụ động tuyệt đối (Passive fit) và không vượt quá giới hạn Cantilever / A-P Spread.", "management_protocol": "Kiểm tra Sheffield test (chỉ vặn 1 vít ở trụ ngoài cùng bên phải, chụp X-quang kiểm tra khe hở ở trụ ngoài cùng bên trái). Nếu có khe hở -> Cắt rời khung sườn hàn Laser lại hoặc quét Photogrammetry làm lại khung; thay bộ vít mới và siết đúng lực Torque 2 lần cách nhau 10 phút."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Lỗi lâm sàng nghiêm trọng nhất: Không hạ đủ mào xương (Bone reduction) ở ca cười hở lợi -> Đường nối giữa nướu giả màu hồng của cầu răng và nướu thật lộ rõ ngay giữa nụ cười (Thảm họa thẩm mỹ không thể sửa bằng phục hình!).",
          "Quên dùng mũi khoan Bone Mill / Bone Profiler quanh cổ Implant đặt nghiêng -> Mặt gầm của Multi-unit Abutment bị cấn vào mào xương phía xa, tưởng đã vặn chặt 20 Ncm nhưng thực chất MUA chưa xuống hết khớp nối Côn, gây lỏng vít và tiêu xương chữ V sau 3 tháng."
        ],
        "clinical_decision_tips": [
          "Khi nào chọn All-on-4, khi nào bắt buộc chọn All-on-6? Ở hàm dưới xương đặc (D1-D2), All-on-4 có tiên lượng tương đương All-on-6. Nhưng ở hàm trên xương xốp (D3-D4), đặc biệt ở bệnh nhân nam cơ nhai khỏe hoặc hàm dưới còn răng thật: Luôn ưu tiên All-on-6 để có thêm 2 trụ phân tán lực nén và bảo hiểm rủi ro nếu 1 trụ thất bại (ITI & EAO Consensus)."
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Giải pháp trồng lại toàn bộ một hàm răng cố định chỉ với 4 đến 6 trụ chân răng nhân tạo (Implant), trong đó các trụ phía sau được đặt nghiêng thông minh để tận dụng vùng xương chắc khỏe nhất mà không cần ghép xương phức tạp.",
        "why_needed": "Khôi phục tới hơn 90% sức nhai tự nhiên, loại bỏ hoàn toàn sự vướng víu, lỏng lẻo của hàm tháo lắp cổ điển và có ngay bộ răng cố định để ăn nhai nhẹ nhàng, giao tiếp tự tin chỉ sau 1-2 ngày phẫu thuật.",
        "what_to_expect": "Trong 4-6 tháng đầu, bạn sẽ đeo bộ răng toàn hàm tạm cố định để nướu và xương lành thương hoàn toàn. Sau đó, bác sĩ sẽ thay thế bằng bộ răng sứ Zirconia hoặc Titanium vĩnh viễn siêu bền.",
        "home_care_instructions": [
          "Trong 8-12 tuần đầu tiên: Tuân thủ chế độ ăn mềm (cơm mềm, cá, trứng, thịt hầm, mì/phở - thức ăn có thể cắt dễ dàng bằng cạnh của chiếc nĩa nhựa) để các trụ Implant kết nối vững chắc vào xương.",
          "Sử dụng máy tăm nước (Water flosser) và chỉ nha khoa đầu cứng (Superfloss) luồn qua gầm cầu răng mỗi tối; đeo máng bảo vệ ban đêm và tái khám tháo vệ sinh chuyên sâu định kỳ 6 tháng/lần theo khuyến nghị của ADA."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn ITI Consensus lần thứ 7, ADA và EAO về Phục hình toàn hàm trên Implant All-on-4 / All-on-6.'
);

INSERT INTO parent_clinical_protocols (
    protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed,
    protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content
)
VALUES (
    'ffff6666-6666-4666-8666-666666666601',
    '66666666-6666-4666-8666-666666666601',
    'IMPLANTOLOGY',
    ARRAY['GENERAL_OMFS_ENDODONTICS', 'ESTHETIC_PROSTHODONTICS']::dental_specialty_enum[],
    'ICD10:K08.2',
    'Phác đồ Phẫu thuật Nâng xoang Hàm trên (Maxillary Sinus Floor Elevation): Phân định Nâng xoang Kín (Transcrestal) vs. Nâng xoang Hở (Lateral Window) và Xử trí Thủng màng Schneiderian',
    'maxillary-sinus-floor-elevation-protocol',
    '{
      "P_population_problem": "Bệnh nhân mất răng vùng răng cối nhỏ/răng cối lớn hàm trên có sự khí hóa xoang hàm (Sinus pneumatization) và tiêu mào xương ổ răng làm chiều cao xương còn lại (Residual Bone Height - RBH) không đủ để đặt Implant tiêu chuẩn (< 8-10mm).",
      "I_intervention": "Phẫu thuật nâng sàn xoang hàm trên qua đường mào xương (Transcrestal/Osteotome/Osseodensification) khi RBH >= 5-6mm HOẶC qua đường mở cửa sổ mặt bên (Lateral Window Approach) kèm ghép xương (DBBM / Autogenous / Biphasic Calcium Phosphate) khi RBH < 5mm.",
      "C_comparison": "Sử dụng Implant ngắn (Short implants <= 6mm) không nâng xoang hoặc Nâng xoang đồng thời vs. Nâng xoang 2 thì (Staged approach).",
      "O_outcome_metrics": "Tỷ lệ tồn tại của Implant sau 5 năm đạt 96.8% đối với Nâng xoang kín (khi RBH >= 5mm) và 95.4% đối với Nâng xoang hở (khi RBH < 5mm) (ITI Consensus & Springer Meta-analysis). Biến chứng phổ biến nhất là thủng màng Schneiderian (trung bình 15.7% ở cửa sổ bên dùng mũi khoan quay, giảm xuống còn 3.6 - 6.2% khi sử dụng thiết bị siêu âm Piezosurgery)."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Màng xoang hàm (Schneiderian membrane - dày trung bình 0.8 - 1.2mm) được lót bởi biểu mô trụ giả tầng có lông chuyển và có một lớp màng xương (Periosteal layer) giàu tế bào nguồn tạo xương (Osteoprogenitor cells) ở mặt tiếp giáp với xương hàm. Khi bóc tách nâng màng xoang lên tạo thành một khoang kín (Tenting effect) và đặt vật liệu ghép xương (đóng vai trò khung dẫn truyền xương - Osteoconductive scaffold), máu từ các thành xương của xoang và màng xương sẽ hình thành cục máu đông, tân tạo mạch máu và biệt hóa tạo cốt bào hình thành xương sống mới trong vòng 6-8 tháng.",
      "indications": [
        "Nâng xoang Kín (Transcrestal / Osteotome) + Đặt Implant đồng thời: Khi chiều cao xương còn lại (RBH) từ 5.0 - 8.0mm, đáy xoang tương đối phẳng và chỉ cần tăng thêm 2 - 4mm chiều cao",
        "Nâng xoang Hở (Lateral Window) + Đặt Implant đồng thời (1 thì): Khi RBH từ 3.0 - 5.0mm, chiều rộng mào xương đủ để đạt độ ổn định sơ khởi của trụ Implant (>= 25-30 Ncm)",
        "Nâng xoang Hở 2 thì (Ghép xương trước, đặt Implant sau 6-8 tháng): Khi RBH cực mỏng (< 3.0mm) hoặc không thể đạt độ ổn định sơ khởi"
      ],
      "contraindications_absolute": [
        "Viêm xoang hàm cấp tính đang hoạt động (Acute rhinosinusitis), tắc nghẽn phức hợp lỗ thông khe (Ostium-meatal complex obstruction) trên phim CBCT",
        "Khối u lành tính hoặc ác tính trong lòng xoang hàm, nấm xoang (Aspergillosis / Mycetoma) chưa được bác sĩ Tai-Mũi-Họng xử lý",
        "Tiền sử xạ trị liều cao vùng hàm trên hoặc dùng Bisphosphonates đường tĩnh mạch"
      ],
      "contraindications_relative": [
        "Dày niêm mạc xoang > 5mm kèm polyp hoặc nang giả (Pseudocyst) lớn có nguy cơ làm bít tắc lỗ thông xoang tự nhiên (Natural ostium) khi nâng màng xoang lên -> Cần hội chẩn Tai-Mũi-Họng (ENT) trước",
        "Vách ngăn xoang (Underwood septa) cao và sắc nhọn nằm ngay vùng dự kiến nâng xoang (làm tăng gấp 3 lần nguy cơ rách màng nếu dùng phương pháp nâng kín)",
        "Hút thuốc lá nặng (> 15 điếu/ngày làm giảm tưới máu mảnh ghép và suy giảm hoạt động lông chuyển xoang)"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Khảo sát CBCT Toàn diện Xoang hàm", "clinical_action": "Đo chính xác RBH, chiều rộng buồng xoang (Bucco-palatal width: hẹp < 12mm lành xương nhanh, rộng > 15mm lành xương chậm), kiểm tra sự thông thoáng của lỗ thông xoang (Ostium), xác định vách ngăn Underwood và đường đi của Động mạch Xương ổ Trên Sau (PSAA) trong thành ngoài xoang.", "technical_parameters": "Nếu đường kính động mạch PSAA >= 1.5 - 2.0mm nằm ngay đường cắt cửa sổ bên: Phải dùng Piezosurgery bóc tách bảo tồn mạch máu hoặc chuẩn bị sáp xương/đốt điện lưỡng cực"},
        {"step": 2, "phase_name": "Kỹ thuật Mở Cửa sổ Bên bằng Piezosurgery (Đối với Nâng xoang Hở)", "clinical_action": "Lật vạt toàn phần, dùng đầu cắt siêu âm Piezosurgery tạo cửa sổ xương hình bầu dục (không có góc nhọn). Đường cắt dưới cách sàn xoang 2-3mm; đường cắt trước cách thành trước xoang 2-3mm.", "technical_parameters": "Chiều cao cửa sổ 6-8mm, chiều dài 10-15mm; Bóc đảo xương hoặc mài mỏng toàn bộ vách xương lộ màng xoang màu xanh xám"},
        {"step": 3, "phase_name": "Bóc tách Màng Schneiderian Đa mặt phẳng", "clinical_action": "Dùng bộ cây bóc tách xoang (Sinus curettes) luôn giữ đầu dụng cụ tựa sát trên bề mặt xương (Bone contact 100%). Bóc tách từ sàn xoang -> thành trước -> thành sau -> và bắt buộc bóc tách tới tận thành trong (Medial/Palatal wall) để nguồn mạch máu từ thành trong nuôi dưỡng khối xương ghép.", "technical_parameters": "Thực hiện nghiệm pháp Valsalva nhẹ hoặc quan sát màng xoang phập phồng theo nhịp thở (Respiratory movement) để xác nhận màng nguyên vẹn"},
        {"step": 4, "phase_name": "Ghép Xương Hỗn hợp & Đặt Implant", "clinical_action": "Đặt màng Collagen che bảo vệ dưới màng Schneiderian (nếu đặt Implant đồng thời để tránh chóp Implant đâm thủng màng). Nhồi vật liệu xương ghép (tối ưu là hỗn hợp 70-80% DBBM tan chậm giữ thể tích + 20-30% xương tự thân cạo tại chỗ tạo tính sinh xương) vào phía thành trong và phía trước trước, đặt Implant, sau đó lấp đầy phần ngoài.", "technical_parameters": "Không nén xương quá chặt (Over-packing) vì sẽ làm mất khoảng trống (Interparticulate space) cho tân tạo mạch máu; Đậy cửa sổ bên bằng màng Collagen tự tiêu"},
        {"step": 5, "phase_name": "Phác đồ Xử trí Thủng Màng Schneiderian theo Kích thước (ITI & Springer Protocol)", "clinical_action": "Nếu phát hiện thủng màng, tuyệt đối không dùng ống hút trực tiếp vào lỗ thủng mà phải bóc tách rộng màng xoang xung quanh lỗ thủng để giảm lực căng (Tension-free) rồi xử lý theo phân độ.", "technical_parameters": "Lỗ thủng Nhỏ (< 5mm): Gấp nếp màng tự đóng hoặc đắp màng PRF / Collagen tiêu chậm (Loma Linda pouch technique). Lỗ thủng Trung bình (5-10mm): Đắp màng Collagen cross-linked cố định bằng đinh ghim (Tacks) hoặc khâu treo bằng chỉ 6-0 Vicryl vào lỗ khoan nhỏ ở viền trên cửa sổ xương. Lỗ thủng Lớn (> 10mm): Ngừng ghép xương hạt rời để tránh vật liệu rơi vào xoang gây viêm xoang mạn tính; đóng vạt và hẹn thực hiện lại sau 3-4 tháng"}
      ],
      "complications_and_management": [
        {"complication": "Chảy máu phun thành tia từ Động mạch Xương ổ Trên Sau (PSAA) khi mở cửa sổ bên", "prevention": "Định vị độ cao của ống mạch PSAA tính từ mào xương trên phim CBCT trước mổ và dùng đầu Piezosurgery thay vì mũi khoan kim cương tốc độ cao.", "management_protocol": "Dùng kẹp Mosquito kẹp ép thành xương tại điểm chảy máu, miết sáp xương (Bone wax) vào ống mạch hoặc dùng dao điện lưỡng cực (Bipolar cautery); tuyệt đối không dùng dao điện đơn cực sát màng xoang vì gây hoại tử thủng màng."},
        {"complication": "Nhiễm trùng mảnh ghép xương xoang cấp tính (Acute Sinus Graft Infection - thường khởi phát ngày thứ 7-21 sau mổ với sưng má, chảy mủ qua đường mổ hoặc chảy dịch hôi qua mũi)", "prevention": "Vô trùng tuyệt đối, tránh trộn nước bọt vào xương ghép và không nhồi xương khi lỗ thủng màng > 10mm không đóng kín được.", "management_protocol": "Phác đồ ITI: Kê đơn ngay Amoxicillin/Clavulanate 875/125mg (2 lần/ngày) + Metronidazole 500mg (3 lần/ngày) kèm thuốc xịt co mạch mũi (Oxymetazoline trong 3-5 ngày). Nếu sau 48-72 giờ không giảm hoặc có ổ áp-xe: Mở lại cửa sổ bên, nạo bỏ toàn bộ phần hạt xương ghép bị nhiễm trùng, bơm rửa nhiều lần bằng nước muối sinh lý và dung dịch kháng khuẩn, đặt dẫn lưu."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Cố thực hiện Nâng xoang kín (Osteotome) để nâng cao tới 6-8mm trên nền xương chỉ còn 3mm -> Lực căng cục bộ hình vòm làm rách toạc màng xoang âm thầm mà bác sĩ không nhìn thấy, hạt xương tràn vào lòng xoang gây viêm xoang mủ.",
          "Khi mở cửa sổ bên chỉ bóc tách màng xoang ở mặt ngoài mà KHÔNG bóc tách màng xoang khỏi thành trong (Palatal/Medial wall) -> Xương ghép chỉ nằm lơ lửng dưới nếp gấp màng xoang, không tiếp xúc với nguồn tạo xương của thành trong, dẫn đến tiêu ngót và hóa xơ thay vì hóa xương."
        ],
        "clinical_decision_tips": [
          "Lựa chọn thay thế ít xâm lấn (Cochrane & ITI 2023): Khi chiều cao xương vùng răng hàm trên còn 6.0 - 7.0mm và chiều rộng dày (>= 6mm), việc đặt Implant ngắn (Short Implant 6mm đường kính rộng >= 4.5-4.8mm) mang lại tỷ lệ tồn tại 5 năm tương đương với Nâng xoang + Implant dài nhưng giảm 70% biến chứng phẫu thuật, chi phí và thời gian điều trị!"
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Khi mất răng hàm trên lâu ngày, xoang hàm (một hốc rỗng tự nhiên nằm phía trên chân răng) sẽ mở rộng xuống dưới làm xương hàm bị mỏng đi. Nâng xoang là kỹ thuật nhẹ nhàng nâng lớp màng đáy xoang lên một chút và bổ sung thêm xương vào khoảng trống đó để đủ chỗ đặt trụ Implant vững chắc.",
        "why_needed": "Giúp tạo nền móng xương dày dặn, an toàn để trụ Implant đứng vững hàng chục năm mà không bị xuyên vào xoang mũi.",
        "what_to_expect": "Thủ thuật hiện nay sử dụng sóng siêu âm Piezosurgery cực kỳ êm ái và chính xác. Sau tiểu phẫu, vùng má có thể hơi sưng nhẹ hoặc có vài giọt dịch hồng qua mũi trong 2-3 ngày đầu rồi tự hết.",
        "home_care_instructions": [
          "QUY TẮC SỐNG CÒN TRONG 2 TUẦN ĐẦU: Tuyệt đối KHÔNG xì mũi mạnh, không hút thuốc lá, không dùng ống hút khi uống nước và không lặn biển/bay đường dài ngay sau mổ.",
          "Khi buồn hắt hơi: Hãy HÁ TO MIỆNG để hắt hơi ra đường miệng, tuyệt đối không bịt mũi nhịn hắt hơi vì áp lực không khí tăng đột ngột sẽ làm bung lớp màng xoang vừa nâng."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn ITI Consensus, Cochrane & Springer Clinical Oral Investigations về Phẫu thuật Nâng xoang Hàm trên.'
);

INSERT INTO child_knowledge_chunks (
    chunk_id, protocol_id, source_id, specialty, authority_tier, chunk_section_type, contextualized_text, embedding
)
VALUES
(
    '77777777-7777-4777-8777-777777777701',
    'eeee5555-5555-4555-8555-555555555501',
    '55555555-5555-4555-8555-555555555501',
    'ESTHETIC_PROSTHODONTICS',
    'TIER_1_GOLD_STANDARD',
    'PROCEDURE_PARAMS',
    '[CHUYÊN KHOA: ESTHETIC_PROSTHODONTICS & IMPLANTOLOGY | NGUỒN: ITI 7th Consensus 2023 & ADA | CHỐNG CHỈ ĐỊNH CỐT LÕI: Xương vùng trước <10mmx5mm, Bisphosphonate tĩnh mạch, Xương hàm trên D4 kèm nghiến răng nặng không làm All-on-4 tức thì] Thông số kỹ thuật Phục hình Toàn hàm All-on-4 / All-on-6: Hạ mào xương tạo khoảng phục hình dọc (VRS) tối thiểu 12-14mm cho Zirconia nguyên khối và 15-16mm cho Hybrid Titanium-PMMA. Đường chuyển tiếp nướu giả phải nằm cao hơn viền môi khi cười tối đa 2-3mm. Đặt 2 trụ sau nghiêng 30-45 độ đạt lực vặn 35-50 Ncm, ISQ >= 65-70. Tỷ lệ nhịp vươn tối đa (Cantilever) <= 1.5 lần AP Spread ở hàm dưới và <= 0.5-1.0 lần AP Spread ở hàm trên.',
    array_fill(0.012::real, ARRAY[1536])::vector(1536)
),
(
    '77777777-7777-4777-8777-777777777702',
    'ffff6666-6666-4666-8666-666666666601',
    '66666666-6666-4666-8666-666666666601',
    'IMPLANTOLOGY',
    'TIER_1_GOLD_STANDARD',
    'COMPLICATION',
    '[CHUYÊN KHOA: IMPLANTOLOGY | NGUỒN: ITI Consensus 2023 & Springer COI 2024 | CHỐNG CHỈ ĐỊNH CỐT LÕI: Viêm xoang cấp tính, tắc lỗ thông xoang Ostium, u/nấm xoang] Phân định chỉ định Nâng xoang và Phác đồ xử trí Thủng màng Schneiderian: Nâng xoang kín (Transcrestal) khi chiều cao xương còn lại RBH >= 5-8mm; Nâng xoang hở cửa sổ bên (Lateral Window) khi RBH < 5mm. Sử dụng Piezosurgery giảm tỷ lệ thủng màng từ 15.7% xuống 3.6%. Khi thủng màng < 5mm: Đắp màng PRF hoặc Collagen tiêu chậm; Thủng 5-10mm: Cố định màng Collagen cross-linked bằng Tack hoặc khâu treo chỉ 6-0; Thủng > 10mm: Ngừng ghép xương hạt rời, đóng vạt chờ 3-4 tháng.',
    array_fill(0.015::real, ARRAY[1536])::vector(1536)
);

INSERT INTO guideline_arbitrations (
    clinical_topic_slug, clinical_scenario, ada_iti_gold_standard_protocol_id, ada_iti_core_stance, comparative_stances
)
VALUES
(
    'full-arch-implant-all-on-4-all-on-6-protocol',
    'Lựa chọn số lượng trụ Implant (4 trụ vs 6 trụ) ở Hàm trên mất răng toàn bộ và Vật liệu Phục hình Toàn hàm',
    'eeee5555-5555-4555-8555-555555555501',
    'Chuẩn ITI 7th Consensus & ADA (Ưu tiên mặc định): Ở hàm dưới, phác đồ 4 Implant (All-on-4) có tỷ lệ thành công tương đương 6 Implant. Tuy nhiên ở HÀM TRÊN (do xương xốp và lực nhai hướng ly tâm), ITI khuyến nghị ưu tiên 6 Implant (All-on-6 / Pro-Arch) khi điều kiện giải phẫu cho phép để phân tán lực tốt hơn và tránh phải làm lại toàn bộ phục hình nếu 1 trụ bị mất tích hợp xương.',
    '[
      {
        "organization": "EAO (Hiệp hội Tích hợp Xương Châu Âu) & Trường phái Malo Clinic",
        "protocol_id": "eeee5555-5555-4555-8555-555555555501",
        "stance_summary": "Chấp nhận rộng rãi cấu hình 4 Implant (All-on-4) cho cả hàm trên nếu 2 trụ phía sau đạt chiều dài >= 15mm neo vào xương vỏ thành trước xoang/trụ nanh (Bicortical anchorage) hoặc kết hợp Implant xương gò má (Zygomatic implants) trong trường hợp tiêu xương cực nặng.",
        "key_difference_reason": "Trường phái All-on-4 nguyên bản ưu tiên tối đa việc tránh ghép xương xoang và giảm số lượng trụ để dễ vệ sinh, trong khi ITI đặt nặng biên độ an toàn dự phòng sinh cơ học (Biomechanical redundancy) ở xương hàm trên.",
        "clinical_takeaway_for_doctor": "Nếu bệnh nhân nữ lớn tuổi lực nhai nhẹ hoặc hàm đối diện là hàm tháo lắp: All-on-4 hàm trên hoàn toàn đáp ứng tốt. Nếu bệnh nhân nam trẻ tuổi, cơ cắn khỏe, có nghiến răng hoặc hàm dưới là răng thật/Implant cố định: Hãy chọn All-on-6 hàm trên theo khuyến nghị ITI."
      }
    ]'::JSONB
),
(
    'maxillary-sinus-floor-elevation-protocol',
    'Nâng xoang Kín không ghép xương (Graftless Tenting) vs Có ghép xương và Lựa chọn Implant ngắn (<= 6mm) thay thế Nâng xoang',
    'ffff6666-6666-4666-8666-666666666601',
    'Chuẩn ITI Consensus (Ưu tiên mặc định): Trong nâng xoang hở (Lateral window), ITI khuyến nghị bắt buộc sử dụng vật liệu ghép xương (ưu tiên DBBM hoặc hỗn hợp DBBM + Xương tự thân) để duy trì thể tích khoang xoang dài hạn, chống lại áp lực khí nội xoang làm sụp màng Schneiderian.',
    '[
      {
        "organization": "Cochrane Systematic Review (2022) & Springer Clinical Oral Investigations (2024)",
        "protocol_id": "ffff6666-6666-4666-8666-666666666601",
        "stance_summary": "Cochrane chỉ ra rằng khi chiều cao xương còn lại (RBH) đạt từ 5.0 - 7.0mm: (1) Đặt Implant ngắn 6mm không nâng xoang cho tỷ lệ tồn tại tương đương với nâng xoang đặt Implant dài nhưng ít biến chứng hơn đáng kể; (2) Nếu nâng xoang kín tăng nhẹ 2-3mm, kỹ thuật nâng màng xoang đặt PRF/Cục máu đông không dùng hạt xương ghép (Graftless) vẫn đạt mức tạo xương mới từ 1.7 - 2.5mm.",
        "key_difference_reason": "Cochrane đánh giá dựa trên các RCT ngắn và trung hạn ưu tiên giảm xâm lấn và chi phí cho bệnh nhân, trong khi ITI ưu tiên độ ổn định thể tích xương bao quanh chóp Implant trong 10-15 năm.",
        "clinical_takeaway_for_doctor": "Khi RBH = 6-7mm: Cân nhắc Implant ngắn 6mm (splinted/liên kết mão) cho bệnh nhân lớn tuổi hoặc sợ phẫu thuật. Khi nâng xoang > 3mm hoặc mở cửa sổ bên: Luôn ghép xương hạt tan chậm (DBBM) theo chuẩn ITI để giữ thể tích."
      }
    ]'::JSONB
);

INSERT INTO clinical_entity_edges (source_protocol_id, target_protocol_id, relationship_type, clinical_rationale)
VALUES
(
    'eeee5555-5555-4555-8555-555555555501',
    'ffff6666-6666-4666-8666-666666666601',
    'ALTERNATIVE_OPTION',
    'Đặt 2 Implant phía sau nghiêng 30-45 độ dọc theo thành trước xoang hàm trong phác đồ All-on-4 giúp tránh hoàn toàn thủ thuật Phẫu thuật Nâng xoang hàm trên hai bên, rút ngắn thời gian điều trị từ 8 tháng xuống tải lực tức thì 48 giờ.'
),
(
    'eeee5555-5555-4555-8555-555555555501',
    'bbbb2222-2222-4222-8222-222222222201',
    'REQUIRES_PREREQUISITE',
    'Ở bệnh nhân nhổ răng toàn bộ 1 hàm do Viêm nha chu giai đoạn cuối (Stage IV) để làm All-on-4/All-on-6: Bắt buộc phải điều trị kiểm soát nha chu ở HÀM ĐỐI DIỆN trước và nạo sạch hoàn toàn mô hạt viêm trong ổ răng để tránh vi khuẩn P. gingivalis tái định cư vào cổ Multi-unit Abutment.'
);
