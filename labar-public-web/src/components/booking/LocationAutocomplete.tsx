import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, AlertCircle, Navigation, Clock } from 'lucide-react';
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
  type?: 'pickup' | 'dropoff' | 'stop';
  accessToken: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  iconColor = 'text-brand-red',
  citySlug,
  type = 'pickup',
  accessToken,
}) => {
  const [query, setQuery] = useState(value?.name || value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationPoint[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
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
    // Load recent locations from localStorage
    try {
      const saved = localStorage.getItem('labar_recent_places');
      if (saved) {
        setRecentLocations(JSON.parse(saved).slice(0, 3));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToRecent = (loc: LocationPoint) => {
    try {
      const existing = recentLocations.filter(
        (r) => r.name !== loc.name && r.address !== loc.address
      );
      const updated = [loc, ...existing].slice(0, 4);
      setRecentLocations(updated);
      localStorage.setItem('labar_recent_places', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await BookingService.searchLocations(text, accessToken, citySlug);
        setSuggestions(results);
        setHighlightedIndex(-1);
      } catch (err: any) {
        setError(err.message || 'Unable to fetch location suggestions.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelectLocation = (loc: LocationPoint) => {
    setQuery(loc.name || loc.address);
    onChange(loc);
    saveToRecent(loc);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationPoint = {
          name: 'Current Pinpoint Location (လက်ရှိတည်နေရာ)',
          address: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}, Yangon`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        handleSelectLocation(loc);
        setIsLocating(false);
      },
      (err) => {
        setError('Location permission was not granted. Search for a pickup instead.');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
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
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          {label}
        </label>
        {type === 'pickup' && !value && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[10px] font-bold text-brand-red hover:text-brand-deepRed flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isLocating ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Navigation size={11} />
            )}
            <span>Locate Me</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/20 transition-all shadow-sm">
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mr-2.5 ${
          type === 'pickup'
            ? 'bg-emerald-500 ring-4 ring-emerald-100'
            : type === 'stop'
            ? 'bg-amber-500 ring-4 ring-amber-100'
            : 'bg-brand-red ring-4 ring-red-100'
        }`} />

        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="w-full text-xs sm:text-sm font-semibold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 placeholder:font-normal"
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

      {/* Interactive Autocomplete & Quick Selection Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-brand-border rounded-2xl shadow-soft-lg z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {error && (
            <div className="px-4 py-2 bg-amber-50 text-[11px] text-amber-800 flex items-center gap-1.5 border-b border-amber-200">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant Geolocation Action */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full text-left px-4 py-2.5 bg-brand-lightRed/40 hover:bg-brand-lightRed text-brand-red text-xs font-bold flex items-center gap-2 border-b border-neutral-100 transition-colors"
          >
            {isLocating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            <span>Use Current Location (လက်ရှိတည်နေရာ ထည့်မည်)</span>
          </button>

          {/* Autocomplete Dynamic API Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/80">
                Search Results
              </div>
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
                  <MapPin size={15} className="text-brand-red shrink-0 mt-0.5" />
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

          {/* Popular Myanmar Hotspots & Shortcuts */}
          {suggestions.length === 0 && (
            <div>
              {recentLocations.length > 0 && (
                <div className="border-b border-neutral-100">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/80 flex items-center gap-1.5">
                    <Clock size={11} />
                    <span>Recent Places</span>
                  </div>
                  {recentLocations.map((loc, idx) => (
                    <button
                      key={`recent-${idx}`}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center justify-between border-b border-neutral-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin size={13} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{loc.name || loc.address}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 shrink-0">Recent</span>
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && query.length >= 2 && !error && (
                <div className="px-4 py-4 text-xs text-neutral-500 text-center">
                  No matching places were returned by the location service.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
