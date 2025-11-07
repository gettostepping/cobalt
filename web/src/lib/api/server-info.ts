import { browser } from "$app/environment";

import { get } from "svelte/store";
import { currentApiURL } from "$lib/api/api-url";
import { turnstileCreated, turnstileEnabled, turnstileSolved } from "$lib/state/turnstile";
import cachedInfo from "$lib/state/server-info";
import type { CobaltServerInfoResponse, CobaltErrorResponse, CobaltServerInfo } from "$lib/types/api";

export type CobaltServerInfoCache = {
    info: CobaltServerInfo,
    origin: string,
}

const request = async () => {
    const apiURL = currentApiURL();
    
    if (!apiURL) {
        console.error('❌ Cannot fetch server info: API URL is not configured');
        return null;
    }
    
    const apiEndpoint = `${apiURL}/`;
    console.log('🔍 Fetching server info from:', apiEndpoint);

    const response: CobaltServerInfoResponse = await fetch(apiEndpoint, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
    })
    .then(async (r) => {
        console.log('📡 Server info response status:', r.status);
        if (!r.ok && r.status !== 200) {
            console.error('❌ Server info request failed:', r.status, r.statusText);
            const text = await r.text().catch(() => '');
            console.error('Response body:', text);
        }
        return r.json();
    })
    .catch((e) => {
        console.error('❌ Error fetching server info:', e);
        if (e?.message?.includes("timed out")) {
            return {
                status: "error",
                error: {
                    code: "error.api.timed_out"
                }
            } as CobaltErrorResponse
        }
        // Return null to indicate failure
        return null;
    });

    return response;
}

// reload the page if turnstile is now disabled, but was previously loaded and not solved
const reloadIfTurnstileDisabled = () => {
    if (browser && !get(turnstileEnabled) && get(turnstileCreated) && !get(turnstileSolved)) {
        window.location.reload();
    }
}

export const getServerInfo = async () => {
    const cache = get(cachedInfo);

    if (cache && cache.origin === currentApiURL()) {
        reloadIfTurnstileDisabled();
        return true
    }

    const freshInfo = await request();

    if (!freshInfo || !("cobalt" in freshInfo)) {
        return false;
    }

    if (!("status" in freshInfo)) {
        cachedInfo.set({
            info: freshInfo,
            origin: currentApiURL(),
        });

        // reload the page if turnstile sitekey changed
        if (browser && get(turnstileEnabled) && cache && cache?.info?.cobalt?.turnstileSitekey !== freshInfo?.cobalt?.turnstileSitekey) {
            window.location.reload();
        }

        reloadIfTurnstileDisabled();

        return true;
    }

    return false;
}
