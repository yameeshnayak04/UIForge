import { 
  AgentRequest, 
  AgentResponse, 
  PlanOutput, 
  GeneratorOutput,
  ExplainerOutput 
} from '@/types';
import { LLMProvider } from '@/lib/llm/provider';
import { 
  PlanOutputSchema, 
  GeneratorOutputSchema, 
  ExplainerOutputSchema,
  validateComponentWhitelist,
  validatePropsForDangerousContent,
  validateComponentContracts,
} from './validators';
import { buildPlannerPrompt, buildGeneratorPrompt, buildExplainerPrompt } from './prompts';
import { applyPatches } from './patch';
import { detectInjection, sanitizeInput } from './injection-filter';
import { generateExpandedCode } from '@/lib/code-generator';

export class AgentOrchestrator {
  constructor(private provider: LLMProvider) {}

  async execute(request: AgentRequest): Promise<AgentResponse> {
    try {
      const injectionCheck = detectInjection(request.intent);
      if (!injectionCheck.safe) {
        return {
          success: false,
          error: `Security check failed: ${injectionCheck.reason}`,
        };
      }

      const safeIntent = sanitizeInput(request.intent);

      const isModify = request.action === 'modify';
      const isRegenerate = request.action === 'regenerate';

      const plan = await this.runPlanner(
        safeIntent,
        request.currentAST,
        isModify
      );

      if (!plan.success) {
        return plan;
      }

      const generator = await this.runGenerator(
        plan.plan!,
        isModify ? request.currentAST : undefined,
        isModify
      );

      if (!generator.success) {
        return generator;
      }

      const explainer = await this.runExplainer(
        plan.plan!,
        generator.ast!,
        request.currentAST
      );

      return {
        success: true,
        plan: plan.plan,
        ast: generator.ast,
        code: generator.code,
        explanation: explainer.explanation || 'UI generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async runPlanner(
    intent: string,
    currentAST?: any,
    isModify: boolean = false
  ): Promise<AgentResponse> {
    try {
      const prompt = buildPlannerPrompt(intent, currentAST, isModify);
      const response = await this.provider.chat(prompt);

      const parsed = this.parseJSON(response);
      const validated = PlanOutputSchema.safeParse(parsed);

      if (!validated.success) {
        return {
          success: false,
          error: 'Planner output validation failed',
          validationErrors: validated.error.issues.map((e) => e.message),
        };
      }

      if (isModify && (!validated.data.patches || validated.data.patches.length === 0)) {
        return {
          success: false,
          error: 'Planner failed to generate incremental patch operations for modify request',
        };
      }

      return {
        success: true,
        plan: validated.data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Planner failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async runGenerator(
  plan: PlanOutput,
  currentAST?: any,
  isModify: boolean = false,
  retries: number = 2
): Promise<AgentResponse> {
  if (isModify && currentAST && plan.patches && plan.patches.length > 0) {
    try {
      const patchedTree = applyPatches(currentAST.tree, plan.patches);
      this.normalizeNode(patchedTree);
      const finalAST = {
        ...currentAST,
        title: currentAST.title || plan.intent || 'Updated UI',
        description: currentAST.description || 'Incrementally updated UI',
        tree: patchedTree,
      };

      const componentErrors = validateComponentWhitelist(finalAST.tree);
      const contractErrors = validateComponentContracts(finalAST.tree);
      const propsErrors = this.validateAllProps(finalAST.tree);
      const allErrors = [...componentErrors, ...contractErrors, ...propsErrors];

      if (allErrors.length > 0) {
        return {
          success: false,
          error: 'Patch output validation failed',
          validationErrors: allErrors,
        };
      }

      return {
        success: true,
        ast: finalAST,
        code: generateExpandedCode(finalAST.tree),
      };
    } catch (error) {
      return {
        success: false,
        error: `Patch application failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🎯 Generator attempt ${attempt}/${retries}`);
      
      const prompt = buildGeneratorPrompt(plan, currentAST);
      const response = await this.provider.chat(prompt);
      
      const parsed = this.parseJSON(response);
      const validated = GeneratorOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(`❌ Validation failed on attempt ${attempt}:`, validated.error.issues);
        
        if (attempt < retries) {
          console.log(`🔄 Retrying...`);
          continue;
        }
        
        return {
          success: false,
          error: 'Generator output validation failed',
          validationErrors: validated.error.issues.map((e) => e.message),
        };
      }

      let finalAST = validated.data.ast;
      this.normalizeNode(finalAST.tree);

      if (isModify && (!plan.patches || plan.patches.length === 0)) {
        return {
          success: false,
          error: 'Modify requests must produce patch operations. Try a clearer modification prompt.',
        };
      }

      const componentErrors = validateComponentWhitelist(finalAST.tree);
      const contractErrors = validateComponentContracts(finalAST.tree);
      const propsErrors = this.validateAllProps(finalAST.tree);
      const allErrors = [...componentErrors, ...contractErrors, ...propsErrors];

      if (allErrors.length > 0) {
        return {
          success: false,
          error: 'Generated AST validation failed',
          validationErrors: allErrors,
        };
      }

      console.log('✅ Generator succeeded');
      return {
        success: true,
        ast: finalAST,
        code: generateExpandedCode(finalAST.tree),
      };
    } catch (error) {
      console.error(`❌ Generator error on attempt ${attempt}:`, error);
      
      if (attempt < retries) {
        console.log(`🔄 Retrying...`);
        continue;
      }
      
      return {
        success: false,
        error: `Generator failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  return {
    success: false,
    error: 'Generator failed: max retries reached',
  };
}



  private async runExplainer(
    plan: PlanOutput,
    ast: any,
    previousAST?: any
  ): Promise<AgentResponse> {
    const useLLMExplainer = process.env.LLM_EXPLAINER === 'true';

    if (!useLLMExplainer) {
      return {
        success: true,
        explanation: this.buildDeterministicExplanation(plan, previousAST),
      };
    }

    try {
      const prompt = buildExplainerPrompt(plan, ast, previousAST);
      const response = await this.provider.chat(prompt);

      const parsed = this.parseJSON(response);
      const validated = ExplainerOutputSchema.safeParse(parsed);

      if (!validated.success) {
        return {
          success: true,
          explanation: 'UI generated successfully (explanation unavailable)',
        };
      }

      return {
        success: true,
        explanation: validated.data.explanation,
      };
    } catch (error) {
      return {
        success: true,
        explanation: 'UI generated successfully (explanation unavailable)',
      };
    }
  }

  private buildDeterministicExplanation(plan: PlanOutput, previousAST?: any): string {
    const components = (plan.components || []).slice(0, 6).join(', ');
    const layout = plan.layout || 'structured layout';

    if (previousAST && plan.patches && plan.patches.length > 0) {
      const addCount = plan.patches.filter((patch) => patch.op === 'add').length;
      const updateCount = plan.patches.filter((patch) => patch.op === 'update').length;
      const removeCount = plan.patches.filter((patch) => patch.op === 'remove').length;
      const moveCount = plan.patches.filter((patch) => patch.op === 'move').length;

      return `Applied incremental updates using whitelisted components (${components || 'no additional components'}). ` +
        `Layout change: ${layout}. ` +
        `Patch summary: ${addCount} add, ${updateCount} update, ${removeCount} remove, ${moveCount} move. ` +
        `This preserves existing structure unless explicitly changed.`;
    }

    return `Generated a deterministic UI using whitelisted components (${components || 'none specified'}). ` +
      `Layout decision: ${layout}. ` +
      `The structure prioritizes clear hierarchy and visible content for each selected component.`;
  }

  private parseJSON(text: string): any {
    let cleaned = text.trim();  
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }   
    const start = cleaned.indexOf('{');
    if (start >= 0) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      let end = -1;

      for (let i = start; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === '"') {
            inString = false;
          }
          continue;
        }

        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }

      if (end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }
    }
    // Log what we're trying to parse
    console.log('Attempting to parse JSON, preview:', cleaned.substring(0, 200));   
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse error. Raw text:', cleaned);
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  private validateAllProps(node: any): string[] {
    const errors = validatePropsForDangerousContent(node.props);

    if (node.children) {
      for (const child of node.children) {
        errors.push(...this.validateAllProps(child));
      }
    }

    return errors;
  }

  private normalizeNode(node: any): void {
    if (!node || typeof node !== 'object') return;

    if (!node.props || typeof node.props !== 'object') {
      node.props = {};
    }

    if (!Array.isArray(node.children)) {
      node.children = [];
    }

    switch (node.type) {
      case 'Button': {
        const label = typeof node.props.children === 'string' ? node.props.children.trim() : '';
        if (!label && node.children.length === 0) {
          node.props.children = 'Action';
        }
        break;
      }
      case 'Text': {
        const text = typeof node.props.children === 'string' ? node.props.children.trim() : '';
        if (!text && node.children.length === 0) {
          node.props.children = 'Text';
        }
        if (!node.props.variant) {
          node.props.variant = 'body';
        }
        break;
      }
      case 'Input': {
        if (!node.props.label && !node.props.placeholder) {
          node.props.placeholder = 'Enter value';
        }
        break;
      }
      case 'Card': {
        if (node.children.length === 0) {
          node.children.push({
            id: `${node.id}-text`,
            type: 'Text',
            props: { variant: 'body', children: 'Card content' },
            children: [],
          });
        }
        break;
      }
      case 'Modal': {
        if (typeof node.props.isOpen !== 'boolean') {
          node.props.isOpen = true;
        }
        if (node.children.length === 0) {
          node.children.push({
            id: `${node.id}-text`,
            type: 'Text',
            props: { variant: 'body', children: 'Modal content' },
            children: [],
          });
        }
        break;
      }
      case 'Table': {
        if (!Array.isArray(node.props.columns) || node.props.columns.length === 0) {
          node.props.columns = [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
          ];
        }
        if (!Array.isArray(node.props.data) || node.props.data.length === 0) {
          node.props.data = [
            { name: 'Item 1', value: 'A' },
            { name: 'Item 2', value: 'B' },
            { name: 'Item 3', value: 'C' },
          ];
        }
        break;
      }
      case 'Chart': {
        if (!['bar', 'line', 'pie'].includes(node.props.type)) {
          node.props.type = 'bar';
        }
        if (!Array.isArray(node.props.data) || node.props.data.length === 0) {
          node.props.data = [
            { label: 'A', value: 10 },
            { label: 'B', value: 20 },
            { label: 'C', value: 15 },
          ];
        }
        break;
      }
      default:
        break;
    }

    for (const child of node.children) {
      this.normalizeNode(child);
    }
  }
}
