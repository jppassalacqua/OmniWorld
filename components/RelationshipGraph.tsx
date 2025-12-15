
import React, { useRef, useState, useEffect } from 'react';
import { Move, GitMerge } from 'lucide-react';
import { Entity, Relationship, SupportedLanguage } from '../types';
import { RelationshipModal } from './RelationshipModal';

interface RelationshipGraphProps {
    entities: Entity[];
    onSelectEntity: (id: string) => void;
    selectedEntityId: string | null;
    lang: SupportedLanguage;
    onAddRelationship?: (sourceId: string, targetId: string, type: string) => void;
    onRemoveRelationship?: (sourceId: string, targetId: string) => void;
}

const getLocalized = (text: any, lang: SupportedLanguage): string => {
  if (!text) return "";
  return text[lang] || text['fr'] || text['en'] || "";
};

export const RelationshipGraph = ({ 
    entities, 
    onSelectEntity, 
    selectedEntityId, 
    lang, 
    onAddRelationship, 
    onRemoveRelationship 
}: RelationshipGraphProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [mode, setMode] = useState<'move' | 'connect'>('move');
    const [dragState, setDragState] = useState<{ active: boolean, source?: string, x: number, y: number } | null>(null);
    const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
    const [editRel, setEditRel] = useState<{ sourceId: string, targetId: string, type: string } | null>(null);
    
    // Initialize simulation nodes
    useEffect(() => {
        const simNodes = entities.map((e: Entity) => {
            const existing = nodes.find(n => n.id === e.id);
            return { 
                id: e.id, 
                name: getLocalized(e.name, lang), 
                type: e.type, 
                img: e.imageUrl, 
                x: existing ? existing.x : Math.random() * 800, 
                y: existing ? existing.y : Math.random() * 600, 
                vx: existing ? existing.vx : 0, 
                vy: existing ? existing.vy : 0 
            };
        });
        
        const simLinks: any[] = [];
        entities.forEach((e: Entity) => {
            if (e.parentId) {
                simLinks.push({ source: e.parentId, target: e.id, type: 'child', id: `child-${e.parentId}-${e.id}` });
            }
            e.relationships.forEach((r: Relationship) => {
                simLinks.push({ source: e.id, target: r.targetId, type: r.type, id: `rel-${e.id}-${r.targetId}` });
            });
        });

        setNodes(simNodes);
        setLinks(simLinks.filter(l => simNodes.find((n:any)=>n.id===l.source) && simNodes.find((n:any)=>n.id===l.target)));
    }, [entities, lang]); 

    // Simulation loop
    useEffect(() => {
        let animationFrameId: number;
        const tick = () => {
            setNodes(prevNodes => {
                if (dragState?.active && mode === 'move') return prevNodes;
                
                const newNodes = [...prevNodes];
                const width = svgRef.current?.clientWidth || 800;
                const height = svgRef.current?.clientHeight || 600;

                // Simple force simulation logic (repulsion + center attraction) could go here
                // For now, keeping it static or simple movement
                newNodes.forEach(n => {
                    if (dragState?.source === n.id && mode === 'move') return; 
                    n.x = Math.max(20, Math.min(width - 20, n.x));
                    n.y = Math.max(20, Math.min(height - 20, n.y));
                });
                return newNodes;
            });
            animationFrameId = requestAnimationFrame(tick);
        };
        animationFrameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [links, mode, dragState]);

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => { 
        e.stopPropagation(); 
        const rect = svgRef.current?.getBoundingClientRect(); 
        if(rect) {
            setDragState({ active: true, source: nodeId, x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const handleSVGMouseMove = (e: React.MouseEvent) => { 
        if (!dragState?.active) return; 
        const rect = svgRef.current?.getBoundingClientRect(); 
        if (rect) { 
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDragState({ ...dragState, x, y }); 
            
            if (mode === 'move') {
                setNodes(prev => prev.map(n => n.id === dragState.source ? { ...n, x, y } : n));
            }
        } 
    };

    const handleSVGMouseUp = () => { 
        if (mode === 'connect' && dragState?.active && dragState.source && hoverNodeId && dragState.source !== hoverNodeId) { 
            const sourceEnt = entities.find((e:any) => e.id === dragState.source); 
            const existing = sourceEnt?.relationships.find((r:any) => r.targetId === hoverNodeId); 
            setEditRel({ 
                sourceId: dragState.source, 
                targetId: hoverNodeId, 
                type: existing ? existing.type : '' 
            }); 
        } 
        setDragState(null); 
    };

    return (
        <div className="w-full h-full bg-slate-950 overflow-hidden relative select-none" onMouseMove={handleSVGMouseMove} onMouseUp={handleSVGMouseUp} onMouseLeave={() => setDragState(null)}>
            <div className="absolute top-4 right-4 z-10 flex bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-xl">
                <button onClick={() => setMode('move')} className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition-colors ${mode === 'move' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><Move size={14}/> Move</button>
                <button onClick={() => setMode('connect')} className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition-colors ${mode === 'connect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><GitMerge size={14}/> Connect</button>
            </div>
            
            <svg ref={svgRef} className="w-full h-full">
                <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#475569" /></marker></defs>
                
                {links.map((link, i) => {
                    const s = nodes.find(n => n.id === link.source); 
                    const t = nodes.find(n => n.id === link.target); 
                    if (!s || !t) return null;
                    return (
                        <g key={i} onClick={(e) => { e.stopPropagation(); if (link.type !== 'child') setEditRel({ sourceId: link.source, targetId: link.target, type: link.type }); }} className="cursor-pointer group">
                            <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={link.type === 'child' ? '#334155' : '#6366f1'} strokeWidth={link.type === 'child' ? 2 : 1.5} strokeDasharray={link.type === 'child' ? "4 2" : ""} markerEnd="url(#arrowhead)" className="opacity-60 group-hover:opacity-100 transition-opacity" />
                            <text x={(s.x+t.x)/2} y={(s.y+t.y)/2} dy={-4} textAnchor="middle" fontSize="10" fill="#94a3b8" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900">{link.type}</text>
                        </g>
                    );
                })}
                
                {mode === 'connect' && dragState?.active && (
                    <line x1={nodes.find(n => n.id === dragState.source)?.x || 0} y1={nodes.find(n => n.id === dragState.source)?.y || 0} x2={dragState.x} y2={dragState.y} stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="pointer-events-none"/>
                )}
                
                {nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`} onMouseDown={(e) => handleNodeMouseDown(e, node.id)} onMouseEnter={() => setHoverNodeId(node.id)} onMouseLeave={() => setHoverNodeId(null)} onClick={(e) => { if(!dragState?.active) onSelectEntity(node.id); }} className="cursor-pointer">
                        <circle r="20" fill={hoverNodeId === node.id && mode === 'connect' ? "#4f46e5" : "#1e293b"} stroke={selectedEntityId === node.id ? "#6366f1" : "#475569"} strokeWidth="2" className="transition-colors duration-200" />
                        {node.img ? <image href={node.img} x="-20" y="-20" height="40" width="40" clipPath="circle(20px at 20px 20px)" preserveAspectRatio="xMidYMid slice" /> : <text x="0" y="4" textAnchor="middle" fontSize="10" fill="white" pointerEvents="none">{node.type.slice(0,1)}</text>}
                        <text x="0" y="32" textAnchor="middle" fontSize="10" fill="#cbd5e1" className="shadow-black drop-shadow-md font-medium select-none pointer-events-none" style={{textShadow: '0px 1px 2px #000'}}>{node.name}</text>
                    </g>
                ))}
            </svg>

            {editRel && (
                <RelationshipModal 
                    isOpen={true} 
                    onClose={() => setEditRel(null)} 
                    sourceName={entities.find((e:any)=>e.id===editRel.sourceId)?.name?.[lang]} 
                    targetName={entities.find((e:any)=>e.id===editRel.targetId)?.name?.[lang]} 
                    initialType={editRel.type} 
                    onSave={(newType: string) => { 
                        if (onAddRelationship) onAddRelationship(editRel.sourceId, editRel.targetId, newType); 
                        setEditRel(null); 
                    }} 
                    onDelete={() => { 
                        if (onRemoveRelationship) onRemoveRelationship(editRel.sourceId, editRel.targetId); 
                        setEditRel(null); 
                    }}
                />
            )}
        </div>
    );
};
