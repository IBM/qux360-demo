<script lang="ts">
    import type {
        IdentifiedThemeI,
        IdentifiedTopicI,
        ThemeCardI,
    } from "$lib/models";
    import { Button } from "carbon-components-svelte";
    import { ChevronDown, ChevronUp, Edit } from "carbon-icons-svelte";

    export let themeCard: ThemeCardI;
    export let openCards: Map<string, boolean>;

    let themeToEdit: IdentifiedThemeI | null = null;

    let isEditThemeModalOpen: boolean = false;

    const handleEditThemeButtonClick = (theme: IdentifiedThemeI): void => {
        themeToEdit = theme;
        isEditThemeModalOpen = true;
    };

    const toggleCard = (id: string): void => {
        openCards = new Map(openCards);
        openCards.set(id, !(openCards.get(id) ?? false));
    };

    const getUniqueInterviewCount = (topics: IdentifiedTopicI[]): number => {
        const uniqueInterviewCount: number = new Set(
            topics
                .map((t: IdentifiedTopicI) => t.interview_id)
                .filter((id: string | undefined): id is string => Boolean(id)),
        ).size;
        return uniqueInterviewCount;
    };
</script>

<div class="theme-card" class:theme-card-open={themeCard.isOpen}>
    <div class="theme-card-left-side">
        <div class="theme-card-header">
            <span class="theme-name">
                {themeCard.theme.title}
            </span>
            <Button
                class="theme-card-button"
                kind="ghost"
                size="small"
                on:click={() => {
                    handleEditThemeButtonClick(themeCard.theme);
                }}
            >
                <Edit size={16} />
            </Button>
        </div>

        {#if !themeCard.isOpen}
            <div class="theme-card-subheader">
                <span>
                    {themeCard.theme.topics.length} supporting topics
                </span>
                <strong>•</strong>
                <span>
                    {getUniqueInterviewCount(themeCard.theme.topics)} supporting
                    transcripts
                </span>
            </div>
        {:else}
            <div class="topic-card-internal-container">
                <span class="topic-card-label">Description</span>
                <span class="topic-card-text">
                    {themeCard.theme.explanation}
                </span>
            </div>
        {/if}
    </div>

    <Button
        class="theme-card-button"
        kind="ghost"
        size="small"
        on:click={() => {
            toggleCard(themeCard.id);
        }}
    >
        {#if themeCard.isOpen}
            <ChevronUp size={16} />
        {:else}
            <ChevronDown size={16} />
        {/if}
    </Button>
</div>

{#key isEditThemeModalOpen}
    {#if isEditThemeModalOpen && themeToEdit}{/if}
{/key}

<style lang="scss">
    @use "@carbon/type";

    .theme-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 1.5rem 1rem;
        background-color: var(--cds-ui-background);
        border: 0.5px solid var(--cds-border-interactive);
        border-radius: 0.25rem;
    }

    .theme-card-open {
        align-items: flex-start;
    }

    .theme-card-left-side {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .theme-card-header {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .theme-name {
        @include type.type-style("heading-02");
    }

    .theme-card-subheader {
        @include type.type-style("label-01");
        line-height: 1rem;
    }

    :global(.theme-card-button) {
        min-height: 1rem;
        padding: 7px !important;
    }
</style>
