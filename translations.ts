
import { SupportedLanguage } from "../types";

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.wiki": "Wiki & Lore",
    "nav.maps": "Cartographie",
    "nav.entities": "Entités",
    "nav.relationships": "Relations",
    "nav.scenarios": "Scénarios",
    "nav.sessions": "Sessions",
    "nav.settings": "Paramètres",
    "nav.back_worlds": "Mes Mondes",
    
    // World Selector
    "world.select": "Sélectionner un Monde",
    "world.create": "Créer un Nouveau Monde",
    "world.delete_confirm": "Supprimer ce monde ?",
    "world.entities_count": "entités",
    "world.scenarios_count": "scénarios",
    
    // Actions
    "action.export_unity": "Exporter vers Unity",
    "action.export_foundry": "Foundry",
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "action.generate": "Générer (IA)",
    "action.manual": "Manuel",
    "action.upload": "Importer",
    "action.edit": "Éditer",
    "action.delete": "Supprimer",
    "action.add_pin": "Ajouter Épingle",
    "action.place_pin": "Placer sur la carte",
    "action.exit": "Quitter",
    "action.new_page": "Nouvelle Page",
    "action.auto_link": "Auto-lier",
    
    // Labels
    "label.name": "Nom",
    "label.type": "Type",
    "label.description": "Description",
    "label.image_url": "URL Image",
    "label.world_name": "Nom du Monde",
    "label.world_context": "Contexte Global",
    "label.system": "Système de Jeu",
    "label.language": "Langue de l'interface & Contenu",
    "label.scale": "Échelle (Largeur)",
    "label.unit": "Unité",
    "label.parent_map": "Carte Parente",
    "label.linked_entity": "Entité Liée",
    
    // Sections
    "section.world_bible": "Bible du Monde",
    "section.cartography": "Cartographie",
    "section.entities": "Entités du Monde",
    "section.scenarios": "Scénarios",
    
    // Placeholders
    "placeholder.genre": "Genre (ex: Dark Fantasy)",
    "placeholder.name": "Nom...",
    "placeholder.description_map": "Décrivez la carte...",
    "placeholder.chat": "Que voulez-vous faire ?",
    
    // Status
    "status.generating": "Génération...",
    "status.writing": "Écriture...",
    "status.active": "Actif",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.wiki": "Wiki & Lore",
    "nav.maps": "Maps",
    "nav.entities": "Entities",
    "nav.relationships": "Relationships",
    "nav.scenarios": "Scenarios",
    "nav.sessions": "Sessions",
    "nav.settings": "Settings",
    "nav.back_worlds": "My Worlds",
    
    // World Selector
    "world.select": "Select a World",
    "world.create": "Create New World",
    "world.delete_confirm": "Delete this world?",
    "world.entities_count": "entities",
    "world.scenarios_count": "scenarios",
    
    // Actions
    "action.export_unity": "Export to Unity",
    "action.export_foundry": "Foundry",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.generate": "Generate (AI)",
    "action.manual": "Manual",
    "action.upload": "Upload",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.add_pin": "Add Pin",
    "action.place_pin": "Place Pin",
    "action.exit": "Exit",
    "action.new_page": "New Page",
    "action.auto_link": "Auto Link",
    
    // Labels
    "label.name": "Name",
    "label.type": "Type",
    "label.description": "Description",
    "label.image_url": "Image URL",
    "label.world_name": "World Name",
    "label.world_context": "Global Context",
    "label.system": "Game System",
    "label.language": "Interface & Content Language",
    "label.scale": "Scale (Width)",
    "label.unit": "Unit",
    "label.parent_map": "Parent Map",
    "label.linked_entity": "Linked Entity",
    
    // Sections
    "section.world_bible": "World Bible",
    "section.cartography": "Cartography",
    "section.entities": "World Entities",
    "section.scenarios": "Scenarios",
    
    // Placeholders
    "placeholder.genre": "Genre/Vibe (e.g. Grimdark)",
    "placeholder.name": "Name...",
    "placeholder.description_map": "Describe map...",
    "placeholder.chat": "What do you want to do?",
    
    // Status
    "status.generating": "Generating...",
    "status.writing": "Writing...",
    "status.active": "Active",
  }
};
