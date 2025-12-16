
import { useState, useRef, useEffect, useMemo } from 'react';
import { Scenario, Session, SessionMessage, Timeline, TimelineEvent, Entity, Relationship, CalendarSystem, Scene, EntityType } from '../types';
import { generateId, getLocalized } from '../utils/helpers';
import { IAIService } from '../services/aiService';

// Text-to-Speech Hook
export const useTTS = (enabled: boolean, text: string | undefined, lang: string) => {
    useEffect(() => {
        if (!enabled || !text) {
            window.speechSynthesis.cancel();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Voice Selection
        const voices = window.speechSynthesis.getVoices();
        const langCode = lang === 'fr' ? 'fr' : 'en';
        // Prefer Google voices, then Microsoft, then native
        const voice = voices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.startsWith(langCode));
        
        if (voice) utterance.voice = voice;
        utterance.rate = 1.0;
        
        window.speechSynthesis.speak(utterance);

        return () => window.speechSynthesis.cancel();
    }, [enabled, text, lang]);
};

export const useScenarioController = (world: any, setWorld: any, aiService?: IAIService, initialSelectedId?: string | null) => {
    const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(initialSelectedId || null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if(initialSelectedId) setSelectedScenarioId(initialSelectedId);
    }, [initialSelectedId]);

    const selectedScenario = world.scenarios.find((s: Scenario) => s.id === selectedScenarioId);

    const handleCreate = () => {
        const newS: Scenario = { id: generateId(), title: { [world.language]: "New Scenario" }, synopsis: { [world.language]: "" }, scenes: [], involvedEntities: [] };
        setWorld({...world, scenarios: [...world.scenarios, newS]});
        setSelectedScenarioId(newS.id);
    };

    const handleGenerate = async () => {
        if (!aiService) return;
        setIsGenerating(true);
        try {
            const worldContext = `${getLocalized(world.name, world.language)}: ${getLocalized(world.description, world.language)}`;
            // Pass a subset of entity names to avoid token limits
            const entityNames = world.entities.slice(0, 50).map((e: Entity) => getLocalized(e.name, world.language));
            
            const result = await aiService.generateScenarioHook(worldContext, entityNames, world.language);
            
            const newScenario: Scenario = {
                id: generateId(),
                title: { [world.language]: result.title },
                synopsis: { [world.language]: result.synopsis },
                scenes: result.scenes.map((s: any) => ({
                    id: generateId(),
                    title: { [world.language]: s.title },
                    description: { [world.language]: s.description },
                    type: (['exploration', 'social', 'combat', 'puzzle'].includes(s.type) ? s.type : 'exploration') as any,
                    status: 'pending'
                })),
                involvedEntities: []
            };

            // Handle New Entities if generated
            let newEntities: Entity[] = [];
            if (result.newEntities && result.newEntities.length > 0) {
                newEntities = result.newEntities.map((ne: any) => ({
                    id: generateId(),
                    name: { [world.language]: ne.name },
                    type: ne.type as EntityType,
                    description: { [world.language]: ne.description },
                    tags: ["AI Generated", "Scenario"],
                    attributes: [],
                    relationships: []
                }));
            }

            setWorld((prev: any) => ({
                ...prev,
                scenarios: [...prev.scenarios, newScenario],
                entities: [...prev.entities, ...newEntities]
            }));
            setSelectedScenarioId(newScenario.id);
        } catch (e) {
            console.error("Scenario generation failed", e);
            alert("Failed to generate scenario. Check API key and limits.");
        } finally {
            setIsGenerating(false);
        }
    };

    const updateScenario = (updated: Scenario) => {
        setWorld({...world, scenarios: world.scenarios.map((s:any) => s.id === updated.id ? updated : s)});
    };

    const addScene = () => {
        if (!selectedScenario) return;
        const newScene: Scene = {
            id: generateId(),
            title: { [world.language]: "New Scene" },
            description: { [world.language]: "" },
            type: 'exploration',
            status: 'pending'
        };
        updateScenario({ ...selectedScenario, scenes: [...selectedScenario.scenes, newScene] });
    };

    const updateScene = (sceneId: string, updatedData: Partial<Scene>) => {
        if (!selectedScenario) return;
        const newScenes = selectedScenario.scenes.map((s: Scene) => s.id === sceneId ? { ...s, ...updatedData } : s);
        updateScenario({ ...selectedScenario, scenes: newScenes });
    };

    const deleteScene = (sceneId: string) => {
        if (!selectedScenario) return;
        updateScenario({ ...selectedScenario, scenes: selectedScenario.scenes.filter((s: Scene) => s.id !== sceneId) });
    };

    const deleteScenario = (id: string) => {
        if(confirm("Delete scenario?")) {
            setWorld({...world, scenarios: world.scenarios.filter((s:any) => s.id !== id)});
            setSelectedScenarioId(null);
        }
    };

    return { 
        selectedScenarioId, setSelectedScenarioId, 
        selectedScenario, isGenerating,
        handleCreate, handleGenerate, updateScenario, deleteScenario,
        addScene, updateScene, deleteScene
    };
};

