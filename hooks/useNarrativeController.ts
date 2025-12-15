
import { useState, useRef, useEffect, useMemo } from 'react';
import { Scenario, Session, SessionMessage, Timeline, TimelineEvent, Entity, Relationship, CalendarSystem } from '../types';
import { generateId, getLocalized } from '../utils/helpers';

export const useScenarioController = (world: any, setWorld: any) => {
    const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
    const selectedScenario = world.scenarios.find((s: Scenario) => s.id === selectedScenarioId);

    const handleCreate = () => {
        const newS: Scenario = { id: generateId(), title: { [world.language]: "New Scenario" }, synopsis: { [world.language]: "" }, scenes: [], involvedEntities: [] };
        setWorld({...world, scenarios: [...world.scenarios, newS]});
        setSelectedScenarioId(newS.id);
    };

    const updateScenario = (updated: Scenario) => {
        setWorld({...world, scenarios: world.scenarios.map((s:any) => s.id === updated.id ? updated : s)});
    };

    return { selectedScenarioId, setSelectedScenarioId, selectedScenario, handleCreate, updateScenario };
};

export const useSessionController = (world: any, setWorld: any) => {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const selectedSession = world.sessions.find((s: Session) => s.id === selectedSessionId);
    const [input, setInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [selectedSession?.messages]);

    const handleCreate = () => {
        const newS: Session = { id: generateId(), name: "New Session", date: new Date().toISOString(), activeEntityIds: [], messages: [], status: 'active' };
        setWorld({...world, sessions: [...world.sessions, newS]});
        setSelectedSessionId(newS.id);
    };

    const sendMessage = () => {
        if (!selectedSession || !input.trim()) return;
        const newMsg: SessionMessage = { id: generateId(), role: 'user', content: input, timestamp: Date.now() };
        const updated = { ...selectedSession, messages: [...selectedSession.messages, newMsg] };
        setWorld({...world, sessions: world.sessions.map((s:any) => s.id === updated.id ? updated : s)});
        setInput('');
    };
    
    const updateSession = (updated: Session) => {
        setWorld({...world, sessions: world.sessions.map((s:any) => s.id === updated.id ? updated : s)});
    };

    return { selectedSessionId, setSelectedSessionId, selectedSession, input, setInput, chatRef, handleCreate, sendMessage, updateSession };
};

export const useTimelineController = (world: any, setWorld: any) => {
    const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(world.timelines[0]?.id || null);
    const [viewMode, setViewMode] = useState<'chronicle' | 'gantt' | 'calendar'>('chronicle');
    const [grouping, setGrouping] = useState<'millennia' | 'centuries' | 'decades' | 'years'>('years');
    const [calendarViewDate, setCalendarViewDate] = useState({ year: 1000, month: 0 });
    const [editingCalendarId, setEditingCalendarId] = useState<string | null>(null);

    const timeline = world.timelines.find((t: Timeline) => t.id === selectedTimelineId) || world.timelines[0];
    const events = useMemo(() => {
        if (!selectedTimelineId) return [];
        return world.events.filter((e: TimelineEvent) => e.timelineId === selectedTimelineId)
            .sort((a: any, b: any) => (a.year - b.year) || (a.month - b.month) || (a.day - b.day));
    }, [world.events, selectedTimelineId]);

    const calendars = world.calendars;
    const activeCalendar = calendars.find((c: CalendarSystem) => c.id === timeline?.calendarId) || calendars[0];

    useEffect(() => {
        if (timeline && !selectedTimelineId) setSelectedTimelineId(timeline.id);
    }, [timeline]);

    const addEvent = () => {
        if (!timeline) return;
        const newEvent: TimelineEvent = { 
            id: generateId(), 
            timelineId: timeline.id, 
            title: "New Event", 
            description: "Something happened.", 
            year: calendarViewDate.year, 
            month: calendarViewDate.month, 
            day: 1, 
            involvedEntityIds: [] 
        };
        setWorld({...world, events: [...world.events, newEvent]});
    };

    const updateEvent = (updated: TimelineEvent) => {
        setWorld({...world, events: world.events.map((x:any) => x.id===updated.id ? updated : x)});
    };
    
    const deleteEvent = (id: string) => {
        setWorld({...world, events: world.events.filter((x:any) => x.id !== id)});
    };

    const createTimeline = () => {
        const newT: Timeline = { id: generateId(), title: "New Timeline", calendarId: calendars[0].id };
        setWorld({...world, timelines: [...world.timelines, newT]});
        setSelectedTimelineId(newT.id);
    };

    const deleteTimeline = (id: string) => {
        if (world.timelines.length <= 1) return;
        setWorld({
            ...world, 
            timelines: world.timelines.filter((t:any) => t.id !== id),
            events: world.events.filter((e:any) => e.timelineId !== id)
        });
        if(selectedTimelineId === id) setSelectedTimelineId(world.timelines.find((t:any)=>t.id !== id).id);
    };

    const createCalendar = () => {
        const newC: CalendarSystem = { 
            id: generateId(), 
            name: "New Calendar", 
            currentYear: 1, 
            months: [{ name: "Month 1", days: 30 }], 
            weekDays: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"] 
        };
        setWorld({...world, calendars: [...world.calendars, newC]});
        setEditingCalendarId(newC.id);
    };

    const updateCalendar = (updated: CalendarSystem) => {
        setWorld({...world, calendars: world.calendars.map((c:any) => c.id === updated.id ? updated : c)});
    };

    return { 
        selectedTimelineId, setSelectedTimelineId, 
        timeline, events, calendars, activeCalendar,
        viewMode, setViewMode,
        grouping, setGrouping,
        calendarViewDate, setCalendarViewDate,
        editingCalendarId, setEditingCalendarId,
        createTimeline, deleteTimeline,
        createCalendar, updateCalendar,
        addEvent, updateEvent, deleteEvent 
    };
};

