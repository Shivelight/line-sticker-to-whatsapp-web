<script>
  export let tabs, activeTab = 0;
</script>

{#each tabs as tab, idx}
  <button
    class="tab"
    class:active={idx === activeTab}
    on:click={() => (activeTab = idx)}
  >
    {tab.name}
  </button>
{/each}

{#each tabs as tab, idx}
  <div hidden={idx !== activeTab}>
    <svelte:component this={tab.content} />
  </div>
{/each}

<style>
  .tab {
    margin: 20px 4px;
  }

  .tab.active {
    border: none;
    color: #00b84f;
    border-bottom: 2px solid #00b84f;
  }
</style>
