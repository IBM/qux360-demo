<script lang="ts">
    import {
        AILabel,
        SupportingQuotes,
        VALIDATION_STATUS_MAP,
        VALIDATION_STRATEGY_MAP,
    } from "$lib/common";
    import CheckValidation from "$lib/components/transcript/analysis/CheckValidation.svelte";
    import {
        StudyStatus,
        ValidationStatus,
        type IdentifiedThemeI,
        type IdentifiedThemeMapI,
        type ValidationI,
    } from "$lib/models";
    import { utilsService } from "$lib/services";
    import {
        selectedStudyIdStore,
        selectedStudyStore,
        studiesStore,
    } from "$lib/stores";
    import {
        Button,
        ContentSwitcher,
        Link,
        Search,
        SkeletonPlaceholder,
        Switch,
        Tag,
        Tooltip,
    } from "carbon-components-svelte";
    import { Add, Checkmark, Close, Help } from "carbon-icons-svelte";
    import { onMount } from "svelte";

    let approvedIdentifiedThemes: IdentifiedThemeMapI = {};
    let suggestedIdentifiedThemes: IdentifiedThemeMapI = {};

    let selectedContentSwitcherIndex: number = 0;

    let searchThemeValue: string = "";

    let isAISettingsModalOpen: boolean = false;

    let suggestThemesButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    $: if ($selectedStudyStore) {
        const themesMap: IdentifiedThemeMapI = $selectedStudyStore.themes;

        approvedIdentifiedThemes = {};
        for (const [interviewId, themes] of Object.entries(themesMap)) {
            const filtered: IdentifiedThemeI[] = themes.filter(
                (t: IdentifiedThemeI) =>
                    t.validation?.isApprovedByUser === true,
            );
            if (filtered.length > 0) {
                approvedIdentifiedThemes[interviewId] = filtered;
            }
        }

        suggestedIdentifiedThemes = {};
        for (const [interviewId, themes] of Object.entries(themesMap)) {
            const filtered: IdentifiedThemeI[] = themes.filter(
                (t: IdentifiedThemeI) =>
                    t.validation?.isApprovedByUser === false,
            );
            if (filtered.length > 0) {
                suggestedIdentifiedThemes[interviewId] = filtered;
            }
        }
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

    const handleSuggestThemesButtonClick = (): void => {
        if ($selectedStudyIdStore) {
            studiesStore.runSuggestStudyThemes($selectedStudyIdStore);
        }
    };

    const getTopicCheckValidation = (
        checks: ValidationI[],
        method: string,
    ): ValidationI | undefined => {
        return checks.find((check: ValidationI) => check.method === method);
    };
</script>

<div class="all-themes-tab-content-container">
    <ContentSwitcher bind:selectedIndex={selectedContentSwitcherIndex}>
        <Switch>
            <span>
                Approved themes ({Object.keys(approvedIdentifiedThemes).length})
            </span>
        </Switch>
        <Switch>
            <div class="suggested-themes-content-switcher-title-container">
                <span>
                    Suggested themes ({Object.keys(suggestedIdentifiedThemes)
                        .length})
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
            <Button
                kind="tertiary"
                size="field"
                skeleton={$selectedStudyStore?.status === StudyStatus.Running}
                icon={Add}
                on:click={() => {}}
            >
                Create theme
            </Button>
        {:else if selectedContentSwitcherIndex === 1}
            <Button
                kind="tertiary"
                size="field"
                skeleton={$selectedStudyStore?.status === StudyStatus.Running}
                on:click={handleSuggestThemesButtonClick}
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

    {#if selectedContentSwitcherIndex === 0}
        <div></div>
    {:else if selectedContentSwitcherIndex === 1}
        <div class="themes-grid">
            {#each Object.entries(suggestedIdentifiedThemes) as [interviewId, themes]}
                {#each themes as theme, index (index)}
                    {#if theme.validation}
                        {#if $selectedStudyStore?.status === StudyStatus.Running}
                            <SkeletonPlaceholder
                                style="height: 40rem; width: 100%;"
                            />
                        {:else}
                            <div class="topic-card-container">
                                <div class="topic-card-header-container">
                                    <div
                                        class="topic-card-header-internal-container"
                                    >
                                        <span class="topic-card-title-text">
                                            {theme.topic}
                                        </span>
                                        {#if theme.validation.status === ValidationStatus.Ok}
                                            <Tag type="cyan">
                                                {VALIDATION_STATUS_MAP[
                                                    ValidationStatus.Ok
                                                ].text}
                                            </Tag>
                                        {:else if theme.validation.status === ValidationStatus.Check}
                                            <Tag class="uncertain-quality-tag">
                                                {VALIDATION_STATUS_MAP[
                                                    ValidationStatus.Check
                                                ].text}
                                            </Tag>
                                        {:else if theme.validation.status === ValidationStatus.Iffy}
                                            <Tag type="red">
                                                {VALIDATION_STATUS_MAP[
                                                    ValidationStatus.Iffy
                                                ].text}
                                            </Tag>
                                        {/if}
                                    </div>

                                    <div
                                        class="topic-card-header-internal-container"
                                    >
                                        <Button
                                            kind="tertiary"
                                            icon={Checkmark}
                                            hideTooltip
                                            size="small"
                                            on:click={() => {}}
                                        ></Button>
                                        <Button
                                            kind="tertiary"
                                            icon={Close}
                                            hideTooltip
                                            size="small"
                                            on:click={() => {}}
                                        ></Button>
                                    </div>
                                </div>

                                <div class="topic-card-internal-container">
                                    <span class="topic-card-label">
                                        Why was this theme identified?
                                    </span>
                                    <span class="topic-card-text">
                                        {theme.explanation}
                                    </span>
                                </div>

                                <div class="topic-card-internal-container">
                                    <SupportingQuotes quotes={theme.quotes} />
                                </div>

                                <div class="overall-evaluation-card-container">
                                    <div
                                        class="overall-evaluation-header-container"
                                    >
                                        <svelte:component
                                            this={VALIDATION_STATUS_MAP[
                                                theme.validation.status
                                            ].principalIcon}
                                            style={`
                                                fill: ${VALIDATION_STATUS_MAP[theme.validation.status].iconColor};
                                            `}
                                        />
                                        <span
                                            class="overall-evaluation-title-text"
                                        >
                                            Overall evaluation:
                                            {VALIDATION_STATUS_MAP[
                                                theme.validation.status
                                            ].text}
                                        </span>
                                        <Tooltip
                                            class="overall-evaluation-tooltip"
                                            icon={Help}
                                        >
                                            <p>
                                                Overall evaluation is determined
                                                using the strategy selected in
                                                the
                                                <Link
                                                    class="link"
                                                    on:click={() => {
                                                        isAISettingsModalOpen = true;
                                                    }}
                                                >
                                                    AI settings
                                                </Link>
                                                for this study. Currently, the strategy
                                                is set to
                                                {$selectedStudyStore!.validation_strategy.toLowerCase()}:
                                                {VALIDATION_STRATEGY_MAP[
                                                    $selectedStudyStore!
                                                        .validation_strategy
                                                ].toLowerCase()}.
                                            </p>
                                        </Tooltip>
                                    </div>

                                    <div
                                        class="overall-evaluation-card-content-container"
                                    >
                                        <CheckValidation
                                            checkValidation={getTopicCheckValidation(
                                                theme.validation.checks,
                                                "quote_validation",
                                            )}
                                            labelText="Quote validation"
                                        />
                                        <CheckValidation
                                            checkValidation={getTopicCheckValidation(
                                                theme.validation.checks,
                                                "llm_validation",
                                            )}
                                            labelText="LLM validation"
                                        />
                                        <CheckValidation
                                            checkValidation={getTopicCheckValidation(
                                                theme.validation.checks,
                                                "llm_assessment",
                                            )}
                                            labelText="Additional explanation"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/if}
                {/each}
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

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

    .themes-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }

    .topic-card-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(69, 137, 255, 0.1) 100%
        );
        border: 0.5px solid var(--cds-border-interactive);
        border-radius: 0.25rem;
    }

    .overall-evaluation-card-container {
        display: flex;
        flex-direction: column;
        background-color: var(--cds-ui-background);
        border: 0.5px solid var(--cds-border-interactive);
    }

    .overall-evaluation-header-container {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 1rem 2rem;
        border-bottom: 0.5px solid var(--cds-border-interactive);
    }

    .overall-evaluation-title-text {
        @include type.type-style("heading-compact-02");
    }

    .overall-evaluation-card-content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 2rem;
    }
</style>
