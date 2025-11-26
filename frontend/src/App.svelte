<script>
    import { Page } from "$lib/components";
    import { Route, Router } from "svelte-routing";
    import Wizard from "./lib/Wizard.svelte";
</script>

<Router>
    <Route>
        <Page>
            <Wizard slot="main-content" />
        </Page>
    </Route>
</Router>
