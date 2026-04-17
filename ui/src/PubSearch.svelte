<svelte:options customElement="pub-search" />

<script>
  import Fuse from "fuse.js";
  import { onMount } from "svelte";

  let pubs = $state([]);
  let query = $state("");
  let yearFilter = $state("");
  let venueFilter = $state("");
  let fuse = $state(null);
  let mounted = $state(false);

  let years = $derived(
    [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a),
  );
  let venues = $derived([...new Set(pubs.map((p) => p.venue))].sort());

  let filtered = $derived.by(() => {
    if (!pubs.length) return [];

    let results = pubs;

    // Apply Fuse.js text search if there's a query
    if (query.trim() && fuse) {
      results = fuse.search(query.trim()).map((r) => r.item);
    }

    // Apply year filter
    if (yearFilter) {
      results = results.filter((p) => p.year === parseInt(yearFilter));
    }

    // Apply venue filter
    if (venueFilter) {
      results = results.filter((p) => p.venue === venueFilter);
    }

    return results;
  });

  // Group filtered results by venueKey for display
  let grouped = $derived.by(() => {
    const groups = new Map();
    for (const pub of filtered) {
      if (!groups.has(pub.venueKey)) {
        groups.set(pub.venueKey, {
          venue: pub.venue,
          venueFull: pub.venueFull,
          year: pub.year,
          pubs: [],
        });
      }
      groups.get(pub.venueKey).pubs.push(pub);
    }
    return [...groups.values()];
  });

  let isFiltering = $derived(
    query.trim() !== "" || yearFilter !== "" || venueFilter !== "",
  );

  onMount(() => {
    const dataEl = document.getElementById("pub-data");
    if (!dataEl) return;

    try {
      pubs = JSON.parse(dataEl.textContent);
    } catch {
      return;
    }

    fuse = new Fuse(pubs, {
      keys: [
        { name: "title", weight: 0.3 },
        { name: "authors.name", weight: 0.25 },
        { name: "abstract", weight: 0.2 },
        { name: "keywords", weight: 0.15 },
        { name: "venue", weight: 0.1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });

    // Hide the static fallback list
    const staticList = document.getElementById("pub-list-static");
    if (staticList) staticList.hidden = true;

    mounted = true;
  });
</script>

{#if mounted}
  <div class="pub-controls">
    <input
      type="search"
      bind:value={query}
      placeholder="Search publications..."
      aria-label="Search publications"
    />
    <div class="pub-filters">
      <select bind:value={yearFilter} aria-label="Filter by year">
        <option value="">All years</option>
        {#each years as year}
          <option value={year}>{year}</option>
        {/each}
      </select>
      <select bind:value={venueFilter} aria-label="Filter by venue">
        <option value="">All venues</option>
        {#each venues as venue}
          <option value={venue}>{venue}</option>
        {/each}
      </select>
    </div>
    {#if isFiltering}
      <p class="pub-results-count" aria-live="polite">
        Showing {filtered.length} of {pubs.length} publications
      </p>
    {/if}
  </div>

  {#each grouped as group}
    <h2>{group.venue} {group.year}</h2>
    <ul>
      {#each group.pubs as pub}
        <li>
          <strong><em>{pub.title}</em></strong>
          {#if pub.links?.paper}
            <a href={pub.links.paper}> [Paper]</a>
          {/if}
          {#if pub.links?.preprint}
            <a href={pub.links.preprint}> [Preprint]</a>
          {/if}
          {#if pub.links?.code}
            <a href={pub.links.code}> [Code]</a>
          {/if}
          {#if pub.links?.slides}
            <a href={pub.links.slides}> [Slides]</a>
          {/if}
          {#if pub.links?.project}
            <a href={pub.links.project}> [Project]</a>
          {/if}
          {#if pub.links?.doi}
            <a href="https://doi.org/{pub.links.doi}"> [DOI]</a>
          {/if}
          <br />
          {#each pub.authors as author, i}{#if i},
            {/if}{author.name}{#if author.orcid}<sup
                ><a
                  class="orcid-id"
                  href="https://orcid.org/{author.orcid}"
                  title="ORCID: {author.orcid}">iD</a
                ></sup
              >{/if}{/each}
          {#if pub.abstract}
            <details class="pub-abstract">
              <summary>Abstract</summary>
              <p>{pub.abstract}</p>
            </details>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}

  {#if isFiltering && filtered.length === 0}
    <p>No publications match your search.</p>
  {/if}
{/if}

<style>
  .pub-controls {
    margin-bottom: 1.5em;
  }

  input[type="search"] {
    width: 100%;
    padding: 0.5em;
    margin-bottom: 0.75em;
    font-size: 1em;
    border: 1px solid var(--text-color, #333);
    border-radius: 4px;
    background: var(--background-color, #fff);
    color: var(--text-color, #333);
    box-sizing: border-box;
  }

  .pub-filters {
    display: flex;
    gap: 0.75em;
    flex-wrap: wrap;
  }

  .pub-filters select {
    padding: 0.4em 0.5em;
    font-size: 0.95em;
    border: 1px solid var(--text-color, #333);
    border-radius: 4px;
    background: var(--background-color, #fff);
    color: var(--text-color, #333);
  }

  .pub-results-count {
    font-size: 0.9em;
    opacity: 0.7;
    margin-top: 0.5em;
  }

  .pub-abstract {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }

  .pub-abstract summary {
    cursor: pointer;
    font-size: 0.9em;
    color: var(--link-color, #1d7484);
  }

  .pub-abstract p {
    font-size: 0.9em;
    margin: 0.3em 0 0;
    line-height: 1.5;
  }

  a {
    color: var(--link-color, #1d7484);
  }

  .orcid-id {
    font-size: 0.7em;
    vertical-align: super;
  }

  ul {
    list-style: disc;
    padding-left: 1.5em;
  }

  li {
    margin-bottom: 0.75em;
  }
</style>
