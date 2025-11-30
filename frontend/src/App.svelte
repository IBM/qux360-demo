<script lang="ts">
    import { Home, Page, Study } from "$lib/components";
    import { selectedStudyStore } from "$lib/stores";
    import { Route, Router } from "svelte-routing";
</script>

<Router>
    <Route>
        <Page>
            <svelte:fragment slot="main-content">
                {#if $selectedStudyStore}
                    <Study />
                {:else}
                    <div class="external-page-content-container">
                        <Home />
                    </div>
                {/if}
            </svelte:fragment>
        </Page>
    </Route>
</Router>

<style lang="scss">
    .external-page-content-container {
        display: flex;
        justify-content: center;
        padding: 4rem 0;
    }
</style>
