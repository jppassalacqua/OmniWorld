
import { useState, useMemo, useEffect } from 'react';
import { WikiPage, TreeNode, Entity, WorldState } from '../types';
import { FileText } from 'lucide-react';
import { generateId, getLocalized } from '../utils/helpers';

export const useWikiController = (world: WorldState, setWorld: any, initialSelectedId?: string | null) => {
    const [selectedPageId, setSelectedPageId] = useState<string | null>(initialSelectedId || null);
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isGeneratingLore, setIsGeneratingLore] = useState(false);
    
    // Deep Linking Support
    useEffect(() => {
        if (initialSelectedId) {
            setSelectedPageId(initialSelectedId);
            // Expand parent
            const page = world.wikiPages.find((p:WikiPage) => p.id === initialSelectedId);
            if(page && page.parentId) {
                setExpandedIds(prev => prev.includes(page.parentId!) ? prev : [...prev, page.parentId!]);
            }
        }
    }, [initialSelectedId]);

    const selectedPage = world.wikiPages.find((p: WikiPage) => p.id === selectedPageId);

    const wikiTree = useMemo(() => {
        if (search) {
             return world.wikiPages
                .filter((p: WikiPage) => getLocalized(p.title, world.language).toLowerCase().includes(search.toLowerCase()))
                .map((p: WikiPage) => ({ id: p.id, label: getLocalized(p.title, world.language), type: 'item', icon: FileText, data: p }));
        }
        const buildTree = (parentId?: string): TreeNode[] => {
             return world.wikiPages
                .filter((p: WikiPage) => p.parentId === parentId || (!parentId && !world.wikiPages.find(x => x.id === p.parentId && x.id !== p.id)))
                .map((p: WikiPage) => ({
                    id: p.id,
                    label: getLocalized(p.title, world.language),
                    type: 'item',
                    icon: FileText,
                    children: world.wikiPages.some(x => x.parentId === p.id) ? buildTree(p.id) : undefined,
                    data: p
                }));
        };
        return buildTree(undefined);
    }, [world.wikiPages, search, world.language]);

    // Calculate Backlinks: Find other pages or entities that link TO the selected page
    const backlinks = useMemo(() => {
        if (!selectedPageId) return [];
        const links: { id: string, name: string, type: 'page' | 'entity' }[] = [];
        
        // Check other Wiki Pages
        world.wikiPages.forEach((p: WikiPage) => {
            if (p.id === selectedPageId) return;
            const content = JSON.stringify(p.content); // Simple check in all languages
            if (content.includes(`(wiki:${selectedPageId})`) || content.includes(`(entity:${selectedPageId})`)) {
                links.push({ id: p.id, name: getLocalized(p.title, world.language), type: 'page' });
            }
        });

        // Check Entities
        world.entities.forEach((e: Entity) => {
            const description = JSON.stringify(e.description);
            if (description.includes(`(wiki:${selectedPageId})`) || description.includes(`(entity:${selectedPageId})`)) {
                links.push({ id: e.id, name: getLocalized(e.name, world.language), type: 'entity' });
            }
        });

        return links;
    }, [selectedPageId, world.wikiPages, world.entities, world.language]);

    const handleCreate = () => {
        const newPage: WikiPage = { 
            id: generateId(), 
            title: { [world.language]: "New Page" }, 
            content: { [world.language]: "" }, 
            tags: [], 
            properties: [] 
        };
        setWorld({...world, wikiPages: [...world.wikiPages, newPage]});
        setSelectedPageId(newPage.id);
    };

    const handleDelete = (id: string) => {
        if(confirm("Delete this page?")) {
            setWorld({...world, wikiPages: world.wikiPages.filter((p: WikiPage) => p.id !== id)});
            if(selectedPageId === id) setSelectedPageId(null);
        }
    };
    
    const updatePage = (updated: WikiPage) => {
        setWorld({...world, wikiPages: world.wikiPages.map((p: WikiPage) => p.id === updated.id ? updated : p)});
    };

    const toggleExpand = (id: string) => setExpandedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    const autoLinkPage = () => {
        if (!selectedPageId) return;
        const page = world.wikiPages.find((p: WikiPage) => p.id === selectedPageId);
        if (!page) return;

        const lang = world.language;
        let content = page.content[lang] || "";
        let originalContent = content;

        // Sort entities by length (longest first) to prevent partial replacement issues
        const entities = [...world.entities].sort((a: Entity, b: Entity) => {
            const na = getLocalized(a.name, lang).length;
            const nb = getLocalized(b.name, lang).length;
            return nb - na;
        });

        entities.forEach((e: Entity) => {
            const name = getLocalized(e.name, lang);
            if (!name || name.length < 2) return;

            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(?<!\\[)\\b${escaped}\\b(?![^\\[]*\\])(?![^\\(]*\\))`, 'g');
            
            content = content.replace(regex, `[${name}](entity:${e.id})`);
        });

        if (content !== originalContent) {
            updatePage({
                ...page,
                content: { ...page.content, [lang]: content }
            });
        }
    };

    const handleSummarize = async (aiService: any) => {
        if (!selectedPageId) return;
        const page = world.wikiPages.find((p: WikiPage) => p.id === selectedPageId);
        if (!page) return;
        
        setIsSummarizing(true);
        try {
            const lang = world.language;
            const content = page.content[lang] || "";
            if (!content) return;
            const summary = await aiService.summarizeText(content, lang);
            const newContent = `> **Summary**: ${summary}\n\n${content}`;
            updatePage({...page, content: {...page.content, [lang]: newContent}});
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleGenerateLore = async (aiService: any, genre: string, topics: string[]) => {
        setIsGeneratingLore(true);
        try {
            const lang = world.language;
            const worldName = getLocalized(world.name, lang);
            const worldContext = getLocalized(world.description, lang);
            
            const result = await aiService.generateWorldLore(worldName, worldContext, genre, topics, lang);
            
            if (result && result.sections) {
                const rootId = generateId();
                const rootPage: WikiPage = {
                    id: rootId,
                    title: { [lang]: "Generated Lore Bible" },
                    content: { [lang]: `Lore generated for **${genre}** theme.\nTopics: ${topics.join(', ')}` },
                    tags: ['generated', 'lore'],
                    properties: []
                };

                const newPages = result.sections.map((section: any) => ({
                    id: generateId(),
                    parentId: rootId,
                    title: { [lang]: section.title },
                    content: { [lang]: section.content },
                    tags: ['lore'],
                    properties: []
                }));

                setWorld((prev: any) => ({
                    ...prev,
                    wikiPages: [...prev.wikiPages, rootPage, ...newPages]
                }));
                
                // Expand and select
                setExpandedIds(prev => [...prev, rootId]);
                setSelectedPageId(rootId);
            }
        } catch (e) {
            console.error("Lore Gen Error", e);
            alert("Failed to generate lore.");
        } finally {
            setIsGeneratingLore(false);
        }
    };

    return {
        selectedPageId, setSelectedPageId,
        search, setSearch,
        expandedIds, setExpandedIds,
        selectedPage,
        wikiTree,
        backlinks,
        isSummarizing,
        isGeneratingLore,
        handleCreate,
        handleDelete,
        updatePage,
        toggleExpand,
        autoLinkPage,
        handleSummarize,
        handleGenerateLore
    };
};
