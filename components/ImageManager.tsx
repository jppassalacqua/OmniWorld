import React, { useRef, useState } from 'react';
import { Download, Upload, Sparkles, Image as ImageIcon, Link } from 'lucide-react';
import { THEME } from '../styles/theme';

interface ImageManagerProps {
    src?: string;
    alt?: string;
    onImageChange: (newUrl: string) => void;
    onGenerate?: () => Promise<string | null>;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'portrait';
    placeholderIcon?: React.ElementType;
}

export const ImageManager = ({ 
    src, 
    alt, 
    onImageChange, 
    onGenerate, 
    className = "", 
    aspectRatio = 'square',
    placeholderIcon: Icon = ImageIcon
}: ImageManagerProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    onImageChange(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = () => {
        if (!src) return;
        const a = document.createElement('a');
        a.href = src;
        a.download = `image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleGenerateClick = async () => {
        if (!onGenerate) return;
        setIsGenerating(true);
        try {
            const result = await onGenerate();
            if (result) onImageChange(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const getAspectRatioClass = () => {
        switch(aspectRatio) {
            case 'video': return 'aspect-video';
            case 'portrait': return 'aspect-[3/4]';
            case 'square': default: return 'aspect-square';
        }
    };

    return (
        <div className={`relative group overflow-hidden bg-slate-900 border border-slate-700 rounded-xl ${getAspectRatioClass()} ${className}`}>
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <Icon size={48} className="mb-2 opacity-50"/>
                    <span className="text-xs font-medium">No Image</span>
                </div>
            )}
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm z-10">
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-lg border border-slate-700" title="Upload from Device">
                        <Upload size={18}/>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
                    
                    {src && (
                        <button onClick={handleDownload} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg border border-slate-700" title="Download">
                            <Download size={18}/>
                        </button>
                    )}
                    
                    <button onClick={() => setShowUrlInput(!showUrlInput)} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg border border-slate-700" title="Enter URL">
                        <Link size={18}/>
                    </button>
                </div>

                {onGenerate && (
                     <button 
                        onClick={handleGenerateClick} 
                        disabled={isGenerating}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Sparkles size={16}/>}
                        <span>Generate with AI</span>
                    </button>
                )}
            </div>

             {/* URL Input Overlay */}
             {showUrlInput && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700 animate-in slide-in-from-bottom-2 z-20">
                    <input 
                        className={THEME.input.base} 
                        placeholder="Paste image URL..." 
                        defaultValue={src}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onImageChange(e.currentTarget.value);
                                setShowUrlInput(false);
                            }
                        }}
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};