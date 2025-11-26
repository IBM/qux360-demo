<script>
    import { Route, Router } from "svelte-routing";
    import Wizard from "./lib/Wizard.svelte";
</script>

<Router>
    <Route>
        <main>
            <Wizard />
        </main>
    </Route>
</Router>
