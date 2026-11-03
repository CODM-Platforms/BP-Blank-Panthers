/**
 * Fixed clan tag prefixed to every member's CODM in-game name. Applicants
 * only type their own handle (e.g. "GUITZY") - the tag is added
 * automatically, everywhere, so nobody types it inconsistently.
 */
export const CLAN_TAG = 'ẞP.ঐ';

export function withClanTag(handle: string): string {
  return `${CLAN_TAG}${handle.trim()}`;
}

export const CODM_BR_CLASSES = [
  'Ninja',
  'Medic',
  'Defender',
  'Mechanic',
  'Scout',
  'Clown',
  'Airborne',
  'Trickster',
  'Poltergeist',
  'Smoke Bomber',
  'Hacker',
  'Refitter',
  'Desperado',
  'Spotter',
  'Rewind',
  'Pumped',
  'Igniter',
  'Kinetic Station',
  'Ravager Launcher',
  'Misdirection',
  'Jet Boost',
  'Shock Wave',
  'Quick Strike',
  'Teleport',
] as const;

export const CODM_MP_ROLES = [
  'Slayer (MP)',
  'OBJ / Objective (MP)',
  'Anchor (MP)',
  'Support (MP)',
  'Sniper (MP)',
] as const;

export const ALL_CODM_CLASSES = [...CODM_BR_CLASSES, ...CODM_MP_ROLES] as const;
