# Leetify Unranked Uploader
A Chrome extension that automatically imports Unranked Matchmaking, Wingman, and CS2 Limited Test Matches to Leetify.
[Find out more on the Leetify Blog!](http://blog.leetify.com/unranked-uploader)

[![Available in the Chrome Web Store](unpackaged-assets/available-in-the-chrome-web-store.png)](https://chrome.google.com/webstore/detail/leetify-unranked-uploader/nobacdlcblpahdbhfihcgkgpjhcmdhlo)


## How it works
This is a high-level overview so you can find your way around this codebase a bit easier:

A match sync is started [every 15 minutes](src/background-sync.ts), when you [visit Leetify or the Steam GCPD page for CS](src/sync-on-page-visit.ts), when you [click either the extension icon in the Chrome toolbar](src/action.ts), or the “Sync matches now” button on the extension options page.

The extension loads an [offscreen Leetify page in the background](src/offscreen/leetify-auth.ts) and retrieves your access token for Leetify.

Then [it requests the GCPD pages](src/gcpd.ts) for Scrimmage (which includes CS2LT matches) and [extracts matches from the response](src/offscreen/dom-parser.ts), one after another, until it doesn't find any more matches that still have a demo download link. It [sends the demo download links and the timestamps of each match to Leetify](src/leetify-match-uploader.ts) (via the access token from before), which saves all new matches as manual uploads. They'll show up on the [Data Sources](https://leetify.com/app/data-sources) page and will be queued; after a bit of waiting (usually no more than a few minutes), they'll also show up in your [Match History](https://leetify.com/app/matches) on Leetify (but not on the Dashboard or Profile).

If your Steam session has expired and the extension can't actually load the GCPD page, it'll try to refresh your session.

After Scrimmage, the extension will again request GCPD pages for Wingman, filter out ranked or unranked matches ([if configured to do so](src/view/options.ts)), and send the found matches to Leetify.

You can independently enable or disable: the sync every 15 minutes, the sync on Leetify visits, and on GCPD visits.
You can also independently enable or disable: unranked 5v5, ranked Wingman, and unranked Wingman.
CS2LT matches look exactly like unranked 5v5 or unranked Wingman matches from CS:GO to the extension, and cannot be disabled independently.

If you're not logged in to either Steam or Leetify, the sync will fail. The extension icon in the Chrome toolbar will show a red `ERR` badge, and the status page will show an error message.

If you don't want to see a specific match on Leetify, you can delete it afterwards on the Data Sources page.
Matches uploaded via the extension are considered manual uploads by Leetify, so they are only displayed to the user who uploaded them (i.e. the Leetify account logged in when the extension uploaded the match). You can share these matches with your friends by sending them the link.


## Contributing/Support
We're not accepting PRs at this time.
If you need help, [please contact support](https://leetify.com/app/support).
[Please post your feedback on Discord!](https://discord.gg/UNygC8BAVg)


## Running locally
1. Clone this repo.
1. Head to [chrome://extensions](chrome://extensions).
1. Enable developer mode, click `Load unpacked`, and select the directory you cloned to (the directory containing `manifest.json`).

See the [Chrome Extension docs](https://developer.chrome.com/docs/extensions/mv3) for info about Chrome's APIs.
