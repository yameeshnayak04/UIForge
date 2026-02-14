import { LLMProvider } from './provider';

const MOCK_RESPONSES: Record<string, any> = {
  dashboard: {
    plan: {
      intent: 'Create a dashboard with user statistics',
      components: ['Stack', 'Navbar', 'Card', 'Text', 'Chart'],
      layout: 'Navbar at top, vertical Stack with 3 Cards showing stats',
    },
    ast: {
      version: 1,
      title: 'Dashboard',
      description: 'User statistics dashboard',
      tree: {
        id: 'root',
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: [
          {
            id: 'navbar-1',
            type: 'Navbar',
            props: { logo: 'Dashboard', links: [{ label: 'Home', href: '#' }] },
            children: [],
          },
          {
            id: 'stack-cards',
            type: 'Stack',
            props: { direction: 'horizontal', gap: 'lg' },
            children: [
              {
                id: 'card-1',
                type: 'Card',
                props: { elevated: true },
                children: [
                  {
                    id: 'text-1',
                    type: 'Text',
                    props: { variant: 'h3', children: 'Total Users' },
                    children: [],
                  },
                  {
                    id: 'text-2',
                    type: 'Text',
                    props: { variant: 'h1', color: 'primary', children: '1,234' },
                    children: [],
                  },
                ],
              },
              {
                id: 'card-2',
                type: 'Card',
                props: { elevated: true },
                children: [
                  {
                    id: 'text-3',
                    type: 'Text',
                    props: { variant: 'h3', children: 'Revenue' },
                    children: [],
                  },
                  {
                    id: 'text-4',
                    type: 'Text',
                    props: { variant: 'h1', color: 'primary', children: '$45.2K' },
                    children: [],
                  },
                ],
              },
              {
  id: 'card-3',
  type: 'Card',
  props: { elevated: true, header: 'Recent Users' },
  children: [
    {
      id: 'table-1',
      type: 'Table',
      props: {
        columns: [
          { key: 'id', label: 'ID', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: false },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'joined', label: 'Joined', sortable: true }
        ],
        data: [
          { id: '001', name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', joined: '2024-01-15' },
          { id: '002', name: 'Bob Smith', email: 'bob@example.com', status: 'Active', joined: '2024-02-20' },
          { id: '003', name: 'Carol White', email: 'carol@example.com', status: 'Pending', joined: '2024-03-10' },
          { id: '004', name: 'David Brown', email: 'david@example.com', status: 'Active', joined: '2024-03-25' },
          { id: '005', name: 'Eve Davis', email: 'eve@example.com', status: 'Inactive', joined: '2024-04-01' },
          { id: '006', name: 'Frank Miller', email: 'frank@example.com', status: 'Active', joined: '2024-04-15' },
          { id: '007', name: 'Grace Lee', email: 'grace@example.com', status: 'Active', joined: '2024-05-01' },
          { id: '008', name: 'Henry Wilson', email: 'henry@example.com', status: 'Pending', joined: '2024-05-10' }
        ]
      },
      children: []
    }
  ]
}

            ],
          },
        ],
      },
    },
    explanation: {
      explanation: 'Created a dashboard layout with a navigation bar and three statistics cards showing total users, revenue, and a monthly chart.',
      changes: [
        'Added Navbar with logo and navigation links',
        'Created horizontal Stack for card layout',
        'Added three Cards with statistics and chart visualization',
      ],
    },
  },
  inventory: {
    plan: {
      intent: 'Create inventory management system',
      components: ['Stack', 'Navbar', 'Card', 'Table', 'Button'],
      layout: 'Navbar with table in card',
    },
    ast: {
      version: 1,
      title: 'Inventory System',
      description: 'Simple inventory management',
      tree: {
        id: 'root',
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: [
          {
            id: 'nav',
            type: 'Navbar',
            props: { logo: 'Inventory' },
            children: [],
          },
          {
            id: 'card',
            type: 'Card',
            props: { elevated: true, header: 'Items' },
            children: [
              {
                id: 'table',
                type: 'Table',
                props: {
                  columns: [
                    { key: 'id', label: 'ID', sortable: true },
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'qty', label: 'Quantity', sortable: true },
                  ],
                  data: [
                    { id: 'INV001', name: 'Mouse', qty: 150 },
                    { id: 'INV002', name: 'Keyboard', qty: 75 },
                    { id: 'INV003', name: 'Monitor', qty: 40 },
                  ],
                },
                children: [],
              },
            ],
          },
        ],
      },
    },
    explanation: {
      explanation: 'Created simple inventory system with table',
      changes: ['Added navbar', 'Added table with 3 sample items'],
    },
  },
  'login form': {
    plan: {
      intent: 'Create a login form',
      components: ['Stack', 'Card', 'Text', 'Input', 'Button'],
      layout: 'Centered Card with title, two inputs, and submit button',
    },
    ast: {
      version: 1,
      title: 'Login Form',
      description: 'User authentication form',
      tree: {
        id: 'root',
        type: 'Stack',
        props: { direction: 'vertical', align: 'center', gap: 'lg' },
        children: [
          {
            id: 'card-login',
            type: 'Card',
            props: { elevated: true },
            children: [
              {
                id: 'text-title',
                type: 'Text',
                props: { variant: 'h2', children: 'Login' },
                children: [],
              },
              {
                id: 'stack-form',
                type: 'Stack',
                props: { direction: 'vertical', gap: 'md' },
                children: [
                  {
                    id: 'input-email',
                    type: 'Input',
                    props: { type: 'email', label: 'Email', placeholder: 'Enter your email' },
                    children: [],
                  },
                  {
                    id: 'input-password',
                    type: 'Input',
                    props: { type: 'password', label: 'Password', placeholder: 'Enter your password' },
                    children: [],
                  },
                  {
                    id: 'button-submit',
                    type: 'Button',
                    props: { variant: 'primary', size: 'lg', children: 'Sign In' },
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    explanation: {
      explanation: 'Created a centered login form with email and password inputs and a submit button.',
      changes: [
        'Added centered Card container',
        'Created form with email and password inputs',
        'Added primary submit button',
      ],
    },
  },
  'settings page': {
    plan: {
      intent: 'Create a settings page',
      components: ['Stack', 'Sidebar', 'Card', 'Text', 'Input', 'Button'],
      layout: 'Sidebar on left with Stack of setting cards on right',
    },
    ast: {
      version: 1,
      title: 'Settings Page',
      description: 'Application settings interface',
      tree: {
        id: 'root',
        type: 'Stack',
        props: { direction: 'horizontal', gap: 'md' },
        children: [
          {
            id: 'sidebar-1',
            type: 'Sidebar',
            props: { collapsed: false },
            children: [
              {
                id: 'text-menu',
                type: 'Text',
                props: { variant: 'h3', children: 'Settings Menu' },
                children: [],
              },
            ],
          },
          {
            id: 'stack-content',
            type: 'Stack',
            props: { direction: 'vertical', gap: 'lg' },
            children: [
              {
                id: 'card-profile',
                type: 'Card',
                props: { header: 'Profile Settings' },
                children: [
                  {
                    id: 'input-name',
                    type: 'Input',
                    props: { label: 'Display Name', placeholder: 'Your name' },
                    children: [],
                  },
                  {
                    id: 'button-save-profile',
                    type: 'Button',
                    props: { variant: 'primary', children: 'Save Profile' },
                    children: [],
                  },
                ],
              },
              {
                id: 'card-notifications',
                type: 'Card',
                props: { header: 'Notification Settings' },
                children: [
                  {
                    id: 'input-email-notif',
                    type: 'Input',
                    props: { type: 'email', label: 'Notification Email', placeholder: 'email@example.com' },
                    children: [],
                  },
                  {
                    id: 'button-save-notif',
                    type: 'Button',
                    props: { variant: 'secondary', children: 'Update Notifications' },
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    explanation: {
      explanation: 'Created a settings page with collapsible sidebar and multiple setting cards for profile and notifications.',
      changes: [
        'Added Sidebar with settings menu',
        'Created Profile Settings card with name input',
        'Added Notification Settings card with email input',
      ],
    },
  },
};

export class MockProvider implements LLMProvider {
  async chat(prompt: string): Promise<string> {
    await this.simulateDelay();

    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('planner')) {
      return this.getPlanResponse(lowerPrompt);
    }

    if (lowerPrompt.includes('generator')) {
      return this.getGeneratorResponse(lowerPrompt);
    }

    if (lowerPrompt.includes('explainer')) {
      return this.getExplainerResponse(lowerPrompt);
    }

    return JSON.stringify({
      intent: 'default response',
      components: ['Card', 'Text'],
      layout: 'Simple card layout',
    });
  }

  private getPlanResponse(prompt: string): string {
    if (prompt.includes('patch') || prompt.includes('modification request')) {
      return JSON.stringify(this.getMockModifyPlan(prompt));
    }

    if (prompt.includes('dashboard')) {
      return JSON.stringify(MOCK_RESPONSES.dashboard.plan);
    }
    if (prompt.includes('login')) {
      return JSON.stringify(MOCK_RESPONSES['login form'].plan);
    }
    if (prompt.includes('settings')) {
      return JSON.stringify(MOCK_RESPONSES['settings page'].plan);
    }

    return JSON.stringify({
      intent: 'generic UI',
      components: ['Stack', 'Navbar', 'Card', 'Text', 'Button'],
      layout: 'Navbar on top, card content area with clear heading and primary action',
    });
  }

  private getGeneratorResponse(prompt: string): string {
    if (prompt.includes('dashboard')) {
      return JSON.stringify({
        ast: MOCK_RESPONSES.dashboard.ast,
        code: this.generateCode(MOCK_RESPONSES.dashboard.ast),
      });
    }
    if (prompt.includes('login')) {
      return JSON.stringify({
        ast: MOCK_RESPONSES['login form'].ast,
        code: this.generateCode(MOCK_RESPONSES['login form'].ast),
      });
    }
    if (prompt.includes('settings')) {
      return JSON.stringify({
        ast: MOCK_RESPONSES['settings page'].ast,
        code: this.generateCode(MOCK_RESPONSES['settings page'].ast),
      });
    }

    const genericAST = {
      version: 1,
      title: 'Workspace Overview',
      description: 'A deterministic starter layout',
      tree: {
        id: 'root',
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: [
          {
            id: 'navbar-1',
            type: 'Navbar',
            props: {
              logo: 'UIForge',
              links: [
                { label: 'Overview', href: '#' },
                { label: 'Reports', href: '#' },
              ],
            },
            children: [],
          },
          {
            id: 'card-1',
            type: 'Card',
            props: { elevated: true, header: 'Project Summary' },
            children: [
              {
                id: 'text-1',
                type: 'Text',
                props: { variant: 'h2', children: 'Team Velocity is up 12%' },
                children: [],
              },
              {
                id: 'text-2',
                type: 'Text',
                props: { variant: 'body', color: 'muted', children: 'Focus areas: onboarding, retention, and release reliability.' },
                children: [],
              },
              {
                id: 'button-1',
                type: 'Button',
                props: { variant: 'primary', children: 'View Details' },
                children: [],
              },
            ],
          },
        ],
      },
    };

    return JSON.stringify({
      ast: genericAST,
      code: this.generateCode(genericAST),
    });
  }

  private getExplainerResponse(prompt: string): string {
    if (prompt.includes('dashboard')) {
      return JSON.stringify(MOCK_RESPONSES.dashboard.explanation);
    }
    if (prompt.includes('login')) {
      return JSON.stringify(MOCK_RESPONSES['login form'].explanation);
    }
    if (prompt.includes('settings')) {
      return JSON.stringify(MOCK_RESPONSES['settings page'].explanation);
    }

    return JSON.stringify({
      explanation: 'Built a deterministic layout with clear hierarchy, meaningful labels, and action-first content.',
      changes: ['Added structural containers first', 'Filled visible content for text and actions'],
    });
  }

  private getMockModifyPlan(prompt: string): any {
    const patches: any[] = [];
    const components = ['Stack', 'Text'];
    const lower = prompt.toLowerCase();

    if (lower.includes('modal')) {
      components.push('Modal', 'Button');
      patches.push({
        op: 'add',
        parentId: 'root',
        node: {
          id: 'modal-settings',
          type: 'Modal',
          props: { isOpen: true, title: 'Settings' },
          children: [
            {
              id: 'modal-settings-text',
              type: 'Text',
              props: { variant: 'body', children: 'Adjust workspace preferences and notifications.' },
              children: [],
            },
          ],
        },
      });
    }

    if (lower.includes('minimal')) {
      patches.push({
        op: 'update',
        nodeId: 'root',
        props: { gap: 'sm' },
      });
    }

    if (patches.length === 0) {
      patches.push({
        op: 'add',
        parentId: 'root',
        node: {
          id: 'update-note',
          type: 'Text',
          props: { variant: 'caption', color: 'muted', children: 'UI updated based on your latest instruction.' },
          children: [],
        },
      });
    }

    return {
      intent: 'Apply incremental UI updates',
      components,
      layout: 'Patch existing tree with minimal structural changes',
      patches,
    };
  }

  private generateCode(ast: any): string {
    return `import { ASTRenderer } from '@/ui/renderer/ASTRenderer';

export default function GeneratedUI() {
  const ast = ${JSON.stringify(ast.tree, null, 2)};
  
  return <ASTRenderer ast={ast} />;
}`;
  }

  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
