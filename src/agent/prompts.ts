import { UIRoot } from '@/types';

const COMPONENT_WHITELIST = [
  'Button', 'Card', 'Input', 'Table', 'Modal', 
  'Sidebar', 'Navbar', 'Chart', 'Stack', 'Text'
];

export function buildPlannerPrompt(
  intent: string,
  currentAST?: UIRoot,
  isModify: boolean = false
): string {
  if (!isModify) {
    return `You are the Planner agent in a deterministic UI system.

  Your job: analyze user intent and produce a structured plan using only whitelisted components.

ALLOWED COMPONENTS (WHITELIST):
${COMPONENT_WHITELIST.join(', ')}

  Rules:
  - Use ONLY whitelisted components.
  - Prefer meaningful visible content (titles, labels, button text, table data).
  - Keep hierarchy simple and coherent.
  - Do not mention custom CSS/classes or new components.

USER INTENT:
"""${intent}"""

  Create a plan that selects components and defines layout structure.

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "intent": "brief summary of user intent",
  "components": ["Component1", "Component2"],
  "layout": "description of layout structure (how components are nested)"
}

Example output:
{
  "intent": "dashboard with stats cards",
  "components": ["Stack", "Card", "Text", "Chart"],
  "layout": "Vertical Stack containing 3 Cards, each with a Text header and Chart"
}`;
  }

  return `You are the Planner agent for incremental UI editing.

Your output must be PATCH-ONLY for existing UI updates.

ALLOWED COMPONENTS (WHITELIST):
${COMPONENT_WHITELIST.join(', ')}

CURRENT UI AST:
${JSON.stringify(currentAST, null, 2)}

USER MODIFICATION REQUEST:
"""${intent}"""

Rules:
- Do NOT recreate whole tree.
- Generate minimal patch operations.
- Preserve existing structure unless user asked for rewrite.
- If user asks to "add" something, use add patch.
- If user asks to "change" text/props, use update patch.
- Use valid nodeId/parentId from current AST.

PATCH OPERATIONS:
- add: { op: "add", parentId: "id", node: {...} }
- remove: { op: "remove", nodeId: "id" }
- update: { op: "update", nodeId: "id", props: {...} }
- move: { op: "move", nodeId: "id", parentId: "newParentId" }

OUTPUT FORMAT (JSON ONLY):
{
  "intent": "summary of modification",
  "components": ["used components"],
  "layout": "how structure changes",
  "patches": [patch operations array]
}`;
}

export function buildGeneratorPrompt(
  plan: any,
  currentAST?: UIRoot
): string {
  const hasPatches = plan.patches && plan.patches.length > 0;

  if (hasPatches && currentAST) {
    return `You are the Generator agent.

Input already includes patch plan.
Generate final AST (after patches) with complete, meaningful props/content.
Respond with ONLY valid JSON.

CURRENT AST:
${JSON.stringify(currentAST, null, 2)}

PLAN:
${JSON.stringify(plan, null, 2)}

Apply patches and generate final AST + React code.

CONSTRAINTS:
- ONLY use: ${COMPONENT_WHITELIST.join(', ')}
- NO inline styles, CSS classes, or external libraries
- Every visible section must have meaningful content
- Text/Button must have non-empty labels
- Table/Chart must have non-empty data

RESPONSE (JSON only):
{
  "ast": { "version": 1, "title": "string", "description": "string", "tree": {...} },
  "code": "import { Stack } from '@/ui/components';\\nexport default function GeneratedUI() { return <Stack />; }"
}`;
  }

  return `Generate UI AST from plan. Respond with ONLY valid JSON.

CRITICAL RULES:
- Keep output concise to avoid truncation
- Use only whitelisted components
- No inline styles/classes
- Include meaningful content (not empty placeholders)

Data rules:
- For tables: Use ONLY 3-4 sample rows (not 10+)
- For charts: Use 3-5 points
- For text/buttons: non-empty user-facing labels

PLAN:
${JSON.stringify(plan, null, 2)}

CONSTRAINTS:
- ONLY use: ${COMPONENT_WHITELIST.join(', ')}
- NO inline styles or arbitrary classes
- Keep data SMALL - 3-4 table rows maximum

Each node needs:
- id: string (e.g., "card-1")
- type: component name from whitelist
- props: object (KEEP MINIMAL)
- children: array (optional)

RESPONSE FORMAT (JSON only, start with { end with }):
{
  "ast": {
    "version": 1,
    "title": "Brief title",
    "description": "Short description",
    "tree": {
      "id": "root",
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "md" },
      "children": [
        {
          "id": "table-1",
          "type": "Table",
          "props": {
            "columns": [
              { "key": "id", "label": "ID", "sortable": true },
              { "key": "name", "label": "Name", "sortable": true }
            ],
            "data": [
              { "id": "1", "name": "Item 1" },
              { "id": "2", "name": "Item 2" },
              { "id": "3", "name": "Item 3" }
            ]
          },
          "children": []
        }
      ]
    }
  },
  "code": "import { Stack, Table } from '@/ui/components';\\n\\nexport default function GeneratedUI() {\\n  const cols = [{key:'id',label:'ID',sortable:true},{key:'name',label:'Name',sortable:true}];\\n  const data = [{id:'1',name:'Item 1'},{id:'2',name:'Item 2'},{id:'3',name:'Item 3'}];\\n  return <Stack direction=\\"vertical\\" gap=\\"md\\"><Table columns={cols} data={data} /></Stack>;\\n}"
}

REMEMBER: Keep table data to 3-4 rows MAX. No large datasets!`;
}




export function buildExplainerPrompt(
  plan: any,
  ast: UIRoot,
  previousAST?: UIRoot
): string {
  const isModification = !!previousAST;

  if (isModification) {
    return `You are a UI explanation agent. Explain what changed and why.

PREVIOUS AST:
${JSON.stringify(previousAST, null, 2)}

NEW AST:
${JSON.stringify(ast, null, 2)}

PLAN:
${JSON.stringify(plan, null, 2)}

Explain the modifications made to the UI and the reasoning behind component choices.

OUTPUT FORMAT (JSON ONLY):
{
  "explanation": "overall explanation of changes",
  "changes": ["specific change 1", "specific change 2"]
}`;
  }

  return `You are a UI explanation agent. Explain the UI design decisions.

PLAN:
${JSON.stringify(plan, null, 2)}

AST:
${JSON.stringify(ast, null, 2)}

Explain why these components were chosen and how the layout serves the user's intent.

OUTPUT FORMAT (JSON ONLY):
{
  "explanation": "overall explanation of the UI design",
  "changes": ["design decision 1", "design decision 2"]
}`;
}
