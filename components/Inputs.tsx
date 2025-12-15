
import React, { useState } from 'react';
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

export const TagInput = ({ tags, onChange }: { tags: string[], onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onChange([...tags, input.trim()]);
            }
            setInput('');
        }
    };
    const removeTag = (t: string) => onChange(tags.filter(tag => tag !== t));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full border border-indigo-500/30 animate-in zoom-in-95 duration-200">
                        <Tag size={10}/> {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-white ml-1"><X size={10}/></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none flex-1 focus:border-indigo-500 transition-colors"
                    placeholder="Add tag (Press Enter)..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={() => { if(input.trim() && !tags.includes(input.trim())) { onChange([...tags, input.trim()]); setInput(''); }}} className="bg-slate-700 hover:bg-slate-600 text-white p-1 rounded transition-colors">
                    <Plus size={14}/>
                </button>
            </div>
        </div>
    );
};
