<script lang="ts">
    import {
        AILabel,
        AISettingsModal,
        EditTopicModal,
        Quote,
        VALIDATION_STATUS_MAP,
        VALIDATION_STRATEGY_MAP,
    } from "$lib/common";
    import {
        TranscriptStatus,
        ValidationStatus,
        type IdentifiedTopicI,
        type ValidationI,
    } from "$lib/models";
    import { utilsService } from "$lib/services";
    import {
        selectedStudyIdStore,
        selectedStudyStore,
        selectedTranscriptFileIdStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import { Button, Link, Tag, Tooltip } from "carbon-components-svelte";
    import { Checkmark, Close, Help } from "carbon-icons-svelte";
    import { onMount } from "svelte";
    import CheckValidation from "./CheckValidation.svelte";

    export let identifiedTopics: IdentifiedTopicI[];

    let runTopicExtractionButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    let isReRunTopicExtractionButtonLoading: boolean = false;

    let topicToEdit: IdentifiedTopicI | null = null;

    let isEditTopicModalOpen: boolean = false;
    let isAISettingsModalOpen: boolean = false;

    $: isReRunTopicExtractionButtonLoading =
        !$selectedTranscriptStore ||
        $selectedTranscriptStore.status ===
            TranscriptStatus.RunningTopicExtraction;

    onMount(() => {
        requestAnimationFrame(async () => {
            await utilsService.updateAILabelSlugColor(
                runTopicExtractionButtonContentElementRef,
                aiLabelSlugColor,
            );
        });
    });

    const getTopicCheckValidation = (
        checks: ValidationI[],
        method: string,
    ): ValidationI | undefined => {
        return checks.find((check: ValidationI) => check.method === method);
    };

    const handleTopicNameLinkClick = (topic: IdentifiedTopicI): void => {
        topicToEdit = topic;
        isEditTopicModalOpen = true;
    };

    const handleApproveTopicButtonClick = (
        identifiedTopic: IdentifiedTopicI,
    ): void => {
        if ($selectedStudyIdStore && $selectedTranscriptFileIdStore) {
            studiesStore.approveTopic(
                $selectedStudyIdStore,
                $selectedTranscriptFileIdStore,
                identifiedTopic,
            );
        }
    };

    const handleRemoveTopicButtonClick = (
        identifiedTopic: IdentifiedTopicI,
    ): void => {
        if ($selectedStudyIdStore && $selectedTranscriptFileIdStore) {
            studiesStore.removeTopic(
                $selectedStudyIdStore,
                $selectedTranscriptFileIdStore,
                identifiedTopic,
            );
        }
    };
</script>

{#if identifiedTopics.length > 0}
    <div class="topic-names-external-container">
        <h4 class="topics-label">Suggested topics</h4>

        <div class="topic-names-vertical-line-container">
            <div class="vertical-line"></div>
            <div class="topic-names-internal-container">
                {#each identifiedTopics as identifiedTopic, index (index)}
                    <div class="topic-name-container">
                        <div class="horizonal-line"></div>
                        <Link
                            class="link"
                            on:click={() => {
                                handleTopicNameLinkClick(identifiedTopic);
                            }}
                        >
                            {identifiedTopic.topic}
                        </Link>
                        {#if identifiedTopic.validation}
                            <svelte:component
                                this={VALIDATION_STATUS_MAP[
                                    identifiedTopic.validation.status
                                ].principalIcon}
                                style={`
                                    fill: ${VALIDATION_STATUS_MAP[identifiedTopic.validation.status].iconColor};
                                `}
                            />
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<Button
    kind="tertiary"
    size="field"
    skeleton={isReRunTopicExtractionButtonLoading}
    on:click={() => {}}
    on:mouseenter={async () => {
        aiLabelSlugColor = "white";
        await utilsService.updateAILabelSlugColor(
            runTopicExtractionButtonContentElementRef,
            aiLabelSlugColor,
        );
    }}
    on:mouseleave={async () => {
        aiLabelSlugColor = "var(--cds-button-tertiary)";
        await utilsService.updateAILabelSlugColor(
            runTopicExtractionButtonContentElementRef,
            aiLabelSlugColor,
        );
    }}
>
    <div
        bind:this={runTopicExtractionButtonContentElementRef}
        class="button-with-ai-label-container"
    >
        Re-run topic extraction
        <AILabel
            headerText="Suggest topics"
            bodyText="AI is used to identify major topics in the transcript and provide supporting quotes. Major topics are determined based on the study description you provided."
            modelName="granite.13b.v2.instruct"
            modelLink=""
            alignment="bottom-left"
            kind="inline"
        />
    </div>
</Button>

{#each identifiedTopics as identifiedTopic, index (index)}
    {#if identifiedTopic.validation}
        <div class="topic-card-container">
            <div class="topic-card-header-container">
                <div class="topic-card-header-internal-container">
                    <span class="topic-card-title-text">
                        {identifiedTopic.topic}
                    </span>
                    {#if identifiedTopic.validation.status === ValidationStatus.Ok}
                        <Tag type="cyan">
                            {VALIDATION_STATUS_MAP[ValidationStatus.Ok].text}
                        </Tag>
                    {:else if identifiedTopic.validation.status === ValidationStatus.Check}
                        <Tag class="uncertain-quality-tag">
                            {VALIDATION_STATUS_MAP[ValidationStatus.Check].text}
                        </Tag>
                    {:else if identifiedTopic.validation.status === ValidationStatus.Iffy}
                        <Tag type="red">
                            {VALIDATION_STATUS_MAP[ValidationStatus.Iffy].text}
                        </Tag>
                    {/if}
                </div>

                <div class="topic-card-header-internal-container">
                    <Button
                        kind="tertiary"
                        icon={Checkmark}
                        hideTooltip
                        size="small"
                        on:click={() => {
                            handleApproveTopicButtonClick(identifiedTopic);
                        }}
                    ></Button>
                    <Button
                        kind="tertiary"
                        icon={Close}
                        hideTooltip
                        size="small"
                        on:click={() => {
                            handleRemoveTopicButtonClick(identifiedTopic);
                        }}
                    ></Button>
                </div>
            </div>

            <div class="topic-card-internal-container">
                <span class="topic-card-label">
                    Why was this topic identified?
                </span>
                <span class="topic-card-text">
                    {identifiedTopic.explanation}
                </span>
            </div>

            <div class="topic-card-internal-container">
                <span class="topic-card-label">Supporting quotes</span>
                {#each identifiedTopic.quotes as quote (quote.line_number)}
                    <Quote
                        line_number={quote.line_number}
                        timestamp={quote.timestamp}
                        speaker={quote.speaker}
                        quote={quote.quote}
                    />
                {/each}
            </div>

            <div class="overall-evaluation-card-container">
                <div class="overall-evaluation-header-container">
                    <svelte:component
                        this={VALIDATION_STATUS_MAP[
                            identifiedTopic.validation.status
                        ].principalIcon}
                        style={`
                            fill: ${VALIDATION_STATUS_MAP[identifiedTopic.validation.status].iconColor};
                        `}
                    />
                    <span class="overall-evaluation-title-text">
                        Overall evaluation:
                        {VALIDATION_STATUS_MAP[
                            identifiedTopic.validation.status
                        ].text}
                    </span>
                    <Tooltip class="overall-evaluation-tooltip" icon={Help}>
                        <p>
                            Overall evaluation is determined using the strategy
                            selected in the
                            <Link
                                class="link"
                                on:click={() => {
                                    isAISettingsModalOpen = true;
                                }}
                            >
                                AI settings
                            </Link>
                            for this study. Currently, the strategy is set to {$selectedStudyStore!.validation_strategy.toLowerCase()}:
                            {VALIDATION_STRATEGY_MAP[
                                $selectedStudyStore!.validation_strategy
                            ].toLowerCase()}.
                        </p>
                    </Tooltip>
                </div>

                <div class="overall-evaluation-card-content-container">
                    <CheckValidation
                        checkValidation={getTopicCheckValidation(
                            identifiedTopic.validation.checks,
                            "quote_validation",
                        )}
                        labelText="Quote validation"
                    />
                    <CheckValidation
                        checkValidation={getTopicCheckValidation(
                            identifiedTopic.validation.checks,
                            "llm_validation",
                        )}
                        labelText="LLM validation"
                    />
                    <CheckValidation
                        checkValidation={getTopicCheckValidation(
                            identifiedTopic.validation.checks,
                            "llm_assessment",
                        )}
                        labelText="Additional explanation"
                    />
                </div>
            </div>
        </div>
    {/if}
{/each}

{#key isEditTopicModalOpen}
    {#if isEditTopicModalOpen && topicToEdit}
        <EditTopicModal
            bind:isModalOpen={isEditTopicModalOpen}
            transcriptFileId={$selectedTranscriptFileIdStore}
            originalTopicName={topicToEdit.topic}
            topicName={topicToEdit.topic}
            topicDescription={topicToEdit.explanation}
            quotes={topicToEdit.quotes}
        />
    {/if}
{/key}

{#key isAISettingsModalOpen}
    {#if isAISettingsModalOpen}
        <AISettingsModal
            bind:isModalOpen={isAISettingsModalOpen}
            study={$selectedStudyStore!}
        />
    {/if}
{/key}

<style lang="scss">
    @use "@carbon/type";

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

    :global(.uncertain-quality-tag) {
        background-color: #ffd9be;
        color: #8a3800;
    }

    :global(.overall-evaluation-tooltip) {
        margin-top: 2px;
        margin-left: -0.25rem;
    }

    :global(.overall-evaluation-tooltip .bx--tooltip) {
        width: 18rem;
    }
</style>
