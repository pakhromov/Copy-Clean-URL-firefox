"use strict";

const STRIP_PARAMS = new Set([
  // UTM
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_source_platform", "utm_creative_format", "utm_marketing_tactic",
  // Click IDs
  "fbclid", "gclid", "msclkid", "dclid", "twclid", "li_fat_id",
  // Analytics
  "_ga", "_gl", "_gid", "_gcl_au",
  // Social / email
  "igshid", "mc_cid", "mc_eid", "_hsenc", "_hsmi", "hsCtaTracking",
  // YouTube
  "list", "t", "index", "start_radio", "rv", "feature", "app", "ab_channel",
  // Referral
  "ref", "referer", "referrer",
]);

function cleanUrl(url) {
  try {
    const u = new URL(url);
    for (const key of [...u.searchParams.keys()]) {
      if (STRIP_PARAMS.has(key)) u.searchParams.delete(key);
    }
    return u.toString();
  } catch {
    return url;
  }
}

async function run(tab) {
  if (!tab?.url) return;
  await navigator.clipboard.writeText(cleanUrl(tab.url));
  browser.browserAction.setIcon({ path: "icon-active.png", tabId: tab.id });
  setTimeout(() => {
    browser.browserAction.setIcon({ path: "icon.png", tabId: tab.id });
  }, 3000);
}

browser.browserAction.onClicked.addListener(run);

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "copy-url") return;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  run(tab);
});
