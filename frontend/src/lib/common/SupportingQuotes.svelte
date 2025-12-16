<script lang="ts">
    import type { QuoteI } from "$lib/models";
    import { Quote } from ".";

    export let quotes: QuoteI[];
</script>

<span class="topic-card-label">Supporting quotes</span>
<div class="supporting-quotes-container">
    {#each quotes as quote (quote.index)}
        <Quote
            index={quote.index}
            timestamp={quote.timestamp}
            speaker={quote.speaker}
            quote={quote.quote}
        />
    {/each}
</div>

<style lang="scss">
    @use "@carbon/type";

    .topic-card-label {
        @include type.type-style("body-compact-01");
        font-weight: 700;
        line-height: 1.125rem;
    }

    .supporting-quotes-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
