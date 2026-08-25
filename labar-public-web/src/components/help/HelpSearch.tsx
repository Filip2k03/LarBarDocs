import React, { useState } from 'react';
import { Search, FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { HelpService } from '@/services/help.service';
import type { HelpArticle } from '@/types/help';

export const HelpSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || query.trim().length < 2) return;

    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const data = await HelpService.searchArticles(query);
      setResults(data);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Search is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-3xl p-2 border border-brand-border shadow-soft-lg">
        <Search size={20} className="text-neutral-400 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for articles, topics, payments, lost items..."
          className="w-full px-3 py-3 text-sm font-semibold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 placeholder:font-normal"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="py-3 px-6 rounded-2xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Results Dropdown or Card */}
      {hasSearched && (
        <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-soft">
          <div className="text-xs font-bold text-neutral-500 uppercase px-3 py-1 mb-2">
            Search Results ({results.length})
          </div>

          {error && <div className="m-2 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900">{error} No local results were substituted.</div>}

          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No matching help articles found for "{query}". You can submit a support ticket below.
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((art) => (
                <a
                  key={art.id}
                  href={`/help/${art.slug}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-brand-bg transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs md:text-sm font-extrabold text-neutral-900 group-hover:text-brand-red transition-colors">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{art.category}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-brand-red transition-colors shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
