<script lang="ts">
    import { VALIDATION_STATUS_MAP } from "$lib/common";
    import { type IntervieweeValidation, ValidationStatus } from "$lib/models";
    import { Information } from "carbon-icons-svelte";

    export let checkValidation: IntervieweeValidation | undefined;
    export let labelText: string;
</script>

{#if checkValidation}
    <div>
        <div class="overall-evaluation-card-content-label-container">
            {#if checkValidation.method === "llm_assessment"}
                <Information
                    style={`
                        fill: ${VALIDATION_STATUS_MAP[ValidationStatus.Ok].iconColor};
                    `}
                />
            {:else}
                <svelte:component
                    this={VALIDATION_STATUS_MAP[checkValidation.status]
                        .secondaryIcon}
                    style={`
                        fill: ${VALIDATION_STATUS_MAP[checkValidation.status].iconColor};
                    `}
                />
            {/if}

            <span class="overall-evaluation-card-content-label">
                {labelText}
            </span>
        </div>
        <div class="overall-evaluation-card-explanation-text">
            {#if checkValidation.method === "llm_assessment" && checkValidation.metadata}
                <span>+ {checkValidation.metadata.strengths}</span>
                <span>- {checkValidation.metadata.weaknesses}</span>
            {:else}
                {checkValidation.explanation}
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    @use "@carbon/type";

    .overall-evaluation-card-content-label-container {
        display: flex;
        gap: 0.25rem;
    }

    .overall-evaluation-card-content-label {
        @include type.type-style("heading-compact-01");
        font-weight: 700;
        line-height: 1.125rem;
    }

    .overall-evaluation-card-explanation-text {
        display: flex;
        flex-direction: column;
        padding-left: 19px;
        @include type.type-style("heading-compact-01");
        font-weight: 400;
        line-height: 1.125rem;
    }
</style>
