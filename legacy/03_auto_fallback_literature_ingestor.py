import os
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

class DentalEvidenceFallbackEngine:
    """
    Engine Tự động Truy vấn Bổ sung (Fallback Retrieval) & Tự làm giàu Kho Tri thức Nha khoa
    Nguồn: PubMed/NCBI, Cochrane Library, Springer Medicine (Clinical Oral Investigations,
    Periodontal and Implant Research), Wiley, Elsevier (Ưu tiên 2016-2026).
    """

    NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    EUROPE_PMC_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"

    # Bộ lọc Tạp chí & Hiệp hội Uy tín Chuẩn Bình duyệt (Peer-Reviewed Whitelist)
    TRUSTED_JOURNALS_FILTER = (
        '("Journal of the American Dental Association"[Journal] OR '
        '"Clinical Oral Implants Research"[Journal] OR '
        '"Clinical Oral Investigations"[Journal] OR '
        '"Journal of Clinical Periodontology"[Journal] OR '
        '"Journal of Periodontology"[Journal] OR '
        '"International Journal of Oral & Maxillofacial Implants"[Journal] OR '
        '"American Journal of Orthodontics and Dentofacial Orthopedics"[Journal] OR '
        '"The Angle Orthodontist"[Journal] OR '
        '"Journal of Prosthetic Dentistry"[Journal] OR '
        '"Journal of Esthetic and Restorative Dentistry"[Journal] OR '
        '"Cochrane Database of Systematic Reviews"[Journal] OR '
        '"British Dental Journal"[Journal] OR '
        '"International Dental Journal"[Journal])'
    )

    def __init__(self, similarity_threshold: float = 0.78):
        self.similarity_threshold = similarity_threshold

    def should_trigger_fallback(self, db_results: List[Dict[str, Any]]) -> bool:
        """Kiểm định chất lượng kết quả từ PostgreSQL: Kích hoạt nếu thiếu chuẩn ADA/ITI hoặc điểm thấp."""
        if not db_results:
            return True
        top_score = float(db_results[0].get("hybrid_rrf_score", 0.0))
        has_gold_standard = any(r.get("slot_role") == "PRIMARY_ADA_ITI_STANDARD" for r in db_results)
        return (top_score < self.similarity_threshold) or (not has_gold_standard)

    def build_mesh_query(self, clinical_keywords: str, start_year: int = 2016, end_year: int = 2026) -> str:
        """Xây dựng câu truy vấn chuẩn Y học Thực chứng (Ưu tiên 5-10 năm gần nhất: 2016-2026)."""
        evidence_filter = (
            '(Practice Guideline[pt] OR Consensus Development Conference[pt] OR '
            'Systematic Review[pt] OR Meta-Analysis[pt] OR Randomized Controlled Trial[pt])'
        )
        date_filter = f'("{start_year}/01/01"[Date - Publication] : "{end_year}/12/31"[Date - Publication])'
        return f"({clinical_keywords}) AND {self.TRUSTED_JOURNALS_FILTER} AND {evidence_filter} AND {date_filter}"

    def fetch_pubmed_and_cochrane(self, clinical_keywords: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Truy vấn trực tiếp NCBI PubMed / Cochrane (2016-2026), nếu thiếu tự động mở rộng về 2005-2026."""
        query = self.build_mesh_query(clinical_keywords, 2016, 2026)
        articles = self._execute_ncbi_esearch_efetch(query, max_results)

        # Fallback tầng 2: Nếu 10 năm gần nhất (2016-2026) có ít hơn 2 bài, mở rộng tìm kiếm y văn kinh điển
        if len(articles) < 2:
            broad_query = f"({clinical_keywords}) AND {self.TRUSTED_JOURNALS_FILTER}"
            articles.extend(self._execute_ncbi_esearch_efetch(broad_query, max_results - len(articles)))

        return articles

    def _execute_ncbi_esearch_efetch(self, query: str, retmax: int) -> List[Dict[str, Any]]:
        encoded_query = urllib.parse.quote(query)
        search_url = f"{self.NCBI_BASE_URL}esearch.fcgi?db=pubmed&term={encoded_query}&retmode=json&retmax={retmax}&sort=relevance"

        try:
            with urllib.request.urlopen(search_url, timeout=10) as response:
                search_data = json.loads(response.read().decode("utf-8"))
                id_list = search_data.get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return []

            ids_str = ",".join(id_list)
            fetch_url = f"{self.NCBI_BASE_URL}efetch.fcgi?db=pubmed&id={ids_str}&retmode=xml"
            with urllib.request.urlopen(fetch_url, timeout=12) as fetch_resp:
                xml_data = fetch_resp.read()
                return self._parse_pubmed_xml(xml_data)
        except Exception as e:
            return [{"error": f"Fallback API Warning: {str(e)}"}]

    def _parse_pubmed_xml(self, xml_bytes: bytes) -> List[Dict[str, Any]]:
        root = ET.fromstring(xml_bytes)
        parsed_records = []
        for article in root.findall(".//PubmedArticle"):
            pmid = article.findtext(".//MedlineCitation/PMID", default="N/A")
            title = article.findtext(".//Article/ArticleTitle", default="")
            journal = article.findtext(".//Article/Journal/Title", default="")
            pub_year = article.findtext(".//Article/Journal/JournalIssue/PubDate/Year", default="2024")
            abstract_texts = [elem.text for elem in article.findall(".//Article/Abstract/AbstractText") if elem.text]
            full_abstract = " ".join(abstract_texts)

            # Phân loại nguồn tổ chức tự động theo Tạp chí
            org_code = "PUBMED_NCBI"
            tier = "TIER_3_PEER_REVIEWED"
            if "American Dental Association" in journal:
                org_code, tier = "ADA", "TIER_1_GOLD_STANDARD"
            elif "Clinical Oral Investigations" in journal:
                org_code = "SPRINGER_COI"
            elif "Cochrane" in journal:
                org_code = "COCHRANE"
            elif "International Dental Journal" in journal:
                org_code, tier = "FDI", "TIER_2_INTERNATIONAL_GUIDE"
            elif "British Dental Journal" in journal:
                org_code, tier = "CGDent", "TIER_2_INTERNATIONAL_GUIDE"
            elif "Clinical Oral Implants Research" in journal or "Clinical Periodontology" in journal:
                org_code = "WILEY"
            elif "Prosthetic Dentistry" in journal:
                org_code = "ELSEVIER"

            parsed_records.append({
                "pmid": f"PMID:{pmid}",
                "organization_code": org_code,
                "authority_tier": tier,
                "journal": journal,
                "publication_year": int(pub_year) if pub_year.isdigit() else 2024,
                "title": title,
                "raw_abstract": full_abstract,
                "citation_tag": f"[{org_code} - {journal} | {pub_year} | PMID:{pmid}]"
            })
        return parsed_records