export const useRelationshipController = (world: any, setWorld: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editRel, setEditRel] = useState<{ sourceId: string, targetId: string, type: string } | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newRel, setNewRel] = useState({ sourceId: '', targetId: '', type: '' });

    const allRelationships = useMemo(() => {
        return world.entities.flatMap((source: Entity) => 
            source.relationships.map((rel: Relationship) => ({
                source,
                target: world.entities.find((e: Entity) => e.id === rel.targetId),
                type: rel.type
            }))
        ).filter((r: any) => r.target); 
    }, [world.entities]);

    const filteredRels = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return allRelationships.filter((r: any) => {
             return getLocalized(r.source.name, world.language).toLowerCase().includes(term) ||
                   getLocalized(r.target.name, world.language).toLowerCase().includes(term) ||
                   r.type.toLowerCase().includes(term);
        });
    }, [allRelationships, searchTerm, world.language]);

    const handleSave = (type: string) => {
        if (!editRel) return;
        const newEntities = world.entities.map((e: Entity) => {
            if (e.id === editRel.sourceId) {
                return {
                    ...e,
                    relationships: e.relationships.map((r: Relationship) => r.targetId === editRel.targetId ? { ...r, type } : r)
                };
            }
            return e;
        });
        setWorld({ ...world, entities: newEntities });
        setEditRel(null);
    };

    const handleDelete = () => {
        if (!editRel) return;
        const newEntities = world.entities.map((e: Entity) => {
            if (e.id === editRel.sourceId) {
                return { ...e, relationships: e.relationships.filter((r: Relationship) => r.targetId !== editRel.targetId) };
            }
            return e;
        });
        setWorld({ ...world, entities: newEntities });
        setEditRel(null);
    };

    const handleCreate = () => {
        if (!newRel.sourceId || !newRel.targetId || !newRel.type) return;
        const newEntities = world.entities.map((e: Entity) => {
            if (e.id === newRel.sourceId) {
                return { ...e, relationships: [...e.relationships, { targetId: newRel.targetId, type: newRel.type }] };
            }
            return e;
        });
        setWorld({ ...world, entities: newEntities });
        setCreateModalOpen(false);
        setNewRel({ sourceId: '', targetId: '', type: '' });
    };

    return {
        searchTerm, setSearchTerm,
        editRel, setEditRel,
        createModalOpen, setCreateModalOpen,
        newRel, setNewRel,
        filteredRels,
        handleSave,
        handleDelete,
        handleCreate
    };
};
