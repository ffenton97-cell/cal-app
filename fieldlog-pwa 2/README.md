# Field Log — PWA Deployment

## Deploy to Netlify (free, 5 minutes)

1. Go to https://app.netlify.com
2. Sign up / log in (use GitHub or email)
3. Click "Add new site" → "Deploy manually"
4. Drag and drop this entire folder onto the upload area
5. Done — you'll get a URL like https://fieldlog-abc123.netlify.app

## Install on iPhone

1. Open the Netlify URL in Safari (must be Safari, not Chrome)
2. Tap the Share button (box with arrow)
3. Scroll down → tap "Add to Home Screen"
4. Tap "Add"
5. Field Log appears on your home screen as a full-screen app

## Notes

- All data is stored in Claude's persistent storage — syncs across sessions
- Works offline once installed
- The service worker (sw.js) handles caching
- To update: re-deploy the folder to Netlify
- For push notifications on iPhone: iOS 16.4+ required, must be installed as PWA first

## Recurring reminders — set these up in Google Calendar

**Daily**
- 5:15am — Weigh-in (before eating/drinking)
- 5:30am — Morning check-in (Field Log)

**Gym sessions**
- 5:45am Mon, Tue, Wed — Gym
- 6:00pm Thu — Gym (evening)
- Fri/Weekend — rest / no reminder

**Sales (weekdays Mon–Thu)**
- 5:00pm — Log outbound activity in Field Log

**Weekly**
- 7:00pm Sunday — Weekly review

**Fortnightly — Payday (every 2nd Wednesday from 25 Mar 2026)**
- 9:00am — Run auto-debits: $700 UBank · $800 offset · $300 Pearler
- Dates: 25 Mar, 8 Apr, 22 Apr, 6 May, 20 May, 3 Jun...

**Monthly (1st of month)**
- 9:00am — Finance snapshot in Field Log
