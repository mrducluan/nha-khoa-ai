from dental_ai.config import get_settings
from dental_ai.embeddings import LocalHashEmbedder
from dental_ai.fallback import build_query, classify_source, parse_pubmed_xml, should_trigger_fallback

PUBMED_XML = b"""<?xml version="1.0"?>
<PubmedArticleSet>
 <PubmedArticle>
  <MedlineCitation><PMID>12345678</PMID>
   <Article>
    <Journal><Title>Journal of the American Dental Association</Title>
     <JournalIssue><PubDate><MedlineDate>2021 Jan-Feb</MedlineDate></PubDate></JournalIssue></Journal>
    <ArticleTitle>Guideline on <i>caries</i> management</ArticleTitle>
    <Abstract><AbstractText Label="BACKGROUND">Fluoride <sup>5%</sup> varnish.</AbstractText>
     <AbstractText Label="CONCLUSIONS">Arrests lesions.</AbstractText></Abstract>
    <PublicationTypeList><PublicationType>Practice Guideline</PublicationType></PublicationTypeList>
   </Article>
  </MedlineCitation>
  <PubmedData><ArticleIdList><ArticleId IdType="doi">10.1/abc</ArticleId></ArticleIdList></PubmedData>
 </PubmedArticle>
 <PubmedArticle>
  <MedlineCitation><PMID>99</PMID>
   <Article><Journal><Title>Journal of the American Dental Association</Title>
     <JournalIssue><PubDate><Year>2019</Year></PubDate></JournalIssue></Journal>
    <ArticleTitle>A cohort study</ArticleTitle>
    <PublicationTypeList><PublicationType>Journal Article</PublicationType></PublicationTypeList>
   </Article></MedlineCitation>
 </PubmedArticle>
</PubmedArticleSet>"""


def test_parse_pubmed_xml_handles_nested_tags_and_medline_date():
    a, b = parse_pubmed_xml(PUBMED_XML)
    assert a.pmid == "12345678" and a.publication_year == 2021 and a.doi == "10.1/abc"
    assert a.title == "Guideline on caries management"
    assert "BACKGROUND: Fluoride 5% varnish." in a.abstract and "CONCLUSIONS" in a.abstract
    assert (a.organization_code, a.authority_tier) == ("ADA", "TIER_1_GOLD_STANDARD")
    # Bài nghiên cứu thường trên JADA KHÔNG được coi là hướng dẫn ADA
    assert b.authority_tier == "TIER_3_PEER_REVIEWED" and b.organization_code != "ADA"
    assert "PMID:12345678" in a.citation_tag


def test_classify_source():
    assert classify_source("Cochrane Database of Systematic Reviews", []) == ("COCHRANE", "TIER_3_PEER_REVIEWED")


def test_build_query_has_filters():
    q = build_query("peri-implantitis")
    assert "2016/01/01" in q and "Systematic Review[pt]" in q and "[Journal]" in q
    assert "[pt]" not in build_query("x", strict=False)


def _result(sim, text="", role="PRIMARY_ADA_ITI_STANDARD"):
    return {"best_vector_similarity": sim, "slot_role": role, "matched_chunks": [{"text": text}]}


def test_fallback_decision_uses_similarity_not_rrf():
    s, e = get_settings(), LocalHashEmbedder()
    assert should_trigger_fallback([], "x", s, e)[0] is True
    assert should_trigger_fallback([_result(0.9)], "câu hỏi", s, e)[0] is False
    assert should_trigger_fallback([_result(0.05)], "răng khôn mọc lệch", s, e)[0] is True
    # Tương đồng vừa + phủ đủ từ khoá → đủ dữ liệu
    assert should_trigger_fallback([_result(0.2, "torque mua ncm")], "Torque MUA bao nhiêu Ncm", s, e)[0] is False


def test_check_doi_with_mocked_crossref():
    import httpx

    from dental_ai.citations import check_doi

    def handler(request):
        if "missing" in str(request.url):
            return httpx.Response(404)
        return httpx.Response(200, json={"message": {
            "title": ["Treatment of stage I-III periodontitis: The EFP S3 level clinical practice guideline"],
            "issued": {"date-parts": [[2020, 7]]}, "container-title": ["J Clin Periodontol"]}})

    http = httpx.Client(transport=httpx.MockTransport(handler))
    ok = check_doi(http, "10.1111/jcpe.13290", "Treatment of Stage I-III Periodontitis — The EFP S3 Level Clinical Practice Guideline", 2020)
    assert ok["status"] == "KHỚP"
    wrong_year = check_doi(http, "10.1111/jcpe.13290", "Treatment of Stage I-III Periodontitis — The EFP S3 Level Clinical Practice Guideline", 2022)
    assert wrong_year["status"] == "SAI_LỆCH" and "2020" in wrong_year["detail"]
    assert check_doi(http, "10.1/missing", "x", 2020)["status"] == "DOI_KHÔNG_TỒN_TẠI"
    assert check_doi(http, "CGDENT-IMP-2022", "x", 2022)["status"] == "KHÔNG_CÓ_DOI"
