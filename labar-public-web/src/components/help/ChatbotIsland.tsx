import React, { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { ConfigService } from '@/services/config.service';
import type { SystemConfig } from '@/types/api';

export const ChatbotIsland: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    ConfigService.getSystemConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  // The Go API does not currently publish a chat endpoint. Never synthesize
  // replies: keep the real Help Center available instead.
  if (config?.chat_enabled && config.chat_endpoint) return null;

  return (
    <a href="/help" className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-xs font-bold text-neutral-800 shadow-lg transition hover:-translate-y-0.5 hover:text-brand-red" aria-label="Open LaBar Help Center">
      <HelpCircle size={18} className="text-brand-red" /> Help
    </a>
  );
};
