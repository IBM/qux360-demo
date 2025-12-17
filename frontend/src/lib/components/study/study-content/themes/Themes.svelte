<script lang="ts">
    import { AILabel } from "$lib/common";
    import type { IdentifiedThemeI } from "$lib/models";
    import { utilsService } from "$lib/services";
    import { selectedStudyStore } from "$lib/stores";
    import {
        Button,
        ContentSwitcher,
        Search,
        Switch,
    } from "carbon-components-svelte";
    import { Add } from "carbon-icons-svelte";
    import { onMount } from "svelte";

    let approvedIdentifiedThemes: IdentifiedThemeI[] = [];
    let suggestedIdentifiedThemes: IdentifiedThemeI[] = [];

    let selectedContentSwitcherIndex: number = 0;

    let searchThemeValue: string = "";

    let suggestThemesButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    $: if ($selectedStudyStore) {
        approvedIdentifiedThemes = $selectedStudyStore.themes.filter(
            (theme: IdentifiedThemeI) =>
                theme.validation && theme.validation.isApprovedByUser,
        );

        suggestedIdentifiedThemes = $selectedStudyStore.themes.filter(
            (theme: IdentifiedThemeI) =>
                theme.validation && !theme.validation.isApprovedByUser,
        );
    }

    $: selectedContentSwitcherIndex,
        utilsService.updateAILabelSlugColor(
            suggestThemesButtonContentElementRef,
            aiLabelSlugColor,
        );

    onMount(() => {
        requestAnimationFrame(async () => {
            await utilsService.updateAILabelSlugColor(
                suggestThemesButtonContentElementRef,
                aiLabelSlugColor,
            );
        });
    });
</script>

<div class="all-themes-tab-content-container">
    <ContentSwitcher bind:selectedIndex={selectedContentSwitcherIndex}>
        <Switch>
            <span>Approved themes ({approvedIdentifiedThemes.length})</span>
        </Switch>
        <Switch>
            <div class="suggested-themes-content-switcher-title-container">
                <span>
                    Suggested themes ({suggestedIdentifiedThemes.length})
                </span>
                <AILabel
                    headerText="Suggested themes"
                    bodyText="AI is used to analyze topics across multiple interviews to identify recurring themes."
                    modelName="granite.13b.v2.instruct"
                    modelLink=""
                    alignment="bottom-right"
                    kind="inline"
                />
            </div>
        </Switch>
    </ContentSwitcher>

    <div class="action-bar">
        <Search
            bind:value={searchThemeValue}
            placeholder="Search for a theme"
        />
        {#if selectedContentSwitcherIndex === 0}
            <Button kind="tertiary" size="field" icon={Add} on:click={() => {}}>
                Create theme
            </Button>
        {:else if selectedContentSwitcherIndex === 1}
            <Button
                kind="tertiary"
                size="field"
                on:click={() => {}}
                on:mouseenter={async () => {
                    aiLabelSlugColor = "white";
                    await utilsService.updateAILabelSlugColor(
                        suggestThemesButtonContentElementRef,
                        aiLabelSlugColor,
                    );
                }}
                on:mouseleave={async () => {
                    aiLabelSlugColor = "var(--cds-button-tertiary)";
                    await utilsService.updateAILabelSlugColor(
                        suggestThemesButtonContentElementRef,
                        aiLabelSlugColor,
                    );
                }}
            >
                <div
                    bind:this={suggestThemesButtonContentElementRef}
                    class="button-with-ai-label-container"
                >
                    Suggest themes
                    <AILabel
                        headerText="Suggest themes"
                        bodyText="AI is used to analyze topics across multiple interviews to identify recurring themes."
                        modelName="granite.13b.v2.instruct"
                        modelLink=""
                        alignment="bottom-right"
                        kind="inline"
                    />
                </div>
            </Button>
        {/if}
    </div>
</div>

<style lang="scss">
    .all-themes-tab-content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
    }

    .suggested-themes-content-switcher-title-container {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .action-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
</style>
