<script lang="ts">
    import { Popover } from "carbon-components-svelte";
    import { onMount } from "svelte";

    export let headerText: string;
    export let bodyText: string;
    export let alignment:
        | "top"
        | "top-left"
        | "top-right"
        | "bottom"
        | "bottom-left"
        | "bottom-right"
        | "left"
        | "left-bottom"
        | "left-top"
        | "right"
        | "right-bottom"
        | "right-top" = "bottom-left";
    export let kind: "default" | "inline" = "default";

    let open: boolean = false;
    let triggerRef: HTMLButtonElement;

    onMount(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                triggerRef &&
                !triggerRef.contains(event.target as Node)
            ) {
                const popover = document.querySelector(
                    ".cds--ai-label__popover",
                );
                if (popover && !popover.contains(event.target as Node)) {
                    open = false;
                }
            }
        };

        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    });

    const togglePopover = (event: MouseEvent) => {
        if (kind !== "inline") {
            event.stopPropagation();
            open = !open;
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            open = false;
        }
    };
    const handleMouseEnter = () => {
        if (kind === "inline") {
            open = true;
        }
    };

    const handleMouseLeave = () => {
        if (kind === "inline") {
            open = false;
        }
    };
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
    class="cds--ai-label {kind}"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <button
        bind:this={triggerRef}
        type="button"
        class="cds--ai-label__button"
        on:click={togglePopover}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="AI Information"
    >
        {#if kind === "inline"}
            <div class="cds--ai-label__inline-icon"></div>
        {/if}
        <span class="cds--ai-label__text">AI</span>
    </button>

    <Popover bind:open align={alignment} class="cds--ai-label__popover">
        <div class="cds--ai-label__content">
            <div class="cds--ai-label__explanation">
                <p class="cds--ai-label__explanation-label">AI explained</p>
                <h2 class="cds--ai-label__heading">{headerText}</h2>
                <div class="cds--ai-label__body">
                    {bodyText}
                </div>
            </div>
        </div>
    </Popover>
</div>

<style lang="scss">
    @use "@carbon/type";

    .cds--ai-label {
        display: inline-flex;
        position: relative;
        align-items: center;
        vertical-align: middle;
    }

    .cds--ai-label__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.375rem;
        background: transparent;
        color: var(--cds-text-primary, #161616);
        border: 1px solid var(--cds-border-inverse, #c6c6c6);
        transition:
            background-color 0.11s,
            color 0.11s;
        cursor: pointer;

        &:hover {
            background-color: var(--cds-background-inverse, #161616);
            color: var(--cds-text-inverse, #ffffff);
            border-color: var(--cds-background-inverse, #161616);
        }

        &:focus {
            outline: 2px solid var(--cds-focus, #0f62fe);
        }

        &:active {
            transform: scale(0.98);
        }
    }

    .cds--ai-label__inline-icon {
        width: 4px;
        height: 4px;
    }

    .cds--ai-label__text {
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1rem;
    }

    /* Inline Variant */
    .cds--ai-label.inline {
        .cds--ai-label__button {
            border: none;
            background: transparent;
            padding: 0;
            height: auto;
            gap: 0.25rem;
        }
    }

    .cds--ai-label__content {
        display: flex;
        flex-direction: column;
        width: 320px;
        padding: 1.5rem;
        background: var(--cds-layer-01, #ffffff);
        border: 1px solid var(--cds-support-info-inverse);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
    }

    .cds--ai-label__explanation {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .cds--ai-label__explanation-label {
        @include type.type-style("label-02");
        line-height: 1.125rem;
        color: var(--cds-text-secondary);
    }

    .cds--ai-label__heading {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
    }

    .cds--ai-label__body {
        @include type.type-style("body-01");
        color: var(--cds-text-secondary, #525252);
        margin-bottom: 1.5rem;
    }
</style>
