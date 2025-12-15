
import { WorldState } from "../types";
import { getEmptyWorldState, getInitialWorldState } from "../utils/seedData";

// Type definition for SQL.js
declare var initSqlJs: any;

class DatabaseService {
  private db: any = null;
  private dbName = 'OmniWorldDB';

  async init() {
    if (this.db) return;

    // Load SQL.js
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    // Check IndexedDB for existing DB
    const savedData = await this.loadFromIndexedDB();
    
    if (savedData) {
      this.db = new SQL.Database(new Uint8Array(savedData));
      console.log("Database loaded from persistence.");
    } else {
      this.db = new SQL.Database();
      this.initSchema();
      console.log("New in-memory database created.");
    }
  }

  private initSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS worlds (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT,
        last_played INTEGER
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  async saveWorld(world: WorldState) {
    if (!this.db) await this.init();
    const data = JSON.stringify(world);
    // Extract name for faster listing without parsing full JSON
    const name = world.name[world.language] || world.name['en'] || "Untitled";
    
    // Check if table has 'name' column (migration for existing users)
    try {
        this.db.run(`INSERT OR REPLACE INTO worlds (id, name, data, last_played) VALUES (?, ?, ?, ?)`, 
            [world.id, name, data, Date.now()]);
    } catch (e) {
        // Fallback or migration logic if needed, but for now we assume schema is correct or re-created
        this.initSchema();
        this.db.run(`INSERT OR REPLACE INTO worlds (id, name, data, last_played) VALUES (?, ?, ?, ?)`, 
            [world.id, name, data, Date.now()]);
    }
    await this.persist();
  }

  async loadWorld(id: string): Promise<WorldState | null> {
    if (!this.db) await this.init();
    
    const stmt = this.db.prepare(`SELECT data FROM worlds WHERE id = ?`);
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return JSON.parse(row.data);
    }
    stmt.free();
    return null;
  }

  async loadLatestWorld(): Promise<WorldState | null> {
    if (!this.db) await this.init();
    const stmt = this.db.prepare(`SELECT data FROM worlds ORDER BY last_played DESC LIMIT 1`);
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return JSON.parse(row.data);
    }
    stmt.free();
    return null;
  }

  async loadAllWorlds(): Promise<{id: string, name: string, lastPlayed: number, description: string, parentId?: string}[]> {
      if(!this.db) await this.init();
      
      // Ensure schema exists if loading for the first time
      this.initSchema();

      try {
        const result = this.db.exec("SELECT id, name, data, last_played FROM worlds ORDER BY last_played DESC");
        if (result.length === 0) return [];
        
        return result[0].values.map((row: any[]) => {
            // Parse partial JSON to get parentId and description
            const w = JSON.parse(row[2]);
            const parentId = w.parentId;
            
            // If name column is empty (legacy data), parse from data
            let name = row[1];
            let description = "";
            if (!name) {
                name = w.name[w.language] || w.name['en'] || "Untitled";
            }
            description = w.description[w.language] || w.description['en'] || "";

            return { 
                id: row[0], 
                name, 
                lastPlayed: row[3],
                description: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
                parentId
            };
        });
      } catch (e) {
          console.error("Error loading worlds", e);
          return [];
      }
  }

  async deleteWorld(id: string) {
      if (!this.db) await this.init();
      this.db.run("DELETE FROM worlds WHERE id = ?", [id]);
      await this.persist();
  }

  // --- Persistence Layer (IndexedDB) ---

  private async persist() {
    const data = this.db.export();
    await this.saveToIndexedDB(data);
  }

  private saveToIndexedDB(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (e: any) => {
        e.target.result.createObjectStore('sqlite', { keyPath: 'id' });
      };

      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(['sqlite'], 'readwrite');
        const store = tx.objectStore('sqlite');
        store.put({ id: 'main', data: data });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (e: any) => {
        e.target.result.createObjectStore('sqlite', { keyPath: 'id' });
      };

      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(['sqlite'], 'readonly');
        const store = tx.objectStore('sqlite');
        const getReq = store.get('main');
        
        getReq.onsuccess = () => {
          resolve(getReq.result ? getReq.result.data : null);
        };
        getReq.onerror = () => reject(getReq.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DatabaseService();
