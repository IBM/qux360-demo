<script lang="ts">
    import type { SerializableTranscriptFileI } from "$lib/models";
    import { Checkbox, OverflowMenu } from "carbon-components-svelte";

    export let transcript: SerializableTranscriptFileI;
    export let checked: boolean = false;
    export let onCheckChange: (value: boolean) => void = () => {};

    const handleTranscriptCardClick = (): void => {};

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
        class="transcript-details-container"
        on:click={handleTranscriptCardClick}
    >
        <span class="transcript-name">{transcript.name}</span>
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

    .transcript-details-container {
        display: flex;
        align-items: center;
        flex: 1;
        height: fit-content;
        gap: 0.875rem;
    }

    .transcript-name {
        @include type.type-style("body-compact-02");
        font-weight: 700;
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
