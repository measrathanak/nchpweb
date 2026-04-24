export const locales = ["en", "km"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function toLocale(input: string | undefined): Locale {
  return input === "km" ? "km" : "en";
}

export const copy = {
  en: {
    siteName: "NPCH News Platform",
    homeTitle: "Latest News & Content",
    homeIntro: "NPCH multilingual (Khmer/English) news platform powered by Headless TYPO3.",
    latest: "Latest Articles",
    browseAll: "Browse all articles",
    readMore: "Read more",
    empty: "No articles found.",
    backHome: "Back to home",
    backToArticles: "Back to articles",
    articleNotFound: "Article not found",
    searchPlaceholder: "Search articles...",
    searchButton: "Search",
    retry: "Retry",
    genericTryAgain: "Please try again in a moment.",
    loadingArticles: "Loading articles...",
    loadingArticle: "Loading article...",
    articlesLoadErrorTitle: "Failed to load articles",
    articleLoadErrorTitle: "Failed to load article",
    pageNotFoundTitle: "Page not found",
    pageNotFoundDescription: "The page you requested does not exist or may have moved.",
    unexpectedErrorTitle: "Something went wrong",
    unexpectedErrorDescription: "An unexpected error occurred while loading this page.",
    seoSiteName: "NPCHWEB News Platform",
    seoArticlesTitle: "Articles",
    seoArticlesDescription: "Browse Khmer and English NPCH news and content articles.",
  },
  km: {
    siteName: "វេទិកាព័ត៌មាន NPCH",
    homeTitle: "ព័ត៌មាន និងមាតិកាថ្មីៗ",
    homeIntro: "គេហទំព័រព័ត៌មានពហុភាសា (ខ្មែរ/អង់គ្លេស) ដំណើរការដោយ Headless TYPO3។",
    latest: "អត្ថបទថ្មីៗ",
    browseAll: "មើលអត្ថបទទាំងអស់",
    readMore: "អានបន្ថែម",
    empty: "រកមិនឃើញអត្ថបទ។",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    backToArticles: "ត្រឡប់ទៅបញ្ជីអត្ថបទ",
    articleNotFound: "រកមិនឃើញអត្ថបទ",
    searchPlaceholder: "ស្វែងរកអត្ថបទ...",
    searchButton: "ស្វែងរក",
    retry: "ព្យាយាមម្តងទៀត",
    genericTryAgain: "សូមព្យាយាមម្តងទៀតបន្តិចក្រោយ។",
    loadingArticles: "កំពុងផ្ទុកអត្ថបទ...",
    loadingArticle: "កំពុងផ្ទុកអត្ថបទ...",
    articlesLoadErrorTitle: "បរាជ័យក្នុងការផ្ទុកបញ្ជីអត្ថបទ",
    articleLoadErrorTitle: "បរាជ័យក្នុងការផ្ទុកអត្ថបទ",
    pageNotFoundTitle: "រកមិនឃើញទំព័រ",
    pageNotFoundDescription: "ទំព័រដែលអ្នកស្នើសុំមិនមាន ឬអាចត្រូវបានផ្លាស់ទី។",
    unexpectedErrorTitle: "មានបញ្ហាកើតឡើង",
    unexpectedErrorDescription: "មានបញ្ហាមិនបានរំពឹងទុកកើតឡើងនៅពេលផ្ទុកទំព័រនេះ។",
    seoSiteName: "វេទិកាព័ត៌មាន NPCHWEB",
    seoArticlesTitle: "អត្ថបទ",
    seoArticlesDescription: "មើលអត្ថបទព័ត៌មាន និងមាតិកា NPCH ជាភាសាខ្មែរ និងអង់គ្លេស។",
  },
};
