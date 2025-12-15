<script lang="ts">
    import { Header, Notifications } from "$lib/components";
    import { Content } from "carbon-components-svelte";
</script>

<div class="page-container">
    <Header />
    <div class="page-content">
        <Notifications />
        <Content class="main-content-container">
            <slot name="main-content"></slot>
        </Content>
    </div>
</div>

<style lang="scss">
    $header-height: 3rem;

    .page-container {
        display: flex;
        width: 100%;
        min-height: 100vh;
        margin: 0;
    }

    .page-content {
        display: flex;
        position: relative;
        top: $header-height;
        height: calc(100vh - $header-height);
        width: 100%;
        margin: 0;
        overflow-y: scroll;
    }

    :global(.main-content-container) {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
        width: 100%;
        padding: 0;
    }
</style>
