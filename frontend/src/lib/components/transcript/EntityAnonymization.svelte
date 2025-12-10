<script lang="ts">
    import { AILabel } from "$lib/common";
    import type {
        EntityAnonymizationMap,
        ExtendedEntityAnonymizationMap,
        SpeakerAnonymizationMap,
        TranscriptFileI,
        TranscriptLineI,
    } from "$lib/models";
    import { apiService, utilsService } from "$lib/services";
    import {
        selectedStudyStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import {
        Button,
        Modal,
        SkeletonText,
        TextInput,
    } from "carbon-components-svelte";
    import { Add, Close } from "carbon-icons-svelte";
    import { onDestroy, onMount } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    let runEntityAnonymizationButtonContentElementRef: HTMLElement;

    let entityAnonymizationMap: EntityAnonymizationMap = {};
    let extendedEntityAnonymizationMap: ExtendedEntityAnonymizationMap = {};

    let isAddEntityModalOpen: boolean = false;
    let isExistingEntity: boolean = false;
    let newEntityName: string = "";

    let isLoadingTranscriptLines: boolean = true;
    let transcriptLines: TranscriptLineI[] = [];

    let unsubscribeSelectedTranscriptStore: Unsubscriber;

    $: if ($selectedTranscriptStore && transcriptLines) {
        entityAnonymizationMap =
            $selectedTranscriptStore.entity_anonymization_map;
        extendedEntityAnonymizationMap =
            transformToExtendedEntityAnonymizationMap();
    }

    $: isAddEntityModalOpen, (newEntityName = "");
    $: isExistingEntity = newEntityName in entityAnonymizationMap;

    onMount(() => {
        requestAnimationFrame(() => {
            const shadow: ShadowRoot | null | undefined =
                runEntityAnonymizationButtonContentElementRef?.lastElementChild
                    ?.shadowRoot;
            if (!shadow) {
                return;
            }

            const style: HTMLStyleElement = document.createElement("style");
            style.textContent = `
                .cds--slug__text {
                    color: white !important;
                }

                .cds--slug__text::before {
                    background: white !important;
                }
            `;
            shadow.appendChild(style);
        });

        unsubscribeSelectedTranscriptStore = selectedTranscriptStore.subscribe(
            async (selectedTranscript: TranscriptFileI | null) => {
                isLoadingTranscriptLines = true;

                if (selectedTranscript?.id) {
                    let lines: TranscriptLineI[] =
                        await apiService.getTranscriptLines(
                            selectedTranscript.id,
                        );
                    lines = applySpeakerAnonymization(
                        lines,
                        selectedTranscript.speaker_anonymization_map,
                    );
                    transcriptLines = lines;
                } else {
                    transcriptLines = [];
                }

                isLoadingTranscriptLines = false;
            },
        );
    });

    onDestroy(() => {
        unsubscribeSelectedTranscriptStore?.();
    });

    const applySpeakerAnonymization = (
        lines: TranscriptLineI[],
        map: SpeakerAnonymizationMap | null,
    ): TranscriptLineI[] => {
        if (!map) return lines;

        return lines.map((line: TranscriptLineI) => ({
            ...line,
            speaker: map[line.speaker] || line.speaker,
        }));
    };

    const runTranscriptEntityAnonymizationWithAI =
        async (): Promise<void> => {};

    const handleAddEntityButtonClick = (): void => {
        isAddEntityModalOpen = true;
    };

    const updateAlias = (entity: string, alias: string): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.updateEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                entity,
                alias,
            );
        }
    };

    const removeAlias = (entity: string): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.removeEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                entity,
            );
        }
    };

    const handleAddEntityModalCancelButtonClick = (): void => {
        isAddEntityModalOpen = false;
    };

    const handleAddEntityModalAddButtonClick = (): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.updateEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                newEntityName,
                "",
            );
        }
        isAddEntityModalOpen = false;
    };

    const countEntityMentions = (entity: string): number => {
        if (!entity) return 0;

        const escapedEntity: string = entity.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        const regex: RegExp = new RegExp(`\\b${escapedEntity}\\b`, "gi"); // 'i' = case-insensitive

        let count: number = 0;

        for (const line of transcriptLines) {
            const matches: RegExpMatchArray | null =
                line.statement.match(regex);
            if (matches) count += matches.length;
        }

        return count;
    };

    const getLinesWithEntity = (entity: string): TranscriptLineI[] => {
        if (!entity) return [];

        const escapedEntity: string = entity.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        const regex: RegExp = new RegExp(`\\b${escapedEntity}\\b`, "i"); // 'i' = case-insensitive

        return transcriptLines.filter((line: TranscriptLineI) =>
            regex.test(line.statement),
        );
    };

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

    const transformToExtendedEntityAnonymizationMap =
        (): ExtendedEntityAnonymizationMap => {
            return Object.entries(entityAnonymizationMap).reduce(
                (acc, [entity, alias]) => {
                    const lines: TranscriptLineI[] = getLinesWithEntity(entity);
                    const count: number = countEntityMentions(entity);

                    acc[entity] = {
                        alias,
                        count,
                        transcriptLines: lines,
                    };

                    return acc;
                },
                {} as ExtendedEntityAnonymizationMap,
            );
        };

    const handleTranscriptLineHeaderClick = (lineNumber: number): void => {
        utilsService.scrollToTranscriptLine(lineNumber);
    };
