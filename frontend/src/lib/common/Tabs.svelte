<script lang="ts">
    import type { TabI } from "$lib/models";
    import { Tab, Tabs } from "carbon-components-svelte";

    export let tabs: TabI[];
    export let activeTab: string;

    const handleChange = (e: CustomEvent<number>): void => {
        const tab = tabs[e.detail];
        if (tab) {
            activeTab = tab.id;
        }
    };
</script>

<Tabs
    selected={tabs.findIndex((t) => t.id === activeTab)}
    on:change={handleChange}
>
    {#each tabs as tab (tab.id)}
        <Tab label={tab.label} />
    {/each}
</Tabs>
