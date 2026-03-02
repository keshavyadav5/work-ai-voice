import { Scenario } from '../../types';
import { callingAgent } from './calling';
import { customerSupportAgent } from './support';
import { technicalAssistant } from './technical';

// Registry of all available scenarios
const scenarios: Record<string, Scenario> = {
    'calling-agent': callingAgent,
    'customer-support': customerSupportAgent,
    'technical-assistant': technicalAssistant,
};

/**
 * Get all available scenarios
 */
export function getAllScenarios(): Scenario[] {
    return Object.values(scenarios);
}

/**
 * Get a specific scenario by ID
 */
export function getScenario(id: string): Scenario | undefined {
    return scenarios[id];
}

/**
 * Check if a scenario ID is valid
 */
export function isValidScenario(id: string): boolean {
    return id in scenarios;
}

export { callingAgent, customerSupportAgent, technicalAssistant };
