<script lang="ts">
    import { Loading } from "carbon-components-svelte";

    export let active: boolean;
</script>

<Loading class="loading-animation" withOverlay={true} {active} />

<style lang="scss">
    :global(.loading-animation.bx--loading-overlay) {
        z-index: 9999;
    }
</style>
