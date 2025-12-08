<script lang="ts">
    import { OutboundLink } from "carbon-components-svelte";

    export let headerText: string;
    export let bodyText: string;
    export let modelName: string;
    export let modelLink: string;
    export let alignment: string = "bottom-left";
    export let kind: "default" | "inline" = "default";

    const handleAILabelClick = (event: PointerEvent): void => {
        event.stopPropagation();
    };
</script>

<cds-ai-label
    autoalign=""
    size="xs"
    {alignment}
    {kind}
    on:click={handleAILabelClick}
>
    <div slot="body-text" class="ai-label-body-container">
        <span class="ai-explained-label">AI explained</span>
        <h2 class="ai-label-heading">{headerText}</h2>
        <p class="ai-label-text">
            {bodyText}
        </p>
        <div class="ai-label-hr"></div>
        <span class="ai-label-text">AI model</span>
        <OutboundLink href={modelLink}>
            {modelName}
        </OutboundLink>
    </div>

    <cds-ai-label-action-button>View details</cds-ai-label-action-button>
</cds-ai-label>

<style lang="scss">
    @use "@carbon/type";

    .ai-label-body-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .ai-explained-label {
        @include type.type-style("label-02");
        line-height: 1.125rem;
        color: var(--cds-text-secondary);
    }

    .ai-label-heading {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
    }

    .ai-label-text {
        @include type.type-style("body-01");
        line-height: 1.25rem;
        color: var(--cds-text-secondary);
    }

    .ai-label-hr {
        width: 100%;
        height: 1px;
        background-color: var(--cds-border-subtle-selected);
        margin: 1rem 0;
    }
</style>
