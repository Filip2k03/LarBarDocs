export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  name_mm: string;
  description: string;
  description_mm: string;
  icon_name: string;
  article_count: number;
}

export interface HelpArticle {
  id: string;
  slug: string;
  category_slug: string;
  title: string;
  title_mm: string;
  content: string;
  content_mm: string;
  tags: string[];
  helpful_count: number;
  last_updated: string;
}

export interface FaqItem {
  id: string;
  question: string;
  question_mm: string;
  answer: string;
  answer_mm: string;
  category: 'ride' | 'driver' | 'payment' | 'safety' | 'delivery';
}
