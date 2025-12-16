
import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Hash, Quote, ImageIcon, Link as LinkIcon, FileText, Users, MapPin, Box, Flag, Scroll, Heading1, Heading2, Heading3, List, Code, Minus, Terminal } from 'lucide-react';
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

const SLASH_COMMANDS = [
    { label: 'Heading 1', value: '# ', icon: Heading1, desc: 'Big section heading' },
    { label: 'Heading 2', value: '## ', icon: Heading2, desc: 'Medium section heading' },
    { label: 'Heading 3', value: '### ', icon: Heading3, desc: 'Small section heading' },
    { label: 'Bullet List', value: '- ', icon: List, desc: 'Create a simple bulleted list' },
    { label: 'Numbered List', value: '1. ', icon: List, desc: 'Create a numbered list' },
    { label: 'Quote', value: '> ', icon: Quote, desc: 'Capture a quote' },
    { label: 'Code Block', value: '```\n\n```', offset: -4, icon: Code, desc: 'Capture code snippet' },
    { label: 'Divider', value: '---\n', icon: Minus, desc: 'Visually separate content' },
    { label: 'Image', action: 'image', icon: ImageIcon, desc: 'Upload or embed an image' },
];

export const RichTextEditor = ({ value, onChange, entities, pages, placeholder, className, lang }: RichTextEditorProps) => {
    const [mentionState, setMentionState] = useState<{ active: boolean; query: string; index: number }>({ active: false, query: '', index: 0 });
    const [slashState, setSlashState] = useState<{ active: boolean; query: string; index: number }>({ active: false, query: '', index: 0 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const lastSlash = textBeforeCursor.lastIndexOf('/');
        
        // Handle Mentions
        if (lastAt !== -1 && (sel - lastAt) < 20) {
            const query = textBeforeCursor.substring(lastAt + 1);
            // Verify @ is preceded by space or newline or start
            const charBeforeAt = lastAt > 0 ? textBeforeCursor[lastAt - 1] : ' ';
            if (!query.includes('\n') && /[\s\n]/.test(charBeforeAt)) { 
                 setMentionState({ active: true, query, index: lastAt });
                 setSlashState({ active: false, query: '', index: 0 });
                 setSelectedIndex(0);
                 return;
            }
        }

        // Handle Slash Commands
        if (lastSlash !== -1 && (sel - lastSlash) < 15) {
            const query = textBeforeCursor.substring(lastSlash + 1);
            const charBeforeSlash = lastSlash > 0 ? textBeforeCursor[lastSlash - 1] : '\n';
            // Only trigger at start of line or after space
            if (!query.includes('\n') && /[\s\n]/.test(charBeforeSlash)) {
                setSlashState({ active: true, query, index: lastSlash });
                setMentionState({ active: false, query: '', index: 0 });
                setSelectedIndex(0);
                return;
            }
        }

        setMentionState({ active: false, query: '', index: 0 });
        setSlashState({ active: false, query: '', index: 0 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((mentionState.active || slashState.active)) {
            const listLength = mentionState.active ? getMentionSuggestions().length : getSlashSuggestions().length;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % listLength);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + listLength) % listLength);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (mentionState.active) {
                    const item = getMentionSuggestions()[selectedIndex];
                    if (item) insertMention(item);
                } else {
                    const item = getSlashSuggestions()[selectedIndex];
                    if (item) insertSlashCommand(item);
                }
            } else if (e.key === 'Escape') {
                setMentionState({ active: false, query: '', index: 0 });
                setSlashState({ active: false, query: '', index: 0 });
            }
        }
    };

    // --- Mention Logic ---
    const getMentionSuggestions = () => {
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
            
        return [...entityMatches, ...pageMatches].sort((a, b) => a.label.localeCompare(b.label)).slice(0, 10);
    };

    const insertMention = (item: any) => {
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

    // --- Slash Logic ---
    const getSlashSuggestions = () => {
        if (!slashState.active) return [];
        const query = slashState.query.toLowerCase();
        return SLASH_COMMANDS.filter(cmd => cmd.label.toLowerCase().includes(query));
    };

    const insertSlashCommand = (item: typeof SLASH_COMMANDS[0]) => {
        if (item.action === 'image') {
            fileInputRef.current?.click();
            setSlashState({ active: false, query: '', index: 0 });
            return;
        }

        const before = value.substring(0, slashState.index);
        const afterQueryIndex = slashState.index + 1 + slashState.query.length;
        const after = value.substring(afterQueryIndex);
        
        const newValue = before + item.value + after;
        onChange(newValue);
        setSlashState({ active: false, query: '', index: 0 });
        
        setTimeout(() => {
             if(textareaRef.current) {
                 const newCursor = before.length + item.value.length + (item.offset || 0);
                 textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
                 textareaRef.current.focus();
             }
        }, 0);
    };

    const mentionSuggestions = getMentionSuggestions();
    const slashSuggestions = getSlashSuggestions();

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
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button onClick={handleLinkInsert} className={THEME.richText.toolbarButton} title="Insert Link"><LinkIcon size={14}/></button>
             </div>
             
             <div className="relative flex-1">
                <AutoTextarea 
                    inputRef={textareaRef}
                    value={value} 
                    onChange={handleInput} 
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Type '/' for commands or '@' to reference..."}
                    className={THEME.richText.editor}
                />
                
                {/* Mention Dropdown */}
                {mentionState.active && mentionSuggestions.length > 0 && (
                    <div className={THEME.richText.mentionDropdown} style={{ top: 'auto', bottom: '100%' }}>
                        <div className="bg-slate-950 px-3 py-1 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-800">Link to...</div>
                        {mentionSuggestions.map((item: any, idx) => (
                            <button 
                                key={`${item.refType}-${item.id}`} 
                                onClick={() => insertMention(item)} 
                                className={`${THEME.richText.mentionItem} ${idx === selectedIndex ? 'bg-indigo-600 text-white' : ''}`}
                            >
                                <div className={`flex items-center justify-center w-5 h-5 rounded ${item.refType === 'wiki' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    <item.icon size={12}/>
                                </div>
                                <span className="truncate">{item.label}</span>
                                <span className="text-[10px] opacity-50 ml-auto uppercase">{item.type}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Slash Command Dropdown */}
                {slashState.active && slashSuggestions.length > 0 && (
                    <div className={THEME.richText.mentionDropdown} style={{ top: 'auto', bottom: '100%', width: '300px' }}>
                        <div className="bg-slate-950 px-3 py-1 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-800">Commands</div>
                        {slashSuggestions.map((item: any, idx) => (
                            <button 
                                key={item.label} 
                                onClick={() => insertSlashCommand(item)} 
                                className={`${THEME.richText.mentionItem} ${idx === selectedIndex ? 'bg-indigo-600 text-white' : ''}`}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 text-slate-400 shrink-0">
                                    <item.icon size={14}/>
                                </div>
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="truncate font-medium text-xs">{item.label}</span>
                                    <span className="truncate text-[10px] opacity-60">{item.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
             </div>
             
             <div className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1 flex gap-4 flex-shrink-0 border-t border-slate-800">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"/> Markdown supported</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> <b>@</b> to reference</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> <b>/</b> for commands</span>
             </div>
        </div>
    );
};
