<script lang="ts">
    import {
        AILabel,
        RUNNING_TOPIC_EXTRACTION_TRANSCRIPT_STATUS,
    } from "$lib/common";
    import { ValidationStatus, type IdentifiedTopicI } from "$lib/models";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Button, Link, Tag } from "carbon-components-svelte";
    import { Checkmark, Close } from "carbon-icons-svelte";
    import { onMount } from "svelte";

    export let identifiedTopics: IdentifiedTopicI[];

    let runTopicExtractionButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    onMount(() => {
        requestAnimationFrame(() => {
            updateAILabelSlugColor();
        });
    });

    const updateAILabelSlugColor = (): void => {
        const shadow: ShadowRoot | null | undefined =
            runTopicExtractionButtonContentElementRef?.lastElementChild
                ?.shadowRoot;
        if (!shadow) {
            return;
        }

        const style: HTMLStyleElement = document.createElement("style");
        style.textContent = `
                .cds--slug__text {
                    color: ${aiLabelSlugColor} !important;
                }

                .cds--slug__text::before {
                    background: ${aiLabelSlugColor} !important;
                }
            `;
        shadow.appendChild(style);
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
                        <Link class="topic-name-link" on:click={() => {}}>
                            {identifiedTopic.topic}
                        </Link>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<Button
    class="run-topic-extraction-button"
    kind="tertiary"
    size="field"
    skeleton={!$selectedTranscriptStore ||
        $selectedTranscriptStore.status.status ===
            RUNNING_TOPIC_EXTRACTION_TRANSCRIPT_STATUS.status}
    on:click={() => {}}
    on:mouseenter={() => {
        aiLabelSlugColor = "white";
        updateAILabelSlugColor();
    }}
    on:mouseleave={() => {
        aiLabelSlugColor = "var(--cds-button-tertiary)";
        updateAILabelSlugColor();
    }}
>
    <div
        bind:this={runTopicExtractionButtonContentElementRef}
        class="run-topic-extraction-button-content-container"
    >
        Re-run topic extraction
        <AILabel
            headerText="Suggested topics"
            bodyText="AI is used to identify major topics in the transcript and provide supporting quotes. Major topics are determined based on the study description you provided."
            modelName="granite.13b.v2.instruct"
            modelLink=""
            alignment="bottom-left"
            kind="inline"
        />
    </div>
</Button>

{#each identifiedTopics as identifiedTopic, index (index)}
    <div class="topic-card-container">
        <div class="topic-card-header-container">
            <div class="topic-card-header-internal-container">
                <span class="topic-card-title-text">
                    {identifiedTopic.topic}
                </span>
                {#if identifiedTopic.validation?.status === ValidationStatus.Ok}
                    <Tag type="cyan">High quality</Tag>
                {:else if identifiedTopic.validation?.status === ValidationStatus.Check}
                    <Tag class="uncertain-quality-tag">Uncertain quality</Tag>
                {:else if identifiedTopic.validation?.status === ValidationStatus.Iffy}
                    <Tag type="red">Low quality</Tag>
                {/if}
            </div>

            <div class="topic-card-header-internal-container">
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
            <span class="topic-card-label">Why was this topic identified?</span>
            <span class="topic-card-text">{identifiedTopic.explanation}</span>
        </div>

        <div class="topic-card-internal-container">
            <span class="topic-card-label">Supporting quotes</span>
        </div>
    </div>
{/each}

<style lang="scss">
    @use "@carbon/type";

    .run-topic-extraction-button-content-container {
        display: flex;
        gap: 0.25rem;
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

    .topic-card-header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .topic-card-header-internal-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .topic-card-title-text {
        @include type.type-style("heading-02");
    }

    .topic-card-internal-container {
        display: flex;
        flex-direction: column;
    }

    .topic-card-label {
        @include type.type-style("body-compact-01");
        font-weight: 700;
        line-height: 1.125rem;
    }

    .topic-card-text {
        @include type.type-style("body-compact-01");
        line-height: 1.125rem;
    }

    :global(.run-topic-extraction-button) {
        width: fit-content;
        padding-right: 12px;
    }

    :global(.uncertain-quality-tag) {
        background-color: #ffd9be;
        color: #8a3800;
    }
</style>
