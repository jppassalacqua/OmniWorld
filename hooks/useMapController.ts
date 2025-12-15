
import { useState, useEffect, useMemo } from 'react';
import { WorldMap, MapPin, Entity, EntityType, TreeNode } from '../types';
import { Map as MapIcon } from 'lucide-react';
import { generateId } from '../utils/helpers';

export const useMapController = (world: any, setWorld: any) => {
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'view' | 'edit' | 'measure'>('view');
  const [measurePoints, setMeasurePoints] = useState<{x:number, y:number}[]>([]);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  
  const selectedMap = world.maps.find((m: WorldMap) => m.id === selectedMapId);

  useEffect(() => { 
      setMeasurePoints([]); 
      setMode('view'); 
      setActivePinId(null);
  }, [selectedMapId]);

  const mapTree = useMemo(() => {
    if (search) {
        return world.maps
            .filter((m: WorldMap) => m.name.toLowerCase().includes(search.toLowerCase()))
            .map((m: WorldMap) => ({ id: m.id, label: m.name, type: 'item', icon: MapIcon, data: m }));
    }

    const buildTree = (parentId?: string): TreeNode[] => {
        return world.maps
            .filter((m: WorldMap) => m.parentId === parentId || (!parentId && !world.maps.find(p => p.id === m.parentId && p.id !== m.id)))
            .map((m: WorldMap) => ({
                id: m.id,
                label: m.name,
                type: 'item',
                icon: MapIcon,
                children: world.maps.some(child => child.parentId === m.id) ? buildTree(m.id) : undefined,
                data: m
            }));
    };
    return buildTree(undefined);
  }, [world.maps, search]);

  const create = () => { 
      const newM: WorldMap = { id: generateId(), name: "New Map", imageUrl: "https://via.placeholder.com/800x600?text=Map", pins: [] }; 
      setWorld({ ...world, maps: [...world.maps, newM] }); 
      setSelectedMapId(newM.id); 
  };
  
  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
      if (!selectedMap) return;
      // If we clicked the map background (image) and not a pin, clear active pin
      if (activePinId) setActivePinId(null);

      if (mode === 'measure') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          if (measurePoints.length >= 2) setMeasurePoints([{x,y}]);
          else setMeasurePoints([...measurePoints, {x,y}]);
      }
  };

  const calculateDistance = () => {
      if (measurePoints.length < 2 || !selectedMap?.scale) return null;
      const [p1, p2] = measurePoints;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distPercent = Math.sqrt(dx*dx + dy*dy);
      const dist = (distPercent / 100) * selectedMap.scale;
      return dist.toFixed(2);
  };

  const toggleExpand = (id: string) => setExpandedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  
  const updateMap = (updatedMap: WorldMap) => {
      setWorld({...world, maps: world.maps.map((m:WorldMap) => m.id === updatedMap.id ? updatedMap : m)});
  };
  
  const deleteMap = (id: string) => {
      if(confirm("Delete map?")) { 
          setWorld({...world, maps: world.maps.filter((m:WorldMap)=>m.id !== id)}); 
          setSelectedMapId(null); 
      }
  };

  return {
      selectedMapId, setSelectedMapId,
      expandedIds, setExpandedIds,
      search, setSearch,
      mode, setMode,
      measurePoints, setMeasurePoints,
      activePinId, setActivePinId,
      selectedMap,
      mapTree,
      create,
      handleMapClick,
      calculateDistance,
      toggleExpand,
      updateMap,
      deleteMap
  };
};
