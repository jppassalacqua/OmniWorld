import React, { useState } from 'react';
import { Map as MapIcon, Languages, X, Plus, Users, Box, Flag, Scroll } from 'lucide-react';
import { Entity, Attribute, Relationship, SupportedLanguage, EntityType } from '../types';
import { RichTextEditor, TagInput, ImageManager } from '../components/Shared';
import { getLocalized } from '../utils/helpers';
import { THEME } from '../styles/theme';

interface EntityDetailProps {
    entity: Entity;
    allEntities: Entity[];
    lang: SupportedLanguage;
    onUpdate: (e: Entity) => void;
    onCreateEntity: (d: any) => void;
    onExport: () => void;
    setView: (v: string) => void;
    aiService: any;
}

export const EntityDetail = ({ entity, allEntities, lang, onUpdate, onCreateEntity, onExport, setView, aiService }: EntityDetailProps) => {
    const [activeTab, setActiveTab] = useState('details');
    const [translatingField, setTranslatingField] = useState<string | null>(null);

    if (!entity) return <div className={THEME.layout.emptyState}>Select an entity</div>;
  
    // Helper to check for descendants (to filter parent selector)
    const isDescendant = (potentialParentId: string): boolean => {
        const potentialParent = allEntities.find(e => e.id === potentialParentId);
        if (!potentialParent) return false;
        if (potentialParent.parentId === entity.id) return true;
        if (potentialParent.parentId) return isDescendant(potentialParent.parentId);
        return false;
    };

    const validParents = allEntities.filter((e: Entity) => e.id !== entity.id && !isDescendant(e.id));

    const handleGenerateImage = async () => { 
        const name = getLocalized(entity.name, lang);
        const desc = getLocalized(entity.description, lang);
        const tags = entity.tags ? entity.tags.join(', ') : "";
        
        // Construct a richer prompt based on available info
        const prompt = `${desc || name}. ${tags ? `Tags: ${tags}` : ''}`;
        
        return await aiService.generateImage(prompt, 'entity', entity.type);
    };
    
    const handleTranslate = async (field: 'name' | 'description') => { 
        const otherLang = lang === 'fr' ? 'en' : 'fr'; 
        const sourceText = (entity[field] as any)[otherLang] || Object.values(entity[field]).find(v => v) || ""; 
        if (!sourceText) return; 
        setTranslatingField(field); 
        try { 
            const translation = await aiService.translateText(sourceText, lang); 
            onUpdate({ ...entity, [field]: { ...entity[field], [lang]: translation } }); 
        } finally { 
            setTranslatingField(null); 
        } 
    };

    const getPlaceholderIcon = () => {
        switch(entity.type) {
            case EntityType.LOCATION: return MapIcon;
            case EntityType.ITEM: return Box;
            case EntityType.FACTION: return Flag;
            case EntityType.LORE: return Scroll;
            default: return Users;
        }
    };
    
    return (
        <div className="h-full flex flex-col bg-slate-900 overflow-y-auto">
             <div className="relative h-96 shrink-0 bg-slate-950">
                <ImageManager 
                    src={entity.imageUrl} 
                    onImageChange={(url) => onUpdate({...entity, imageUrl: url})}
                    onGenerate={handleGenerateImage}
                    className="w-full h-full rounded-none border-0"
                    aspectRatio="video"
                    placeholderIcon={getPlaceholderIcon()}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-4 left-6 z-10 w-full pr-12">
                    <div className="flex items-end gap-3 mb-1">
                        <input className="text-4xl font-bold text-white tracking-tight bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 outline-none w-full shadow-black drop-shadow-md" value={getLocalized(entity.name, lang)} onChange={(e) => onUpdate({...entity, name: {...entity.name, [lang]: e.target.value}})}/>
                        <button onClick={() => handleTranslate('name')} disabled={!!translatingField} className="mb-2 p-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded shadow-lg backdrop-blur transition-all pointer-events-auto"><Languages size={14}/></button>
                        <span className="text-indigo-400 font-mono text-sm px-2 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded mb-1.5 backdrop-blur">{entity.type}</span>
                    </div>
                </div>
             </div>
             
             <div className="flex border-b border-slate-700 bg-slate-900 px-6">
                <button onClick={() => setActiveTab('details')} className={THEME.button.tab(activeTab === 'details')}>Details</button>
                <button onClick={() => setActiveTab('relationships')} className={THEME.button.tab(activeTab === 'relationships')}>Relationships ({entity.relationships.length})</button>
             </div>
             <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                 {activeTab === 'details' && (
                     <section className="space-y-6">
                        <div>
                             <div className="mb-4">
                                <label className={THEME.text.label}>Parent Entity</label>
                                <select className={THEME.input.select} value={entity.parentId || ''} onChange={(e) => onUpdate({ ...entity, parentId: e.target.value || undefined })}>
                                    <option value="">None (Root)</option>
                                    {validParents.map((e: Entity) => (
                                        <option key={e.id} value={e.id}>{getLocalized(e.name, lang)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mb-3"><h3 className={THEME.text.header}>Description</h3><button onClick={() => handleTranslate('description')} disabled={!!translatingField} className="flex items-center gap-1 text-xs bg-indigo-900/50 text-indigo-300 hover:text-white px-2 py-0.5 rounded border border-indigo-500/30 hover:bg-indigo-600 transition-colors"><Languages size={12}/> Translate</button></div>
                            <RichTextEditor value={getLocalized(entity.description, lang)} onChange={(val) => onUpdate({...entity, description: {...entity.description, [lang]: val}})} entities={allEntities} lang={lang} placeholder="Describe this entity..." />
                        </div>
                        <div><h3 className={THEME.text.header}>Tags</h3><TagInput tags={entity.tags || []} onChange={(newTags) => onUpdate({ ...entity, tags: newTags })} /></div>
                        <div>
                            <h3 className={THEME.text.header}>Attributes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {entity.attributes.map((attr: Attribute, idx: number) => (
                                    <div key={idx} className="bg-slate-800 p-2 rounded flex items-center gap-2 border border-slate-700 focus-within:border-indigo-500 transition-colors">
                                        <input className="bg-transparent text-slate-400 text-sm outline-none w-1/2 text-right border-r border-slate-700 pr-2" value={attr.key} onChange={(e) => { const newAttrs = [...entity.attributes]; newAttrs[idx] = { ...attr, key: e.target.value }; onUpdate({ ...entity, attributes: newAttrs }); }}/>
                                        <input className="bg-transparent text-white font-mono text-sm outline-none w-1/2 pl-2" value={attr.value} onChange={(e) => { const newAttrs = [...entity.attributes]; newAttrs[idx] = { ...attr, value: e.target.value }; onUpdate({ ...entity, attributes: newAttrs }); }}/>
                                        <button onClick={() => { const newAttrs = entity.attributes.filter((_: any, i: number) => i !== idx); onUpdate({ ...entity, attributes: newAttrs }); }} className={THEME.button.icon}><X size={14}/></button>
                                    </div>
                                ))}
                                <button onClick={() => onUpdate({ ...entity, attributes: [...entity.attributes, { key: "New Stat", value: "0" }] })} className="border border-dashed border-slate-700 rounded p-3 text-slate-500 hover:text-white hover:border-slate-500 flex items-center justify-center text-sm gap-2 h-full min-h-[46px] transition-colors"><Plus size={14}/> Add Attribute</button>
                            </div>
                        </div>
                     </section>
                 )}
                 {activeTab === 'relationships' && (
                     <section className="space-y-3">
                         {entity.relationships.length === 0 && <p className="text-slate-500 text-sm italic">No relationships defined.</p>}
                         {entity.relationships.map((rel: Relationship, idx: number) => {
                             const target = allEntities.find((e: Entity) => e.id === rel.targetId);
                             return target ? (<div key={idx} className="flex items-center bg-slate-800 p-3 rounded border border-slate-700"><span className="text-indigo-400 font-bold text-sm w-24 text-right mr-4">{rel.type}</span><div className="w-px h-6 bg-slate-700 mr-4"/><span className="text-white text-sm">{getLocalized(target.name, lang)}</span></div>) : null;
                         })}
                     </section>
                 )}
             </div>
        </div>
    );
};