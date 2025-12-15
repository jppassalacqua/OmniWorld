
import React, { useState, useEffect } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface RelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: string) => void;
    onDelete?: () => void;
    sourceName?: string;
    targetName?: string;
    initialType?: string;
}

export const RelationshipModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete, 
    sourceName, 
    targetName, 
    initialType 
}: RelationshipModalProps) => {
    const [type, setType] = useState(initialType || '');
    
    useEffect(() => { 
        setType(initialType || ''); 
    }, [initialType, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-1">Manage Relationship</h3>
                <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                    <span className="text-indigo-400 font-medium">{sourceName || 'Source'}</span>
                    <ChevronRight size={14}/>
                    <span className="text-emerald-400 font-medium">{targetName || 'Target'}</span>
                </p>
                <div className="mb-6">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Relationship Type</label>
                    <input 
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-indigo-500 outline-none" 
                        value={type} 
                        onChange={e => setType(e.target.value)} 
                        placeholder="e.g. Ally, Rival, Parent..." 
                        autoFocus 
                        onKeyDown={e => { if(e.key === 'Enter') onSave(type); }}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onSave(type)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium transition-colors">
                        {initialType ? 'Update' : 'Create'}
                    </button>
                    {initialType && onDelete && (
                        <button onClick={onDelete} className="px-4 bg-slate-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-slate-700 hover:border-red-900 rounded transition-colors">
                            <Trash2 size={18}/>
                        </button>
                    )}
                    <button onClick={onClose} className="px-4 bg-slate-800 text-slate-400 hover:text-white rounded transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
