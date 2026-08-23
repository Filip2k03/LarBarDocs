import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { HelpCategory, HelpArticle, FaqItem } from '@/types/help';

export class HelpService {
  public static async getCategories(): Promise<HelpCategory[]> {
    return ApiClient.get<HelpCategory[]>(API_ENDPOINTS.helpCategories);
  }

  public static async getArticles(categorySlug?: string): Promise<HelpArticle[]> {
    return ApiClient.get<HelpArticle[]>(API_ENDPOINTS.helpArticles, {
      params: categorySlug ? { category: categorySlug } : undefined,
    });
  }

  public static async getArticleBySlug(slug: string): Promise<HelpArticle> {
    return ApiClient.get<HelpArticle>(API_ENDPOINTS.helpArticleBySlug(slug));
  }

  public static async searchArticles(query: string): Promise<HelpArticle[]> {
    return ApiClient.get<HelpArticle[]>(API_ENDPOINTS.helpSearch(query));
  }

  public static async getFaqs(): Promise<FaqItem[]> {
    return ApiClient.get<FaqItem[]>(API_ENDPOINTS.faqs);
  }
}
