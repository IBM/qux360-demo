<script lang="ts">
    import {
        AILabel,
        Quote,
        SupportingQuotes,
        VALIDATION_STATUS_MAP,
        VALIDATION_STRATEGY_MAP,
    } from "$lib/common";
    import CheckValidation from "$lib/components/transcript/analysis/CheckValidation.svelte";
    import {
        StudyStatus,
        ValidationStatus,
        type IdentifiedThemeI,
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

    let approvedIdentifiedThemes: IdentifiedThemeI[] = [];
    let suggestedIdentifiedThemes: IdentifiedThemeI[] = [];

    let selectedContentSwitcherIndex: number = 0;

    let searchThemeValue: string = "";

    let isAISettingsModalOpen: boolean = false;

    let suggestThemesButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    $: if ($selectedStudyStore) {
        approvedIdentifiedThemes = $selectedStudyStore.themes.filter(
            (theme: IdentifiedThemeI) =>
                theme.validation &&
                theme.validation.isApprovedByUser &&
                theme.title
                    .toLowerCase()
                    .includes(searchThemeValue.toLowerCase()),
        );

        suggestedIdentifiedThemes = $selectedStudyStore.themes.filter(
            (theme: IdentifiedThemeI) =>
                theme.validation &&
                !theme.validation.isApprovedByUser &&
                theme.title
                    .toLowerCase()
                    .includes(searchThemeValue.toLowerCase()),
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

    const getTranscriptNameFromStudy = (interviewId: string): string => {
        let transcriptName: string = "";

        if ($selectedStudyStore) {
            transcriptName =
                $selectedStudyStore.transcriptFiles.find(
                    (transcript) => transcript.id?.toString() === interviewId,
                )?.name || "";
        }

        return transcriptName;
    };

    const handleApproveThemeButtonClick = (
        identifiedTheme: IdentifiedThemeI,
    ): void => {
        if ($selectedStudyIdStore) {
            studiesStore.approveTheme($selectedStudyIdStore, identifiedTheme);
        }
    };

    const handleRemoveThemeButtonClick = (themeTopicToRemove: string): void => {
        if ($selectedStudyIdStore) {
            studiesStore.removeTheme($selectedStudyIdStore, themeTopicToRemove);
        }
    };
</script>

<div class="all-themes-tab-content-container">
    <ContentSwitcher bind:selectedIndex={selectedContentSwitcherIndex}>
        <Switch>
            <span>
                Approved themes ({approvedIdentifiedThemes.length})
            </span>
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
            {#each suggestedIdentifiedThemes as theme, index (index)}
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
                                        {theme.title}
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
                                        on:click={() => {
                                            handleApproveThemeButtonClick(
                                                theme,
                                            );
                                        }}
                                    ></Button>
                                    <Button
                                        kind="tertiary"
                                        icon={Close}
                                        hideTooltip
                                        size="small"
                                        on:click={() => {
                                            handleRemoveThemeButtonClick(
                                                theme.title,
                                            );
                                        }}
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
                                <span class="topic-card-label">
                                    Supporting topics and quotes
                                </span>
                                <div class="theme-topics-container">
                                    {#each theme.topics as topic, topic_index (topic_index)}
                                        <span>
                                            {topic_index + 1}. {topic.topic} [{getTranscriptNameFromStudy(
                                                topic.interview_id!,
                                            )}]
                                        </span>
                                        <div class="quotes-container">
                                            {#each topic.quotes as quote (quote.index)}
                                                <div
                                                    class="quote-external-container"
                                                >
                                                    <Quote
                                                        index={quote.index}
                                                        timestamp={quote.timestamp}
                                                        speaker={quote.speaker}
                                                        quote={quote.quote}
                                                    />
                                                </div>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
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
                                    <span class="overall-evaluation-title-text">
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
                                            using the strategy selected in the
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
                                            "topic_hydration",
                                        )}
                                        labelText="Cross validation"
                                    />
                                    <CheckValidation
                                        checkValidation={getTopicCheckValidation(
                                            theme.validation.checks,
                                            "cross_interview_coverage",
                                        )}
                                        labelText="Cross-interview coverage"
                                    />
                                    <CheckValidation
                                        checkValidation={getTopicCheckValidation(
                                            theme.validation.checks,
                                            "topic_count",
                                        )}
                                        labelText="Topic count"
                                    />
                                    <CheckValidation
                                        checkValidation={getTopicCheckValidation(
                                            theme.validation.checks,
                                            "llm_coherence",
                                        )}
                                        labelText="Coherence"
                                    />
                                </div>
                            </div>
                        </div>
                    {/if}
                {/if}
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

    .interview-name {
        margin-bottom: 0.25rem;
    }

    .theme-topics-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
    }

    .quotes-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-left: 1.5rem;
    }

    .quote-external-container {
        display: flex;
    }

    .quote-external-container::before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 4px;
        margin-top: 7px;
        margin-right: 0.5rem;
        background-color: black;
        border-radius: 50%;
    }
</style>
