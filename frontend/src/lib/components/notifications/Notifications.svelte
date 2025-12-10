<script lang="ts">
    import type { NotificationI } from "$lib/models";
    import { notificationsStore } from "$lib/stores";
    import { InlineNotification } from "carbon-components-svelte";
    import { onDestroy, onMount } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    let notifications: NotificationI[] = [];

    let unsubscribeNotificationsStore: Unsubscriber;

    onMount(() => {
        unsubscribeNotificationsStore = notificationsStore.subscribe(
            (notificationsFromSubscription: NotificationI[]) => {
                notifications = notificationsFromSubscription;
            },
        );
    });

    onDestroy(() => {
        if (unsubscribeNotificationsStore) {
            unsubscribeNotificationsStore();
        }
    });
</script>

<div class="global-section">
    {#each notifications as notification (notification.id)}
        <InlineNotification
            lowContrast
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            on:close={(e) => {
                e.preventDefault();
                notificationsStore.dismissNotification(notification.id);
            }}
        />
    {/each}
</div>

<style lang="scss">
    .global-section {
        position: fixed;
        top: 3rem;
        right: 2rem;
        z-index: 9999;

        :global(.bx--inline-notification__details) {
            width: 350px;
        }
    }
</style>