</script>

<div class="entity-anonymization-container">
    <h3 class="transcript-section-title">Entity anonymization</h3>
    <div class="entity-anonymization-buttons-container">
        <Button
            class="run-anonymization-button run-entity-anonymization-button"
            kind="primary"
            size="field"
            on:click={async () => {
                await runTranscriptEntityAnonymizationWithAI();
            }}
        >
            <div
                bind:this={runEntityAnonymizationButtonContentElementRef}
                class="run-anonymization-button-content-container"
            >
                Run anonymization
                <AILabel
                    headerText="Entity anonymization"
                    bodyText="AI is used to identify sensitive entities to anonymize, such as names, locations, and organizations."
                    modelName="granite.13b.v2.instruct"
                    modelLink=""
                    alignment="top-left"
                    kind="inline"
                />
            </div>
        </Button>
        <Button
            kind="tertiary"
            size="field"
            icon={Add}
            on:click={handleAddEntityButtonClick}
        >
            Add entity
        </Button>
    </div>
    {#each Object.entries(extendedEntityAnonymizationMap) as [entity, extendedEntityAnonymization]}
        <div class="entity-anonymization-item-container">
            <TextInput labelText="Entity" value={entity} readonly />
            <TextInput
                labelText="Replacement text"
                value={extendedEntityAnonymization.alias}
                on:input={(event: CustomEvent) => {
                    updateAlias(entity, event.detail);
                }}
            />
            <Button
                class="close-entity-anonymization-item-button"
                kind="ghost"
                size="small"
                on:click={() => removeAlias(entity)}
            >
                <Close size={16} />
            </Button>
        </div>
        {#if extendedEntityAnonymization.count > 0}
            <div class="mentions-container">
                <span class="mentions-label">
                    Mentions ({extendedEntityAnonymization.count})
                </span>
                <div class="transcript-lines-container">
                    {#if isLoadingTranscriptLines}
                        {#each Array(3) as _}
                            <SkeletonText paragraph />
                        {/each}
                    {:else}
                        {#each extendedEntityAnonymization.transcriptLines as transcriptLine (transcriptLine.line_number)}
                            <div class="transcript-line-container">
                                <span
                                    class="transcript-line-header"
                                    on:click={() => {
                                        handleTranscriptLineHeaderClick(
                                            transcriptLine.line_number,
                                        );
                                    }}
                                >
                                    {transcriptLine.speaker}
                                    <strong>•</strong>
                                    {transcriptLine.timestamp}
                                </span>
                                <span>
                                    {@html highlightEntity(
                                        transcriptLine.statement,
                                        entity,
                                    )}
                                </span>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {/if}
    {/each}
</div>

<Modal
    bind:open={isAddEntityModalOpen}
    modalHeading="Add entity"
    size="sm"
    secondaryButtonText="Cancel"
    primaryButtonText="Add"
    primaryButtonDisabled={newEntityName.trim() === "" || isExistingEntity}
    on:click:button--secondary={handleAddEntityModalCancelButtonClick}
    on:click:button--primary={handleAddEntityModalAddButtonClick}
>
    <TextInput
        bind:value={newEntityName}
        labelText="Entity"
        placeholder=""
        invalid={isExistingEntity}
        invalidText="This entity has already been previously added to be anonymized"
    />
</Modal>

<style lang="scss">
    @use "@carbon/type";

    .entity-anonymization-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .entity-anonymization-buttons-container {
        display: flex;
        gap: 0.5rem;
    }

    .run-anonymization-button-content-container {
        display: flex;
        gap: 0.25rem;
    }

    .entity-anonymization-item-container {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
    }

    .mentions-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 188px;
        padding: 0.75rem 1rem;
        overflow: scroll;
        background-color: var(--cds-ui-background);
        border: 1px solid var(--cds-border-subtle-selected);
        border-radius: 0.25rem;
    }

    .mentions-label {
        @include type.type-style("label-02");
        font-weight: 700;
        line-height: 1.125rem;
    }

    .transcript-lines-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .transcript-line-container {
        display: flex;
        flex-direction: column;
        @include type.type-style("label-02");
        line-height: 1.125rem;
    }

    .transcript-line-header:hover {
        cursor: pointer;
        opacity: 0.5;
    }

    :global(.run-entity-anonymization-button) {
        padding-right: 12px;
    }

    :global(.close-entity-anonymization-item-button) {
        color: black;
        padding: 3px !important;
        margin-bottom: 0.25rem;
    }

    :global(.bold-entity) {
        font-weight: 700;
    }
</style>
