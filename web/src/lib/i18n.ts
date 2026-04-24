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
    homeIntro: "Multilingual (Khmer/English) news site powered by Headless TYPO3.",
    browseAll: "Browse all articles",
    readMore: "Read more",
    empty: "No articles found.",
    backHome: "Back to home",
    backToArticles: "Back to articles",
    articleNotFound: "Article not found",
    searchPlaceholder: "Search articles...",
    searchButton: "Search",
    loadingArticles: "Loading articles...",
  },
  km: {
    siteName: "វេទិកាព័ត៌មាន NPCH",
    homeTitle: "ព័ត៌មាន និងមាតិកាថ្មីៗ",
    homeIntro: "គេហទំព័រព័ត៌មានពហុភាសា (ខ្មែរ/អង់គ្លេស) ដំណើរការដោយ Headless TYPO3។",
    browseAll: "មើលអត្ថបទទាំងអស់",
    readMore: "អានបន្ថែម",
    empty: "រកមិនឃើញអត្ថបទ។",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    backToArticles: "ត្រឡប់ទៅបញ្ជីអត្ថបទ",
    articleNotFound: "រកមិនឃើញអត្ថបទ",
    searchPlaceholder: "ស្វែងរកអត្ថបទ...",
    searchButton: "ស្វែងរក",
    loadingArticles: "កំពុងផ្ទុកអត្ថបទ...",
  },
};
