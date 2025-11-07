import env from "$lib/env";
import { get } from "svelte/store";
import settings from "$lib/state/settings";

export const currentApiURL = () => {
    const processingSettings = get(settings).processing;
    const customInstanceURL = processingSettings.customInstanceURL;

    if (processingSettings.enableCustomInstances && customInstanceURL.length > 0) {
        try {
            return new URL(customInstanceURL).origin;
        } catch (e) {
            console.error('❌ Invalid custom instance URL:', customInstanceURL, e);
            // Fall through to default
        }
    }

    // Check if DEFAULT_API is set BEFORE trying to use it
    if (!env.DEFAULT_API) {
        console.error('❌ WEB_DEFAULT_API environment variable is not set!');
        console.error('⚠️  This is a build-time variable. Please set it in Vercel:');
        console.error('   1. Go to Vercel Project Settings → Environment Variables');
        console.error('   2. Add: WEB_DEFAULT_API = https://api.cobalt.tools (or your API URL)');
        console.error('   3. Redeploy your project');
        console.error('📝 Note: Trailing slashes are OK, but make sure to include https://');
        // Return empty string - this will cause fetch to fail and show the error
        return '';
    }

    try {
        // Handle trailing slashes - new URL() handles them fine, but let's be explicit
        const apiUrl = env.DEFAULT_API.trim();
        // Remove trailing slash if present (origin will anyway, but this makes it clearer)
        const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const url = new URL(cleanUrl);
        console.log('📍 Using Cobalt API URL:', url.origin);
        return url.origin;
    } catch (e) {
        console.error('❌ Invalid WEB_DEFAULT_API URL:', env.DEFAULT_API, e);
        console.error('⚠️  Make sure the URL includes the protocol (https:// or http://)');
        return '';
    }
}
