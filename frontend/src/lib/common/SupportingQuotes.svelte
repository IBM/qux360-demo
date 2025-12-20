<script lang="ts">
    import type { QuoteI } from "$lib/models";
    import { Modal, OutboundLink } from "carbon-components-svelte";
    import { Quote } from ".";

    export let quotes: QuoteI[];

    let displayedQuotes: QuoteI[] = [];

    let hasMoreQuotes: boolean = false;
    let isSeeAllQuotesModalOpen: boolean = false;

    $: displayedQuotes = quotes.slice(0, 2);
    $: hasMoreQuotes = quotes.length > 2;

    const handleSeeAllQuotesLinkClick = (): void => {
        isSeeAllQuotesModalOpen = true;
    };
</script>

<span class="topic-card-label">Supporting quotes</span>
<div class="supporting-quotes-container">
    {#each displayedQuotes as quote (quote.index)}
        <Quote
            index={quote.index}
            timestamp={quote.timestamp}
            speaker={quote.speaker}
            quote={quote.quote}
        />
    {/each}
</div>

{#if hasMoreQuotes}
    <OutboundLink
        class="see-all-quotes-link link"
        on:click={handleSeeAllQuotesLinkClick}
    >
        See all quotes
    </OutboundLink>
{/if}

<Modal
    bind:open={isSeeAllQuotesModalOpen}
    modalHeading="All quotes"
    size="sm"
    passiveModal
>
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
</Modal>

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

    :global(.see-all-quotes-link) {
        margin-top: 1rem;
    }
</style>
