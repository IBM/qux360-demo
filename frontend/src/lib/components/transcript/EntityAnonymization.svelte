<script lang="ts">
    import { AILabel } from "$lib/common";
    import { Button } from "carbon-components-svelte";
    import { Add } from "carbon-icons-svelte";
    import { onMount } from "svelte";

    let runEntityAnonymizationButtonContentElementRef: HTMLElement;

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
    });

    const runTranscriptEntityAnonymizationWithAI = async (): Promise<void> => {
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
        <Button kind="tertiary" size="field" icon={Add} on:click={() => {}}>
            Add entity
        </Button>
    </div>
</div>

<style lang="scss">
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

    :global(.run-entity-anonymization-button) {
        padding-right: 12px;
    }
</style>
