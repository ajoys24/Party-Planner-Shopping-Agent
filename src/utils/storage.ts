import { PartyPlan } from '../types';
import { SAMPLE_PARTIES } from './presets';

const STORAGE_KEY_PLANS = 'party_planner_plans_v1';
const STORAGE_KEY_ACTIVE_ID = 'party_planner_active_id_v1';

export function loadSavedPartyPlans(): PartyPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (!raw) {
      // Seed initial presets
      savePartyPlans(SAMPLE_PARTIES);
      return SAMPLE_PARTIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_PARTIES;
  } catch (e) {
    console.error('Failed to load party plans from localStorage', e);
    return SAMPLE_PARTIES;
  }
}

export function savePartyPlans(plans: PartyPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save party plans to localStorage', e);
  }
}

export function loadActivePartyId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || SAMPLE_PARTIES[0].id;
  } catch {
    return SAMPLE_PARTIES[0].id;
  }
}

export function saveActivePartyId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch {}
}
