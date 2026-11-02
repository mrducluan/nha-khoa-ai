-- ============================================================================
-- SEED DATA HẠT GIỐNG CỐT LÕI CHO 4 CHUYÊN KHOA MŨI NHỌN
-- ============================================================================

INSERT INTO dental_sources (source_id, organization_code, authority_tier, document_title, authors_or_committee, publication_year, journal_or_series, doi_or_pmid, evidence_level, grade_of_recommendation, authority_weight)
VALUES
('11111111-1111-4111-8111-111111111101', 'ITI', 'TIER_1_GOLD_STANDARD', 'Proceedings of the 7th ITI Consensus Conference: Immediate Implant Placement and Loading Protocols in the Esthetic Zone', 'Morton D, Gallucci G, Buser D, Chappuis V et al. (ITI Consensus Group)', 2023, 'Clinical Oral Implants Research (Wiley / ITI)', '10.1111/clr.14185', 'CONSENSUS_GUIDELINE', 'Grade A', 1.50),
('11111111-1111-4111-8111-111111111102', 'ADA', 'TIER_1_GOLD_STANDARD', 'ADA Evidence-Based Clinical Practice Guideline on Antibiotic Prophylaxis and Peri-Implant Maintenance', 'American Dental Association Council on Scientific Affairs', 2023, 'Journal of the American Dental Association (JADA)', '10.1016/j.adaj.2023.02.011', '1A_SYSTEMATIC_REVIEW_META', 'Strong', 1.50),
('11111111-1111-4111-8111-111111111103', 'CGDent', 'TIER_2_INTERNATIONAL_GUIDE', 'Standards in Dentistry: Good Practice Guidelines for Dental Implantology and Antimicrobial Prescribing', 'College of General Dentistry (UK)', 2022, 'CGDent Good Practice Series', 'CGDENT-IMP-2022', 'CONSENSUS_GUIDELINE', 'Good Practice', 1.20),
('11111111-1111-4111-8111-111111111104', 'SPRINGER_PIR', 'TIER_3_PEER_REVIEWED', 'Surgical vs Non-Surgical Therapy of Peri-Implantitis: Long-term Clinical and Radiographic Outcomes', 'Schwarz F, Ramanauskaite A et al.', 2024, 'Periodontal and Implant Research / Clinical Oral Investigations (Springer)', '10.1007/s00784-024-05612-x', '1A_SYSTEMATIC_REVIEW_META', 'Grade A', 1.05),
('22222222-2222-4222-8222-222222222201', 'ADA', 'TIER_1_GOLD_STANDARD', 'Evidence-Based Clinical Practice Guideline on the Nonsurgical Treatment of Chronic/Stage I-III Periodontitis by Means of Scaling and Root Planing With or Without Adjuncts', 'Smiley CJ, Tracy SL, Abt E et al. (ADA Council on Scientific Affairs)', 2016, 'Journal of the American Dental Association (JADA)', '10.1016/j.adaj.2015.01.028', '1A_SYSTEMATIC_REVIEW_META', 'Strong', 1.50),
('22222222-2222-4222-8222-222222222202', 'EFP', 'TIER_2_INTERNATIONAL_GUIDE', 'Treatment of Stage I-III and Stage IV Periodontitis — The EFP S3 Level Clinical Practice Guidelines', 'Sanz M, Herrera D, Kebschull M, Tonetti M et al. (EFP / AAP Workshop)', 2022, 'Journal of Clinical Periodontology (Wiley)', '10.1111/jcpe.13290', '1A_SYSTEMATIC_REVIEW_META', 'Grade A (S3)', 1.25),
('33333333-3333-4333-8333-333333333301', 'SPRINGER_COI', 'TIER_3_PEER_REVIEWED', 'Biomechanical Predictability of Tooth Movement with Clear Aligners vs Fixed Appliances: A Systematic Review and Meta-Analysis', 'Rossini G, Parrini S, Castroflorio T et al.', 2023, 'Clinical Oral Investigations (Springer)', '10.1007/s00784-023-04988-2', '1A_SYSTEMATIC_REVIEW_META', 'Grade A', 1.15),
('33333333-3333-4333-8333-333333333302', 'FDI', 'TIER_2_INTERNATIONAL_GUIDE', 'FDI Policy Statement on Clear Aligner Therapy: Clinical Governance, Diagnosis and Patient Safety', 'FDI World Dental Federation Science Committee', 2024, 'International Dental Journal (Elsevier)', '10.1016/j.identj.2024.01.009', 'CONSENSUS_GUIDELINE', 'Strong', 1.25),
('44444444-4444-4444-8444-444444444401', 'ITI', 'TIER_1_GOLD_STANDARD', 'Ceramic Laminate Veneers and Minimally Invasive Adhesive Restorations: Survival Rates and Preparation Protocols', 'Sailer I, Fehmer V, Pjetursson BE (ITI Consensus / Prosthodontic Group)', 2022, 'International Journal of Prosthodontics / ITI Treatment Guide', '10.11607/ijp.2022.35', '1A_SYSTEMATIC_REVIEW_META', 'Grade A', 1.50);

