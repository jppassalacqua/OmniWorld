
import { useState, useMemo } from 'react';
import { WikiPage, TreeNode } from '../types';
import { FileText } from 'lucide-react';
import { generateId, getLocalized } from '../utils/helpers';

export const useWikiController = (world: any, setWorld: any) => {
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    
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

    return {
        selectedPageId, setSelectedPageId,
        search, setSearch,
        expandedIds, setExpandedIds,
        selectedPage,
        wikiTree,
        handleCreate,
        handleDelete,
        updatePage,
        toggleExpand
    };
};