export const useSessionController = (world: any, setWorld: any, aiService: IAIService, initialSelectedId?: string | null) => {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSelectedId || null);
    
    useEffect(() => {
        if(initialSelectedId) setSelectedSessionId(initialSelectedId);
    }, [initialSelectedId]);

    const selectedSession = world.sessions.find((s: Session) => s.id === selectedSessionId);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [selectedSession?.messages, isProcessing]);

    const handleCreate = () => {
        const newS: Session = { id: generateId(), name: "New Session", date: new Date().toISOString(), activeEntityIds: [], messages: [], status: 'active' };
        setWorld({...world, sessions: [...world.sessions, newS]});
        setSelectedSessionId(newS.id);
    };

    const updateSession = (updated: Session) => {
        setWorld({...world, sessions: world.sessions.map((s:any) => s.id === updated.id ? updated : s)});
    };

    const sendMessage = async () => {
        if (!selectedSession || !input.trim() || isProcessing) return;
        
        const userMsg: SessionMessage = { id: generateId(), role: 'user', content: input, timestamp: Date.now() };
        const updatedSession = { ...selectedSession, messages: [...selectedSession.messages, userMsg] };
        
        // Optimistic update
        updateSession(updatedSession);
        setInput('');
        setIsProcessing(true);

        try {
            // Prepare Context
            const worldContext = `World: ${getLocalized(world.name, world.language)}. ${getLocalized(world.description, world.language)}`;
            const scenario = world.scenarios[0]; 
            const scenarioContext = scenario 
                ? `Scenario: ${getLocalized(scenario.title, world.language)}. ${getLocalized(scenario.synopsis, world.language)}`
                : "Freeplay session.";

            const result = await aiService.continueSessionChat(
                worldContext,
                scenarioContext,
                updatedSession.messages,
                world.language
            );

            // Add AI Response
            const aiMsg: SessionMessage = { id: generateId(), role: 'gm', content: result.response, timestamp: Date.now() };
            let finalSession = { ...updatedSession, messages: [...updatedSession.messages, aiMsg] };

            // Handle New Entities
            if (result.newEntities && result.newEntities.length > 0) {
                const createdEntities = result.newEntities.map((ne: any) => ({
                    id: generateId(),
                    name: { [world.language]: ne.name },
                    type: ne.type,
                    description: { [world.language]: ne.description },
                    tags: ["AI Generated", "Session"],
                    attributes: [],
                    relationships: []
                }));
                // Update world with new entities
                setWorld((prev: any) => ({
                    ...prev,
                    entities: [...prev.entities, ...createdEntities],
                    sessions: prev.sessions.map((s:any) => s.id === finalSession.id ? finalSession : s)
                }));
            } else {
                updateSession(finalSession);
            }

        } catch (error) {
            console.error("AI Error", error);
            const errorMsg: SessionMessage = { id: generateId(), role: 'system', content: "Error contacting the Game Master.", timestamp: Date.now() };
            updateSession({ ...updatedSession, messages: [...updatedSession.messages, errorMsg] });
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteSession = (id: string) => {
        if(confirm("Delete session?")) {
            setWorld({...world, sessions: world.sessions.filter((s:any) => s.id !== id)});
            setSelectedSessionId(null);
        }
    };

    const clearChat = () => {
        if (!selectedSession) return;
        if (confirm("Clear all messages?")) {
             updateSession({ ...selectedSession, messages: [] });
        }
    };

    return { selectedSessionId, setSelectedSessionId, selectedSession, input, setInput, isProcessing, chatRef, handleCreate, sendMessage, updateSession, deleteSession, clearChat };
};

export const useTimelineController = (world: any, setWorld: any, initialSelectedId?: string | null) => {
    const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(initialSelectedId || world.timelines[0]?.id || null);
    
    useEffect(() => {
        if(initialSelectedId) setSelectedTimelineId(initialSelectedId);
    }, [initialSelectedId]);

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
