
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Entity, EntityType, TreeNode } from '../types';
import { Users } from 'lucide-react';
import { generateId, getLocalized } from '../utils/helpers';

export const useEntityController = (world: any, setWorld: any, initialSelectedId?: string | null) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(initialSelectedId || null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showManualModal, setShowManualModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Sync if initialSelectedId changes (deep navigation)
  useEffect(() => {
    if (initialSelectedId) {
        setSelectedEntityId(initialSelectedId);
        // Find parent to expand
        const entity = world.entities.find((e: Entity) => e.id === initialSelectedId);
        if (entity && entity.parentId && !expandedIds.includes(entity.parentId)) {
            setExpandedIds(prev => [...prev, entity.parentId!]);
        }
    }
  }, [initialSelectedId]);

  const filteredEntities = useMemo(() => {
      return world.entities.filter((e: Entity) => {
          const q = search.toLowerCase();
          const n = getLocalized(e.name, world.language).toLowerCase();
          const typeMatch = filterType === 'ALL' || e.type === filterType;
          return typeMatch && (n.includes(q) || (e.tags || []).join(' ').toLowerCase().includes(q));
      });
  }, [world.entities, world.language, search, filterType]);

  const entityTree = useMemo(() => {
      // If searching or filtering, flatten the tree to show all matches
      if (filterType !== 'ALL' || search) {
          return filteredEntities.map((e: Entity) => ({ 
              id: e.id, 
              label: getLocalized(e.name, world.language), 
              type: 'item', 
              icon: Users, 
              data: e 
          }));
      }

      const buildTree = (parentId?: string): TreeNode[] => {
          return filteredEntities
              .filter((e: Entity) => e.parentId === parentId || (!parentId && !filteredEntities.find(p => p.id === e.parentId && p.id !== e.id)))
              .map((e: Entity) => ({ 
                  id: e.id, 
                  label: getLocalized(e.name, world.language), 
                  type: 'item', 
                  icon: Users, 
                  children: filteredEntities.some(child => child.parentId === e.id) ? buildTree(e.id) : undefined, 
                  data: e 
              }));
      };
      return buildTree(undefined);
  }, [filteredEntities, world.language, filterType, search]);

  const selectedEntity = useMemo(() => world.entities.find((e: Entity) => e.id === selectedEntityId), [world.entities, selectedEntityId]);
  
  const handleUpdateEntity = (updated: Entity) => { 
      setWorld({ ...world, entities: world.entities.map((e: Entity) => e.id === updated.id ? updated : e) }); 
  };
  
  const handleCreateEntity = (data: any) => { 
      const newEntity: Entity = { 
          id: generateId(), 
          name: { [world.language]: data.name }, 
          type: data.type, 
          description: { [world.language]: data.desc }, 
          imageUrl: data.imageUrl, 
          parentId: data.parentId, 
          tags: data.tags || [], 
          attributes: [], 
          relationships: data.relationships || [] 
      }; 
      setWorld({ ...world, entities: [...world.entities, newEntity] }); 
      setSelectedEntityId(newEntity.id); 
      setShowManualModal(false);
      
      // Auto-expand the parent if it exists
      if (data.parentId) {
          setExpandedIds(prev => [...prev, data.parentId]);
      }
  };

  const handleAddRelationship = (sourceId: string, targetId: string, type: string) => {
      const source = world.entities.find((e:Entity) => e.id === sourceId);
      if(source) {
          const updated = { ...source, relationships: [...source.relationships, { targetId, type }] };
          handleUpdateEntity(updated);
      }
  };

  const handleRemoveRelationship = (sourceId: string, targetId: string) => {
      const source = world.entities.find((e:Entity) => e.id === sourceId);
      if(source) {
          const updated = { ...source, relationships: source.relationships.filter((r:any) => r.targetId !== targetId) };
          handleUpdateEntity(updated);
      }
  };
  
  const toggleExpand = (id: string) => setExpandedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // --- Drag and Drop Logic ---

  const isDescendant = (parentId: string, childId: string, entities: Entity[]): boolean => {
      if (parentId === childId) return true;
      const child = entities.find(e => e.id === childId);
      if (!child || !child.parentId) return false;
      return isDescendant(parentId, child.parentId, entities);
  };

  const handleMoveEntity = useCallback((draggedId: string, targetId: string | null) => {
      if (draggedId === targetId) return; // Can't move to self

      // Prevent circular dependency: Target cannot be a descendant of Dragged
      if (targetId && isDescendant(draggedId, targetId, world.entities)) {
          console.warn("Cannot move an entity into its own descendant.");
          return;
      }

      const draggedEntity = world.entities.find((e: Entity) => e.id === draggedId);
      if (!draggedEntity) return;

      // Update parentId
      const updatedEntity = { ...draggedEntity, parentId: targetId || undefined };
      handleUpdateEntity(updatedEntity);

      // Expand the target folder if we dropped into it
      if (targetId && !expandedIds.includes(targetId)) {
          setExpandedIds(prev => [...prev, targetId]);
      }
  }, [world.entities, expandedIds]);

  return {
    selectedEntityId, setSelectedEntityId,
    search, setSearch,
    filterType, setFilterType,
    showManualModal, setShowManualModal,
    viewMode, setViewMode,
    expandedIds, setExpandedIds,
    filteredEntities,
    entityTree,
    selectedEntity,
    handleUpdateEntity,
    handleCreateEntity,
    handleAddRelationship,
    handleRemoveRelationship,
    toggleExpand,
    handleMoveEntity
  };
};
