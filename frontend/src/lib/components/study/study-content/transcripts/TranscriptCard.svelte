<script lang="ts">
    import { TRANSCRIPT_STATUS_MAP } from "$lib/common";
    import { TranscriptStatus, type TranscriptFileI } from "$lib/models";
    import { selectedTranscriptFileIdStore } from "$lib/stores";
    import { Checkbox, OverflowMenu } from "carbon-components-svelte";
    import { CircleFill } from "carbon-icons-svelte";

    export let transcript: TranscriptFileI;
    export let checked: boolean = false;
    export let onCheckChange: (value: boolean) => void = () => {};

    const handleTranscriptCardClick = (): void => {
        selectedTranscriptFileIdStore.set(transcript.id);
    };

    const onCheckboxChange = (event: Event): void => {
        const value: boolean = (event.target as HTMLInputElement).checked;
        checked = value;
        onCheckChange(value);
    };
</script>

<div
    class="transcript-card-container {checked
        ? 'transcript-card-container-checked'
        : ''}"
    on:click|self={handleTranscriptCardClick}
>
    <div class="checkbox-container">
        <Checkbox {checked} on:change={onCheckboxChange} />
    </div>
    <div
        class="transcript-details-external-container"
        on:click={handleTranscriptCardClick}
    >
        <div class="transcript-details-internal-container">
            <div class="transcript-name">
                {transcript.name}
                {#if transcript.status === TranscriptStatus.Ready}
                    <CircleFill style="fill: #24A148;" />
                {/if}
            </div>
            <div class="transcript-status-container">
                <svelte:component
                    this={TRANSCRIPT_STATUS_MAP[transcript.status].icon}
                    style="fill: {TRANSCRIPT_STATUS_MAP[transcript.status]
                        .iconColor};"
                />
                <span class="transcript-status-text">
                    {#if transcript.status === TranscriptStatus.Ready}
                        {transcript.topics.length} topics suggested
                    {:else}
                        {transcript.status}
                    {/if}
                </span>
            </div>
        </div>
    </div>

    <OverflowMenu class="transcript-card-overflow-menu" flipped size="xl"
    ></OverflowMenu>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-card-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem 1rem;
        background-color: var(--cds-ui-background);
        box-shadow: 2px 4px 12px 0px #00000014;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;

        transition:
            background-color 120ms ease,
            border-color 120ms ease;
    }

    .transcript-card-container:hover {
        cursor: pointer;
        background-color: var(--cds-hover-ui);
        border-color: var(--cds-border-interactive);
    }

    .transcript-card-container-checked {
        background-color: var(--cds-layer-selected);
    }

    :global(
            .transcript-card-container:has(.transcript-card-overflow-menu:hover)
        ) {
        cursor: default;
        background-color: var(--cds-ui-background);
        border-color: var(--cds-border-subtle-selected);
    }

    .checkbox-container {
        display: flex;
        align-items: center;
        width: 1.5rem;
        height: 1.5rem;
    }

    .transcript-details-external-container {
        display: flex;
        align-items: center;
        flex: 1;
        height: fit-content;
        gap: 0.875rem;
    }

    .transcript-details-internal-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .transcript-name {
        display: flex;
        align-items: flex-end;
        gap: 0.25rem;
        @include type.type-style("body-compact-02");
        font-weight: 700;
    }

    .transcript-status-container {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .transcript-status-text {
        @include type.type-style("body-compact-02");
        color: var(--cds-text-secondary);
    }

    .separator {
        width: 4px;
        height: 4px;
        background-color: #8d8d8d;
        border-radius: 50%;
    }

    .delete-item-container {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    :global(.transcript-card-overflow-menu) {
        width: 2rem;
        height: 2rem;
    }
</style>
