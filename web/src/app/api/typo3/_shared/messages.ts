export function getApiMessages(language: string) {
  const isKhmer = language === "km";

  if (isKhmer) {
    return {
      fetchArticlesFailed: "បរាជ័យក្នុងការទាញអត្ថបទ",
      fetchArticleFailed: "បរាជ័យក្នុងការទាញអត្ថបទលម្អិត",
      invalidArticleUid: "UID អត្ថបទមិនត្រឹមត្រូវ",
      articleNotFound: "រកមិនឃើញអត្ថបទ",
      searchFailed: "បរាជ័យក្នុងការស្វែងរក",
    };
  }

  return {
    fetchArticlesFailed: "Failed to fetch articles",
    fetchArticleFailed: "Failed to fetch article",
    invalidArticleUid: "Invalid article uid",
    articleNotFound: "Article not found",
    searchFailed: "Search failed",
  };
}
