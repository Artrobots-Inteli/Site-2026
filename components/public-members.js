// Shared public contract. No authenticated request or private identifier is used here.
(function (root) {
  const siteKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const idPattern = /^[a-zA-Z0-9-]{1,100}$/;
  const groups = ['leadership', 'projects', 'community'];
  function validSiteKey(value) {
    return typeof value === 'string' && value.length <= 80 && siteKeyPattern.test(value);
  }
  function configuredOrigin(document, location) {
    const configured = document.querySelector('meta[name="artrolove-public-origin"]')?.content?.trim();
    const local = ['localhost', '127.0.0.1'].includes(location.hostname);
    const origin = configured || (local ? 'http://127.0.0.1:3107' : '');
    if (!origin) return null;
    const url = new URL(origin);
    if (url.origin !== origin || url.username || url.password || !(url.protocol === 'https:' || local && url.origin === 'http://127.0.0.1:3107')) throw new Error('Invalid configured origin');
    return url.origin;
  }
  function validateFeed(data) {
    if (!data || !Array.isArray(data.members) || !Array.isArray(data.linkedSiteKeys) || data.members.length > 2000 || data.linkedSiteKeys.length > 2000) throw new Error('Invalid public feed');
    const linked = new Set();
    for (const key of data.linkedSiteKeys) {
      if (!validSiteKey(key) || linked.has(key)) throw new Error('Invalid linked key');
      linked.add(key);
    }
    const ids = new Set();
    const assignedKeys = new Set();
    for (const member of data.members) {
      if (!member || typeof member.id !== 'string' || !idPattern.test(member.id) || ids.has(member.id)
        || typeof member.name !== 'string' || typeof member.position !== 'string' || typeof member.description !== 'string'
        || member.photoPath !== `/api/public/members/${member.id}/photo`
        || member.profilePath !== `/membros/${member.id}` || !groups.includes(member.directoryGroup)
        || !(member.siteKey === null || validSiteKey(member.siteKey))) throw new Error('Invalid public member');
      if (member.siteKey !== null) {
        if (!linked.has(member.siteKey) || assignedKeys.has(member.siteKey)) throw new Error('Ambiguous site association');
        assignedKeys.add(member.siteKey);
      }
      ids.add(member.id);
    }
    return data;
  }
  async function loadFeed(origin) {
    const response = await fetch(`${origin}/api/public/members`, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Public feed unavailable');
    return validateFeed(await response.json());
  }
  function profileState(feed, key) {
    const member = feed.members.find((item) => item.siteKey === key);
    if (member) return { kind: 'connected', member };
    return { kind: feed.linkedSiteKeys.includes(key) ? 'withdrawn' : 'legacy' };
  }
  const api = { validSiteKey, configuredOrigin, validateFeed, loadFeed, profileState, groups };
  root.ArtrobotsPublicMembers = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
