<script lang="ts">
    import { LoadingComponent } from "$lib/common";
    import { Home, Page, Study } from "$lib/components";
    import { type StudyI } from "$lib/models";
    import {
        loadingRequestStore,
        selectedStudyStore,
        studiesStore,
    } from "$lib/stores";
    import { onMount } from "svelte";
    import { Route, Router } from "svelte-routing";

    onMount(() => {
        studiesStore.subscribe((studies: StudyI[]) => {
            studies.forEach(async (study: StudyI) => {
                studiesStore.runTranscriptFilesParticipantIdentification(study);
            });
        });
    });
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

<LoadingComponent active={$loadingRequestStore} />

<style lang="scss">
    .external-page-content-container {
        display: flex;
        justify-content: center;
        padding: 4rem 0;
    }
</style>
