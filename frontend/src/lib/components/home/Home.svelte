<script lang="ts">
    import { AllStudies, NewStudy } from ".";

    let isCreatingStudy: boolean = false;
</script>

{#if !isCreatingStudy}
    <AllStudies bind:isCreatingStudy />
{:else}
    <NewStudy bind:isCreatingStudy />
{/if}

<style lang="scss">
</style>
