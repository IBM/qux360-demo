<script>
    import { NewStudy, Page } from "$lib/components";
    import { Route, Router } from "svelte-routing";
</script>

<Router>
    <Route>
        <Page>
            <div slot="main-content" class="external-page-content-container">
                <NewStudy />
            </div>
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
