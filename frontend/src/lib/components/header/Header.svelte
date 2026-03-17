<script lang="ts">
    import { APP_TITLE } from "$lib/common";
    import {
        Header,
        HeaderGlobalAction,
        HeaderUtilities,
    } from "carbon-components-svelte";
    import { Settings } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
</script>

<Header platformName={APP_TITLE} expandedByDefault={false}>
    <HeaderUtilities>
        <HeaderGlobalAction
            aria-label="Settings"
            icon={Settings}
            iconDescription="Open LLM config"
            tooltipAlignment="end"
            on:click={() => dispatch("open-settings")}
        />
    </HeaderUtilities>
</Header>

<style lang="scss">
    :global(.bx--header) {
        background: #ffffff !important;
        border-bottom: 1px solid #c6c6c6 !important;
    }

    :global(.bx--header__name) {
        color: var(--cds-text-01) !important;
    }

    :global(.bx--header__nav::before) {
        background-color: #c6c6c6 !important;
    }

    :global(a.bx--header__menu-item) {
        color: var(--cds-text-01) !important;
    }

    :global(a.bx--header__menu-item:hover),
    :global(a.bx--header__menu-item:active) {
        background-color: var(--cds-hover-light-ui) !important;
    }

    :global(a.bx--header__menu-item:focus) {
        border-color: transparent !important;
        border-bottom: 3px solid var(--cds-inverse-support-04) !important;
    }

    :global(.bx--header__menu-toggle svg),
    :global(.bx--header__action svg) {
        fill: black !important;
    }

    :global(.bx--header__action:hover) {
        background-color: var(--cds-hover-light-ui) !important;
    }
</style>
