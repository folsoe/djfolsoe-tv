DJ FOLSOE V813.5 THEME ENGINE

Nyt:
- 8 låste V160/V170 themes: fredagsbar, popup, trance, retro, eurodance, morning, summer, weekend
- Worker endpoint: GET/POST /api/theme
- /api/overlay/v170-state inkluderer aktivt theme
- StreamElements V170.3 overlay skifter farver/titler automatisk
- Admin Theme Engine panel
- THEME_COMMANDS_V813_5.txt

Deploy:
1. Upload hele pakken til GitHub.
2. Deploy cloudflare-worker/worker.js i Cloudflare.
3. Test /api/theme og /api/overlay/v170-state.
4. Opdatér StreamElements med HTML/CSS/JS fra streamelements-v170.3-overlay.
