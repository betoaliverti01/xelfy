import { supabase, isSupabaseConfigured } from './supabaseClient';

const TABLE_MAP = {
  Account: 'accounts',
  AppSettings: 'app_settings',
  CatalogItem: 'catalog_items',
  Category: 'categories',
  Client: 'clients',
  Event: 'events',
  Financial: 'financials',
  Inventory: 'inventory',
  OnlineStore: 'online_store',
  Order: 'orders',
  ProductRecipe: 'product_recipes',
  ReadNotification: 'read_notifications',
  Transfer: 'transfers',
};

function createEntityHandler(entityName) {
  const table = TABLE_MAP[entityName] || entityName.toLowerCase();

  return {
    async list(sort = '-created_date', limit = 100) {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        return stored ? JSON.parse(stored) : [];
      }
      let query = supabase.from(table).select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const col = desc ? sort.slice(1) : sort;
        query = query.order(col, { ascending: !desc });
      }
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) {
        console.error(`Erro ao listar ${table}:`, error);
        return [];
      }
      return data || [];
    },

    async filter(filterObj = {}, sort, limit) {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        const all = stored ? JSON.parse(stored) : [];
        return all.filter((item) => {
          return Object.entries(filterObj).every(([k, v]) => item[k] === v);
        });
      }
      let query = supabase.from(table).select('*');
      for (const [k, v] of Object.entries(filterObj)) {
        if (v !== undefined) {
          query = query.eq(k, v);
        }
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const col = desc ? sort.slice(1) : sort;
        query = query.order(col, { ascending: !desc });
      }
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) {
        console.error(`Erro ao filtrar ${table}:`, error);
        return [];
      }
      return data || [];
    },

    async get(id) {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        const all = stored ? JSON.parse(stored) : [];
        return all.find((item) => item.id === id) || null;
      }
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) {
        console.error(`Erro ao buscar ${table} id ${id}:`, error);
        return null;
      }
      return data;
    },

    async create(itemData) {
      const payload = {
        ...itemData,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        const all = stored ? JSON.parse(stored) : [];
        const newItem = { id: crypto.randomUUID(), ...payload };
        all.unshift(newItem);
        localStorage.setItem(`xelfy_${table}`, JSON.stringify(all));
        return newItem;
      }
      const { data: created, error } = await supabase.from(table).insert([payload]).select().single();
      if (error) throw error;
      return created;
    },

    async update(id, itemData) {
      const payload = {
        ...itemData,
        updated_date: new Date().toISOString(),
      };

      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        const all = stored ? JSON.parse(stored) : [];
        const idx = all.findIndex((item) => item.id === id);
        if (idx !== -1) {
          all[idx] = { ...all[idx], ...payload };
          localStorage.setItem(`xelfy_${table}`, JSON.stringify(all));
          return all[idx];
        }
        return payload;
      }
      const { data: updated, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return updated;
    },

    async delete(id) {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(`xelfy_${table}`);
        const all = stored ? JSON.parse(stored) : [];
        const filtered = all.filter((item) => item.id !== id);
        localStorage.setItem(`xelfy_${table}`, JSON.stringify(filtered));
        return { success: true };
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

export const base44 = {
  auth: {
    async me() {
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
          };
        }
      }
      // Usuário padrão local ou fallback
      return {
        id: 'owner-user',
        email: 'robertoalivertimkt@gmail.com',
        name: 'Roberto Aliverti',
      };
    },

    async loginViaEmailPassword(email, password) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
      }
      return { email };
    },

    async register({ email, password }) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data.user;
      }
      return { email };
    },

    async logout() {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      window.location.reload();
    },

    redirectToLogin() {
      window.location.href = '/login';
    },
  },

  entities: new Proxy({}, {
    get(target, prop) {
      if (!target[prop]) {
        target[prop] = createEntityHandler(prop);
      }
      return target[prop];
    },
  }),

  integrations: {
    Core: {
      async UploadFile({ file }) {
        if (!file) return { file_url: '' };
        if (isSupabaseConfigured) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { error } = await supabase.storage.from('xelfy-media').upload(fileName, file);
          if (error) {
            console.error('Erro no upload para Supabase Storage:', error);
          } else {
            const { data } = supabase.storage.from('xelfy-media').getPublicUrl(fileName);
            return { file_url: data.publicUrl };
          }
        }
        // Fallback local caso Storage ainda não esteja configurado
        return { file_url: URL.createObjectURL(file) };
      },
    },
  },
};

export default base44;
