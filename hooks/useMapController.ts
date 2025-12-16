
import { useState, useEffect, useMemo } from 'react';
import { WorldMap, MapPin, Entity, EntityType, TreeNode, MapLayer } from '../types';
import { Map as MapIcon } from 'lucide-react';
import { generateId } from '../utils/helpers';

export const useMapController = (world: any, setWorld: any, initialSelectedId?: string | null) => {
  const [selectedMapId, setSelectedMapId] = useState<string | null>(initialSelectedId || null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'view' | 'edit' | 'measure' | 'pin'>('view');
  const [measurePoints, setMeasurePoints] = useState<{x:number, y:number}[]>([]);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null); // null = default layer
  const [showAllPins, setShowAllPins] = useState(true);
  
  // Deep Linking
  useEffect(() => {
    if (initialSelectedId) {
        setSelectedMapId(initialSelectedId);
        const map = world.maps.find((m:WorldMap) => m.id === initialSelectedId);
        if(map && map.parentId) {
             setExpandedIds(prev => prev.includes(map.parentId!) ? prev : [...prev, map.parentId!]);
        }
    }
  }, [initialSelectedId]);

  const selectedMap = world.maps.find((m: WorldMap) => m.id === selectedMapId);

  useEffect(() => { 
      setMeasurePoints([]); 
      setMode('view'); 
      setActivePinId(null);
      setActiveLayerId(null);
      setShowAllPins(true);
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
      const newM: WorldMap = { id: generateId(), name: "New Map", imageUrl: "https://via.placeholder.com/800x600?text=Map", pins: [], layers: [] }; 
      setWorld({ ...world, maps: [...world.maps, newM] }); 
      setSelectedMapId(newM.id); 
  };
  
  const updateMap = (updatedMap: WorldMap) => {
      setWorld({...world, maps: world.maps.map((m:WorldMap) => m.id === updatedMap.id ? updatedMap : m)});
  };

  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
      if (!selectedMap) return;
      if (activePinId) setActivePinId(null);

      if (mode === 'measure') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          if (measurePoints.length >= 2) setMeasurePoints([{x,y}]);
          else setMeasurePoints([...measurePoints, {x,y}]);
      }

      if (mode === 'pin') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          const newPin: MapPin = {
              id: generateId(),
              x,
              y,
              entityId: '', // Empty initially, user must select
              layerId: activeLayerId || undefined
          };
          updateMap({ ...selectedMap, pins: [...selectedMap.pins, newPin] });
          setActivePinId(newPin.id);
          setMode('view');
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
  
  const deleteMap = (id: string) => {
      if(confirm("Delete map?")) { 
          setWorld({...world, maps: world.maps.filter((m:WorldMap)=>m.id !== id)}); 
          setSelectedMapId(null); 
      }
  };

  // Pin CRUD
  const updatePin = (pinId: string, updates: Partial<MapPin>) => {
      if(!selectedMap) return;
      updateMap({
          ...selectedMap, 
          pins: selectedMap.pins.map(p => p.id === pinId ? { ...p, ...updates } : p)
      });
  };

  const deletePin = (pinId: string) => {
      if(!selectedMap) return;
      updateMap({
          ...selectedMap, 
          pins: selectedMap.pins.filter(p => p.id !== pinId)
      });
      setActivePinId(null);
  };

  // Layer methods
  const addLayer = () => {
      if (!selectedMap) return;
      const newLayer: MapLayer = { id: generateId(), name: "New Layer", imageUrl: selectedMap.imageUrl };
      updateMap({ ...selectedMap, layers: [...(selectedMap.layers || []), newLayer] });
      setActiveLayerId(newLayer.id);
  };

  const updateLayer = (layerId: string, updates: Partial<MapLayer>) => {
      if (!selectedMap || !selectedMap.layers) return;
      const newLayers = selectedMap.layers.map(l => l.id === layerId ? { ...l, ...updates } : l);
      updateMap({ ...selectedMap, layers: newLayers });
  };

  const removeLayer = (layerId: string) => {
      if (!selectedMap || !selectedMap.layers) return;
      updateMap({ ...selectedMap, layers: selectedMap.layers.filter(l => l.id !== layerId) });
      if (activeLayerId === layerId) setActiveLayerId(null);
  };

  const getActiveImageUrl = () => {
      if (!selectedMap) return "";
      if (activeLayerId) {
          const layer = selectedMap.layers?.find(l => l.id === activeLayerId);
          return layer ? layer.imageUrl : selectedMap.imageUrl;
      }
      return selectedMap.imageUrl;
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
      deleteMap,
      updatePin, deletePin,
      activeLayerId, setActiveLayerId,
      addLayer, updateLayer, removeLayer, getActiveImageUrl,
      showAllPins, setShowAllPins
  };
};
