
import React from 'react';
import { 
  Map as MapIcon, PlusCircle, Search, Settings, Ruler, X, 
  Trash2, MapPin as PinIcon, Globe, ChevronRight, Layers, Plus, Eye, EyeOff 
} from 'lucide-react';
import { ResizableSplitPane, TreeItem, TreeNode, ImageManager, AutoTextarea } from '../components/Shared';
import { WorldMap, MapPin, Entity, EntityType } from '../types';
import { useMapController } from '../hooks/useMapController';
import { THEME } from '../styles/theme';
import { getLocalized } from '../utils/helpers';

export const MapManager = ({ world, setWorld, aiService, onNavigateToEntity, initialSelectedId }: any) => {
  const ctrl = useMapController(world, setWorld, initialSelectedId);

  const handleGenerateMapImage = async () => {
    if (!ctrl.selectedMap) return null;
    const prompt = `${ctrl.selectedMap.name}. ${ctrl.selectedMap.description || ''}`;
    return await aiService.generateImage(prompt, 'map');
  };

  return (
    <ResizableSplitPane initialLeftWidth={300} className="border border-slate-800 rounded-xl bg-slate-900"
        left={
            <div className="flex flex-col h-full bg-slate-900/50">
                <div className={THEME.layout.sidebarHeader}>
                    <div className="flex justify-between items-center"><span className={THEME.text.header}>Maps</span><button onClick={ctrl.create} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                    <div className="relative"><Search size={14} className="absolute left-2.5 top-2 text-slate-500" /><input value={ctrl.search} onChange={e=>ctrl.setSearch(e.target.value)} placeholder="Filter maps..." className={THEME.input.search} /></div>
                </div>
                <div className={THEME.layout.sidebarContent}>
                    {ctrl.mapTree.map((node: any) => (<TreeItem key={node.id} node={node} level={0} selectedId={ctrl.selectedMapId} onSelect={(n: TreeNode) => ctrl.setSelectedMapId(n.id)} expandedIds={ctrl.expandedIds} toggleExpand={ctrl.toggleExpand} />))}
                </div>
            </div>
        }
        right={
            <div className={THEME.layout.mainContent}>
                {ctrl.selectedMap ? (
                    <>
                        {/* Toolbar */}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-1 flex gap-1 shadow-xl">
                                <button onClick={() => { ctrl.setMode(ctrl.mode === 'view' ? 'edit' : 'view'); ctrl.setMeasurePoints([]); }} className={`p-2 rounded hover:bg-slate-800 ${ctrl.mode === 'edit' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Settings"><Settings size={18}/></button>
                                <button onClick={() => { ctrl.setMode(ctrl.mode === 'pin' ? 'view' : 'pin'); ctrl.setMeasurePoints([]); }} className={`p-2 rounded hover:bg-slate-800 ${ctrl.mode === 'pin' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Add Pin"><PinIcon size={18}/></button>
                                <button onClick={() => { ctrl.setMode(ctrl.mode === 'measure' ? 'view' : 'measure'); ctrl.setMeasurePoints([]); }} className={`p-2 rounded hover:bg-slate-800 ${ctrl.mode === 'measure' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Measure"><Ruler size={18}/></button>
                                <div className="w-px h-6 bg-slate-700 mx-1 self-center"/>
                                <button onClick={() => ctrl.setShowAllPins(!ctrl.showAllPins)} className={`p-2 rounded hover:bg-slate-800 ${ctrl.showAllPins ? 'text-indigo-400' : 'text-slate-500'}`} title={ctrl.showAllPins ? "Showing Pins from All Layers" : "Showing Pins from Active Layer Only"}>
                                    {ctrl.showAllPins ? <Eye size={18}/> : <EyeOff size={18}/>}
                                </button>
                            </div>
                            {ctrl.mode === 'measure' && ctrl.selectedMap.scale && ctrl.measurePoints.length === 2 && (
                                <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
                                    {ctrl.calculateDistance()} {ctrl.selectedMap.distanceUnit || 'units'}
                                </div>
                            )}
                            {ctrl.mode === 'pin' && (
                                <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold shadow-xl animate-in fade-in slide-in-from-top-2 text-sm">
                                    Click map to place pin
                                </div>
                            )}
                        </div>

                        {/* Layer Switcher (Bottom Center) */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full p-1 shadow-xl flex gap-1 items-center animate-in slide-in-from-bottom-4">
                            <button 
                                onClick={() => ctrl.setActiveLayerId(null)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!ctrl.activeLayerId ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                Default
                            </button>
                            {ctrl.selectedMap.layers?.map((l: any) => (
                                <button 
                                    key={l.id}
                                    onClick={() => ctrl.setActiveLayerId(l.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${ctrl.activeLayerId === l.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    {l.name}
                                </button>
                            ))}
                            {ctrl.mode === 'edit' && (
                                <button onClick={ctrl.addLayer} className="w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700" title="Add Layer">
                                    <Plus size={14}/>
                                </button>
                            )}
                        </div>

                        {/* Edit Panel */}
                        {ctrl.mode === 'edit' && (
                            <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-right-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h3 className="font-bold text-white">Map Settings</h3>
                                    <button onClick={() => ctrl.setMode('view')}><X size={16} className="text-slate-400 hover:text-white"/></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className={THEME.text.label}>{ctrl.activeLayerId ? 'Layer Image' : 'Default Map Image'}</label>
                                            {ctrl.activeLayerId && (
                                                <button onClick={() => ctrl.removeLayer(ctrl.activeLayerId!)} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                                    <Trash2 size={10}/> Delete Layer
                                                </button>
                                            )}
                                        </div>
                                        {ctrl.activeLayerId ? (
                                            <>
                                                <input 
                                                    className={THEME.input.base + " text-xs mb-2"} 
                                                    value={ctrl.selectedMap.layers?.find((l:any)=>l.id===ctrl.activeLayerId)?.name} 
                                                    onChange={e => ctrl.updateLayer(ctrl.activeLayerId!, {name: e.target.value})}
                                                    placeholder="Layer Name"
                                                />
                                                <ImageManager 
                                                    src={ctrl.selectedMap.layers?.find((l:any)=>l.id===ctrl.activeLayerId)?.imageUrl} 
                                                    onImageChange={(url) => ctrl.updateLayer(ctrl.activeLayerId!, {imageUrl: url})}
                                                    onGenerate={handleGenerateMapImage}
                                                    aspectRatio="video"
                                                    className="w-full"
                                                    placeholderIcon={Layers}
                                                />
                                            </>
                                        ) : (
                                            <ImageManager 
                                                src={ctrl.selectedMap.imageUrl} 
                                                onImageChange={(url) => ctrl.updateMap({...ctrl.selectedMap, imageUrl: url})}
                                                onGenerate={handleGenerateMapImage}
                                                aspectRatio="video"
                                                className="w-full"
                                                placeholderIcon={MapIcon}
                                            />
                                        )}
                                    </div>
                                    {!ctrl.activeLayerId && (
                                        <>
                                            <div><label className={THEME.text.label}>Name</label><input className={THEME.input.base} value={ctrl.selectedMap.name} onChange={e => ctrl.updateMap({...ctrl.selectedMap, name:e.target.value})}/></div>
                                            <div><label className={THEME.text.label}>Description</label><AutoTextarea className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500 min-h-[80px]" value={ctrl.selectedMap.description || ''} onChange={(e:any) => ctrl.updateMap({...ctrl.selectedMap, description:e.target.value})}/></div>
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <div><label className={THEME.text.label}>Scale (Width)</label><input type="number" className={THEME.input.base} value={ctrl.selectedMap.scale || ''} onChange={e => ctrl.updateMap({...ctrl.selectedMap, scale:Number(e.target.value)})}/></div>
                                                <div><label className={THEME.text.label}>Unit</label><input className={THEME.input.base} placeholder="km, miles" value={ctrl.selectedMap.distanceUnit || ''} onChange={e => ctrl.updateMap({...ctrl.selectedMap, distanceUnit:e.target.value})}/></div>
                                            </div>
                                            <div>
                                                <label className={THEME.text.label}>Parent Map</label>
                                                <select className={THEME.input.select} value={ctrl.selectedMap.parentId || ''} onChange={e => ctrl.updateMap({...ctrl.selectedMap, parentId:e.target.value || undefined})}>
                                                    <option value="">None (Root)</option>
                                                    {world.maps.filter((m:WorldMap)=>m.id!==ctrl.selectedMap.id).map((m:WorldMap)=><option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                            </div>
                                            {ctrl.selectedMap.parentId && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div><label className={THEME.text.label}>Pos X (%)</label><input type="number" className={THEME.input.base} value={ctrl.selectedMap.parentX || 0} onChange={e => ctrl.updateMap({...ctrl.selectedMap, parentX:Number(e.target.value)})}/></div>
                                                    <div><label className={THEME.text.label}>Pos Y (%)</label><input type="number" className={THEME.input.base} value={ctrl.selectedMap.parentY || 0} onChange={e => ctrl.updateMap({...ctrl.selectedMap, parentY:Number(e.target.value)})}/></div>
                                                </div>
                                            )}
                                            <div>
                                                <label className={THEME.text.label}>Linked Location</label>
                                                <select className={THEME.input.select} value={ctrl.selectedMap.associatedEntityId || ''} onChange={e => ctrl.updateMap({...ctrl.selectedMap, associatedEntityId:e.target.value || undefined})}>
                                                    <option value="">None</option>
                                                    {world.entities.filter((e:Entity)=>e.type===EntityType.LOCATION).map((e:Entity)=><option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>)}
                                                </select>
                                            </div>
                                            <button onClick={() => ctrl.deleteMap(ctrl.selectedMap.id)} className="w-full py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded flex items-center justify-center gap-2 text-sm font-bold border border-red-900/50 mt-4"><Trash2 size={14}/> Delete Map</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 p-4 cursor-crosshair">
                            <div className="relative shadow-2xl inline-block max-w-full max-h-full">
                                <img 
                                    src={ctrl.getActiveImageUrl()} 
                                    className={`max-w-full max-h-full object-contain rounded border border-slate-800 ${ctrl.mode === 'pin' ? 'cursor-copy' : ''}`}
                                    onClick={ctrl.handleMapClick}
                                />
                                {ctrl.selectedMap.pins.map((p:MapPin)=>{
                                    const isVisible = ctrl.showAllPins || (p.layerId === (ctrl.activeLayerId || undefined));
                                    if (!isVisible) return null;

                                    const entity = world.entities.find((e:Entity) => e.id === p.entityId);
                                    
                                    return (
                                        <div 
                                            key={p.id} 
                                            className={`absolute w-6 h-6 -ml-3 -mt-6 cursor-pointer hover:scale-110 transition-transform z-10 ${ctrl.activePinId === p.id ? 'text-indigo-400 scale-125' : 'text-red-500'}`}
                                            style={{left:`${p.x}%`, top:`${p.y}%`}}
                                            onClick={(e) => { e.stopPropagation(); ctrl.setActivePinId(ctrl.activePinId === p.id ? null : p.id); }}
                                        >
                                            <PinIcon fill={ctrl.activePinId === p.id ? "currentColor" : "none"} />
                                            {ctrl.activePinId === p.id && (
                                                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-50 cursor-default animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                                    {entity ? (
                                                        <>
                                                            <h4 className="font-bold text-white text-sm mb-0.5 truncate">{getLocalized(entity.name, world.language)}</h4>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-500/20">{entity.type}</span>
                                                            <button 
                                                                onClick={() => onNavigateToEntity(entity.id)}
                                                                className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                Go to Entity <ChevronRight size={12}/>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h4 className="font-bold text-slate-400 text-sm mb-2">Unlinked Pin</h4>
                                                            <select 
                                                                className={THEME.input.select + " text-xs py-1 mb-2"}
                                                                onChange={(e) => ctrl.updatePin(p.id, { entityId: e.target.value })}
                                                                value=""
                                                            >
                                                                <option value="">Select Entity...</option>
                                                                {world.entities.map((e:Entity) => (
                                                                    <option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>
                                                                ))}
                                                            </select>
                                                        </>
                                                    )}
                                                    <div className="pt-2 border-t border-slate-800 mt-2 flex justify-end">
                                                        <button onClick={() => ctrl.deletePin(p.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={12}/> Remove Pin</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Sub-map icons */}
                                {world.maps.filter((m:WorldMap) => m.parentId === ctrl.selectedMap.id && m.parentX !== undefined).map((subMap: WorldMap) => (
                                    <div 
                                        key={subMap.id} 
                                        className="absolute w-8 h-8 -ml-4 -mt-4 text-indigo-400 hover:text-white cursor-pointer hover:scale-110 transition-transform bg-slate-900/80 rounded border border-indigo-500 flex items-center justify-center z-10" 
                                        style={{left:`${subMap.parentX}%`, top:`${subMap.parentY}%`}}
                                        onClick={(e) => { e.stopPropagation(); ctrl.setSelectedMapId(subMap.id); }}
                                        title={`Go to ${subMap.name}`}
                                    >
                                        <MapIcon size={16}/>
                                    </div>
                                ))}
                                {ctrl.mode === 'measure' && ctrl.measurePoints.map((p, i) => (
                                    <div key={i} className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-yellow-400 rounded-full border border-black z-10" style={{left:`${p.x}%`, top:`${p.y}%`}} />
                                ))}
                                {ctrl.mode === 'measure' && ctrl.measurePoints.length === 2 && (
                                    <svg className="absolute inset-0 pointer-events-none z-10" style={{width: '100%', height: '100%'}}>
                                        <line x1={`${ctrl.measurePoints[0].x}%`} y1={`${ctrl.measurePoints[0].y}%`} x2={`${ctrl.measurePoints[1].x}%`} y2={`${ctrl.measurePoints[1].y}%`} stroke="#facc15" strokeWidth="2" strokeDasharray="5,5" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </>
                ) : (<div className={THEME.layout.emptyState}><Globe size={64} className="mb-4 opacity-20"/><p>Select a map.</p></div>)}
            </div>
        }
    />
  );
};
