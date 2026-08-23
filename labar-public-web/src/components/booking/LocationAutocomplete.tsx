import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, AlertCircle } from 'lucide-react';
import { BookingService } from '@/services/booking.service';
import type { LocationPoint } from '@/types/booking';

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: LocationPoint | null;
  onChange: (location: LocationPoint | null) => void;
  iconColor?: string;
  citySlug?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  iconColor = 'text-brand-red',
  citySlug,
}) => {
  const [query, setQuery] = useState(value?.name || value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.name || value.address);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setError(null);

    if (value && text !== (value.name || value.address)) {
      onChange(null);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await BookingService.searchLocations(text, citySlug);
        setSuggestions(results);
        setHighlightedIndex(-1);
      } catch (err: any) {
        setError(err.message || 'Unable to fetch locations from API.');
        // Allow fallback user custom pin location
        setSuggestions([
          {
            name: text,
            address: `${text}, Yangon, Myanmar`,
            latitude: 16.8661,
            longitude: 96.1951,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelectLocation = (loc: LocationPoint) => {
    setQuery(loc.name || loc.address);
    onChange(loc);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectLocation(suggestions[highlightedIndex]);
      } else if (query.trim().length > 0) {
        // Use custom typed location
        handleSelectLocation({
          name: query,
          address: `${query}, Yangon, Myanmar`,
          latitude: 16.7794,
          longitude: 96.1554,
        });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      
      <div className="relative flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/20 transition-all shadow-sm">
        <MapPin size={18} className={`shrink-0 mr-2.5 ${iconColor}`} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-sm font-semibold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 placeholder:font-normal"
        />

        {isLoading && <Loader2 size={16} className="animate-spin text-brand-red shrink-0 ml-2" />}
        
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-brand-border rounded-2xl shadow-soft-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
          {error && (
            <div className="px-4 py-2 bg-amber-50 text-[11px] text-amber-800 flex items-center gap-1.5 border-b border-amber-200">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {suggestions.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-xs text-neutral-500 text-center">
              No matching locations found. Press enter to use "{query}".
            </div>
          )}

          {suggestions.map((item, index) => (
            <button
              key={`${item.latitude}-${item.longitude}-${index}`}
              type="button"
              onClick={() => handleSelectLocation(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors border-b border-neutral-100 last:border-0 ${
                highlightedIndex === index ? 'bg-brand-lightRed/50' : 'hover:bg-neutral-50'
              }`}
            >
              <MapPin size={16} className="text-brand-red shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {item.name || item.address}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {item.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
