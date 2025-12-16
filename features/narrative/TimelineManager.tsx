
import React, { useState } from 'react';
import { PlusCircle, Trash2, Plus, Calendar, List, BarChartHorizontal, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResizableSplitPane } from '../../components/Shared';
import { TimelineEvent, CalendarSystem, Timeline } from '../../types';
import { useTimelineController } from '../../hooks/useNarrativeController';
import { THEME } from '../../styles/theme';

const CalendarSettingsModal = ({ isOpen, onClose, calendar, onSave }: any) => {
    const [localCal, setLocalCal] = useState<CalendarSystem | null>(null);

    React.useEffect(() => {
        if (calendar) setLocalCal(JSON.parse(JSON.stringify(calendar)));
    }, [calendar, isOpen]);

    if (!isOpen || !localCal) return null;

    const updateMonth = (idx: number, field: string, value: any) => {
        const newMonths = [...localCal.months];
        newMonths[idx] = { ...newMonths[idx], [field]: value };
        setLocalCal({ ...localCal, months: newMonths });
    };

    const addMonth = () => {
        setLocalCal({ ...localCal, months: [...localCal.months, { name: "New Month", days: 30 }] });
    };

    const removeMonth = (idx: number) => {
        setLocalCal({ ...localCal, months: localCal.months.filter((_, i) => i !== idx) });
    };

    return (
        <div className={THEME.layout.modalOverlay} onClick={onClose}>
            <div className={`${THEME.layout.modalContent} max-w-2xl max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Calendar Settings</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={THEME.text.label}>Calendar Name</label>
                            <input className={THEME.input.base} value={localCal.name} onChange={e => setLocalCal({...localCal, name: e.target.value})} />
                        </div>
                        <div>
                            <label className={THEME.text.label}>Current Year</label>
                            <input type="number" className={THEME.input.base} value={localCal.currentYear} onChange={e => setLocalCal({...localCal, currentYear: Number(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label className={THEME.text.label}>Week Days (Comma separated)</label>
                        <input className={THEME.input.base} value={localCal.weekDays.join(', ')} onChange={e => setLocalCal({...localCal, weekDays: e.target.value.split(',').map(s => s.trim())})} />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                             <label className={THEME.text.label}>Months</label>
                             <button onClick={addMonth} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1"><Plus size={12}/> Add Month</button>
                        </div>
                        <div className="space-y-2">
                            {localCal.months.map((m, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className={`${THEME.input.base} flex-1`} value={m.name} onChange={e => updateMonth(i, 'name', e.target.value)} placeholder="Month Name" />
                                    <input type="number" className={`${THEME.input.base} w-20`} value={m.days} onChange={e => updateMonth(i, 'days', Number(e.target.value))} placeholder="Days" />
                                    <button onClick={() => removeMonth(i)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t border-slate-700 pt-4">
                    <button onClick={onClose} className={THEME.button.secondary}>Cancel</button>
                    <button onClick={() => onSave(localCal)} className={THEME.button.primary}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export const TimelineManager = ({ world, setWorld, initialSelectedId }: any) => {
    const ctrl = useTimelineController(world, setWorld, initialSelectedId);
    
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

                    <div className="flex-1 overflow-y-auto relative bg-slate-950">
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
                                        <div className="absolute inset-0 pointer-events-none -z-20 flex justify-between opacity-10">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white"/>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    {ctrl.activeCalendar.weekDays.map((d, i) => (
                                        <div key={i} className="bg-slate-900 p-2 text-center text-xs font-bold uppercase text-slate-500">{d.substring(0,3)}</div>
                                    ))}
                                    {(() => {
                                        const daysInMonth = getDaysInMonth(ctrl.calendarViewDate.month);
                                        let totalDays = 0;
                                        totalDays += (ctrl.calendarViewDate.year - 1) * ctrl.activeCalendar.months.reduce((acc, m) => acc + m.days, 0);
                                        for(let i=0; i<ctrl.calendarViewDate.month; i++) totalDays += ctrl.activeCalendar.months[i].days;
                                        
                                        const startOffset = totalDays % ctrl.activeCalendar.weekDays.length;
                                        const slots = [];
                                        
                                        for(let i=0; i<startOffset; i++) slots.push(<div key={`empty-${i}`} className="bg-slate-950/50"/>);
                                        
                                        for(let d=1; d<=daysInMonth; d++) {
                                            const dayEvents = ctrl.events.filter(e => e.year === ctrl.calendarViewDate.year && e.month === ctrl.calendarViewDate.month && e.day === d);
                                            slots.push(
                                                <div key={d} className="bg-slate-950 hover:bg-slate-900 transition-colors p-2 min-h-[80px] border-t border-slate-900 relative group" onClick={() => {
                                                    ctrl.addEvent(); 
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
    );
};
