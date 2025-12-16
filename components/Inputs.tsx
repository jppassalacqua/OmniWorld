
import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { THEME } from '../styles/theme';

export const AutoTextarea = ({ value, onChange, placeholder, className, onKeyDown, onKeyUp, inputRef }: any) => {
  return (
    <textarea
      ref={inputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      placeholder={placeholder}
      className={`${THEME.input.textarea} ${className || ''}`}
    />
  );
};

export const TagInput = ({ tags, onChange, suggestions = [] }: { tags: string[], onChange: (tags: string[]) => void, suggestions?: string[] }) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Deduped and filtered suggestions
    const filteredSuggestions = Array.from(new Set(suggestions)).filter(s =>
        s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
    ).slice(0, 5);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input);
        }
    };

    const addTag = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (t: string) => onChange(tags.filter(tag => tag !== t));

    return (
        <div className="flex flex-col gap-2" ref={containerRef}>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full border border-indigo-500/30 animate-in zoom-in-95 duration-200">
                        <Tag size={10}/> {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-white ml-1"><X size={10}/></button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <div className="flex gap-2">
                    <input 
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none flex-1 focus:border-indigo-500 transition-colors"
                        placeholder="Add tag..."
                        value={input}
                        onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={() => addTag(input)} className="bg-slate-700 hover:bg-slate-600 text-white p-1 rounded transition-colors">
                        <Plus size={14}/>
                    </button>
                </div>
                {showSuggestions && input && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">
                        {filteredSuggestions.map(s => (
                            <button
                                key={s}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                                onClick={() => addTag(s)}
                            >
                                <span className="flex items-center gap-2"><Tag size={10} className="opacity-50"/> {s}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
