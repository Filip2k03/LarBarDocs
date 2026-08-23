export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  body?: unknown;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: unknown;
}
