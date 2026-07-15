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
  // Other common ad / campaign trackers
  "mkt_tok", "yclid", "wbraid", "gbraid", "ttclid", "epik", "rdt_cid",
  "vero_id", "vero_conv", "_openstat", "s_kwcid", "ef_id", "wickedid",
  "oly_anon_id", "oly_enc_id", "guce_referrer", "guce_referrer_sig",
  "pk_campaign", "pk_kwd", "pk_source", "pk_medium",
]);

// Params stripped only on matching hosts (incl. subdomains). Reserved for
// world-wide popular sites whose junk params are too site-specific or generic
// to strip everywhere (e.g. Amazon affiliate tags).
const DOMAIN_STRIP = [
  {
    host: /(^|\.)amazon\.[a-z.]+$/i,
    params: new Set([
      "tag", "linkCode", "linkId", "creativeASIN", "camp", "creative",
      "ascsubtag", "ref", "ref_", "smid", "psc", "th", "qid", "sr",
      "keywords", "sprefix", "dib", "dib_tag", "content-id",
      "pd_rd_i", "pd_rd_r", "pd_rd_w", "pd_rd_wg",
      "pf_rd_p", "pf_rd_r", "pf_rd_s", "pf_rd_t", "pf_rd_i", "pf_rd_m",
    ]),
  },
];

function cleanUrl(url) {
  try {
    const u = new URL(url);
    const domainRule = DOMAIN_STRIP.find((r) => r.host.test(u.hostname));
    for (const key of [...u.searchParams.keys()]) {
      if (STRIP_PARAMS.has(key) || domainRule?.params.has(key)) {
        u.searchParams.delete(key);
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}

async function run(tab) {
  if (!tab?.url) return;
  await navigator.clipboard.writeText(cleanUrl(tab.url));
  browser.browserAction.setIcon({ path: "icon-active.svg", tabId: tab.id });
  setTimeout(() => {
    browser.browserAction.setIcon({ path: "icon.svg", tabId: tab.id });
  }, 3000);
}

browser.browserAction.onClicked.addListener(run);

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "copy-url") return;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  run(tab);
});
