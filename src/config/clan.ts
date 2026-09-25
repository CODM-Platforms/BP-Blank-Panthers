/**
 * Fixed clan tag prefixed to every member's CODM in-game name. Applicants
 * only type their own handle (e.g. "GUITZY") - the tag is added
 * automatically, everywhere, so nobody types it inconsistently.
 */
export const CLAN_TAG = 'ẞP.ঐ';

export function withClanTag(handle: string): string {
  return `${CLAN_TAG}${handle.trim()}`;
}