-- CHUYÊN KHOA 1: IMPLANTOLOGY
INSERT INTO parent_clinical_protocols (protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed, protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content)
VALUES (
    'aaaa1111-1111-4111-8111-111111111101',
    '11111111-1111-4111-8111-111111111101',
    'IMPLANTOLOGY',
    ARRAY['PERIODONTOLOGY', 'ESTHETIC_PROSTHODONTICS']::dental_specialty_enum[],
    'ICD10:K08.1',
    'Phác đồ Cấy ghép Implant Tức thì (Type 1A) kèm Ghép xương Vùng Răng Cửa Thẩm mỹ Hàm trên',
    'immediate-implant-esthetic-zone-type1',
    '{
      "P_population_problem": "Bệnh nhân mất 1 răng vùng thẩm mỹ hàm trên (răng 13 đến 23), vách xương ổ mặt ngoài nguyên vẹn (dày >= 1.0mm), không có nhiễm trùng cấp tính có mủ.",
      "I_intervention": "Nhổ răng không sang chấn (Flapless atraumatic extraction) + Cấy Implant tức thì lệch về phía khẩu cái (Type 1) + Ghép xương hạt dị loại tan chậm (DBBM) vào khoảng hở nhảy (Jumping gap >= 2mm) + Ghép mô liên kết dưới biểu mô (CTG) nếu kiểu hình nướu mỏng + Phục hình tạm tức thì thoát khớp (Type 1A).",
      "C_comparison": "Cấy Implant sớm sau 4-8 tuần lành thương mô mềm (Type 2 - Early Placement) kèm tái tạo xương có hướng dẫn (GBR).",
      "O_outcome_metrics": "Tỷ lệ tồn tại sau 5 năm (5-year Survival Rate): 97.4% (95% CI: 95.8% - 98.6%). Tiêu xương rìa trung bình (MBL): 0.42mm. Tỷ lệ tụt nướu mặt ngoài >1mm giảm từ 26% xuống dưới 3.5% khi tuân thủ ghép Jumping Gap + CTG."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Sau nhổ răng, bó xương (Bundle bone) ở vách xương mặt ngoài bị tiêu đi do mất nguồn cấp máu từ dây chằng nha chu (PDL), dẫn đến giảm 30-50% chiều rộng mào xương trong 3 tháng đầu. Cấy Implant tức thì KHÔNG ngăn chặn được sự tiêu Bundle bone tự nhiên này; do đó bắt buộc phải đặt trụ lệch về phía khẩu cái và bù thể tích bằng vật liệu xương tan chậm (DBBM) kết hợp làm dày mô mềm (Phenotype modification).",
      "indications": [
        "Vách xương mặt ngoài còn nguyên vẹn sau nhổ răng (tốt nhất dày >= 1mm trên CBCT)",
        "Kiểu hình nha chu dày (Thick gingival phenotype) hoặc kiểu hình mỏng nhưng bắt buộc kết hợp ghép mô liên kết (CTG)",
        "Có đủ xương phía chóp (>= 3-5mm) và phía khẩu cái để đạt độ ổn định sơ khởi (Primary stability)"
      ],
      "contraindications_absolute": [
        "Mất vách xương mặt ngoài hình chữ U rộng hoặc khuyết hổng xương 2-3 thành nặng",
        "Nhiễm trùng quanh chóp cấp tính đang chảy dịch mủ (Acute purulent exudate)",
        "Bệnh nhân đang dùng Bisphosphonates đường tĩnh mạch hoặc xạ trị vùng đầu cổ liều cao"
      ],
      "contraindications_relative": [
        "Đường cười cao (High lip line) đi kèm kiểu hình nướu cực mỏng và tụt nướu sẵn có (ITI khuyến nghị chuyển sang Type 2 - Cấy sớm sau 4-8 tuần)",
        "Bệnh nha chu giai đoạn III-IV chưa được điều trị kiểm soát (BOP > 10%, túi nha chu >= 5mm)",
        "Hút thuốc lá nặng (> 10 điếu/ngày) hoặc Đái tháo đường kiểm soát kém (HbA1c > 7.5%)"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Chẩn đoán 3D & Lập kế hoạch số", "clinical_action": "Chụp CBCT khảo sát độ dày vách ngoài (Facial bone wall) và vị trí ống thần kinh mũi khẩu; quét trong miệng (IOS) thiết kế máng hướng dẫn phẫu thuật.", "technical_parameters": "Voxel size <= 0.15mm; Khoảng cách an toàn tới chân răng kế cận >= 1.5mm"},
        {"step": 2, "phase_name": "Nhổ răng không lật vạt (Flapless)", "clinical_action": "Chia cắt chân răng nếu cần, dùng Periotome làm đứt dây chằng nha chu phía gần-xa-khẩu cái. TUYỆT ĐỐI không tựa nạy vào bản xương mặt ngoài.", "technical_parameters": "Bảo tồn 100% nhú lợi và viền xương mặt ngoài"},
        {"step": 3, "phase_name": "Sửa soạn lỗ khoan lệch khẩu cái", "clinical_action": "Khoan vào thành xương phía khẩu cái cách chóp ổ răng 3mm để tránh trượt mũi khoan ra phía ngoài.", "technical_parameters": "Tốc độ khoan 800-1200 rpm có tưới nước muối lạnh; Trục Implant đi qua rìa cắn hoặc gót răng (Cingulum) để làm phục hình bắt vít"},
        {"step": 4, "phase_name": "Đặt trụ Implant trong Vùng An toàn 3D", "clinical_action": "Đặt trụ Implant thấp hơn viền nướu mặt ngoài tương lai 3-4mm (hoặc thấp hơn mào xương ngoài 1mm).", "technical_parameters": "Lực vặn (Insertion Torque): 35 - 45 Ncm VÀ chỉ số ISQ >= 70 để đủ điều kiện gắn răng tạm tức thì (Type 1A); Khoảng hở mặt ngoài (Jumping gap) >= 2.0mm"},
        {"step": 5, "phase_name": "Ghép khoảng nhảy & Tăng sinh mô mềm", "clinical_action": "Nhồi xương dị loại khử protein (DBBM - hạt 0.25-1mm) vào Jumping gap lên tới sát viền lợi tự do (Dual-zone technique). Nếu nướu mỏng (< 1.5mm), tạo đường hầm mặt ngoài ghép mô liên kết (CTG) lấy từ khẩu cái/lồi củ.", "technical_parameters": "Độ dày mảnh ghép CTG: 1.0 - 1.5mm"},
        {"step": 6, "phase_name": "Phục hình tạm tức thì nâng đỡ mô mềm", "clinical_action": "Gắn mão tạm bắt vít có phần Emergent Profile vùng dưới tới hạn (Subcritical contour) lõm để tạo không gian cho máu cục và mô mềm dày lên.", "technical_parameters": "Mão tạm thoát khớp hoàn toàn (Out of occlusion) cả ở tư thế lồng múi tối đa và vận động sang bên/ra trước (khe hở 200 micromet)"}
      ],
      "complications_and_management": [
        {"complication": "Tụt nướu mặt ngoài làm lộ cổ Abutment/Implant sau 6-12 tháng", "prevention": "Đặt trụ đúng trục khẩu cái, duy trì Jumping gap >= 2mm và luôn ghép CTG ở kiểu hình nướu mỏng.", "management_protocol": "Tháo mão phục hình, mài chỉnh giảm độ lồi cổ Abutment, phẫu thuật vạt đường hầm dịch chuyển về phía thân răng (Coronally Advanced Tunnel) kết hợp ghép CTG dày."},
        {"complication": "Độ ổn định sơ khởi < 30 Ncm hoặc ISQ < 60", "prevention": "Chọn thiết kế Implant thuôn (Tapered) có bước ren sâu vùng chóp.", "management_protocol": "Hủy bỏ kế hoạch gắn răng tạm tức thì; chuyển sang đặt nắp lành thương (Healing abutment) tùy chỉnh đóng kín ổ răng hoặc khâu vùi kết hợp cầu dán Maryland tạm."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Sai lầm kinh điển của bác sĩ trẻ: Chọn trụ Implant đường kính quá lớn để lấp đầy ổ răng nhổ -> Làm tiêu sạch vách xương ngoài và gây tụt nướu thảm khốc.",
          "Đặt mũi khoan theo đúng trục ổ răng tự nhiên -> Trụ bị nghiêng ra phía môi, lỗ vít xuyên qua mặt ngoài răng cửa."
        ],
        "clinical_decision_tips": [
          "Quy tắc vàng ITI: Vách xương ngoài bị nứt hoặc khuyết hổng > 50% -> Chuyển ngay sang Phác đồ Type 2 (Đợi 4-8 tuần cho mô mềm đóng kín rồi mới mở vạt cấy Implant + GBR màng Collagen)."
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Kỹ thuật nhổ chiếc răng hỏng và đặt ngay chân răng nhân tạo (Implant) cùng một chiếc răng tạm thẩm mỹ chỉ trong 1 lần hẹn duy nhất.",
        "why_needed": "Giúp bạn không bị trống răng cửa ngày nào khi giao tiếp, giảm số lần tiểu phẫu và giữ gìn tối đa đường viền nướu hồng hào tự nhiên.",
        "what_to_expect": "Quá trình thực hiện hoàn toàn nhẹ nhàng dưới gây tê tại chỗ, không cần rạch nướu rộng nên rất ít sưng đau. Bạn sẽ có ngay răng tạm đẹp sau buổi hẹn.",
        "home_care_instructions": [
          "TUYỆT ĐỐI không dùng chiếc răng cửa tạm này để cắn thức ăn trong 8-12 tuần đầu (vì răng tạm chỉ đóng vai trò thẩm mỹ và giữ khuôn nướu).",
          "Súc miệng nhẹ nhàng bằng dung dịch Chlorhexidine 0.12% theo chỉ định trong 2 tuần đầu, không chải răng mạnh trực tiếp vào vùng nướu vừa cấy."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn ITI Consensus lần thứ 7 và ADA về Cấy ghép Implant tức thì vùng thẩm mỹ.'
);

-- CHUYÊN KHOA 2: PERIODONTOLOGY
INSERT INTO parent_clinical_protocols (protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed, protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content)
VALUES (
    'bbbb2222-2222-4222-8222-222222222201',
    '22222222-2222-4222-8222-222222222201',
    'PERIODONTOLOGY',
    ARRAY['IMPLANTOLOGY', 'ORTHODONTICS']::dental_specialty_enum[],
    'ICD10:K05.3',
    'Phác đồ Điều trị Không Phẫu thuật và Phẫu thuật Tái tạo cho Bệnh nhân Viêm Nha chu Giai đoạn I-III (Stage I-III Periodontitis)',
    'periodontitis-stage-1-3-stepwise-therapy',
    '{
      "P_population_problem": "Bệnh nhân trưởng thành mắc Viêm nha chu Stage I, II hoặc III (Mất bám dính lâm sàng CAL >= 3mm, tiêu xương trên phim X-quang, độ sâu túi nha chu PPD >= 4mm kèm chảy máu khi thăm khám BOP).",
      "I_intervention": "Làm sạch mảng bám dưới nướu và xử lý mặt gốc răng (Subgingival Instrumentation / SRP) theo lộ trình 4 bước (Step 1 -> Step 4) có hoặc không kết hợp thuốc hỗ trợ.",
      "C_comparison": "Lấy cao răng trên nướu đơn thuần hoặc dùng kháng sinh toàn thân thường quy không chọn lọc.",
      "O_outcome_metrics": "SRP đơn thuần giúp giảm độ sâu túi trung bình 1.4mm và tăng mức bám dính lâm sàng (CAL gain) 0.55mm (ADA Meta-analysis). Khoảng 74% các túi nha chu 4-6mm đóng kín (PPD <= 4mm không BOP) sau Bước 2 mà không cần phẫu thuật."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Sự mất cân bằng hệ vi sinh dưới nướu (Dysbiosis - đứng đầu là P. gingivalis, T. forsythia, A. actinomycetemcomitans) kích hoạt phản ứng viêm quá mức của vật chủ (tăng IL-1beta, TNF-alpha, PGE2 và MMP-8), kích hoạt hủy cốt bào phá hủy dây chằng nha chu và xương ổ răng.",
      "indications": [
        "Mọi bệnh nhân được chẩn đoán Viêm nha chu Stage I, II, III, IV (Grade A, B, C)",
        "Điều trị tiền đề bắt buộc trước khi thực hiện Cấy ghép Implant, Chỉnh nha hoặc Phục hình sứ thẩm mỹ"
      ],
      "contraindications_absolute": [
        "Cạo vôi xử lý mặt gốc răng sâu mà chưa dùng kháng sinh dự phòng trên bệnh nhân có nguy cơ Viêm nội tâm mạc nhiễm trùng rất cao (Van tim nhân tạo, tiền sử IE theo ADA Guideline)"
      ],
      "contraindications_relative": [
        "Phẫu thuật nha chu tái tạo (Bước 3) bị chống chỉ định tương đối nếu chỉ số mảng bám toàn miệng (FMPS) > 20% hoặc chỉ số chảy máu (FMBS) > 20%"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Bước 1: Kiểm soát Yếu tố Nguy cơ & Màng sinh học trên nướu", "clinical_action": "Hướng dẫn vệ sinh răng miệng cá nhân hóa (OHI - bàn chải kẽ răng), loại bỏ vôi răng trên nướu và các bờ phục hình dư thừa, cai thuốc lá, kiểm soát đường huyết HbA1c.", "technical_parameters": "Mục tiêu đạt FMPS < 20%"},
        {"step": 2, "phase_name": "Bước 2: Xử lý Bề mặt Gốc răng Dưới nướu (Subgingival Instrumentation / SRP)", "clinical_action": "Kết hợp đầu siêu âm Piezoelectric mảnh và cây nạo Gracey dưới gây tê tại chỗ (chia theo phần tư hàm hoặc Full-mouth trong 24h). Chỉ dùng kháng sinh toàn thân hỗ trợ (Amoxicillin + Metronidazole) ở ca Stage III Grade C người trẻ tiến triển cực nhanh.", "technical_parameters": "Áp lực thăm khám 0.25N; Đánh giá lại (Re-evaluation) sau 6-8 tuần"},
        {"step": 3, "phase_name": "Bước 3: Điều trị Túi Nha chu Tồn lưu (PPD >= 6mm hoặc 4-5mm có BOP)", "clinical_action": "Lặp lại xử lý dưới nướu cho túi 4-5mm. Với túi >= 6mm kèm khuyết hổng xương trong (Infrabony defect >= 3mm) hoặc tổn thương vùng chẽ Độ II: Thực hiện phẫu thuật tái tạo mô nha chu (GTR bằng màng sinh học hoặc Enamel Matrix Derivative - EMD).", "technical_parameters": "Khâu đóng kín thì đầu bằng chỉ Monofilament 6-0"},
        {"step": 4, "phase_name": "Bước 4: Điều trị Nha chu Duy trì (Supportive Periodontal Care - SPC)", "clinical_action": "Tái khám định kỳ kiểm tra biểu đồ nha chu, phá vỡ màng sinh học bằng Air-polishing bột Erythritol/Glycine.", "technical_parameters": "Chu kỳ 3-4 tháng/lần cho Grade B-C; 6 tháng/lần cho Grade A"}
      ],
      "complications_and_management": [
        {"complication": "Nhạy cảm ngà chân răng (Root hypersensitivity) sau SRP", "prevention": "Tránh nạo lấy đi quá nhiều lớp xê-măng chân răng lành mạnh (Over-instrumentation).", "management_protocol": "Bôi Varnish Fluoride 5%, kem đánh răng chứa Arginine 8% hoặc Potassium Nitrate."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Kê đơn kháng sinh toàn thân (Spiramycin + Metronidazole) tràn lan cho mọi ca viêm nha chu mạn tính trước cả khi cạo vôi dưới nướu -> Màng sinh học (Biofilm) bảo vệ vi khuẩn khiến kháng sinh vô tác dụng nếu không phá vỡ cơ học bằng SRP trước.",
          "Tiến hành gắn mắc cài chỉnh nha hoặc cắm Implant khi túi nha chu vẫn còn >= 5mm và BOP (+)."
        ],
        "clinical_decision_tips": [
          "Đích đến điều trị thành công (Endpoint of therapy): Không còn túi >= 5mm VÀ không có túi 4mm nào chảy máu khi thăm khám (BOP+), tổng BOP toàn miệng < 10%."
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Viêm nha chu là tình trạng vi khuẩn tích tụ sâu dưới nướu làm tiêu dần phần xương giữ chân răng, giống như ngôi nhà bị xói mòn phần móng.",
        "why_needed": "Làm sạch sâu dưới nướu giúp chặn đứng quá trình tiêu xương, làm nướu săn chắc ôm sát lại chân răng, giữ lại răng thật lâu dài và ngăn ngừa biến chứng lên tim mạch, tiểu đường.",
        "what_to_expect": "Bác sĩ sẽ dùng đầu máy siêu âm êm ái kết hợp gây tê nhẹ để lấy sạch mảng bám ẩn sâu dưới lợi. Sau vài ngày nướu sẽ hết sưng đỏ và hết chảy máu.",
        "home_care_instructions": [
          "Sử dụng bàn chải kẽ răng (Interdental brushes) đúng kích thước mỗi tối - đây là vũ khí quan trọng nhất vì bàn chải thường không chạm tới kẽ răng bị tiêu xương.",
          "Tái khám bảo dưỡng định kỳ 3-6 tháng/lần để bệnh không tái phát."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn ADA và EFP S3 Guideline về điều trị Viêm nha chu Giai đoạn I-III.'
);

-- CHUYÊN KHOA 3: ORTHODONTICS
INSERT INTO parent_clinical_protocols (protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed, protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content)
VALUES (
    'cccc3333-3333-4333-8333-333333333301',
    '33333333-3333-4333-8333-333333333301',
    'ORTHODONTICS',
    ARRAY['PERIODONTOLOGY', 'ESTHETIC_PROSTHODONTICS']::dental_specialty_enum[],
    'ICD10:K07.2',
    'Phác đồ Cơ sinh học Chỉnh nha Khay Trong suốt (Clear Aligner Therapy - CAT): Kiểm soát Độ chính xác, Overcorrection và Phối hợp TADs',
    'clear-aligner-biomechanics-predictability-protocol',
    '{
      "P_population_problem": "Bệnh nhân sai khớp cắn Hạng I, Hạng II hoặc chen chúc cần điều trị bằng hệ thống Khay chỉnh nha trong suốt (Clear Aligners).",
      "I_intervention": "Thiết kế cơ sinh học số (Digital Staging) sử dụng Attachments tối ưu hóa, Power Ridges, Mài kẽ có kiểm soát (IPR), thiết lập bù trừ quá mức (Overcorrection) và kết hợp Miniscrew (TADs) cho di chuyển phức tạp.",
      "C_comparison": "Mắc cài cố định truyền thống (Fixed Labial Appliances) hoặc lập kế hoạch khay trong suốt không có Overcorrection.",
      "O_outcome_metrics": "Độ chính xác trung bình của chuyển động răng bằng Clear Aligner đơn thuần đạt 50-56% (Springer COI Meta-analysis): Nghiêng ngoài-trong đạt 70-76%, Di xa răng cối hàm trên đạt 87% (nhờ hiệu ứng bao phủ mặt nhai), nhưng Xoay răng nanh/răng cối nhỏ chỉ đạt 40-48% và Trồi răng cửa đạt ~30-45% nếu không có Attachment chuyên biệt và Overcorrection."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Khác với mắc cài dùng lực kéo-đẩy tại một điểm qua dây cung (Force-driven system), Khay trong suốt hoạt động dựa trên biến dạng đàn hồi của vật liệu Polymer đẩy vào bề mặt thân răng (Displacement-driven system). Do mô-đun đàn hồi của nhựa thấp hơn hợp kim NiTi/SS và dễ bị trượt khỏi thân răng (Watermelon seed effect), khay rất mạnh trong việc đẩy lún (Intrusion) và di xa tuần tự (Sequential Distalization), nhưng dễ gây nghiêng thân răng không kiểm soát (Tipping) nếu thiếu ngẫu lực (Moment-to-Force ratio) từ Attachments và Power Ridges.",
      "indications": [
        "Sai khớp cắn có cắn hở phía trước nhẹ-trung bình (nhờ hiệu ứng Bite-block mặt nhai của khay kiểm soát chiều đứng cực tốt)",
        "Sai khớp cắn Hạng II cần di xa tuần tự răng cối hàm trên ( <= 2.5 - 3.0mm mỗi bên)",
        "Bệnh nhân có tiền sử bệnh nha chu đã ổn định (giúp vệ sinh răng miệng vượt trội hơn mắc cài cố định theo FDI & EFP)"
      ],
      "contraindications_absolute": [
        "Bệnh nhân viêm nha chu đang tiến triển chưa kiểm soát (BOP > 20%, tiêu xương cấp)",
        "Bất hài hòa xương hàm nặng (Skeletal discrepancy) bắt buộc phải phẫu thuật chỉnh hình xương hàm mà bệnh nhân từ chối phẫu thuật"
      ],
      "contraindications_relative": [
        "Răng ngầm sâu cần kéo trồi hành trình dài, đóng khoảng nhổ răng cối nhỏ (> 7mm) nếu không phối hợp TADs/Power Arms hoặc cơ học lai (Hybrid mechanics)",
        "Bệnh nhân không đủ khả năng tuân thủ đeo khay tối thiểu 20-22 giờ/ngày"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Chẩn đoán Toàn diện (FDI Governance)", "clinical_action": "Phân tích Phim Ceph, CBCT khảo sát giới hạn xương vỏ mặt ngoài/trong (Alveolar housing), khám khớp thái dương hàm (TMJ) và nha chu trước khi quét 3D.", "technical_parameters": "Không bao giờ lập kế hoạch chỉ dựa trên mẫu hàm scan 3D mà thiếu phim X-quang"},
        {"step": 2, "phase_name": "Thiết lập Tốc độ Di chuyển (Staging Velocity)", "clinical_action": "Giới hạn vận tốc di chuyển mỗi khay trong ngưỡng sinh học của dây chằng nha chu để tránh mất dấu khay (Unseating / Tracking loss).", "technical_parameters": "Tịnh tiến <= 0.20 - 0.25mm/khay; Xoay răng (Rotation) <= 1.5 - 2.0 độ/khay; Torque chân răng <= 1.0 độ/khay"},
        {"step": 3, "phase_name": "Thiết kế Hệ thống Neo chặn & Ngẫu lực (Attachments & Auxiliaries)", "clinical_action": "Đặt Beveled Attachments cho chuyển động xoay và trồi; đặt Power Ridges vùng cổ răng cửa kèm lún đồng thời khi kéo lui để chống mất Torque (hiệu ứng rủ rèm - Bowing effect).", "technical_parameters": "Với di xa hàm trên tuần tự (Sequential Distalization protocol 50%): Bắt buộc mang thun Hạng II (3.5 - 4.5 oz) hoặc neo chặn vào TADs vùng mào dưới gò má (IZC)"},
        {"step": 4, "phase_name": "Tích hợp Bù trừ Quá mức (3D Overcorrection)", "clinical_action": "Tại giai đoạn hoàn thiện trên phần mềm mô phỏng, cộng thêm biên độ bù trừ hao hụt cơ học của vật liệu nhựa.", "technical_parameters": "Overcorrection +15-20% cho góc xoay răng nanh/cối nhỏ; +5-10 độ Buccal Root Torque cho răng cửa trên khi đóng khoảng; Bù đường cong Spee ngược nhẹ ở hàm dưới để tránh cắn hở răng hàm sau"},
        {"step": 5, "phase_name": "Kiểm soát Lâm sàng & Tinh chỉnh (Refinement)", "clinical_action": "Kiểm tra khít sát khay tại rìa cắn và điểm tiếp xúc bên (dùng chỉ nha khoa kiểm tra Heavy contacts gây cản trở xoay răng) mỗi 6-8 tuần.", "technical_parameters": "Thực hiện IPR chính xác bằng thước đo lá (Feeler gauge) đúng thời điểm mặt bên vừa mở phẳng"}
      ],
      "complications_and_management": [
        {"complication": "Cắn hở vùng răng hàm sau (Posterior Open Bite) sau thời gian đeo khay", "prevention": "Loại bỏ các điểm chạm sớm vùng răng cửa trên phần mềm (tránh Fremitus) và thêm Torque chân răng cửa trên.", "management_protocol": "Cắt bỏ phần nhựa khay từ phía xa răng nanh trở về sau hoặc đeo thun đứng (Vertical elastics) để răng cối trồi tự nhiên đóng khớp."},
        {"complication": "Mất theo dõi khay (Loss of tracking) ở răng cửa bên hàm trên", "prevention": "Đặt Optimized Extrusion Attachment hoặc Beveled Attachment kích thước lớn ngay từ đầu.", "management_protocol": "Dùng kỹ thuật Bootstrap (dán nút mặt ngoài và mặt trong quàng thun qua mặt nhai khay) hoặc quét lại mẫu hàm đặt khay tinh chỉnh (Refinement)."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Tin tưởng 100% vào hình ảnh mô phỏng 3D trên màn hình như một bộ phim hoạt hình -> Mô phỏng 3D là hệ thống Thiết kế Lực (Force System), không phải kết quả răng thực tế!",
          "Cho tất cả các răng di chuyển cùng một lúc (En-masse movement) mà không phân kỳ neo chặn (Staging) -> Làm giảm lực giữ khay và thất bại toàn hàm."
        ],
        "clinical_decision_tips": [
          "Với ca nhổ răng cối nhỏ kéo lui: Luôn thiết lập Gable Bend ảo (nghiêng xa chân răng nanh và nghiêng gần chân răng hàm nhỏ số 5 khoảng 5-7 độ trên phần mềm) để chống đổ nghiêng thân răng vào khoảng nhổ."
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Chỉnh nha bằng hệ thống khay nhựa y tế trong suốt được cá nhân hóa theo từng giai đoạn, giúp dịch chuyển răng êm ái mà gần như vô hình.",
        "why_needed": "Mang lại tính thẩm mỹ cao khi giao tiếp, dễ dàng tháo lắp khi ăn uống và chải răng sạch sẽ, giảm thiểu tối đa nguy cơ sâu răng hay viêm lợi so với mắc cài kim loại.",
        "what_to_expect": "Mỗi khay sẽ tạo một lực ôm nhẹ nhàng, bạn chỉ cảm thấy hơi căng tức nhẹ trong 1-2 ngày đầu khi thay khay mới. Bác sĩ sẽ gắn các nút nhỏ cùng màu răng (Attachments) để giúp khay bám chắc và xoay răng chuẩn xác.",
        "home_care_instructions": [
          "Đeo khay đủ từ 20 đến 22 giờ mỗi ngày (chỉ tháo ra khi ăn và vệ sinh răng miệng).",
          "Sử dụng cục cắn (Chewies) 5-10 phút mỗi lần sau khi đeo khay vào để khay ôm sát hoàn toàn vào răng."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn Springer Clinical Oral Investigations & FDI về cơ sinh học Chỉnh nha Khay trong suốt.'
);

-- CHUYÊN KHOA 4: ESTHETIC & PROSTHODONTICS
INSERT INTO parent_clinical_protocols (protocol_id, source_id, primary_specialty, secondary_specialties, condition_code_icd_or_snomed, protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content)
VALUES (
    'dddd4444-4444-4444-8444-444444444401',
    '44444444-4444-4444-8444-444444444401',
    'ESTHETIC_PROSTHODONTICS',
    ARRAY['PERIODONTOLOGY', 'ORTHODONTICS']::dental_specialty_enum[],
    'ICD10:K03.8',
    'Phác đồ Phục hình Mặt dán sứ Veneer Xâm lấn Tối thiểu & Quy trình Dán dính Men-Ngà (Adhesive Luting Protocol)',
    'ceramic-laminate-veneer-adhesive-protocol',
    '{
      "P_population_problem": "Bệnh nhân cần phục hồi thẩm mỹ và hình thể vùng răng trước do nhiễm màu, mòn rìa cắn, khe thưa (Diastema) hoặc dị dạng thân răng.",
      "I_intervention": "Sửa soạn răng qua Mock-up (Mock-up driven preparation) bảo tồn >= 80% diện tích men răng + Mặt dán sứ Thủy tinh Lithium Disilicate / Feldspathic + Quy trình xói mòn chọn lọc và gắn Cement nhựa quang trùng hợp dưới đê cao su.",
      "C_comparison": "Mài cùi mão toàn sứ xâm lấn nhiều mô răng hoặc dán Veneer lên bề mặt lộ ngà > 50% không có Immediate Dentin Sealing (IDS).",
      "O_outcome_metrics": "Tỷ lệ tồn tại sau 10 năm (10-year Survival Rate) đạt 95.5% khi dán trên nền men răng; giảm xuống còn 81-84% nếu lộ ngà răng rộng mà không áp dụng quy trình dán ngà tức thì (IDS) (ITI Consensus)."
    }'::JSONB,
    '{
      "pathophysiology_mechanism": "Độ bền của mặt dán sứ cực mỏng (0.3 - 0.5mm) phụ thuộc hoàn toàn vào liên kết vi cơ học và hóa học giữa Sứ (qua xử lý Acid Hydrofluoric + Silane) - Cement nhựa - và Các trụ men răng (Enamel prisms sau xói mòn Acid Phosphoric 37%). Khi vượt qua ranh giới men-ngà (DEJ), ngà răng chứa nhiều sợi Collagen ẩm và dịch ống ngà làm giảm lực dán và tăng biến dạng uốn (Flexural stress), dễ gây nứt vỡ sứ hoặc bong sút.",
      "indications": [
        "Răng đổi màu không đáp ứng với tẩy trắng nội/ngoại (Tetracycline độ I-II, nhiễm Fluor)",
        "Đóng khe thưa, chỉnh sửa răng hình chêm (Peg-shaped lateral incisors), kéo dài rìa cắn bị mòn",
        "Tái lập hướng dẫn răng trước (Anterior guidance) kết hợp xâm lấn tối thiểu"
      ],
      "contraindications_absolute": [
        "Mất quá 50-60% cấu trúc men răng mặt ngoài và không còn vòng men răng ngoại vi (Enamel periphery)",
        "Vệ sinh răng miệng kém, sâu răng lan tràn chưa kiểm soát hoặc viêm lợi chảy máu cấp tính"
      ],
      "contraindications_relative": [
        "Tật nghiến răng nặng (Severe Bruxism) chưa được kiểm soát bằng máng nhai bảo vệ ban đêm (Occlusal splint)",
        "Răng lệch lạc xoay trục nặng (cần Chỉnh nha tiền phục hình đưa răng về đúng cung trước để tránh mài lộ tủy/ngà)"
      ],
      "step_by_step_procedure": [
        {"step": 1, "phase_name": "Thiết kế Nụ cười (DSD) & Sửa soạn qua Mock-up", "clinical_action": "Bơm nhựa Bis-acryl lên răng qua khóa Silicone để duyệt thẩm mỹ/phát âm, sau đó dùng mũi khoan định mức độ sâu đi xuyên trực tiếp qua lớp Mock-up để bảo tồn tối đa men răng.", "technical_parameters": "Mài mặt ngoài: 0.3mm (1/3 cổ), 0.5mm (1/3 giữa và rìa cắn); Hạ rìa cắn 1.0 - 1.5mm tạo kiểu Butt-joint; Đường hoàn tất Chamfer nhẹ ngang lợi hoặc trên lợi 0.5mm"},
        {"step": 2, "phase_name": "Dán Ngà Tức thì (Immediate Dentin Sealing - IDS)", "clinical_action": "Nếu sau sửa soạn có vùng lộ ngà răng đáng kể (> 15-20% diện tích), thực hiện dán ngà ngay lập tức khi ngà vừa mới cắt xong trước khi lấy dấu.", "technical_parameters": "Dùng hệ thống keo dán Etch-and-Rinse 3 bước (Optibond FL) hoặc Self-etch 2 bước (Clearfil SE Bond) phủ 1 lớp Flowable mỏng và chiếu đèn qua Glycerin"},
        {"step": 3, "phase_name": "Xử lý Bề mặt Trong của Mặt dán sứ (Intaglio Conditioning)", "clinical_action": "Xói mòn mặt trong Veneer bằng Acid Hydrofluoric (HF), rửa sạch muối kết tủa, bôi Silane và làm khô bằng nhiệt.", "technical_parameters": "Lithium Disilicate (e.max): HF 4.5-5% trong 20 giây; Sứ Feldspathic: HF 9% trong 60-90 giây; Rửa siêu âm trong cồn 90% 3 phút; Bôi Silane chờ 60 giây rồi sấy ấm"},
        {"step": 4, "phase_name": "Cách ly Đê Cao su & Xử lý Bề mặt Răng", "clinical_action": "Đặt đê cao su tuyệt đối (Rubber dam + Clamp B4), thổi cát hạt Al2O3 27-50 micromet làm sạch bề mặt, xói mòn men răng bằng Acid Phosphoric 37% trong 30 giây, rửa sạch và bôi keo dán (Adhesive) KHÔNG chiếu đèn trước khi đặt sứ.", "technical_parameters": "Dùng băng Teflon (PTFE tape) che chắn 2 răng kế cận"},
        {"step": 5, "phase_name": "Gắn Cement Quang trùng hợp & Hoàn thiện", "clinical_action": "Sử dụng Cement nhựa chỉ quang trùng hợp (Light-cure only resin cement - không chứa Amine bậc 3 để không bị đổi màu vàng theo thời gian), lấy sạch cement dư, bôi Glycerin chống lớp ức chế Oxy và chiếu đèn.", "technical_parameters": "Cường độ đèn >= 1000 mW/cm2 trong 40 giây mỗi mặt (ngoài và trong)"}
      ],
      "complications_and_management": [
        {"complication": "Viêm nướu mạn tính đường viền cổ răng sau gắn Veneer", "prevention": "Đặt đường hoàn tất trên nướu hoặc ngang nướu, không vi phạm khoảng bám dính trên mào xương (Supracrestal tissue attachment >= 3mm) và lấy sạch 100% cement dư dưới đê cao su.", "management_protocol": "Dùng lưỡi dao số 12 và mũi đánh bóng sứ mịn lấy sạch cement dư; nếu xâm phạm khoảng sinh học sâu bắt buộc phẫu thuật làm dài thân răng hoặc làm lại phục hình."}
      ],
      "educational_pearls_for_residents": {
        "common_pitfalls": [
          "Mài răng trực tiếp lên răng thật mà không qua lớp Mock-up -> Lấy đi toàn bộ lớp men răng quý giá ở 1/3 cổ răng (vốn chỉ dày 0.3 - 0.4mm), khiến Veneer dán hoàn toàn trên ngà răng và bong sút sớm.",
          "Chiếu đèn làm cứng lớp keo dán trên răng TRƯỚC khi đặt mặt dán sứ vào -> Độ dày lớp keo làm Veneer bị kênh, không thể xuống khít hoàn toàn đường hoàn tất!"
        ],
        "clinical_decision_tips": [
          "Khi ca lâm sàng vừa có răng lệch lạc vừa muốn làm Veneer: Luôn ưu tiên Chỉnh nha ngắn hạn (Pre-restorative Orthodontics 3-6 tháng) đưa răng về đúng vị trí để đạt chuẩn No-prep hoặc Minimal-prep Veneer."
        ]
      },
      "patient_friendly_translation": {
        "what_is_it": "Mặt dán sứ Veneer là một lớp sứ mỏng như kính áp tròng (chỉ 0.3 - 0.5mm) được dán cố định lên bề mặt ngoài của răng để tái tạo màu sắc và hình dáng nụ cười hoàn hảo.",
        "why_needed": "Bảo tồn tối đa răng thật (không cần mài nhỏ răng, không lấy tủy), màu sắc trong bóng tự nhiên như răng thật và không bị ố màu theo thời gian.",
        "what_to_expect": "Bạn sẽ được nhìn thấy trước nụ cười tương lai ngay trên miệng mình qua bước thử mẫu (Mock-up) trước khi bác sĩ chạm vào răng. Quá trình thực hiện rất êm ái và bảo tồn.",
        "home_care_instructions": [
          "Không dùng răng cửa dán sứ để cắn các vật quá cứng (như cắn hạt dưa, càng cua, mở nắp chai).",
          "Đeo máng bảo vệ ban đêm nếu bạn có thói quen nghiến răng khi ngủ để bảo vệ lớp sứ bền đẹp hàng chục năm."
        ]
      }
    }'::JSONB,
    'Phác đồ chuẩn ITI Consensus & ADA về Mặt dán sứ Veneer xâm lấn tối thiểu.'
);

INSERT INTO guideline_arbitrations (clinical_topic_slug, clinical_scenario, ada_iti_gold_standard_protocol_id, ada_iti_core_stance, comparative_stances)
VALUES
(
    'immediate-implant-esthetic-zone-type1',
    'Chỉ định Cấy ghép Implant tức thì vùng thẩm mỹ và Phác đồ Kháng sinh Dự phòng trong phẫu thuật Implant',
    'aaaa1111-1111-4111-8111-111111111101',
    'Chuẩn ADA & ITI Consensus (Ưu tiên mặc định): Cho phép Cấy Implant tức thì kèm phục hình tạm (Type 1A) khi vách ngoài nguyên vẹn, đạt lực vặn 35-45 Ncm, bắt buộc ghép Jumping gap bằng xương tan chậm và ghép CTG nếu nướu mỏng. Về kháng sinh dự phòng khi đặt Implant đơn lẻ: Phác đồ Bắc Mỹ/ITI khuyến nghị liều duy nhất 2g Amoxicillin uống 1 giờ trước phẫu thuật để giảm nguy cơ thất bại tích hợp xương sớm.',
    '[
      {
        "organization": "CGDent (Vương quốc Anh) & EAO (Châu Âu)",
        "protocol_id": "aaaa1111-1111-4111-8111-111111111101",
        "stance_summary": "CGDent Good Practice Guidelines khuyến cáo KHÔNG kê đơn kháng sinh dự phòng thường quy cho các ca cấy ghép Implant đơn giản trên bệnh nhân khỏe mạnh bình thường (nhằm chống kháng kháng sinh), chỉ chỉ định khi có ghép xương rộng (GBR), nâng xoang hoặc bệnh nhân suy giảm miễn dịch.",
        "key_difference_reason": "Sự khác biệt đến từ chính sách Quản lý Kháng sinh nghiêm ngặt tại Anh Quốc (Antimicrobial Stewardship) đặt lợi ích cộng đồng lên trên mức giảm rủi ro thất bại Implant ~1.5-2% ở từng cá nhân.",
        "clinical_takeaway_for_doctor": "Với ca cấy Implant đơn giản không ghép xương trên người khỏe mạnh: Bác sĩ có thể cân nhắc không dùng kháng sinh kéo dài sau mổ, chỉ dùng 1 liều duy nhất trước mổ (2g Amoxicillin theo ITI/ADA) kết hợp súc miệng Chlorhexidine 0.12-0.2%."
      }
    ]'::JSONB
),
(
    'periodontitis-stage-1-3-stepwise-therapy',
    'Sử dụng thuốc hỗ trợ tại chỗ và toàn thân kèm theo Cạo vôi xử lý mặt gốc răng (SRP) trong điều trị Viêm nha chu Stage I-III',
    'bbbb2222-2222-4222-8222-222222222201',
    'Chuẩn ADA (Ưu tiên mặc định): Khuyến nghị mạnh mẽ SRP là nền tảng cốt lõi. ADA cho phép cân nhắc sử dụng có chọn lọc các chất hỗ trợ (như Doxycycline liều thấp ức chế men tiêu collagen SDD hoặc Chlorhexidine/Minocycline đặt tại chỗ) ở các vị trí túi sâu không đáp ứng nhưng mang lại mức tăng bám dính lâm sàng khiêm tốn (0.3-0.4mm).',
    '[
      {
        "organization": "EFP (Liên đoàn Nha chu Châu Âu - S3 Guideline) & CGDent",
        "protocol_id": "bbbb2222-2222-4222-8222-222222222201",
        "stance_summary": "EFP S3 Guideline đưa ra khuyến nghị nghiêm ngặt hơn: Phản đối việc sử dụng thường quy Doxycycline liều thấp (SDD) hoặc kháng sinh toàn thân hỗ trợ cho đa số bệnh nhân viêm nha chu. Chỉ cho phép dùng phối hợp Amoxicillin + Metronidazole ở một nhóm rất hẹp: Viêm nha chu Stage III Grade C ở người trẻ tuổi tiến triển nhanh.",
        "key_difference_reason": "EFP đặt ngưỡng cân bằng Lợi ích / Nguy cơ biến chứng toàn thân và loạn khuẩn khắt khe hơn so với hướng dẫn của ADA.",
        "clinical_takeaway_for_doctor": "Tuyệt đối ưu tiên làm sạch cơ học dưới nướu (SRP) triệt để ở Bước 2; chỉ kê đơn Amoxicillin + Metronidazole khi gặp ca tiêu xương dọc tiến triển cực nhanh ở người trẻ (Stage III-IV Grade C) ngay thời điểm hoàn tất SRP."
      }
    ]'::JSONB
);

INSERT INTO clinical_entity_edges (source_protocol_id, target_protocol_id, relationship_type, clinical_rationale)
VALUES
(
    'aaaa1111-1111-4111-8111-111111111101',
    'bbbb2222-2222-4222-8222-222222222201',
    'REQUIRES_PREREQUISITE',
    'Bắt buộc phải hoàn tất Bước 1 & Bước 2 của Phác đồ Nha chu (kiểm soát túi nha chu <= 4mm và BOP < 10%) trước khi cấy Implant để ngăn ngừa vi khuẩn nha chu lây nhiễm sang bề mặt trụ gây Viêm quanh Implant (Peri-implantitis).'
),
(
    'dddd4444-4444-4444-8444-444444444401',
    'cccc3333-3333-4333-8333-333333333301',
    'SYNERGISTIC_WITH',
    'Chỉnh nha tiền phục hình (Pre-restorative Clear Aligner) giúp sắp đều trục răng và lún/trồi viền nướu, nhờ đó khi sửa soạn Veneer bảo tồn được >85% lớp men răng tự nhiên thay vì phải mài sâu vào ngà răng.'
);
