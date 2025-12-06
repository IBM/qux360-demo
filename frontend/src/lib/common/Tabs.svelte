<script lang="ts">
    import type { TabI } from "$lib/models";

    export let tabs: TabI[];
    export let activeTab: string;

    const selectTab = (id: string): void => {
        activeTab = id;
    };
</script>

<div class="tabs-container">
    <ul class="bx--tabs__nav bx--tabs__nav--hidden">
        {#each tabs as tab (tab.id)}
            <li class="bx--tabs__nav-item">
                <a
                    role="tab"
                    tabindex="0"
                    aria-selected={activeTab === tab.id}
                    aria-disabled="false"
                    class="bx--tabs__nav-link {activeTab === tab.id
                        ? 'bx--tabs__nav-item--selected'
                        : ''}"
                    on:click={() => selectTab(tab.id)}
                >
                    {tab.label}
                </a>
            </li>
        {/each}
    </ul>
</div>

<style lang="scss">
    .tabs-container {
        position: relative;
        min-height: calc(2.5rem - 0.5px);
        border-bottom: 1px solid var(--cds-border-subtle-selected);
    }

    .bx--tabs__nav-link {
        width: auto;
        border-color: var(--cds-border-subtle-selected);
    }

    .bx--tabs__nav-link:active,
    .bx--tabs__nav-link:focus {
        width: auto;
        outline: unset;
        outline-offset: unset;
        border-bottom: 2px solid var(--cds-interactive-04);
    }

    .bx--tabs__nav-item--selected {
        border-bottom: 2px solid var(--cds-interactive-04);
    }
</style>
