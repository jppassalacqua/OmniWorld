import React, { useState, useRef } from 'react';
import { Bold, Italic, Hash, Quote, ImageIcon, Link as LinkIcon, FileText, Users, MapPin, Box, Flag, Scroll } from 'lucide-react';
import { Entity, SupportedLanguage, WikiPage, EntityType } from '../types';
import { AutoTextarea } from './Inputs';
import { getLocalized } from '../utils/helpers';
import { THEME } from '../styles/theme';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    entities: Entity[];
    pages?: WikiPage[];
    placeholder?: string;
    className?: string;
    lang: SupportedLanguage;
}

const getEntityIcon = (type: EntityType) => {
    switch (type) {
        case EntityType.LOCATION: return MapPin;
        case EntityType.ITEM: return Box;
        case EntityType.FACTION: return Flag;
        case EntityType.LORE: return Scroll;
        default: return Users;
    }
};

export const RichTextEditor = ({ value, onChange, entities, pages, placeholder, className, lang }: RichTextEditorProps) => {
    const [mentionState, setMentionState] = useState<{ active: boolean; query: string; index: number }>({ active: false, query: '', index: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertText = (text: string, cursorOffset = 0) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newValue = value.substring(0, start) + text + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
            if(textareaRef.current) {
                const newPos = start + text.length + cursorOffset;
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
                textareaRef.current.focus();
            }
        }, 0);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                const md = `\n![${e.target.files![0].name}](${reader.result})\n`;
                insertText(md, 0);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleLinkInsert = () => {
        const url = prompt("Enter URL:", "https://");
        if (url) {
             insertText(`[Link Text](${url})`, -11);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const sel = e.target.selectionStart;
        onChange(val);

        const textBeforeCursor = val.substring(0, sel);
        const lastAt = textBeforeCursor.lastIndexOf('@');
        
        if (lastAt !== -1) {
            const query = textBeforeCursor.substring(lastAt + 1);
            if (!query.includes('\n') && (sel - lastAt) < 20) { 
                 setMentionState({ active: true, query, index: lastAt });
                 return;
            }
        }
        setMentionState({ active: false, query: '', index: 0 });
    };

    const getSuggestions = () => {
        if (!mentionState.active) return [];
        const query = mentionState.query.toLowerCase();
        
        const entityMatches = entities
            .filter(e => getLocalized(e.name, lang).toLowerCase().includes(query))
            .map(e => ({
                id: e.id,
                label: getLocalized(e.name, lang),
                type: e.type,
                refType: 'entity',
                icon: getEntityIcon(e.type)
            }));
            
        const pageMatches = (pages || [])
            .filter(p => getLocalized(p.title, lang).toLowerCase().includes(query))
            .map(p => ({
                id: p.id,
                label: getLocalized(p.title, lang),
                type: 'WIKI',
                refType: 'wiki',
                icon: FileText
            }));
            
        return [...entityMatches, ...pageMatches].sort((a, b) => a.label.localeCompare(b.label));
    };

    const suggestions = getSuggestions();

    const insertMention = (item: any) => {
        // Create link format: [Label](type:id)
        const ref = `[${item.label}](${item.refType}:${item.id})`;
        const before = value.substring(0, mentionState.index);
        const afterQueryIndex = mentionState.index + 1 + mentionState.query.length; 
        const after = value.substring(afterQueryIndex);
        
        const newValue = before + ref + " " + after;
        onChange(newValue);
        setMentionState({ active: false, query: '', index: 0 });
        
        setTimeout(() => {
             if(textareaRef.current) {
                 const newCursor = before.length + ref.length;
                 textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
                 textareaRef.current.focus();
             }
        }, 0);
    };

    return (
        <div className={`${THEME.richText.container} ${className || ''}`}>
             <div className={`${THEME.richText.toolbar} flex-wrap`}>
                <button onClick={() => insertText('**Bold**', -2)} className={THEME.richText.toolbarButton} title="Bold"><Bold size={14}/></button>
                <button onClick={() => insertText('_Italic_', -1)} className={THEME.richText.toolbarButton} title="Italic"><Italic size={14}/></button>
                <div className="w-px h-4 bg-slate-600 mx-1 opacity-50"/>
                <button onClick={() => insertText('### ')} className={THEME.richText.toolbarButton} title="Heading"><Hash size={14}/></button>
                <button onClick={() => insertText('> ')} className={THEME.richText.toolbarButton} title="Quote"><Quote size={14}/></button>
                <div className="w-px h-4 bg-slate-600 mx-1 opacity-50"/>
                <label className={`${THEME.richText.toolbarButton} cursor-pointer`} title="Insert Image">
                    <ImageIcon size={14}/>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button onClick={handleLinkInsert} className={THEME.richText.toolbarButton} title="Insert Link"><LinkIcon size={14}/></button>
             </div>
             
             <div className="relative flex-1">
                <AutoTextarea 
                    inputRef={textareaRef}
                    value={value} 
                    onChange={handleInput} 
                    placeholder={placeholder || "Type '/' for commands or '@' to reference..."}
                    className={THEME.richText.editor}
                />
                
                {suggestions.length > 0 && (
                    <div className={THEME.richText.mentionDropdown}>
                        {suggestions.map((item: any) => (
                            <button key={`${item.refType}-${item.id}`} onClick={() => insertMention(item)} className={THEME.richText.mentionItem}>
                                <div className={`flex items-center justify-center w-5 h-5 rounded ${item.refType === 'wiki' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    <item.icon size={12}/>
                                </div>
                                <span className="truncate">{item.label}</span>
                                <span className="text-[10px] opacity-50 ml-auto uppercase">{item.type}</span>
                            </button>
                        ))}
                    </div>
                )}
             </div>
             
             <div className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1 flex gap-4 flex-shrink-0 border-t border-slate-800">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"/> Markdown supported</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> <b>@</b> to reference</span>
             </div>
        </div>
    );
};