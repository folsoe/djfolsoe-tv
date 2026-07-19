{
  "version": "2.0",
  "sources": [
    {
      "id": "apple-dk",
      "name": "Apple Music Danmark",
      "type": "apple-rss",
      "enabled": true,
      "url": "https://rss.marketingtools.apple.com/api/v2/dk/music/most-played/100/songs.json",
      "weight": 100,
      "tags": ["current", "denmark", "radio", "morning", "fredagsbar"]
    },
    {
      "id": "apple-gb",
      "name": "Apple Music UK",
      "type": "apple-rss",
      "enabled": true,
      "url": "https://rss.marketingtools.apple.com/api/v2/gb/music/most-played/100/songs.json",
      "weight": 85,
      "tags": ["current", "international", "morning", "fredagsbar"]
    },
    {
      "id": "hitlisten",
      "name": "Hitlisten Danmark",
      "type": "html-chart",
      "enabled": true,
      "url": "https://hitlisten.nu/",
      "weight": 115,
      "selectors": {
        "rows": ["tr", ".chart-item", ".chart-entry"],
        "rank": [".position", ".rank", "td:first-child"],
        "title": [".title", ".track-title", ".chart-name"],
        "artist": [".artist", ".track-artist", ".chart-artist"]
      },
      "tags": ["current", "denmark", "official", "morning", "fredagsbar"]
    },
    {
      "id": "official-uk",
      "name": "Official UK Singles",
      "type": "html-chart",
      "enabled": true,
      "url": "https://www.officialcharts.com/charts/singles-chart/",
      "weight": 90,
      "selectors": {
        "rows": [".chart-item", ".chart-item-content", ".c-chart-item"],
        "rank": [".position", ".chart-position", ".c-chart-item__position"],
        "title": [".chart-name", ".title", ".c-chart-item__title"],
        "artist": [".chart-artist", ".artist", ".c-chart-item__artist"]
      },
      "tags": ["current", "international", "morning", "fredagsbar"]
    }
  ],
  "retroYears": {
    "70s": [1970, 1972, 1974, 1976, 1978, 1979],
    "80s": [1980, 1982, 1984, 1986, 1988, 1989]
  }
}
