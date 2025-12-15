
import React, { useState } from 'react';
import { 
  PlusCircle, Search, Trash2, Edit2, Plus, Calendar, 
  MessageSquare, Send, Sparkles, List, BarChartHorizontal, Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { ResizableSplitPane, AutoTextarea } from '../components/Shared';
import { TimelineEvent, Entity, CalendarSystem, Timeline } from '../types';
import { RelationshipModal } from '../components/RelationshipModal';
import { useScenarioController, useSessionController, useTimelineController, useRelationshipController } from '../hooks/useNarrativeController';
import { THEME } from '../styles/theme';
import { getLocalized } from '../utils/helpers';

// --- Scenario Manager ---

export const ScenarioManager = ({ world, setWorld }: any) => {
    const ctrl = useScenarioController(world, setWorld);

    return (
        <ResizableSplitPane
            initialLeftWidth={300}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}><span className={THEME.text.header}>Scenarios</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.scenarios.map((s: any) => (
                            <button key={s.id} onClick={() => ctrl.setSelectedScenarioId(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${ctrl.selectedScenarioId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="font-bold truncate">{getLocalized(s.title, world.language)}</div>
                                <div className="text-xs opacity-70 truncate">{s.scenes.length} scenes</div>
                            </button>
                        ))}
                     </div>
                </div>
            }
            right={
                ctrl.selectedScenario ? (
                    <div className="h-full overflow-y-auto p-8">
                        <input className={THEME.input.title} value={getLocalized(ctrl.selectedScenario.title, world.language)} onChange={e => ctrl.updateScenario({...ctrl.selectedScenario, title: {...ctrl.selectedScenario.title, [world.language]: e.target.value}})} />
                        <div className="mb-8">
                            <h3 className={THEME.text.header}>Synopsis</h3>
                            <AutoTextarea className="w-full bg-slate-900 mt-2" value={getLocalized(ctrl.selectedScenario.synopsis, world.language)} onChange={(e: any) => ctrl.updateScenario({...ctrl.selectedScenario, synopsis: {...ctrl.selectedScenario.synopsis, [world.language]: e.target.value}})} />
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><Sparkles size={64} className="mb-4 opacity-20"/><p>Select a scenario.</p></div>
            }
        />
    );
};

// --- Session Manager ---

export const SessionManager = ({ world, setWorld }: any) => {
    const ctrl = useSessionController(world, setWorld);

    return (
        <ResizableSplitPane
            initialLeftWidth={250}
            className={THEME.layout.splitPane}
            left={
                 <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}><span className={THEME.text.header}>Sessions</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.sessions.map((s: any) => (
                            <button key={s.id} onClick={() => ctrl.setSelectedSessionId(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${ctrl.selectedSessionId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="font-bold truncate">{s.name}</div>
                                <div className="text-xs opacity-70 truncate">{new Date(s.date).toLocaleDateString()}</div>
                            </button>
                        ))}
                     </div>
                </div>
            }
            right={
                ctrl.selectedSession ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                             <input className="bg-transparent font-bold text-white text-lg focus:outline-none" value={ctrl.selectedSession.name} onChange={e => ctrl.updateSession({...ctrl.selectedSession, name: e.target.value})} />
                             <span className="text-xs text-slate-500">{new Date(ctrl.selectedSession.date).toLocaleString()}</span>
                        </div>
                        <div ref={ctrl.chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                            {ctrl.selectedSession.messages.map((m: any) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                        <div className="text-xs opacity-50 mb-1 font-bold uppercase">{m.role}</div>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                             <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Type a message..." value={ctrl.input} onChange={e => ctrl.setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ctrl.sendMessage()} />
                             <button onClick={ctrl.sendMessage} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"><Send size={20}/></button>
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><MessageSquare size={64} className="mb-4 opacity-20"/><p>Select a session.</p></div>
            }
        />
    );
};

// --- Timeline Manager ---

const CalendarSettingsModal = ({ calendar, isOpen, onClose, onSave }: any) => {
    const [c, setC] = useState<CalendarSystem>(calendar);

    if (!isOpen) return null;
    return (
        <div className={THEME.layout.modalOverlay} onClick={onClose}>
            <div className={`${THEME.layout.modalContent} max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Calendar Settings</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className={THEME.text.label}>Calendar Name</label>
                        <input className={THEME.input.base} value={c.name} onChange={e => setC({...c, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={THEME.text.label}>Current Year</label>
                            <input type="number" className={THEME.input.base} value={c.currentYear} onChange={e => setC({...c, currentYear: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={THEME.text.label}>Months ({c.months.length})</label>
                            <button onClick={() => setC({...c, months: [...c.months, {name: 'New Month', days: 30}]})} className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"><Plus size={12}/> Add Month</button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border border-slate-800 rounded p-2">
                            {c.months.map((m, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input className={THEME.input.base} value={m.name} onChange={e => {const nm = [...c.months]; nm[idx].name = e.target.value; setC({...c, months: nm})}} placeholder="Name" />
                                    <input type="number" className="w-24 bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none" value={m.days} onChange={e => {const nm = [...c.months]; nm[idx].days = Number(e.target.value); setC({...c, months: nm})}} placeholder="Days" />
                                    <button onClick={() => setC({...c, months: c.months.filter((_, i) => i !== idx)})} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={THEME.text.label}>Weekdays (Comma separated)</label>
                        <input className={THEME.input.base} value={c.weekDays.join(', ')} onChange={e => setC({...c, weekDays: e.target.value.split(',').map(s => s.trim())})} />
                    </div>
                    <button onClick={() => onSave(c)} className={THEME.button.primary + " w-full justify-center"}>Save Calendar</button>
                </div>
            </div>
        </div>
    );
};

export const TimelineManager = ({ world, setWorld }: any) => {
    const ctrl = useTimelineController(world, setWorld);
    
    // Grouping Logic
    const groupedEvents = React.useMemo(() => {
        const groups: Record<string, TimelineEvent[]> = {};
        ctrl.events.forEach((e: TimelineEvent) => {
            let key = "";
            switch(ctrl.grouping) {
                case 'millennia': key = Math.floor(e.year / 1000) + "th Millennium"; break;
                case 'centuries': key = Math.floor(e.year / 100) + (e.year < 0 ? " BC" : "") + "00s"; break;
                case 'decades': key = Math.floor(e.year / 10) + "0s"; break;
                case 'years': default: key = "Year " + e.year; break;
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });
        return groups;
    }, [ctrl.events, ctrl.grouping]);

    const getMonthName = (idx: number) => ctrl.activeCalendar?.months[idx]?.name || `Month ${idx+1}`;
    const getDaysInMonth = (idx: number) => ctrl.activeCalendar?.months[idx]?.days || 30;

    return (
        <ResizableSplitPane
            initialLeftWidth={280}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader}>
                        <div className="flex justify-between items-center"><span className={THEME.text.header}>Timelines</span><button onClick={ctrl.createTimeline} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                     </div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.timelines.map((t: Timeline) => (
                            <div key={t.id} className={`group flex items-center justify-between w-full px-3 py-2 rounded text-sm mb-1 cursor-pointer ${ctrl.selectedTimelineId === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`} onClick={() => ctrl.setSelectedTimelineId(t.id)}>
                                <span className="truncate font-bold">{t.title}</span>
                                <button onClick={(e) => { e.stopPropagation(); ctrl.deleteTimeline(t.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-300"><Trash2 size={14}/></button>
                            </div>
                        ))}
                     </div>
                     <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <h4 className={THEME.text.header + " mb-2"}>Calendar</h4>
                        <div className="bg-slate-800 rounded p-3 text-sm border border-slate-700">
                            <div className="font-bold text-white mb-1">{ctrl.activeCalendar.name}</div>
                            <div className="text-slate-500 text-xs mb-2">{ctrl.activeCalendar.currentYear} Current Year</div>
                            <button onClick={() => ctrl.setEditingCalendarId(ctrl.activeCalendar.id)} className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition-colors w-full flex items-center justify-center gap-1"><Settings size={12}/> Configure</button>
                        </div>
                        <button onClick={ctrl.createCalendar} className="text-xs text-slate-500 hover:text-indigo-400 mt-2 flex items-center gap-1"><Plus size={12}/> New Calendar</button>
                     </div>
                </div>
            }
            right={
                <div className="flex flex-col h-full bg-slate-950">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-900/50 backdrop-blur">
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button onClick={() => ctrl.setViewMode('chronicle')} className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-all ${ctrl.viewMode === 'chronicle' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><List size={16}/> Chronicle</button>
                            <button onClick={() => ctrl.setViewMode('gantt')} className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-all ${ctrl.viewMode === 'gantt' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><BarChartHorizontal size={16}/> Gantt</button>
                            <button onClick={() => ctrl.setViewMode('calendar')} className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-all ${ctrl.viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Calendar size={16}/> Calendar</button>
                        </div>
                        
                        {ctrl.viewMode === 'chronicle' && (
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold uppercase">Group By</span>
                                <select className="bg-slate-800 border border-slate-700 rounded text-sm text-white p-1.5 outline-none" value={ctrl.grouping} onChange={(e:any) => ctrl.setGrouping(e.target.value)}>
                                    <option value="millennia">Millennia</option>
                                    <option value="centuries">Centuries</option>
                                    <option value="decades">Decades</option>
                                    <option value="years">Years</option>
                                </select>
                             </div>
                        )}
                        
                        <button onClick={ctrl.addEvent} className={THEME.button.primary}><Plus size={16}/> Add Event</button>
                    </div>

                    {/* Views */}
                    <div className="flex-1 overflow-y-auto relative bg-slate-950">
                        {/* Chronicle View */}
                        {ctrl.viewMode === 'chronicle' && (
                            <div className="max-w-4xl mx-auto p-8 relative">
                                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-800"/>
                                {Object.keys(groupedEvents).map(group => (
                                    <div key={group} className="mb-8 relative animate-in slide-in-from-bottom-2 duration-500">
                                        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur py-2 mb-4 border-b border-slate-800 ml-16">
                                            <h3 className="text-xl font-bold text-indigo-400">{group}</h3>
                                        </div>
                                        <div className="space-y-6">
                                            {groupedEvents[group].map(e => (
                                                <div key={e.id} className="relative ml-16 group">
                                                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full border-2 border-slate-950 bg-indigo-500 z-10 ring-4 ring-slate-950"/>
                                                    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <input className="font-bold text-white bg-transparent border-none text-lg focus:ring-0 p-0 w-full" value={e.title} onChange={ev => ctrl.updateEvent({...e, title: ev.target.value})} />
                                                                <div className="text-xs text-indigo-300 font-mono mt-0.5 flex items-center gap-2">
                                                                    <span>Year {e.year}</span>
                                                                    <span className="opacity-50">•</span>
                                                                    <span>{getMonthName(e.month)} {e.day}</span>
                                                                    {e.endYear && (
                                                                        <>
                                                                            <span className="opacity-50">→</span>
                                                                            <span>Year {e.endYear} {e.endMonth !== undefined && getMonthName(e.endMonth)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button onClick={() => ctrl.deleteEvent(e.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                                        </div>
                                                        <textarea className="w-full bg-slate-950/50 border border-slate-800/50 rounded p-3 text-sm text-slate-300 resize-none h-20 focus:border-indigo-500 outline-none transition-colors" value={e.description} onChange={ev => ctrl.updateEvent({...e, description: ev.target.value})} />
                                                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/50">
                                                            <div className="flex items-center gap-1"><span className="text-[10px] uppercase font-bold text-slate-500 w-8">Year</span><input type="number" className="bg-slate-800 w-full text-xs rounded border border-slate-700 px-1 py-0.5 text-white" value={e.year} onChange={ev => ctrl.updateEvent({...e, year: Number(ev.target.value)})} /></div>
                                                            <div className="flex items-center gap-1"><span className="text-[10px] uppercase font-bold text-slate-500 w-8">Month</span><select className="bg-slate-800 w-full text-xs rounded border border-slate-700 px-1 py-0.5 text-white" value={e.month} onChange={ev => ctrl.updateEvent({...e, month: Number(ev.target.value)})}>{ctrl.activeCalendar.months.map((m, i) => <option key={i} value={i}>{m.name}</option>)}</select></div>
                                                            <div className="flex items-center gap-1"><span className="text-[10px] uppercase font-bold text-slate-500 w-8">Day</span><input type="number" className="bg-slate-800 w-full text-xs rounded border border-slate-700 px-1 py-0.5 text-white" value={e.day} onChange={ev => ctrl.updateEvent({...e, day: Number(ev.target.value)})} /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gantt View */}
                        {ctrl.viewMode === 'gantt' && (
                            <div className="p-8 min-w-[800px] overflow-x-auto">
                                <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
                                    <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between">
                                        <h3 className="font-bold text-white">Timeline Overview</h3>
                                        <span className="text-xs text-slate-500">Scale: Years</span>
                                    </div>
                                    <div className="relative min-h-[400px] p-6">
                                        {(() => {
                                            const minYear = Math.min(...ctrl.events.map(e => e.year));
                                            const maxYear = Math.max(...ctrl.events.map(e => e.endYear || e.year)) + 1;
                                            const range = Math.max(10, maxYear - minYear);
                                            
                                            return ctrl.events.map((e, idx) => {
                                                const start = e.year;
                                                const end = e.endYear || e.year; // Simple duration 1 year minimum for viz if undefined
                                                const duration = Math.max(0.2, end - start);
                                                
                                                const left = ((start - minYear) / range) * 100;
                                                const width = (duration / range) * 100;

                                                return (
                                                    <div key={e.id} className="relative h-12 mb-2 group">
                                                        <div 
                                                            className="absolute top-1 bottom-1 bg-indigo-600/30 border border-indigo-500 rounded flex items-center px-2 whitespace-nowrap overflow-hidden text-xs text-indigo-100 hover:bg-indigo-600 hover:z-10 transition-colors cursor-pointer"
                                                            style={{ left: `${left}%`, width: `${Math.max(width, 5)}%` }} // Minimum width for visibility
                                                            title={`${e.title} (${start} - ${end})`}
                                                        >
                                                            <span className="font-bold mr-2">{e.title}</span>
                                                        </div>
                                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800 -z-10"/>
                                                    </div>
                                                );
                                            });
                                        })()}
                                        {/* Simple Grid Lines */}
                                        <div className="absolute inset-0 pointer-events-none -z-20 flex justify-between opacity-10">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white"/>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calendar View */}
                        {ctrl.viewMode === 'calendar' && (
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => ctrl.setCalendarViewDate(d => {
                                            const newMonth = d.month - 1;
                                            return newMonth < 0 ? { year: d.year - 1, month: ctrl.activeCalendar.months.length - 1 } : { ...d, month: newMonth };
                                        })} className={THEME.button.icon}><ChevronLeft size={24}/></button>
                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold text-white">{getMonthName(ctrl.calendarViewDate.month)}</h3>
                                            <div className="text-indigo-400 font-mono">Year {ctrl.calendarViewDate.year}</div>
                                        </div>
                                        <button onClick={() => ctrl.setCalendarViewDate(d => {
                                            const newMonth = d.month + 1;
                                            return newMonth >= ctrl.activeCalendar.months.length ? { year: d.year + 1, month: 0 } : { ...d, month: newMonth };
                                        })} className={THEME.button.icon}><ChevronRight size={24}/></button>
                                    </div>
                                    <button onClick={() => ctrl.setCalendarViewDate({year: ctrl.activeCalendar.currentYear, month: 0})} className="text-sm text-slate-400 hover:text-white">Jump to Present</button>
                                </div>
                                
                                <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden flex-1">
                                    {/* Weekdays */}
                                    {ctrl.activeCalendar.weekDays.map((d, i) => (
                                        <div key={i} className="bg-slate-900 p-2 text-center text-xs font-bold uppercase text-slate-500">{d.substring(0,3)}</div>
                                    ))}
                                    {/* Days */}
                                    {(() => {
                                        const daysInMonth = getDaysInMonth(ctrl.calendarViewDate.month);
                                        // Simple epoch assumption: Year 1 Month 0 Day 1 is index 0 of WeekDays
                                        // This is a naive calculation for demonstration. Real custom calendars need complex epoch math.
                                        let totalDays = 0;
                                        // Add days from full past years
                                        totalDays += (ctrl.calendarViewDate.year - 1) * ctrl.activeCalendar.months.reduce((acc, m) => acc + m.days, 0);
                                        // Add days from past months in current year
                                        for(let i=0; i<ctrl.calendarViewDate.month; i++) totalDays += ctrl.activeCalendar.months[i].days;
                                        
                                        const startOffset = totalDays % ctrl.activeCalendar.weekDays.length;
                                        const slots = [];
                                        
                                        // Empty slots
                                        for(let i=0; i<startOffset; i++) slots.push(<div key={`empty-${i}`} className="bg-slate-950/50"/>);
                                        
                                        // Days
                                        for(let d=1; d<=daysInMonth; d++) {
                                            const dayEvents = ctrl.events.filter(e => e.year === ctrl.calendarViewDate.year && e.month === ctrl.calendarViewDate.month && e.day === d);
                                            slots.push(
                                                <div key={d} className="bg-slate-950 hover:bg-slate-900 transition-colors p-2 min-h-[80px] border-t border-slate-900 relative group" onClick={() => {
                                                    ctrl.addEvent(); 
                                                    // In a real app, we'd pass the specific date to addEvent
                                                }}>
                                                    <span className={`text-sm font-bold ${dayEvents.length > 0 ? 'text-white' : 'text-slate-600'}`}>{d}</span>
                                                    <div className="mt-1 space-y-1">
                                                        {dayEvents.map(e => (
                                                            <div key={e.id} className="text-[10px] bg-indigo-900/50 text-indigo-200 px-1 py-0.5 rounded border border-indigo-500/20 truncate" title={e.title}>
                                                                {e.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white" title="Add Event"><Plus size={12}/></button>
                                                </div>
                                            );
                                        }
                                        return slots;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
        />
        {/* Modals */}
        <CalendarSettingsModal 
            isOpen={!!ctrl.editingCalendarId} 
            onClose={() => ctrl.setEditingCalendarId(null)}
            calendar={world.calendars.find(c => c.id === ctrl.editingCalendarId)}
            onSave={(c) => { ctrl.updateCalendar(c); ctrl.setEditingCalendarId(null); }}
        />
    );
};

// --- Relationship Manager ---

export const RelationshipManager = ({ world, setWorld }: any) => {
    const ctrl = useRelationshipController(world, setWorld);

    return (
        <div className="flex flex-col h-full bg-slate-900 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Relationship Matrix</h2>
                    <p className="text-slate-400 text-sm">Manage connections between all entities.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                        <input 
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-64 focus:border-indigo-500 outline-none" 
                            placeholder="Search relationships..." 
                            value={ctrl.searchTerm} 
                            onChange={e => ctrl.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => ctrl.setCreateModalOpen(true)} className={THEME.button.primary}>
                        <Plus size={16}/> New Relationship
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-4 bg-slate-800/50 p-4 border-b border-slate-700 font-bold text-slate-400 text-xs uppercase tracking-wider">
                    <div className="col-span-4 truncate">Source Entity</div>
                    <div className="col-span-3 text-center truncate">Relationship Type</div>
                    <div className="col-span-4 text-right truncate">Target Entity</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {ctrl.filteredRels.map((rel: any, idx: number) => (
                        <div key={`${rel.source.id}-${rel.target.id}-${idx}`} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 items-center hover:bg-slate-800/30 transition-colors group">
                            <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                    {rel.source.imageUrl ? <img src={rel.source.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-600 font-bold">{rel.source.type[0]}</div>}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{getLocalized(rel.source.name, world.language)}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{rel.source.type}</div>
                                </div>
                            </div>
                            <div className="col-span-3 text-center overflow-hidden">
                                <span className="inline-block px-3 py-1 bg-indigo-900/30 text-indigo-300 text-xs rounded-full border border-indigo-500/30 truncate max-w-full">{rel.type}</span>
                            </div>
                            <div className="col-span-4 flex items-center justify-end gap-3 text-right overflow-hidden">
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{getLocalized(rel.target.name, world.language)}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{rel.target.type}</div>
                                </div>
                                <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                    {rel.target.imageUrl ? <img src={rel.target.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-600 font-bold">{rel.target.type[0]}</div>}
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => ctrl.setEditRel({ sourceId: rel.source.id, targetId: rel.target.id, type: rel.type })} className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"><Edit2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {ctrl.filteredRels.length === 0 && <div className="p-8 text-center text-slate-500">No relationships found.</div>}
                </div>
            </div>

            {/* Edit Modal */}
            {ctrl.editRel && (
                <RelationshipModal 
                    isOpen={true} 
                    onClose={() => ctrl.setEditRel(null)} 
                    sourceName={world.entities.find((e: Entity) => e.id === ctrl.editRel.sourceId)?.name?.[world.language]} 
                    targetName={world.entities.find((e: Entity) => e.id === ctrl.editRel.targetId)?.name?.[world.language]} 
                    initialType={ctrl.editRel.type} 
                    onSave={ctrl.handleSave} 
                    onDelete={ctrl.handleDelete}
                />
            )}

            {/* Create Modal */}
            {ctrl.createModalOpen && (
                <div className={THEME.layout.modalOverlay}>
                    <div className={THEME.layout.modalContent}>
                        <h3 className="text-lg font-bold text-white mb-4">New Relationship</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={THEME.text.label}>Source</label>
                                <select className={THEME.input.select} value={ctrl.newRel.sourceId} onChange={e => ctrl.setNewRel({...ctrl.newRel, sourceId: e.target.value})}>
                                    <option value="">Select Source...</option>
                                    {world.entities.map((e: Entity) => <option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={THEME.text.label}>Type</label>
                                <input className={THEME.input.base} placeholder="e.g. Friend, Enemy" value={ctrl.newRel.type} onChange={e => ctrl.setNewRel({...ctrl.newRel, type: e.target.value})}/>
                            </div>
                            <div>
                                <label className={THEME.text.label}>Target</label>
                                <select className={THEME.input.select} value={ctrl.newRel.targetId} onChange={e => ctrl.setNewRel({...ctrl.newRel, targetId: e.target.value})}>
                                    <option value="">Select Target...</option>
                                    {world.entities.map((e: Entity) => <option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={ctrl.handleCreate} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium">Create</button>
                            <button onClick={() => ctrl.setCreateModalOpen(false)} className={THEME.button.secondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
