# Non tutte le superfici sono uguali

> Nel tennis professionistico, il nome della superficie conta meno di quanto pensi.

Scrollytelling interattivo sui dati di velocità delle superfici nel tennis ATP (1991–2025).

**Live:** [daniloderosa.github.io/tennis_surface_speed](https://daniloderosa.github.io/tennis_surface_speed)

L'articolo è in una prima versione, non pensata per la condivisione.

---

## Cosa racconta

Il progetto sfida il luogo comune dei "tre mondi" del tennis (hard veloce, erba velocissima, terra lenta) mostrando che la realtà è molto più sfumata:

- Gstaad (terra) è più veloce di Indian Wells 2025 (hard)
- Roland Garros e Paris Masters si sovrappongono per lunghezza rally
- I rally si allungano su tutte le superfici — non perché le superfici convergano, ma perché i giocatori cambiano

## Struttura narrativa

| Sezione | Contenuto                                                                    |
| ------- | ---------------------------------------------------------------------------- |
| 01      | Strip plot di tutti i tornei, da grigio a colorato, con anomalie evidenziate |
| 02      | Scatterplot velocità vs lunghezza rally media per torneo                     |
| 03      | Line chart 1991–2025: velocità media e lunghezza rally nel tempo             |
| 04      | Mappa completa dei tornei con annotazioni                                    |

## Fonti dati

- **Surface speed ratings** — [Tennis Abstract](https://www.tennisabstract.com/cgi-bin/surface-speed.cgi) (Jeff Sackmann)
- **Risultati ATP** — [tennis_atp](https://github.com/JeffSackmann/tennis_atp) (Jeff Sackmann)
- **Rally length** — [Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject) (Jeff Sackmann)

## Stack tecnico

- [SvelteKit 2](https://kit.svelte.dev/) + Svelte 5 (runes)
- [D3.js v7](https://d3js.org/) per scale, calcoli e rendering SVG
- [LayerChart](https://layerchart.com/) come layer grafico
- Deploy su GitHub Pages via `@sveltejs/adapter-static`

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri `http://localhost:5173`.

## Aggiornare i dati

I dati di velocità vengono da scraping manuale di Tennis Abstract. Per aggiornare il rally length:

```bash
# Scarica il CSV aggiornato
curl -L -o static/data/charting-m-stats-Rally.csv \
  https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/charting-m-stats-Rally.csv

# Rigenera il JSON
python scripts/build_rally_data.py
```

## Licenza

Dati: © Jeff Sackmann — [Open Database License](https://opendatacommons.org/licenses/odbl/).
Codice: MIT.
