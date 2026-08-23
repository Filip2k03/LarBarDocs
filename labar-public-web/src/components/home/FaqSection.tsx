import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { HelpService } from '@/services/help.service';
import type { FaqItem } from '@/types/help';
import { ApiErrorState } from '@/components/common/ApiErrorState';

interface FaqSectionProps {
  locale?: 'en' | 'my';
}

export const FaqSection: React.FC<FaqSectionProps> = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      setIsLoading(true);
      try {
        const data = await HelpService.getFaqs();
        setFaqs(data);
      } catch (err) {
        setFaqs([]);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (error) return <ApiErrorState error={error} title="Help articles are unavailable" />;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-brand-red" />
        </div>
      ) : (
        faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const q = faq.question;
          const a = typeof faq.answer === 'string' ? faq.answer : JSON.stringify(faq.answer);

          return (
            <div
              key={faq.id}
              className="bg-white rounded-3xl border border-brand-border/80 overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-neutral-900 hover:text-brand-red transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 text-sm md:text-base font-extrabold">
                  <HelpCircle size={18} className="text-brand-red shrink-0" />
                  <span>{q}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-red' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                  {a}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
