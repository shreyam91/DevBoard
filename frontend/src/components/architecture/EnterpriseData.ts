export const generateEnterpriseData = () => {
  const nodes: any[] = [];
  const edges: any[] = [];

  // Helper to add nodes
  const addNode = (id: string, label: string, type: string, color: string, icon: string, parentNode?: string, extraData: any = {}) => {
    nodes.push({
      id,
      type,
      parentNode,
      data: { label, color, icon, ...extraData },
      position: { x: 0, y: 0 }, // elkjs will calculate this
    });
  };

  const addEdge = (source: string, target: string, type: string, color: string, label?: string, packetColor?: string) => {
    edges.push({
      id: `${source}-${target}`,
      source,
      target,
      type,
      data: { color, label, packetColor: packetColor || color },
      animated: true,
    });
  };

  // ROOT CATEGORIES (Group Nodes)
  addNode('frontend', 'Frontend', 'groupNode', 'blue', 'layout', undefined, { width: 500, height: 400 });
  addNode('backend', 'Backend (API Layer)', 'groupNode', 'purple', 'server', undefined, { width: 600, height: 450 });
  addNode('database', 'Database Layer', 'groupNode', 'green', 'database', undefined, { width: 400, height: 450 });
  addNode('services', 'Microservices', 'groupNode', 'orange', 'layers', undefined, { width: 500, height: 300 });
  addNode('external', 'External Integrations', 'groupNode', 'slate', 'globe', undefined, { width: 400, height: 200 });

  // FRONTEND CHILDREN
  addNode('fe_app', 'App Shell', 'detailNode', 'blue', 'layout', 'frontend', { subtitle: 'Next.js App Router' });
  addNode('fe_pages', 'Pages / Routes', 'detailNode', 'blue', 'folder', 'frontend', { count: 12 });
  addNode('fe_components', 'Shared Components', 'detailNode', 'cyan', 'code', 'frontend', { count: 45 });
  addNode('fe_state', 'State Management', 'detailNode', 'pink', 'activity', 'frontend', { subtitle: 'Zustand / Redux' });
  addNode('fe_api', 'API Client', 'detailNode', 'purple', 'globe', 'frontend', { subtitle: 'Axios Interceptors' });

  // BACKEND CHILDREN
  addNode('be_routes', 'API Routes', 'detailNode', 'purple', 'globe', 'backend', { subtitle: 'REST Endpoints' });
  addNode('be_auth', 'Authentication', 'detailNode', 'red', 'auth', 'backend', { subtitle: 'JWT / RBAC Middleware' });
  addNode('be_controllers', 'Controllers', 'detailNode', 'slate', 'code', 'backend', { count: 18 });
  addNode('be_services', 'Business Logic', 'detailNode', 'orange', 'server', 'backend', { count: 24 });
  addNode('be_repo', 'Repositories (ORM)', 'detailNode', 'green', 'database', 'backend', { subtitle: 'Prisma Client' });
  addNode('be_queue', 'Background Workers', 'detailNode', 'yellow', 'activity', 'backend', { subtitle: 'BullMQ / Redis' });

  // DATABASE CHILDREN (Cylinder Tables)
  addNode('db_users', 'Users Table', 'databaseTableNode', 'green', 'database', 'database', { 
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true },
      { name: 'email', type: 'String' },
      { name: 'password_hash', type: 'String' },
      { name: 'role', type: 'Enum' },
      { name: 'created_at', type: 'DateTime' }
    ]
  });
  
  addNode('db_orders', 'Orders Table', 'databaseTableNode', 'green', 'database', 'database', { 
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true },
      { name: 'user_id', type: 'UUID' },
      { name: 'total', type: 'Decimal' },
      { name: 'status', type: 'Enum' },
      { name: 'created_at', type: 'DateTime' }
    ]
  });
  
  addNode('db_products', 'Products Table', 'databaseTableNode', 'green', 'database', 'database', { 
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true },
      { name: 'name', type: 'String' },
      { name: 'price', type: 'Decimal' },
      { name: 'inventory', type: 'Int' }
    ]
  });

  // MICROSERVICES
  addNode('ms_payment', 'Payment Service', 'detailNode', 'orange', 'server', 'services', { status: 'ok' });
  addNode('ms_email', 'Email Service', 'detailNode', 'orange', 'server', 'services', { status: 'ok' });
  addNode('ms_search', 'Search Service', 'detailNode', 'orange', 'server', 'services', { status: 'ok' });

  // EXTERNAL
  addNode('ext_stripe', 'Stripe API', 'detailNode', 'slate', 'globe', 'external', { subtitle: 'Payment Gateway' });
  addNode('ext_sendgrid', 'SendGrid', 'detailNode', 'slate', 'globe', 'external', { subtitle: 'SMTP Relay' });
  addNode('ext_aws', 'AWS S3', 'detailNode', 'slate', 'storage', 'external', { subtitle: 'Blob Storage' });
  addNode('ext_redis', 'Redis Cache', 'detailNode', 'yellow', 'database', 'external');

  // EDGES - Frontend internal
  addEdge('fe_app', 'fe_pages', 'glowingEdge', '#60a5fa');
  addEdge('fe_pages', 'fe_components', 'glowingEdge', '#60a5fa');
  addEdge('fe_pages', 'fe_state', 'glowingEdge', '#60a5fa');
  addEdge('fe_pages', 'fe_api', 'animatedFlowEdge', '#c084fc', 'fetch()');
  
  // EDGES - Frontend to Backend
  addEdge('fe_api', 'be_routes', 'animatedFlowEdge', '#a855f7', 'HTTP REST', '#f0abfc');

  // EDGES - Backend internal
  addEdge('be_routes', 'be_auth', 'glowingEdge', '#f43f5e', 'verify');
  addEdge('be_routes', 'be_controllers', 'glowingEdge', '#94a3b8');
  addEdge('be_controllers', 'be_services', 'glowingEdge', '#fb923c');
  addEdge('be_services', 'be_repo', 'glowingEdge', '#34d399');
  addEdge('be_services', 'be_queue', 'animatedFlowEdge', '#eab308', 'dispatch');

  // EDGES - Backend to Database
  addEdge('be_repo', 'db_users', 'animatedFlowEdge', '#10b981', 'SELECT/INSERT', '#6ee7b7');
  addEdge('be_repo', 'db_orders', 'animatedFlowEdge', '#10b981', 'QUERY', '#6ee7b7');
  addEdge('be_repo', 'db_products', 'animatedFlowEdge', '#10b981', 'QUERY', '#6ee7b7');

  // EDGES - Database Relationships
  addEdge('db_users', 'db_orders', 'animatedFlowEdge', '#3b82f6', '1:N', '#93c5fd');
  addEdge('db_products', 'db_orders', 'animatedFlowEdge', '#f97316', 'N:M', '#fdba74');

  // EDGES - Backend to Microservices
  addEdge('be_services', 'ms_payment', 'animatedFlowEdge', '#f97316', 'gRPC');
  addEdge('be_queue', 'ms_email', 'animatedFlowEdge', '#eab308', 'consume');
  addEdge('be_services', 'ms_search', 'glowingEdge', '#f97316');

  // EDGES - Microservices to External
  addEdge('ms_payment', 'ext_stripe', 'animatedFlowEdge', '#64748b', 'Webhook', '#cbd5e1');
  addEdge('ms_email', 'ext_sendgrid', 'animatedFlowEdge', '#64748b', 'SMTP');
  addEdge('ms_search', 'ext_redis', 'glowingEdge', '#eab308');

  return { nodes, edges };
};
