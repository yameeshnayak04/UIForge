import { UIRoot, PatchOperation } from './ast';

export interface PlanOutput {
  intent: string;
  components: string[];
  layout: string;
  patches?: PatchOperation[];
}

export interface GeneratorOutput {
  ast: UIRoot;
  code: string;
}

export interface ExplainerOutput {
  explanation: string;
  changes: string[];
}

export interface AgentRequest {
  action: 'generate' | 'modify' | 'regenerate';
  intent: string;
  currentAST?: UIRoot;
  currentCode?: string;
}

export interface AgentResponse {
  success: boolean;
  plan?: PlanOutput;
  ast?: UIRoot;
  code?: string;
  explanation?: string;
  error?: string;
  validationErrors?: string[];
}
