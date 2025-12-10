import { writable, type Writable } from "svelte/store";

const loadingRequestsCount: Writable<number> = writable(0);

const createLoadingRequestStore = () => {
    const { subscribe, set } = writable<boolean>(false);

    loadingRequestsCount.subscribe((count: number) => {
        set(count > 0);
    });

    return {
        subscribe,
        startLoadingRequest: (): void => {
            loadingRequestsCount.update((count: number) => count + 1);
        },
        stopLoadingRequest: (): void => {
            loadingRequestsCount.update((count: number) =>
                Math.max(0, count - 1),
            );
        },
    };
};

export const loadingRequestStore = createLoadingRequestStore();
