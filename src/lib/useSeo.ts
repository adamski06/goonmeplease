import { useEffect } from "react";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Imperative per-route SEO. Sets <title>, description, canonical, OG tags,
 * and an optional JSON-LD script. JSON-LD is tagged with data-seo-jsonld
 * so it can be cleaned up between routes.
 */
export function useSeo(opts: SeoOptions) {
  useEffect(() => {
    if (opts.title) document.title = opts.title;
    if (opts.description) upsertMeta("name", "description", opts.description);
    if (opts.canonical) upsertLink("canonical", opts.canonical);
    if (opts.ogTitle || opts.title)
      upsertMeta("property", "og:title", opts.ogTitle ?? opts.title!);
    if (opts.ogDescription || opts.description)
      upsertMeta("property", "og:description", opts.ogDescription ?? opts.description!);
    if (opts.ogType) upsertMeta("property", "og:type", opts.ogType);
    if (opts.ogImage) upsertMeta("property", "og:image", opts.ogImage);
    if (opts.canonical) upsertMeta("property", "og:url", opts.canonical);

    let scripts: HTMLScriptElement[] = [];
    if (opts.jsonLd) {
      const blocks = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
      blocks.forEach((block) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.seoJsonld = "true";
        s.text = JSON.stringify(block);
        document.head.appendChild(s);
        scripts.push(s);
      });
    }

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [
    opts.title,
    opts.description,
    opts.canonical,
    opts.ogTitle,
    opts.ogDescription,
    opts.ogImage,
    opts.ogType,
    JSON.stringify(opts.jsonLd ?? null),
  ]);
}
