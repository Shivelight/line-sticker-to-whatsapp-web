<script>
  import Tabs from "./lib/Tabs.svelte";
  import Convert from "./lib/Convert.svelte";
  import Help from "./lib/Help.svelte";
</script>

<main>
  <Tabs
    tabs={[
      { name: "Convert", content: Convert },
      { name: "Tutorial", content: Help },
    ]}
  />
</main>
