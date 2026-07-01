import type { PlatformSignature } from "../types/index.js";

function sig(
  id: string,
  name: string,
  category: PlatformSignature["category"],
  partial: Omit<PlatformSignature, "id" | "name" | "category"> = {},
): PlatformSignature {
  return { id, name, category, ...partial };
}

export const PLATFORM_SIGNATURES: PlatformSignature[] = [
  // Traditional CMS
  sig("wordpress", "WordPress", "Traditional CMS", {
    metaGenerator: [/wordpress/i],
    html: [/wp-content/i, /wp-includes/i, /wp-json/i, /wp-block/i],
    cookies: [/wordpress_/i, /wp-settings/i],
    scripts: [/wp\.i18n/i, /wp\.element/i],
    assetPaths: [/\/wp-content\//i, /\/wp-includes\//i],
    apiEndpoints: [{ path: "/wp-json/", pattern: /namespaces/i }],
  }),
  sig("drupal", "Drupal", "Traditional CMS", {
    metaGenerator: [/drupal/i],
    html: [
      /drupal\.js/i,
      /drupalSettings/i,
      /\/sites\/default\/files\//i,
      /\/sites\/all\/(?:modules|themes)\//i,
      /\/core\/(?:misc|modules|themes|assets)\//i,
      /data-drupal-/i,
      /Drupal\.settings/i,
    ],
    headers: [
      { name: "x-drupal-cache", pattern: /.+/i },
      { name: "x-drupal-dynamic-cache", pattern: /.+/i },
      { name: "x-generator", pattern: /drupal/i },
    ],
    cookies: [/^SSESS/i, /^SESS[a-f0-9]{10,}/i, /^Drupal\./i],
    assetPaths: [
      /\/sites\/default\/files\//i,
      /\/core\/modules\//i,
      /\/core\/themes\//i,
      /\/core\/misc\//i,
    ],
    apiEndpoints: [{ path: "/jsonapi" }],
  }),
  sig("joomla", "Joomla", "Traditional CMS", {
    metaGenerator: [/joomla/i],
    html: [/joomla/i, /\/components\/com_/i, /\/modules\/mod_/i, /\/media\/system\/js\//i],
    cookies: [/joomla_/i],
    assetPaths: [/\/administrator\//i],
  }),
  sig("magento", "Magento", "Traditional CMS", {
    html: [/magento/i, /Mage\.Cookies/i, /\/pub\/static\//i, /\/skin\//i, /mage\/cookies/i],
    headers: [{ name: "x-magento-", pattern: /.+/i }],
    cookies: [/mage-cache/i, /mage-messages/i, /X-Magento-Vary/i],
    assetPaths: [/\/static\/version/i, /\/skin\//i, /\/pub\/media\//i],
  }),
  sig("typo3", "TYPO3", "Traditional CMS", {
    metaGenerator: [/typo3/i],
    html: [/typo3/i, /\/typo3conf\//i, /data-typo3/i],
    assetPaths: [/\/typo3\//i],
  }),
  sig("ghost", "Ghost", "Traditional CMS", {
    metaGenerator: [/ghost/i],
    html: [/ghost\.org/i, /\/ghost\//i],
    apiEndpoints: [{ path: "/ghost/api/content/posts/", pattern: /posts|meta/i }],
  }),
  sig("umbraco", "Umbraco", "Traditional CMS", {
    html: [/umbraco/i, /\/umbraco\//i, /Umbraco\.Sys/i],
    cookies: [/UMB_/i],
  }),
  sig("kentico", "Kentico", "Traditional CMS", {
    html: [/kentico/i, /CMSClient/i],
    cookies: [/CMSPreferredCulture/i, /CMSCsrfCookie/i],
  }),
  sig("xperience-kentico", "Xperience by Kentico", "Enterprise DXP", {
    html: [/xperience by kentico/i, /Kentico\.Xperience/i],
    scripts: [/Kentico\.Xperience/i],
  }),
  sig("opencart", "OpenCart", "Traditional CMS", {
    html: [/opencart/i, /route=common\/home/i, /catalog\/view\/theme/i],
  }),
  sig("prestashop", "PrestaShop", "Traditional CMS", {
    metaGenerator: [/prestashop/i],
    html: [/prestashop/i, /\/modules\/ps_/i],
    cookies: [/PrestaShop/i],
  }),
  sig("concrete-cms", "Concrete CMS", "Traditional CMS", {
    html: [/concrete5/i, /concrete cms/i, /\/concrete\//i],
  }),
  sig("silverstripe", "SilverStripe", "Traditional CMS", {
    html: [/silverstripe/i, /framework\/javascript/i],
  }),
  sig("modx", "MODX", "Traditional CMS", {
    html: [/modx/i, /\/assets\/components\//i],
  }),
  sig("expressionengine", "ExpressionEngine", "Traditional CMS", {
    html: [/expressionengine/i, /exp:/i],
  }),
  sig("orchard-core", "Orchard Core", "Traditional CMS", {
    html: [/orchard/i, /The Orchard Team/i],
  }),
  sig("plone", "Plone", "Traditional CMS", {
    html: [/plone/i, /portal_css/i],
  }),
  sig("dotnetnuke", "DotNetNuke (DNN)", "Traditional CMS", {
    html: [/dotnetnuke/i, /__dnn/i, /DnnForm/i, /dnnapi/i],
  }),
  sig("ez-platform", "eZ Platform / Ibexa", "Traditional CMS", {
    html: [/ibexa/i, /ezplatform/i, /\beZ Publish\b/i],
  }),
  sig("pimcore", "Pimcore", "Traditional CMS", {
    html: [/pimcore/i, /\/bundles\/pimcore/i],
  }),

  // Enterprise DXP
  sig("sitecore-xp", "Sitecore XP", "Enterprise DXP", {
    html: [/\/-\/media\//i, /\/~\/media\//i, /\/sitecore\/shell\//i, /\bsc_site\b/i, /Sitecore\.PageModes/i, /data-sc-/i],
    headers: [{ name: "x-powered-by", pattern: /sitecore/i }],
    cookies: [/SC_ANALYTICS/i, /^sc_/i],
    assetPaths: [/\/sitecore\/shell\//i, /\/-\/media\//i],
    apiEndpoints: [{ path: "/sitecore/api/ssc/item" }],
  }),
  sig("sitecore-xm", "Sitecore XM", "Enterprise DXP", {
    html: [/sitecore experience/i, /\bxm cloud\b/i],
    scripts: [/Sitecore\.JSS/i, /@sitecore-jss/i],
  }),
  sig("sitecore-xm-cloud", "Sitecore XM Cloud", "Enterprise DXP", {
    html: [/sitecore cloud/i, /\bxmcloud\b/i, /pages\.sitecorecloud\.io/i],
    headers: [{ name: "x-sitecore-", pattern: /.+/i }],
    headless: true,
  }),
  sig("sitecore-headless", "Sitecore Headless", "Enterprise DXP", {
    headless: true,
    html: [/sitecore jss/i, /@sitecore-jss/i],
    scripts: [/@sitecore-jss/i, /Sitecore\.LayoutService/i],
  }),
  sig("sitecore-jss", "Sitecore JSS", "Enterprise DXP", {
    headless: true,
    scripts: [/@sitecore-jss/i, /Sitecore\.JSS/i, /Sitecore\.LayoutService/i],
    html: [/sitecore jss/i, /@sitecore-jss/i],
    apiEndpoints: [{ path: "/-/jss/render" }],
  }),
  sig("aem", "Adobe Experience Manager", "Enterprise DXP", {
    html: [/\/etc\.clientlibs\//i, /\/content\/dam\//i, /cq:template/i, /data-cmp-/i, /granite\.js/i],
    headers: [{ name: "x-aem-", pattern: /.+/i }],
    assetPaths: [/\/etc\.clientlibs\//i, /\/content\/dam\//i, /\/ui\.apps\//i, /\/ui\.content\//i],
  }),
  sig("aem-cloud", "Adobe Experience Manager as a Cloud Service", "Enterprise DXP", {
    html: [/adobe experience manager cloud/i, /aem cloud/i, /etc\.clientlibs/i],
    headers: [{ name: "x-adobe-content", pattern: /.+/i }],
  }),
  // NOTE: Optimizely CMS (formerly Episerver). Bare "optimizely" is intentionally
  // excluded because it collides with Optimizely Web Experimentation (A/B testing),
  // which is embedded on countless sites that do NOT run the CMS.
  sig("optimizely-cms", "Optimizely", "Enterprise DXP", {
    html: [/episerver/i, /EPiServer/i, /optimizely\.cms/i, /__epiforms/i],
    cookies: [/EPiServer/i, /\.EPiServerLogin/i],
    scripts: [/EPiServer/i, /optimizely\/cms/i],
  }),
  sig("optimizely-dxp", "Optimizely", "Enterprise DXP", {
    html: [/optimizely dxp/i, /episerver/i],
    cookies: [/EPiServer/i],
  }),
  sig("contentstack", "Contentstack", "Enterprise DXP", {
    headless: true,
    html: [/contentstack/i, /contentstack\.io/i],
    scripts: [/contentstack/i, /Contentstack/i],
    jsGlobals: [/Contentstack/i],
  }),
  sig("contentful", "Contentful", "Enterprise DXP", {
    headless: true,
    html: [/contentful/i, /ctfassets\.net/i, /images\.ctfassets/i],
    scripts: [/contentful/i, /@contentful/i],
  }),
  sig("acquia-cms", "Acquia", "Enterprise DXP", {
    html: [/acquia/i],
    headers: [{ name: "x-acquia-host", pattern: /.+/i }, { name: "x-ah-environment", pattern: /.+/i }],
  }),
  sig("acquia-dxp", "Acquia", "Enterprise DXP", {
    html: [/acquia dxp/i, /acquia\.com/i],
    headers: [{ name: "x-acquia-search", pattern: /.+/i }],
  }),
  sig("bloomreach-experience", "Bloomreach Experience", "Enterprise DXP", {
    html: [/bloomreach/i, /brxm/i, /hst:/i],
  }),
  sig("bloomreach-content", "Bloomreach Content", "Enterprise DXP", {
    html: [/bloomreach content/i, /bloomreach\.io/i],
  }),
  sig("liferay", "Liferay", "Enterprise DXP", {
    html: [/liferay/i, /Liferay\.Util/i],
    cookies: [/LFR_SESSION/i],
  }),
  sig("magnolia", "Magnolia", "Enterprise DXP", {
    html: [/magnolia cms/i, /magnoliaPublic/i, /\.magnolia-cms\./i, /\/\.magnolia\//i],
  }),
  sig("crownpeak", "Crownpeak DXM", "Enterprise DXP", {
    html: [/crownpeak/i, /cpdxm/i],
  }),
  sig("sitefinity", "Sitefinity", "Enterprise DXP", {
    html: [/sitefinity/i, /Telerik\.Sitefinity/i],
  }),
  sig("oracle-cm", "Oracle Content Management", "Enterprise DXP", {
    html: [/oracle content management/i, /oracle\.com\/content/i],
  }),
  sig("opentext-teamsite", "OpenText TeamSite", "Enterprise DXP", {
    html: [/teamsite/i, /opentext/i, /interwoven/i],
  }),
  sig("sdl-tridion", "SDL Tridion / Tridion Sites", "Enterprise DXP", {
    html: [/tridion/i, /tcm:\d/i, /tridion sites/i],
  }),
  sig("firstspirit", "FirstSpirit", "Enterprise DXP", { html: [/firstspirit/i, /e-spirit/i] }),
  sig("hcl-dx", "HCL Digital Experience", "Enterprise DXP", { html: [/hcl digital experience/i, /websphere portal/i] }),
  sig("coremedia", "CoreMedia", "Enterprise DXP", { html: [/coremedia/i] }),
  sig("storyblok", "Storyblok", "Headless CMS", {
    headless: true,
    html: [/storyblok/i, /a\.storyblok\.com/i],
    scripts: [/storyblok/i],
  }),
  sig("builder-io", "Builder.io", "Headless CMS", {
    headless: true,
    html: [/builder\.io/i, /builder-io/i],
    scripts: [/builder\.io/i, /@builder\.io/i],
  }),
  sig("hygraph", "Hygraph", "Headless CMS", {
    headless: true,
    html: [/hygraph/i, /graphcms/i, /media\.graphassets/i],
  }),
  sig("sanity", "Sanity", "Headless CMS", {
    headless: true,
    html: [/sanity\.io/i, /cdn\.sanity/i],
    scripts: [/@sanity/i, /sanity\.io/i],
  }),
  sig("prismic", "Prismic", "Headless CMS", {
    headless: true,
    html: [/prismic/i, /images\.prismic/i],
    scripts: [/prismic/i, /@prismicio/i],
  }),
  sig("agility-cms", "Agility CMS", "Headless CMS", { headless: true, html: [/agilitycms/i, /agility cms/i] }),
  sig("uniform", "Uniform", "Enterprise DXP", { html: [/uniform\.dev/i, /@uniformdev/i], headless: true }),
  sig("zesty", "Zesty.io", "Headless CMS", { headless: true, html: [/zesty\.io/i, /zestyio/i] }),
  sig("dotcms", "dotCMS", "Enterprise DXP", { html: [/dotcms/i, /\/dotAsset\//i] }),
  sig("craftercms", "CrafterCMS", "Enterprise DXP", { html: [/craftercms/i, /crafter/i] }),
  sig("q4web", "Q4 Web", "Enterprise DXP", {
    html: [/q4web/i, /q4app\.com/i, /q4cdn\.com/i, /Q4\.Application/i, /q4\.inc/i],
    scripts: [/q4app/i, /Q4\.Module/i, /q4cdn/i],
  }),
  sig("ingeniux", "Ingeniux CMS", "Enterprise DXP", { html: [/ingeniux/i] }),

  sig("craft-cms", "Craft CMS", "Traditional CMS", {
    html: [/craft cms/i, /craftcms/i, /\/cpresources\//i, /CRAFT_CSRF/i],
    cookies: [/CraftSessionId/i, /CRAFT_CSRF/i],
    headers: [{ name: "x-powered-by", pattern: /Craft CMS/i }],
    assetPaths: [/\/cpresources\//i],
    apiEndpoints: [{ path: "/cpresources/" }],
  }),

  // Commerce
  sig("shopify", "Shopify", "Commerce Platform", {
    html: [
      /cdn\.shopify\.com/i,
      /Shopify\.theme/i,
      /shopify-section/i,
      /shopifycloud/i,
      /myshopify\.com/i,
    ],
    headers: [{ name: "x-shopid", pattern: /.+/i }, { name: "powered-by", pattern: /shopify/i }],
    cookies: [/_shopify_/i, /cart_sig/i, /secure_customer_sig/i],
    scripts: [/Shopify\./i, /shopify\.com\/s\/files/i],
    apiEndpoints: [{ path: "/cart.js" }],
  }),
  sig("shopify-hydrogen", "Shopify Hydrogen", "Commerce Platform", {
    headless: true,
    html: [/shopify hydrogen/i, /@shopify\/hydrogen/i],
    scripts: [/@shopify\/hydrogen/i],
  }),
  sig("woocommerce", "WooCommerce", "Commerce Platform", {
    html: [
      /woocommerce/i,
      /\/wp-content\/plugins\/woocommerce\//i,
      /wc-cart-fragments/i,
      /wc-block/i,
      /wc_add_to_cart_params/i,
    ],
    scripts: [/woocommerce/i, /wc_add_to_cart_params/i, /\/woocommerce\//i],
    cookies: [/woocommerce_/i, /wp_woocommerce_/i],
    apiEndpoints: [{ path: "/wp-json/wc/store/v1/products" }, { path: "/wp-json/wc/v3/products" }],
  }),
  sig("shopware", "Shopware", "Commerce Platform", {
    html: [/shopware/i, /\/storefront\//i, /shopware\.js/i, /plugin\.base\.js/i],
    scripts: [/shopware/i, /storefront\.js/i, /Shopware\.State/i],
    cookies: [/^sw-/i, /session-/i],
    assetPaths: [/\/storefront\//i, /\/bundles\//i],
    apiEndpoints: [{ path: "/store-api/" }],
  }),
  sig("znode", "Znode", "Commerce Platform", {
    html: [/znode/i, /znodecommerce/i, /Znode\.Multifront/i, /\/znode\//i],
    scripts: [/znode/i, /Znode/i],
    cookies: [/Znode/i],
  }),
  sig("bigcommerce", "BigCommerce", "Commerce Platform", {
    html: [/bigcommerce/i, /cdn\d+\.bigcommerce/i],
    scripts: [/BigCommerce/i],
  }),
  sig("sfcc", "Salesforce Commerce Cloud", "Commerce Platform", {
    html: [
      /demandware/i,
      /demandware\.net/i,
      /demandware\.static/i,
      /salesforce commerce cloud/i,
      /\/on\/demandware\./i,
      /\/dw\/image\//i,
    ],
    cookies: [/dwsid/i, /dwac_/i, /dwanonymous_/i, /cqcid/i],
    scripts: [/demandware/i, /\/on\/demandware\//i],
    headers: [{ name: "x-dw-request-base-id", pattern: /.+/i }],
    assetPaths: [/demandware\.net/i, /\/on\/demandware\//i],
  }),
  sig("sap-commerce", "SAP Commerce Cloud (Hybris)", "Commerce Platform", {
    html: [/hybris/i, /sap commerce/i, /\/yaccelerator/i],
  }),
  sig("commercetools", "commercetools", "Commerce Platform", {
    headless: true,
    html: [/commercetools/i, /commercetools\.com/i],
  }),
  sig("elastic-path", "Elastic Path", "Commerce Platform", { html: [/elastic path/i, /elasticpath/i] }),
  sig("vtex", "VTEX", "Commerce Platform", { html: [/vtex/i, /vtexassets/i], cookies: [/Vtex/i] }),
  sig("spryker", "Spryker", "Commerce Platform", { html: [/spryker/i, /spryker-shop/i] }),

  // Website builders
  sig("wix", "Wix", "Website Builder", {
    html: [/static\.wixstatic\.com/i, /wix\.com/i, /wix-dropdown/i],
    headers: [{ name: "x-wix-", pattern: /.+/i }],
    scripts: [/wixBiSession/i, /viewerModel/i],
  }),
  sig("squarespace", "Squarespace", "Website Builder", {
    html: [/static1\.squarespace\.com/i, /Squarespace\.Constants/i],
    scripts: [/Static\.SQUARESPACE_CONTEXT/i],
  }),
  sig("webflow", "Webflow", "Website Builder", {
    metaGenerator: [/webflow/i],
    html: [/webflow\.com/i, /w-webflow-badge/i, /data-wf-page/i],
  }),
  sig("framer", "Framer", "Website Builder", {
    html: [/framerusercontent\.com/i, /framer\.com/i, /framer-site/i],
    metaGenerator: [/framer/i],
  }),
  sig("duda", "Duda", "Website Builder", { html: [/dudamobile/i, /dmcdn\.net/i, /irp\.cdn-website\.com/i] }),
  sig("weebly", "Weebly", "Website Builder", {
    html: [/weebly/i, /editmysite\.com/i],
    scripts: [/_W\.config/i],
  }),
  sig("godaddy-builder", "GoDaddy Website Builder", "Website Builder", {
    html: [/godaddy website builder/i, /secureservercdn\.net/i, /wsimg\.com/i],
  }),
  sig("hubspot-cms", "HubSpot", "Website Builder", {
    html: [/js\.hs-scripts\.com/i, /hsforms\.net/i, /hubspot/i, /hs-analytics/i],
    scripts: [/_hsq/i, /HubSpotConversations/i],
  }),
  sig("carrd", "Carrd", "Website Builder", { html: [/carrd\.co/i, /carrd\.com/i] }),

  // Headless CMS
  sig("strapi", "Strapi", "Headless CMS", {
    headless: true,
    html: [/\bstrapi\b/i, /strapi\.io/i],
    apiEndpoints: [{ path: "/api" }],
  }),
  sig("directus", "Directus", "Headless CMS", {
    headless: true,
    html: [/directus/i, /directus\.io/i],
    apiEndpoints: [{ path: "/server/ping" }],
  }),
  sig("payload-cms", "Payload", "Headless CMS", {
    headless: true,
    html: [/payload cms/i, /payloadcms/i, /payload\.config/i],
    scripts: [/@payloadcms/i, /payloadcms/i],
  }),
  sig("ghost-headless", "Ghost Headless", "Headless CMS", {
    headless: true,
    html: [/ghost\.org/i],
    apiEndpoints: [{ path: "/ghost/api/content/posts/", pattern: /posts/i }],
  }),
  sig("buttercms", "ButterCMS", "Headless CMS", { headless: true, html: [/buttercms/i, /cdn\.buttercms/i] }),
  sig("cosmic", "Cosmic", "Headless CMS", { headless: true, html: [/cosmicjs/i, /cosmic\.js/i] }),
  sig("datocms", "DatoCMS", "Headless CMS", { headless: true, html: [/datocms/i, /datocms-assets/i] }),
  sig("kontent-ai", "Kontent.ai", "Headless CMS", { headless: true, html: [/kontent\.ai/i, /kentico cloud/i] }),

  // SSG
  sig("nextjs", "Next.js", "Static Site Generator", {
    framework: "Next.js",
    html: [/__NEXT_DATA__/i, /\/_next\/static\//i],
    scripts: [/__NEXT_DATA__/i],
    assetPaths: [/\/_next\//i],
  }),
  sig("nuxt", "Nuxt.js", "Static Site Generator", {
    framework: "Nuxt.js",
    html: [/__NUXT__/i, /\/_nuxt\//i],
    assetPaths: [/\/_nuxt\//i],
  }),
  sig("astro", "Astro", "Static Site Generator", {
    html: [/\/_astro\//i, /astro-island/i, /data-astro-/i],
    metaGenerator: [/astro/i],
    assetPaths: [/\/_astro\//i],
  }),
  sig("gatsby", "Gatsby", "Static Site Generator", {
    html: [/\bgatsby\b/i, /\/page-data\//i, /___gatsby/i, /gatsby-plugin/i],
    assetPaths: [/\/page-data\//i],
  }),
  sig("hugo", "Hugo", "Static Site Generator", {
    html: [/powered by hugo/i, /generator" content="Hugo/i],
    metaGenerator: [/hugo/i],
  }),
  sig("jekyll", "Jekyll", "Static Site Generator", {
    metaGenerator: [/jekyll/i],
    html: [/jekyll/i],
  }),
  sig("eleventy", "Eleventy (11ty)", "Static Site Generator", {
    html: [/eleventy/i, /11ty/i],
  }),
  sig("hexo", "Hexo", "Static Site Generator", { metaGenerator: [/hexo/i], html: [/hexo/i] }),
  sig("vuepress", "VuePress", "Static Site Generator", { html: [/vuepress/i, /\/assets\/js\//i] }),
  sig("docusaurus", "Docusaurus", "Static Site Generator", {
    html: [/docusaurus/i, /__docusaurus/i],
    scripts: [/docusaurus/i],
  }),
  sig("sveltekit", "SvelteKit", "Static Site Generator", {
    html: [/sveltekit/i, /__sveltekit/i, /\/_app\//i],
    framework: "Svelte",
  }),
  sig("remix", "Remix", "Static Site Generator", {
    html: [/__remixContext/i, /__remixManifest/i, /data-remix-/i, /remix-run/i],
    framework: "Remix",
  }),

  // Frameworks
  sig("react", "React", "Web Framework", {
    framework: "React",
    html: [/data-reactroot/i, /data-reactid/i, /__REACT_DEVTOOLS/i],
    scripts: [/react-dom(?:\.production|\.development)?\.min\.js/i, /react\.production\.min\.js/i],
  }),
  sig("angular", "Angular", "Web Framework", {
    framework: "Angular",
    html: [/ng-version=/i, /\bng-app=/i],
    scripts: [/angular(?:\.min)?\.js/i, /@angular\/core/i],
  }),
  sig("vue", "Vue", "Web Framework", {
    framework: "Vue",
    html: [/data-v-[a-f0-9]+/i, /__VUE__/i],
    scripts: [/vue(?:\.runtime|\.global)(?:\.prod)?(?:\.min)?\.js/i],
  }),
  sig("svelte", "Svelte", "Web Framework", {
    framework: "Svelte",
    html: [/svelte/i],
    scripts: [/svelte/i],
  }),
  sig("laravel", "Laravel", "Web Framework", {
    html: [/laravel/i],
    cookies: [/laravel_session/i, /XSRF-TOKEN/i],
    headers: [{ name: "x-powered-by", pattern: /laravel/i }],
  }),
  sig("symfony", "Symfony", "Web Framework", {
    html: [/symfony/i],
    headers: [{ name: "x-powered-by", pattern: /symfony/i }],
  }),
  sig("aspnet-mvc", "ASP.NET MVC", "Web Framework", {
    headers: [{ name: "x-aspnet-version", pattern: /.+/i }, { name: "x-powered-by", pattern: /asp\.net/i }],
    html: [/__VIEWSTATE/i, /aspnet/i],
  }),
  sig("aspnet-core", "ASP.NET Core", "Web Framework", {
    headers: [{ name: "x-powered-by", pattern: /asp\.net core/i }],
    html: [/blazor/i, /aspnetcore/i],
  }),
  sig("django", "Django", "Web Framework", {
    html: [/csrfmiddlewaretoken/i, /django/i],
    cookies: [/csrftoken/i, /sessionid/i],
  }),
  sig("rails", "Ruby on Rails", "Web Framework", {
    html: [/rails/i, /csrf-token/i],
    headers: [{ name: "x-powered-by", pattern: /phusion passenger/i }],
    cookies: [/_session_id/i],
  }),
  sig("flask", "Flask", "Web Framework", {
    headers: [{ name: "server", pattern: /werkzeug/i }],
  }),
  sig("spring-boot", "Spring Boot", "Web Framework", {
    html: [/Whitelabel Error Page/i, /org\.springframework/i],
    headers: [{ name: "x-application-context", pattern: /.+/i }],
  }),
  sig("phoenix", "Phoenix", "Web Framework", {
    html: [/phoenix/i, /csrf-token/i],
    cookies: [/_.*_key/i],
  }),
  sig("fastapi", "FastAPI", "Web Framework", {
    html: [/fastapi/i, /swagger/i, /openapi/i],
    headers: [{ name: "server", pattern: /uvicorn/i }],
  }),
  sig("express", "Express", "Web Framework", {
    headers: [{ name: "x-powered-by", pattern: /express/i }],
  }),
];

export function getSignatureById(id: string): PlatformSignature | undefined {
  return PLATFORM_SIGNATURES.find((signature) => signature.id === id);
}

/** Like getSignatureById but throws if the signature is missing, returning a non-optional type. */
export function getRequiredSignature(id: string): PlatformSignature {
  const signature = getSignatureById(id);
  if (!signature) throw new Error(`Platform signature not found: ${id}`);
  return signature;
}

export function getSignatureByName(name: string): PlatformSignature | undefined {
  return PLATFORM_SIGNATURES.find(
    (signature) => signature.name.toLowerCase() === name.toLowerCase(),
  );
}
