# 🎨 DecoTime & Ohuhu Color Chart & Tracker

Applicazione completa e schede cromatiche stampabili per catalogare, monitorare e tracciare la propria collezione di pennarelli **DecoTime (Twin Marker & Acqua Marker)** e **Ohuhu (Honolulu 320)**.

---

## 📱 Componenti Principali

### 1. **App Android (.APK)**
- File pronto all'installazione: [`DecoTime_Color_Chart.apk`](./DecoTime_Color_Chart.apk)
- Funziona offline su tablet e smartphone Android.
- Supporta schermo intero, salvataggio locale e sincronizzazione Wi-Fi.

### 2. **Web App Standalone (.HTML)**
- File: [`DecoTime_Color_Tracker_Standalone.html`](./DecoTime_Color_Tracker_Standalone.html)
- Nessuna installazione richiesta: basta fare doppio clic per aprirla in qualsiasi browser (Chrome, Edge, Safari, Firefox).
- Include tutti gli stili, dati e script integrati in un unico file autonomo.

### 3. **Modelli PDF Stampabili per Campionario (Swatch)**
- Schede ad alta risoluzione pronte per la stampa e campionatura reale con inchiostro.
- Riquadri grandi numerati, suddivisione a pagine orizzontali e verticali.

---

## 🌟 Funzionalità del Tracker

- **Catalogazione Completa (703+ Colori):**
  - **Twin Marker (Alcool):** 263 colori DecoTime con codici storici e nuovi codici unificati.
  - **Acqua Marker (Base Acqua):** 120 colori ordinati nella sequenza cromatica ufficiale (incluso il colore 91 Natural Oak).
  - **Ohuhu Marker:** 320 colori (serie Honolulu B con suddivisione swatch standard).
- **Codifica Visiva a Colori (Targhette):**
  - 🖊️ **Twin Marker:** Targhetta e accenti in **Rosso Rubino / Bordeaux** (`#be2846`).
  - 💧 **Acqua Marker:** Targhetta e accenti in **Rosa Scuro** (`#c2185b`).
  - 🖍️ **Ohuhu Marker:** Targhetta e accenti in **Viola Ametista** (`#7b1fa2`).
- **Tema Scuro & Chiaro:**
  - Toggle rapido ☀️ / 🌙 nell'intestazione e nelle opzioni.
  - Palette scura ad alto contrasto ottimizzata per schermi OLED e tablet.
- **Lista della Spesa Automatica:**
  - Generazione istantanea dell'elenco dei colori mancanti (divisi per marca o complessivi).
  - Tasto rapido per copiare la lista negli appunti e inviarla via messaggio o note.
- **Sincronizzazione Wi-Fi Locale:**
  - Script batch per avviare un server locale (`AVVIA_SERVER_SINCRONIZZAZIONE_WIFI.bat`).
  - Sincronizza lo stato di possesso tra PC, tablet e smartphone sulla stessa rete Wi-Fi.

---

## 🛠️ Struttura della Repository

```
├── android-app/                          # Progetto sorgente Android Studio (Kotlin + WebView)
├── decotime-tracker/                     # Sorgenti Web App modulare (HTML, CSS, JS, server)
│   ├── index.html                        # Interfaccia grafica principale
│   ├── styles.css                        # Fogli di stile (temi chiaro/scuro e layout)
│   ├── app.js                            # Logica applicativa, filtri, swipe e sync
│   ├── data.js                           # Database completo DecoTime (Twin & Acqua)
│   ├── ohuhu_data.js                     # Database Ohuhu 320
│   └── inventory.json                    # Stato iniziale dell'inventario
├── DecoTime_Color_Chart.apk              # File APK Release per Android
├── DecoTime_Color_Tracker_Standalone.html# Web app autonoma a file singolo
├── build_bundle.js                       # Script per pacchettizzare la web app
├── *.pdf / *.png                         # Modelli e anteprime stampabili PDF
└── README.md                             # Documentazione della repository
```

---

## 🚀 Guida Rapida

- **Su PC:** Apri semplicemente [`DecoTime_Color_Tracker_Standalone.html`](./DecoTime_Color_Tracker_Standalone.html) nel tuo browser preferito.
- **Su Android:** Scarica ed esegui [`DecoTime_Color_Chart.apk`](./DecoTime_Color_Chart.apk) sul tuo dispositivo abilitando l'installazione da origini sconosciute.
