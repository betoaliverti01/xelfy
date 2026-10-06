#!/usr/bin/env node
/**
 * Xelfy MCP Server
 * Autonomous Model Context Protocol (MCP) server for Xelfy
 * Provides direct tool access to Supabase database tables and business logic.
 */

const readline = require('readline');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cxqmqmlyizduqojihzwc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cW1xbWx5aXpkdXFvamloendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMzczMTMsImV4cCI6MjEwNjgxMzMxM30.ceTHZbYhwDTEaS5ZYIJwUS6z03P8a1EzZXV2Ks_qvzA';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const AVAILABLE_TABLES = [
  'Order',
  'Financial',
  'CatalogItem',
  'Client',
  'Inventory',
  'ProductRecipe',
  'Account',
  'Transfer',
  'AppSettings',
  'OnlineStore',
  'ReadNotification',
  'Event',
  'Schedule'
];

const TOOLS = [
  {
    name: 'xelfy_list_tables',
    description: 'Lista todas as tabelas e entidades disponíveis no banco de dados do Xelfy.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'xelfy_query_table',
    description: 'Consulta registros de uma tabela do Xelfy com suporte a filtros e limite.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Nome da tabela (ex: Order, Financial, Client, CatalogItem, Inventory)',
          enum: AVAILABLE_TABLES
        },
        limit: {
          type: 'number',
          description: 'Número máximo de registros a retornar (padrão: 20)'
        },
        order: {
          type: 'string',
          description: 'Coluna e direção de ordenação (ex: created_date.desc, id.asc)'
        },
        filters: {
          type: 'object',
          description: 'Filtros chave-valor para busca exata (ex: { "status": "Pendente" })'
        }
      },
      required: ['table']
    }
  },
  {
    name: 'xelfy_insert_record',
    description: 'Insere um novo registro em uma tabela do Xelfy.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Nome da tabela',
          enum: AVAILABLE_TABLES
        },
        data: {
          type: 'object',
          description: 'Dados a serem inseridos (campos da entidade)'
        }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'xelfy_update_record',
    description: 'Atualiza um registro existente no Xelfy pelo seu ID.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Nome da tabela',
          enum: AVAILABLE_TABLES
        },
        id: {
          type: 'string',
          description: 'ID ou UUID do registro a ser atualizado'
        },
        data: {
          type: 'object',
          description: 'Campos a atualizar'
        }
      },
      required: ['table', 'id', 'data']
    }
  },
  {
    name: 'xelfy_delete_record',
    description: 'Remove um registro de uma tabela do Xelfy pelo seu ID.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Nome da tabela',
          enum: AVAILABLE_TABLES
        },
        id: {
          type: 'string',
          description: 'ID ou UUID do registro a remover'
        }
      },
      required: ['table', 'id']
    }
  },
  {
    name: 'xelfy_get_dashboard_summary',
    description: 'Obtém um resumo executivo do negócio (total de pedidos, contas a receber, faturamento e clientes).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function handleToolCall(name, args) {
  try {
    switch (name) {
      case 'xelfy_list_tables': {
        return {
          tables: AVAILABLE_TABLES,
          backend: 'Supabase PostgreSQL (xelfy)',
          project_url: SUPABASE_URL
        };
      }

      case 'xelfy_query_table': {
        const { table, limit = 20, order, filters = {} } = args;
        if (!AVAILABLE_TABLES.includes(table)) {
          throw new Error(`Tabela '${table}' desconhecida. Tabelas válidas: ${AVAILABLE_TABLES.join(', ')}`);
        }

        const params = new URLSearchParams();
        params.set('select', '*');
        params.set('limit', String(limit));

        if (order) {
          params.set('order', order);
        }

        for (const [key, val] of Object.entries(filters)) {
          params.set(key, `eq.${val}`);
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
          method: 'GET',
          headers: HEADERS
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro Supabase (${res.status}): ${errText}`);
        }

        const data = await res.json();
        return { table, count: data.length, records: data };
      }

      case 'xelfy_insert_record': {
        const { table, data } = args;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ao inserir no Supabase (${res.status}): ${errText}`);
        }

        const created = await res.json();
        return { success: true, created };
      }

      case 'xelfy_update_record': {
        const { table, id, data } = args;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ao atualizar no Supabase (${res.status}): ${errText}`);
        }

        const updated = await res.json();
        return { success: true, updated };
      }

      case 'xelfy_delete_record': {
        const { table, id } = args;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: 'DELETE',
          headers: HEADERS
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ao deletar no Supabase (${res.status}): ${errText}`);
        }

        return { success: true, deleted_id: id };
      }

      case 'xelfy_get_dashboard_summary': {
        // Fetch summary from Order and Financial
        const [ordersRes, finRes, clientsRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/Order?select=id,status,total_amount&limit=100`, { headers: HEADERS }),
          fetch(`${SUPABASE_URL}/rest/v1/Financial?select=id,type,status,amount&limit=100`, { headers: HEADERS }),
          fetch(`${SUPABASE_URL}/rest/v1/Client?select=id&limit=100`, { headers: HEADERS })
        ]);

        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const financials = finRes.ok ? await finRes.json() : [];
        const clients = clientsRes.ok ? await clientsRes.json() : [];

        const totalRevenue = financials
          .filter(f => f.type === 'Receita' && f.status === 'Pago')
          .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

        const openReceivables = financials
          .filter(f => f.type === 'Receita' && f.status === 'Aberto')
          .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

        const pendingOrders = orders.filter(o => o.status === 'Pendente').length;

        return {
          total_orders: orders.length,
          pending_orders: pendingOrders,
          total_clients: clients.length,
          received_revenue: totalRevenue,
          open_receivables: openReceivables
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (err) {
    return { error: err.message };
  }
}

// JSON-RPC stdio protocol loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;

  try {
    const msg = JSON.parse(line);
    const { id, method, params } = msg;

    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'xelfy-mcp-server',
            version: '1.0.0'
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (method === 'notifications/initialized') {
      // No response needed for notification
      return;
    }

    if (method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: {} }) + '\n');
      return;
    }

    if (method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;
      const res = await handleToolCall(name, toolArgs || {});
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(res, null, 2)
            }
          ]
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    // Default method not found
    if (id !== undefined) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method '${method}' not found` }
      }) + '\n');
    }
  } catch (e) {
    process.stderr.write(`Error processing line: ${e.message}\n`);
  }
});
