-- ============================================================================
-- 08 — MỞ RỘNG DANH MỤC TỔ CHỨC NGUỒN (chạy lại an toàn)
-- Bổ sung các tổ chức ban hành hướng dẫn mà bản nháp tri thức cần trích dẫn đúng:
--   SDCEP (Scottish Dental Clinical Effectiveness Programme), AAPD (nha khoa trẻ em Hoa Kỳ),
--   ACP (American College of Prosthodontists), IDSA (bệnh truyền nhiễm Hoa Kỳ),
--   AAOMS (phẫu thuật hàm mặt Hoa Kỳ), AHA (tim mạch Hoa Kỳ), AAE (nội nha Hoa Kỳ), WHO.
-- Không đổi file gốc 01: chỉ thay ràng buộc CHECK (tên mặc định do PostgreSQL đặt).
-- ============================================================================
ALTER TABLE dental_sources DROP CONSTRAINT IF EXISTS dental_sources_organization_code_check;
ALTER TABLE dental_sources ADD CONSTRAINT dental_sources_organization_code_check CHECK (
    organization_code IN (
        'ADA', 'ITI', 'FDI', 'CGDent', 'EFP', 'AAP', 'EAO', 'AAID', 'ICOI',
        'SPRINGER_COI', 'SPRINGER_PIR', 'COCHRANE', 'PUBMED_NCBI', 'WILEY', 'ELSEVIER',
        'SDCEP', 'AAPD', 'ACP', 'IDSA', 'AAOMS', 'AHA', 'AAE', 'WHO'
    )
);
