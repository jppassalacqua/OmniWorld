
import React from 'react';
import { Users, Search, PlusCircle, Network, List } from 'lucide-react';
import { EntityType } from '../types';
import { ResizableSplitPane, TreeItem, TreeNode } from '../components/Shared';
import { RelationshipGraph } from '../components/RelationshipGraph';
import { useEntityController } from '../hooks/useEntityController';
import { EntityDetail } from '../components/EntityDetail';
import { THEME } from '../styles/theme';

export const EntityManager = ({ world, setWorld, onExport, setView, aiService, initialSelectedId }: any) => {
  const ctrl = useEntityController(world, setWorld, initialSelectedId);

  const onDragStart = (e: React.DragEvent, node: TreeNode) => {
      // Logic handled in controller or mostly standard HTML5 logic in TreeItem
  };

  const onDrop = (e: React.DragEvent, targetNode: TreeNode) => {
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId && targetNode.id) {
          ctrl.handleMoveEntity(draggedId, targetNode.id);
      }
  };

  return (
    <ResizableSplitPane
        initialLeftWidth={320}
        className={THEME.layout.splitPane}
        left={
            <div className={THEME.layout.sidebar}>
                <div className={THEME.layout.sidebarHeader}>
                    <div className="flex items-center justify-between"><span className={THEME.text.header}>Entities</span><div className="flex gap-1"><button onClick={() => ctrl.setViewMode(ctrl.viewMode === 'list' ? 'graph' : 'list')} className={THEME.button.icon}>{ctrl.viewMode === 'list' ? <Network size={16}/> : <List size={16}/>}</button><button onClick={() => ctrl.setShowManualModal(true)} className={THEME.button.icon}><PlusCircle size={16}/></button></div></div>
                    <div className="relative"><Search size={14} className="absolute left-2.5 top-2 text-slate-500" /><input value={ctrl.search} onChange={e => ctrl.setSearch(e.target.value)} placeholder="Search..." className={THEME.input.search} /></div>
                    <div className="flex gap-2 flex-wrap pb-1">{['ALL', ...Object.values(EntityType)].map(type => (<button key={type} onClick={() => ctrl.setFilterType(type)} className={THEME.button.filter(ctrl.filterType === type)}>{type}</button>))}</div>
                </div>
                <div className={THEME.layout.sidebarContent}>
                    {/* Root Drop Zone (Optional, if we want to allow dragging back to root easily) */}
                    <div 
                        onDragOver={(e) => e.preventDefault()} 
                        onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            if (draggedId) ctrl.handleMoveEntity(draggedId, null);
                        }}
                        className="min-h-[10px]"
                    >
                        {ctrl.entityTree.map((node: any) => (
                            <TreeItem 
                                key={node.id} 
                                node={node} 
                                level={0} 
                                selectedId={ctrl.selectedEntityId} 
                                onSelect={(n: TreeNode) => ctrl.setSelectedEntityId(n.id)} 
                                expandedIds={ctrl.expandedIds} 
                                toggleExpand={ctrl.toggleExpand} 
                                draggable={true}
                                onDragStart={onDragStart}
                                onDrop={onDrop}
                            />
                        ))}
                    </div>
                </div>
            </div>
        }
        right={
             <div className={THEME.layout.mainContent}>
                {ctrl.viewMode === 'graph' ? (
                    <RelationshipGraph 
                        entities={ctrl.filteredEntities} 
                        onSelectEntity={ctrl.setSelectedEntityId} 
                        selectedEntityId={ctrl.selectedEntityId} 
                        lang={world.language}
                        onAddRelationship={ctrl.handleAddRelationship}
                        onRemoveRelationship={ctrl.handleRemoveRelationship}
                    />
                ) : (ctrl.selectedEntity ? (
                    <EntityDetail 
                        entity={ctrl.selectedEntity} 
                        allEntities={world.entities} 
                        lang={world.language} 
                        onUpdate={ctrl.handleUpdateEntity} 
                        onCreateEntity={ctrl.handleCreateEntity}
                        onDelete={ctrl.handleDeleteEntity}
                        onExport={onExport} 
                        setView={setView} 
                        aiService={aiService} 
                        maps={world.maps}
                    />
                ) : (
                    <div className={THEME.layout.emptyState}><Users size={64} className="mb-4 opacity-20"/><p>Select an entity to view details.</p></div>
                ))}
             </div>
        }
    />
  );
};
