<script lang="ts">
    export let line_number: number;
    export let timestamp: string;
    export let speaker: string;
    export let quote: string;
    export let entity: string = "";

    const highlightEntity = (statement: string, entity: string): string => {
        if (!entity) return statement;

        const escapedEntity: string = entity.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        const regex: RegExp = new RegExp(`\\b(${escapedEntity})\\b`, "gi");

        return statement.replace(
            regex,
            "<strong class='bold-entity'>$1</strong>",
        );
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

<div class="transcript-line-container">
    <span
        class="transcript-line-header"
        on:click={() => {
            handleTranscriptLineHeaderClick(line_number);
        }}
    >
        {speaker}
        <strong>•</strong>
        {timestamp}
    </span>
    <span>
        {@html highlightEntity(quote, entity)}
    </span>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-line-container {
        display: flex;
        flex-direction: column;
        @include type.type-style("label-02");
        line-height: 1.125rem;
    }

    .transcript-line-header {
        width: fit-content;
    }

    .transcript-line-header:hover {
        cursor: pointer;
        opacity: 0.5;
    }

    :global(.bold-entity) {
        font-weight: 700;
    }
</style>
