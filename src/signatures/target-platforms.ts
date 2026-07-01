/** Canonical platform names the scanner is configured to detect and report. */
export const TARGET_PLATFORMS = [
  "WordPress",
  "Shopify",
  "Wix",
  "Drupal",
  "Joomla",
  "Magento",
  "Webflow",
  "Squarespace",
  "Ghost",
  "TYPO3",
  "Sitecore",
  "Kentico",
  "Contentful",
  "Contentstack",
  "Strapi",
  "HubSpot",
  "Adobe Experience Manager",
  "Optimizely",
  "Sitefinity",
  "Umbraco",
  "Magnolia",
  "Liferay",
  "dotCMS",
  "Craft CMS",
  "Storyblok",
  "Sanity",
  "Hygraph",
  "Prismic",
  "Directus",
  "Payload",
  "Shopware",
  "WooCommerce",
  "BigCommerce",
  "PrestaShop",
  "OpenCart",
  "Znode",
  "Acquia",
  "Q4 Web",
] as const;

export type TargetPlatform = (typeof TARGET_PLATFORMS)[number];

/** Map internal/detailed platform names to canonical target names. */
const PLATFORM_ALIASES: Record<string, TargetPlatform> = {
  "Sitecore XP": "Sitecore",
  "Sitecore XM": "Sitecore",
  "Sitecore XM Cloud": "Sitecore",
  "Sitecore Headless": "Sitecore",
  "Sitecore JSS": "Sitecore",
  "Adobe Experience Manager as a Cloud Service": "Adobe Experience Manager",
  AEM: "Adobe Experience Manager",
  "HubSpot CMS": "HubSpot",
  "Progress Sitefinity": "Sitefinity",
  "Payload CMS": "Payload",
  "Hygraph (GraphCMS)": "Hygraph",
  "Acquia CMS": "Acquia",
  "Acquia DXP": "Acquia",
  "Optimizely CMS": "Optimizely",
  "Optimizely DXP": "Optimizely",
  "Magnolia CMS": "Magnolia",
  "Liferay DXP": "Liferay",
  "Xperience by Kentico": "Kentico",
};

export function normalizePlatformName(name: string | null): TargetPlatform | string | null {
  if (!name) return null;
  if (PLATFORM_ALIASES[name]) return PLATFORM_ALIASES[name];
  if ((TARGET_PLATFORMS as readonly string[]).includes(name)) return name;
  return name;
}

export function isTargetPlatform(name: string | null): name is TargetPlatform {
  if (!name) return false;
  const normalized = normalizePlatformName(name);
  return (TARGET_PLATFORMS as readonly string[]).includes(normalized as string);
}

export function targetPlatformIds(): Set<string> {
  return new Set(
    [
      "wordpress",
      "shopify",
      "wix",
      "drupal",
      "joomla",
      "magento",
      "webflow",
      "squarespace",
      "ghost",
      "typo3",
      "sitecore-xp",
      "sitecore-xm",
      "sitecore-xm-cloud",
      "sitecore-headless",
      "sitecore-jss",
      "kentico",
      "xperience-kentico",
      "contentful",
      "contentstack",
      "strapi",
      "hubspot-cms",
      "aem",
      "aem-cloud",
      "optimizely-cms",
      "optimizely-dxp",
      "sitefinity",
      "umbraco",
      "magnolia",
      "liferay",
      "dotcms",
      "craft-cms",
      "storyblok",
      "sanity",
      "hygraph",
      "prismic",
      "directus",
      "payload-cms",
      "shopware",
      "woocommerce",
      "bigcommerce",
      "prestashop",
      "opencart",
      "znode",
      "acquia-cms",
      "acquia-dxp",
      "q4web",
    ],
  );
}
