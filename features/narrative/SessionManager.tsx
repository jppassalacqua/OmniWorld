
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Trash2, MessageSquare, Send, User, Bot, Loader2, Dices, Mic, MicOff, Volume2, VolumeX, Eraser } from 'lucide-react';
import { ResizableSplitPane } from '../../components/Shared';
import { useSessionController, useTTS } from '../../hooks/useNarrativeController';
import { THEME } from '../../styles/theme';

// --- Helper for Dice ---
const rollDice = (formula: string): { total: number, result: string } => {
    try {
        const parts = formula.toLowerCase().match(/^(\d+)d(\d+)([+-]\d+)?$/);
        if (!parts) return { total: 0, result: "Invalid" };
        
        const count = parseInt(parts[1], 10);
        const sides = parseInt(parts[2], 10);
        const modifier = parts[3] ? parseInt(parts[3], 10) : 0;
        
        let rolls = [];
        let total = 0;
        for(let i=0; i<count; i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            rolls.push(r);
            total += r;
        }
        total += modifier;
        
        const rollStr = `[${rolls.join(', ')}]${modifier ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : ''}`;
        return { total, result: rollStr };
    } catch (e) {
        return { total: 0, result: "Error" };
    }
};

export const SessionManager = ({ world, setWorld, aiService, initialSelectedId }: any) => {
    const ctrl = useSessionController(world, setWorld, aiService, initialSelectedId);
    const [diceInput, setDiceInput] = useState('1d20');
    const [isListening, setIsListening] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Get last GM message for TTS
    const lastGmMessage = ctrl.selectedSession?.messages.filter((m:any) => m.role === 'gm').pop()?.content;
    
    // Use the extracted hook
    useTTS(ttsEnabled, lastGmMessage, world.language);

    const handleRoll = () => {
        if (!ctrl.selectedSession) return;
        const { total, result } = rollDice(diceInput);
        if (result === "Invalid") return;

        const msg = { 
            id: crypto.randomUUID(), 
            role: 'system', 
            content: `Rolled ${diceInput}`, 
            timestamp: Date.now(),
            diceRoll: { formula: diceInput, result, total } 
        };
        ctrl.updateSession({
            ...ctrl.selectedSession,
            messages: [...ctrl.selectedSession.messages, msg]
        });
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition.");
            
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = world.language === 'fr' ? 'fr-FR' : 'en-US';
            
            recognition.onstart = () => setIsListening(true);
            
            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                ctrl.setInput((prev: string) => prev + (prev ? ' ' : '') + text);
                setIsListening(false);
            };
            
            recognition.onerror = (e: any) => {
                console.error("Speech error", e);
                setIsListening(false);
            };
            
            recognition.onend = () => setIsListening(false);
            
            recognition.start();
            recognitionRef.current = recognition;
        }
    };

    return (
        <ResizableSplitPane
            initialLeftWidth={250}
            className={THEME.layout.splitPane}
            left={
                    <div className={THEME.layout.sidebar}>
                        <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}><span className={THEME.text.header}>Sessions</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                        <div className={THEME.layout.sidebarContent}>
                        {world.sessions.map((s: any) => (
                            <div key={s.id} onClick={() => ctrl.setSelectedSessionId(s.id)} className={`group w-full text-left px-3 py-2 rounded text-sm mb-1 cursor-pointer flex justify-between items-center ${ctrl.selectedSessionId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="truncate flex-1">
                                    <div className="font-bold truncate">{s.name}</div>
                                    <div className="text-xs opacity-70 truncate">{new Date(s.date).toLocaleDateString()}</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); ctrl.deleteSession(s.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-300 p-1"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        </div>
                </div>
            }
            right={
                ctrl.selectedSession ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
                                <input className="bg-transparent font-bold text-white text-lg focus:outline-none" value={ctrl.selectedSession.name} onChange={e => ctrl.updateSession({...ctrl.selectedSession, name: e.target.value})} />
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setTtsEnabled(!ttsEnabled)} 
                                        className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}
                                        title={ttsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                                    >
                                        {ttsEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                                    </button>
                                    <button onClick={ctrl.clearChat} className="p-2 text-slate-400 hover:text-red-400" title="Clear Chat History"><Eraser size={16}/></button>
                                    <div className="w-px h-6 bg-slate-800"/>
                                    <div className="flex bg-slate-800 rounded-lg p-1 items-center border border-slate-700">
                                        <Dices size={16} className="text-slate-400 ml-2 mr-1"/>
                                        <input className="bg-transparent text-white w-16 text-sm font-mono outline-none" value={diceInput} onChange={e => setDiceInput(e.target.value)} placeholder="1d20"/>
                                        <button onClick={handleRoll} className="px-2 py-1 bg-slate-700 hover:bg-indigo-600 text-white text-xs rounded transition-colors font-bold">ROLL</button>
                                    </div>
                                </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950" ref={ctrl.chatRef}>
                            {ctrl.selectedSession.messages.map((m: any) => (
                                <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {m.role !== 'user' && (
                                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${m.role === 'gm' ? 'bg-purple-600 text-white' : 'bg-red-900/50 text-red-400'}`}>
                                            <Bot size={18}/>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                                        m.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : m.role === 'gm' 
                                                ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                                : 'bg-red-950/30 border border-red-900/30 text-red-200 text-sm italic'
                                    }`}>
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {m.content}
                                            {m.diceRoll && (
                                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 font-mono text-sm">
                                                    <Dices size={14}/>
                                                    <span className="opacity-70">{m.diceRoll.formula} = {m.diceRoll.result}</span>
                                                    <span className="font-bold text-emerald-400">Total: {m.diceRoll.total}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                            <User size={18}/>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {ctrl.isProcessing && (
                                <div className="flex gap-4 justify-start animate-pulse">
                                    <div className="w-8 h-8 rounded bg-purple-600/50 flex items-center justify-center shrink-0 text-white">
                                        <Bot size={18}/>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-2xl rounded-bl-none px-5 py-3 border border-slate-700/50 flex items-center gap-2 text-slate-400 text-sm">
                                        <Loader2 size={14} className="animate-spin"/> Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                            <div className="flex gap-2 relative">
                                    <input 
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-12 pl-10 shadow-inner" 
                                    placeholder="What do you want to do?" 
                                    value={ctrl.input} 
                                    onChange={e => ctrl.setInput(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && !ctrl.isProcessing && ctrl.sendMessage()} 
                                    disabled={ctrl.isProcessing}
                                    />
                                    
                                    <button 
                                        onClick={toggleListening}
                                        className={`absolute left-2 top-2 bottom-2 aspect-square rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                        title={isListening ? "Stop listening" : "Start voice input"}
                                    >
                                        {isListening ? <MicOff size={18}/> : <Mic size={18}/>}
                                    </button>

                                    <button 
                                    onClick={ctrl.sendMessage} 
                                    disabled={!ctrl.input.trim() || ctrl.isProcessing}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Send size={18}/>
                                </button>
                            </div>
                            <div className="text-center mt-2 text-[10px] text-slate-600">
                                AI Game Master has context of current world & scenario. New entities may be created automatically.
                            </div>
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><MessageSquare size={64} className="mb-4 opacity-20"/><p>Select a session to start playing.</p></div>
            }
        />
    );
};
