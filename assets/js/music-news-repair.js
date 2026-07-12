(() => {
  "use strict";

  const MAX_STORIES = 6;
  const POLL_MS = 5 * 60 * 1000;

  const featured = document.getElementById("featuredNews");
  const grid = document.getElementById("musicNewsGrid");
  const refreshButton = document.getElementById("musicNewsRefresh");

  if (!featured || !grid) {
    return;
  }

  function decodeEntities(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value || "");
    return textarea.value;
  }

  function cleanText(value) {
    const raw = decodeEntities(value);

    const holder = document.createElement("div");
    holder.innerHTML = raw;

    const text = holder.textContent || holder.innerText || raw;

    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function validImage(value) {
    if (typeof value !== "string") {
      return "";
    }

    const trimmed = value.trim();

    return /^https?:\/\//i.test(trimmed)
      ? trimmed
      : "";
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      return /^https?:$/i.test(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function first(...values) {
    return values.find(value =>
      typeof value === "string" && value.trim()
    ) || "";
  }

  function normalizeStory(item) {
    const title = cleanText(first(
      item?.title,
      item?.headline,
      item?.name
    ));

    const summary = cleanText(first(
      item?.summary,
      item?.description,
      item?.excerpt,
      item?.body,
      item?.content
    ));

    const source = cleanText(first(
      item?.source?.name,
      item?.source,
      item?.publisher,
      item?.site
    )) || "Music News";

    const theme = cleanText(first(
      item?.theme,
      item?.category,
      item?.genre
    )) || "Music";

    const date = cleanText(first(
      item?.publishedAt,
      item?.published_at,
      item?.date,
      item?.createdAt
    ));

    return {
      title: title || "Untitled music story",
      summary,
      source,
      theme,
      date,
      image: validImage(first(
        item?.image,
        item?.imageUrl,
        item?.image_url,
        item?.thumbnail,
        item?.media?.image
      )),
      url: safeUrl(first(
        item?.url,
        item?.link,
        item?.sourceUrl,
        item?.source_url
      ))
    };
  }

  function extractStories(payload) {
    const candidates = [
      payload?.articles,
      payload?.news,
      payload?.stories,
      payload?.data?.articles,
      payload?.data?.news,
      payload?.data?.stories,
      payload?.core?.news?.articles,
      payload?.core?.musicNews,
      payload?.content?.news
    ];

    const list = candidates.find(Array.isArray) || [];

    const seen = new Set();

    return list
      .map(normalizeStory)
      .filter(story => {
        const key = story.title.toLowerCase();

        if (!story.title || seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .slice(0, MAX_STORIES);
  }

  function metaHtml(story) {
    const values = [
      story.source,
      story.theme,
      story.date
    ].filter(Boolean);

    return values
      .map(value => `<span>${escapeHtml(value)}</span>`)
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderHero(story) {
    if (!story) {
      featured.hidden = true;
      featured.innerHTML = "";
      return;
    }

    const style = story.image
      ? ` style="background-image:linear-gradient(rgba(4,7,12,.08),rgba(4,7,12,.3)),url('${escapeHtml(story.image)}')"`
      : "";

    const link = story.url
      ? `<a class="djfNewsLink" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Read full story ↗</a>`
      : "";

    featured.hidden = false;
    featured.innerHTML = `
      <div class="djfNewsHeroMedia"${style}></div>
      <div class="djfNewsHeroCopy">
        <div class="djfNewsMeta">${metaHtml(story)}</div>
        <h3>${escapeHtml(story.title)}</h3>
        <p>${escapeHtml(story.summary || "More details will be available from the original source.")}</p>
        ${link}
      </div>
    `;
  }

  function renderCards(stories) {
    const cards = stories.map(story => {
      const style = story.image
        ? ` style="background-image:linear-gradient(rgba(4,7,12,.05),rgba(4,7,12,.22)),url('${escapeHtml(story.image)}')"`
        : "";

      const link = story.url
        ? `<a class="djfNewsLink" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Read story ↗</a>`
        : "";

      return `
        <article class="djfNewsCard">
          <div class="djfNewsCardMedia"${style}></div>
          <div class="djfNewsCardBody">
            <div class="djfNewsMeta">${metaHtml(story)}</div>
            <h3>${escapeHtml(story.title)}</h3>
            <p>${escapeHtml(story.summary || "Open the source for the full story.")}</p>
            ${link}
          </div>
        </article>
      `;
    }).join("");

    grid.innerHTML = cards || `
      <div class="djfNewsEmpty">
        No clean music stories are available yet.
      </div>
    `;
  }

  function render(stories) {
    renderHero(stories[0]);
    renderCards(stories.slice(1));
  }

  function sanitizeExistingNews() {
    const rawStories = [];

    document.querySelectorAll(
      "#musicNewsGrid article, #featuredNews article, #featuredNews"
    ).forEach(node => {
      const titleNode = node.querySelector("h1,h2,h3,h4");
      const summaryNode = node.querySelector("p");
      const linkNode = node.querySelector("a[href]");
      const imageNode = node.querySelector("img");

      if (!titleNode) {
        return;
      }

      rawStories.push(normalizeStory({
        title: titleNode.innerHTML,
        summary: summaryNode?.innerHTML || "",
        url: linkNode?.href || "",
        image: imageNode?.src || "",
        source:
          node.querySelector("[data-source],.source")?.textContent ||
          "Music News"
      }));
    });

    if (rawStories.length) {
      render(rawStories.slice(0, MAX_STORIES));
      return true;
    }

    return false;
  }

  async function fetchStories() {
    const apiBase =
      window.DJF_CONFIG?.apiBase ||
      window.CONFIG?.apiBase ||
      "https://djfolsoe-tv-api.sunefolsoe.workers.dev";

    const paths = [
      "/api/content/news",
      "/api/cms/public/news",
      "/api/cms/public/state",
      "/api/broadcast"
    ];

    for (const path of paths) {
      try {
        const response = await fetch(`${apiBase}${path}`, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const stories = extractStories(await response.json());

        if (stories.length) {
          render(stories);
          return;
        }
      } catch (error) {
        console.warn(`Music News Repair could not read ${path}`, error);
      }
    }

    sanitizeExistingNews();
  }

  const observer = new MutationObserver(() => {
    window.clearTimeout(observer.timer);
    observer.timer = window.setTimeout(() => {
      sanitizeExistingNews();
    }, 120);
  });

  observer.observe(grid, {
    childList: true,
    subtree: true
  });

  observer.observe(featured, {
    childList: true,
    subtree: true
  });

  refreshButton?.addEventListener("click", fetchStories);

  window.setTimeout(fetchStories, 900);
  window.setInterval(fetchStories, POLL_MS);
})();