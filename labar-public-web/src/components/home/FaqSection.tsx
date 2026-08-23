import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { HelpService } from '@/services/help.service';
import type { FaqItem } from '@/types/help';

interface FaqSectionProps {
  locale?: 'en' | 'my';
}

export const FaqSection: React.FC<FaqSectionProps> = ({ locale = 'en' }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const loadFaqs = async () => {
      setIsLoading(true);
      try {
        const data = await HelpService.getFaqs();
        setFaqs(data);
      } catch {
        // Default standard FAQs
        setFaqs([
          {
            id: 'faq_1',
            question: 'How do I book a taxi with LaBar?',
            question_mm: 'LaBar ဖြင့် တက္ကစီ ခရီးစဉ် မည်သို့ ခေါ်ယူနိုင်ပါသလဲ?',
            answer: 'You can book directly on this website using our live booking tool or download the LaBar mobile app on iOS and Android for 1-tap instant booking.',
            answer_mm: 'ဤဝဘ်ဆိုက်ပေါ်ရှိ တိုက်ရိုက်ခေါ်ယူမှုစနစ်ဖြင့်လည်းကောင်း၊ iOS နှင့် Android ရှိ LaBar မိုဘိုင်းအက်ပ်ကို ဒေါင်းလုဒ်ရယူ၍လည်းကောင်း ၁ ချက်နှိပ်ရုံဖြင့် လွယ်ကူစွာ ခေါ်ယူနိုင်ပါသည်။',
            category: 'ride',
          },
          {
            id: 'faq_2',
            question: 'How much does a ride cost?',
            question_mm: 'ခရီးစဉ် မီတာခ မည်မျှ ကျသင့်ပါသလဲ?',
            answer: 'LaBar uses transparent base fares calculated strictly by distance and time according to official municipal rules. You will always see the exact guaranteed fare estimate before confirming.',
            answer_mm: 'LaBar သည် အကွာအဝေးနှင့် ကြာမြင့်ချိန်ပေါ်မူတည်၍ ပွင့်လင်းမြင်သာသော နှုန်းထားဖြင့် တွက်ချက်ပါသည်။ ခရီးစဥ်မစတင်မီ ကျသင့်ငွေကို အတိအကျ ကြိုတင်မြင်တွေ့နိုင်ပါသည်။',
            category: 'payment',
          },
          {
            id: 'faq_3',
            question: 'How do I contact my driver?',
            question_mm: 'ယာဉ်မောင်းထံသို့ မည်သို့ ဆက်သွယ်နိုင်ပါသလဲ?',
            answer: 'Once your driver accepts the trip, you can use our in-app end-to-end encrypted VoIP phone call or in-app instant chat without revealing your personal private phone number.',
            answer_mm: 'ယာဉ်မောင်းမှ ခရီးစဉ်လက်ခံပြီးသည်နှင့် သင့်ဖုန်းနံပါတ် အပြင်သို့မပေါက်ကြားစေဘဲ အက်ပ်တွင်း အသံခေါ်ဆိုမှု သို့မဟုတ် မက်ဆေ့ခ်ျဖြင့် တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။',
            category: 'driver',
          },
          {
            id: 'faq_4',
            question: 'What is the LaBar Guardian safety system?',
            question_mm: 'LaBar Guardian လုံခြုံရေးစနစ်ဆိုသည်မှာ အဘယ်နည်း?',
            answer: 'LaBar Guardian is our integrated dual-shield safety system providing real-time 60fps route telemetry, route deviation alerts, emergency 1km SOS mesh intercept, and optional in-cabin video sentinel.',
            answer_mm: 'LaBar Guardian သည် မိသားစုထံသို့ တိုက်ရိုက် လမ်းကြောင်းမျှဝေခြင်း၊ ၁ ကီလိုမီတာ အရေးပေါ် SOS အကူအညီနှင့် ယာဉ်တွင်း CCTV လုံခြုံရေးတို့ ပါဝင်သော ပြည့်စုံသည့် စောင့်ရှောက်မှုစနစ် ဖြစ်ပါသည်။',
            category: 'safety',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isMyanmar = locale === 'my';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-brand-red" />
        </div>
      ) : (
        faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const q = isMyanmar ? faq.question_mm : faq.question;
          const a = isMyanmar ? faq.answer_mm : faq.answer;

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
