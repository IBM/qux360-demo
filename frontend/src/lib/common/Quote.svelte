<script lang="ts">
    export let index: number;
    export let timestamp: string;
    export let speaker: string;
    export let quote: string;
    export let entity: string = "";

    const highlightEntity = (statement: string, entity: string): string => {
        if (!entity) return statement.trim();

        const escapedEntity: string = entity.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        const regex: RegExp = new RegExp(`\\b(${escapedEntity})\\b`, "gi");

        return statement
            .trim()
            .replace(regex, "<strong class='bold-entity'>$1</strong>");
    };

    const handleTranscriptLineHeaderClick = (lineNumber: number): void => {
        const element: HTMLElement | null = document.getElementById(
            `transcript-line-${lineNumber}`,
        );
        if (!element) return;

        element.scrollIntoView({ behavior: "smooth", block: "start" });

        element.classList.add("highlight-pulse");
        setTimeout(() => element.classList.remove("highlight-pulse"), 3000);
    };
</script>

<div class="quote-container">
    <span
        class="quote-header"
        on:click={() => {
            handleTranscriptLineHeaderClick(index);
        }}
    >
        {speaker}
        <strong>•</strong>
        {timestamp}
    </span>
    <span class="quote-text">
        "{@html highlightEntity(quote, entity)}"
    </span>
</div>

<style lang="scss">
    @use "@carbon/type";

    .quote-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        @include type.type-style("label-02");
        line-height: 1.125rem;
    }

    .quote-header {
        width: fit-content;
    }

    .quote-header:hover {
        cursor: pointer;
        opacity: 0.5;
    }

    .quote-text {
        font-style: italic;
    }

    :global(.bold-entity) {
        font-weight: 700;
    }
</style>
