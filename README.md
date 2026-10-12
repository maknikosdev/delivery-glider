# The Delivery Glider 🛸📦

**🇬🇷 [Ελληνικά](#-ελληνικά) · 🇬🇧 [English](#-english)**

---

## 🇬🇷 Ελληνικά

Offline 2D endless-runner για Android, χτισμένο με Expo / React Native.
Neo-Athens Grid, 2088 — παραδίδεις δέματα πετώντας ανάμεσα σε μπαλκόνια, ιπτάμενα ταξί και drones της αστυνομίας, διαχειριζόμενος το βάρος του glider σου. Πακέτο: `com.neoncourier.deliveryglider`.

### 🎮 Πώς παίζεται

- **Κράτα πατημένο** για να ανέβει το glider — άσε το και πέφτει. Όσα περισσότερα δέματα κουβαλάς, τόσο πιο βαρύς είσαι. Στην αρχή κάθε run η βαρύτητα μπαίνει σταδιακά (~2″).
- **Swipe δεξιά** κοντά σε φωτισμένο μπαλκόνι για παράδοση δέματος.
- **Swipe κάτω** για απότομη βουτιά.
- **Δέματα προς παραλαβή (pick-up parcels)**: όταν έχεις ελεύθερη θέση στο φορτίο, πέτα πάνω σε ένα κρέιτ 📦 στον αέρα για να το πάρεις και να το παραδώσεις αργότερα. Κάθε δέμα βαραίνει τον glider· αν είσαι γεμάτος δεν το παίρνεις.
- **Νομίσματα (Neo-Coins)** σε «coin trails», και **power-ups** (Overclock, Nano-Repair, Grav-Inverter).
- **Combo**: συνεχόμενες παραδόσεις χτίζουν πολλαπλασιαστή (έως x5).
- Κάθε glider έχει δικό του **active/passive skill** (double tap ή swipe-κάτω-και-κράτα).
- Tutorial μέσα στην εφαρμογή («ΠΩΣ ΠΑΙΖΕΤΑΙ»), κουμπί **EL/EN** στο Menu.

### ✨ Λειτουργίες

**Gameplay**
- Πλήρης game loop: βαρύτητα ανάλογη με τα δέματα, tap/hold-to-fly, swipe-to-deliver, dive.
- **7 ζώνες δυσκολίας**: Rookie District → Traffic Begins (κινούμενα εμπόδια από 60m) → Transit Lanes → Megacity Core → Hyper-Speed Chaos → Blackout Sprawl → Metro Undercity (μόνιμοι τοίχοι σήραγγας· εκεί μετράει η ακρίβεια). Κάθε ζώνη έχει δικό της χρωματικό tint και μπόνους πόντων στην είσοδο.
- **Τυχαία layouts σε κάθε run**: περίπου οι μισοί τομείς της πίστας παράγονται εξ ολοκλήρου procedural και οι υπόλοιποι είναι χειροποίητα templates με ανακατεμένα εμπόδια/μπαλκόνια. Δουλεύει και με seed (Daily Challenge) ώστε όλοι να παίζουν την ίδια πίστα.
- **Route Branching**: κάθε 500m η πίστα σπάει σε πάνω (υψηλό ρίσκο/πληρωμή) και κάτω (ασφαλής) διαδρομή.
- **Wind Corridors**: μόνιμα κάθετα ρεύματα αέρα με βέλη ↑/↓.
- **Soft difficulty ramp**: τα πρώτα 5 runs ενός νέου παίκτη είναι πιο ήπια.
- **Weather/City Events** (κάθε 60-120″): Solar Flare (αντεστραμμένοι χειρισμοί), Acid Rain (διάβρωση), Police Blockade, Sandstorm (τυρβώδεις άνεμοι), Blackout (σκοτάδι + ξεθωριασμένο HUD).
- **Bosses** (3, μία φορά ανά run): Sky Wyvern, Giant Seagull, Mechanical Drone — με δικά τους sprites, κινήσεις και βλήματα (φλόγα, ψάρι, πύραυλος). Πληρωμή αν τους ξεπεράσεις χωρίς χτύπημα.
- **Wanted Level** (0-3 αστέρια): ανεβαίνει με χτύπημα σε police drone ή 5 χαμένες παραδόσεις· από level 2 σε κυνηγάει chaser drone· πέφτει με 3 παραδόσεις σε κόκκινα μπαλκόνια.
- **Slipstream** πίσω από ταξί (x2 πόντοι), **Delivery Fever** (3 παραδόσεις → διπλά νομίσματα + ασπίδα), **Express Delivery** (VIP μπαλκόνι με χρονόμετρο, x5), «Close call» μπόνους.
- **Τύποι φορτίου**: Standard, Fragile (χάνει αξία με βουτιές), Thermal (λήγει σε 13″), VIP (x2.5 αλλά ανεβάζει Wanted Level).
- **Mutators** (προαιρετικά, με πολλαπλασιαστή πόντων): Heavy World, Blackout City, Glass Cannon, Speed Demon.
- **Daily Challenge / Daily Seed** και **Ghost Replay** της καλύτερης πτήσης σου.
- **Revive** («Second Chance»): με 60 νομίσματα ή δωρεάν token, μία φορά ανά run.
- **Mystery Crate** στο Game Over: 1 από 3 κουτιά (νομίσματα / free revive / προσωρινό skin).
- **Gadgets** πριν το run (έως 2): Ejector Seat, Package Magnet, Fuel Canister.

**Gliders & πρόοδος**
- **26 gliders**, ξεκλειδώνονται μόνο με πόντους που μαζεύεις παίζοντας:
  - 14 βασικοί (Starter, Swift, Heavy Lifter, Phantom, Pulse-Wave, Hologram, Anti-Grav Heavy, Solar-Wing, Storm Chaser, Iron Courier, Nomad, Riftwalker, Storm Breaker, Titan) με skills όπως EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity.
  - 12 νέοι, καθένας με δικό του artwork και μοναδική μηχανική: **Purr-cel** (Lucky Paws), **Aero Lance** (4 δέματα, πολύ ευέλικτο), **Gearhead** (Overdrive Gears), **Verdant** (Photosynthesis), **Glacier** (Cryo Field), **Bastion** (Supply Drop), **Specter** (Low Profile), **Vault Runner** (Lucrative Contracts), **Nebula** (Singularity), **Magma** (Inferno Trail), **Runic** (Chrono Rune), **Lifeline** (Revive Beacon).
- **Skill Upgrade Tree**: κάθε skill ανεβαίνει 0→3, και στο level 2 διαλέγεις κατεύθυνση (branch).
- **Skin Updates I-III** για κάθε glider που έχεις: Neon Trail, Plasma Trail, Legend Aura — τρέιλ πίσω από το glider, αγοράζονται με τη σειρά με επιπλέον πόντους (25%/50%/90% της τιμής του glider, ελάχιστη βάση 1000).
- **Πιο αργή οικονομία**: οι τιμές των gliders είναι διπλάσιες και τα κέρδη μειωμένα (παράδοση 7 πόντοι, νομίσματα 1-3 ανά chunk, near-miss 3), ώστε το ξεκλείδωμα να παίρνει χρόνο.
- Ο **Titan** μεταφέρει 8 δέματα και μπορεί να ανέβει ακόμα και γεμάτος· ο **Heavy Lifter** είναι ελαφρύτερος από πριν.
- **5 περιβάλλοντα background** (Neon City, Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring): ένα νέο ξεκλειδώνει κάθε 3 gliders που αποκτάς, και σε κάθε run επιλέγεται τυχαία ένα από τα ξεκλειδωμένα. Καθαρά διακοσμητικά.
- **25 Achievements** που ξεκλειδώνουν cosmetic skins (χρώματα), **20 Daily Contracts** (4 τυχαία κάθε μέρα), **milestone reward** (δωρεάν Phantom στα 10.000m συνολικά), **Field Guide** (οδηγός εμποδίων, bosses, αντικειμένων, τύπων φορτίου), **Stats** (100% offline).

**Τεχνικά / UI**
- 100% offline, χωρίς καμία κλήση δικτύου· αποθήκευση με AsyncStorage (save key `@delivery_glider/save_v6`).
- Neon/cyberpunk γραφικά (react-native-svg + illustrated sprites), πολυεπίπεδο parallax background, ενιαίο UI με `OctagonPanel`/`OctagonButton`.
- Πλήρες EL/EN σε όλη την εφαρμογή· μουσική + συνθετικά SFX με κοινό κουμπί mute.
- Expo SDK 57 (React Native 0.86.2, React 19.2.3), Android min SDK 29 → target/compile SDK 36, New Architecture.

### ⚠️ Σημαντικά (διάβασέ τα πριν το build)

0. **Καμία αγορά με πραγματικά χρήματα.** Μόνο πόντοι που κερδίζεις παίζοντας. Δεν υπάρχει billing SDK, τιμή σε €/$ ή κλήση δικτύου.
1. **Μουσική**: looping track `assets/audio/music.mp3` (royalty-free), χαμηλότερη ένταση από τα SFX, ελέγχεται από το mute (`src/audio/AudioManager.js`).
2. **SFX 100% συνθετικά** (`tools/gen_sfx.py` → `assets/audio/*.wav`), άρα κανένα θέμα πνευματικών δικαιωμάτων. Αναπαραγωγή με `expo-audio`.
3. **Γραφικά**: vector/SVG σε κώδικα και PNG sprites για gliders, bosses, UI frames.
4. **Path χωρίς κενά**: ο φάκελος του project (π.χ. `delivery-glider`) δεν πρέπει να έχει κενά, αλλιώς σπάει το native build σε Windows.
5. **Ερμηνείες μηχανικών**: τα Gadgets αγοράζονται μία φορά και εξοπλίζονται ελεύθερα· shields/corrosion καθυστερούν τον θάνατο κατά ένα χτύπημα· το Grav-Inverter αντιστρέφει μόνο τη βαρύτητα.

### Δομή Project

```
App.js                         # root navigation
app.json / eas.json            # Expo & EAS config
src/
  constants/gameConfig.js      # φυσική, ζώνες, καιρός, combo, οικονομία, bosses, mutators, package types
  i18n/translations.js, i18n.js# EL/EN dictionary + translator
  game/
    useGameLoop.js             # πυρήνας: physics, collisions, delivery, combo, weather, bosses, parcels
    chunks.js                  # chunk pool, route branching, spawner
    randomizer.js              # τυχαία layouts (procedural + shuffle), seed-aware
    parcels.js                 # pick-up parcels
    gliders.js, newGliders.js  # 14 + 12 gliders
    gliderSkills.js            # skills των 12 νέων gliders
    gliderSprites.js           # artwork των νέων gliders
    economy.js                 # κόστος Skin Updates
    environments.js            # 5 περιβάλλοντα background + κανόνες ξεκλειδώματος
    achievements.js, contracts.js, seededRandom.js
  store/storage.js, GameContext.js
  audio/AudioManager.js
  components/                  # sprites, HUD, ParallaxBackground, GliderTrail, SkinUpdatesRow, ParcelSprite, ...
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, FieldGuide, ...
assets/                        # icon, splash, sprites (gliders, bosses, UI), audio
tools/gen_sfx.py
android/                       # native project (expo prebuild)
```

### Development

```bash
cd delivery-glider
npm install
npx expo start
```
Σκάναρε το QR με το Expo Go ή πάτα `a` για emulator.

### Build μέσω Android Studio

1. `npm install`. 2. Άνοιξε το **Android Studio** → **File → Open** → φάκελος `delivery-glider/android`. 3. Περίμενε το Gradle sync (χρειάζεται JDK 17+, AGP 8.12, Android SDK Platform 36). 4. **Run ▶** ή **Build → Generate Signed Bundle / APK**.
Αν αλλάξεις μόνο JS στο `src/`, αρκεί νέο Run· αν αλλάξεις `app.json`: `npx expo prebuild --platform android --clean`.

### Build μέσω EAS (cloud)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production   # .aab για Google Play
eas build --platform android --profile preview      # .apk για δοκιμή
```

### Έκδοση / Google Play
Πριν από κάθε νέο build ανέβασε το `versionCode` (και το `version`) στο `app.json`· ανέβασε και το `mapping.txt` (R8) στο Play Console.

---

## 🇬🇧 English

An offline 2D endless-runner for Android, built with Expo / React Native.
Neo-Athens Grid, 2088 — deliver packages while gliding between balconies, flying taxis and police drones, managing your glider's weight. Package: `com.neoncourier.deliveryglider`.

### 🎮 How to play

- **Hold** the screen to rise — release and you fall. The more packages you carry, the heavier you are. Gravity eases in over ~2 s at the start of each run.
- **Swipe right** near a lit balcony to deliver a package.
- **Swipe down** for a sharp dive.
- **Pick-up parcels**: with free cargo space, fly through a floating 📦 crate to grab it and deliver it later. Every package adds weight; if you're full you can't take it.
- **Coins (Neo-Coins)** in coin trails, and **power-ups** (Overclock, Nano-Repair, Grav-Inverter).
- **Combo**: chained deliveries build a multiplier (up to x5).
- Every glider has its own **active/passive skill** (double tap or swipe-down-and-hold).
- Built-in tutorial ("HOW TO PLAY"), and an **EL/EN** button on the Menu.

### ✨ Features

**Gameplay**
- Full game loop: gravity scales with carried packages, tap/hold-to-fly, swipe-to-deliver, dive.
- **7 difficulty zones**: Rookie District → Traffic Begins (moving obstacles from 60 m) → Transit Lanes → Megacity Core → Hyper-Speed Chaos → Blackout Sprawl → Metro Undercity (permanent tunnel walls — precision matters most). Each zone has its own colour tint and an entry bonus.
- **Random layouts every run**: about half of the track is fully procedural, the rest are hand-made templates with shuffled obstacles/balconies. Works with a seed (Daily Challenge) so everyone plays the same track.
- **Route Branching**: every 500 m the track splits into an upper (high risk/reward) and a lower (safe) route.
- **Wind Corridors**: fixed vertical air currents with ↑/↓ arrows.
- **Soft difficulty ramp**: a new player's first 5 runs are gentler.
- **Weather/City Events** (every 60-120 s): Solar Flare (reversed controls), Acid Rain (corrosion), Police Blockade, Sandstorm (turbulent winds), Blackout (darkness + faded HUD).
- **Bosses** (3, once per run): Sky Wyvern, Giant Seagull, Mechanical Drone — each with its own sprite, movement and projectiles (fireball, fish, missile). Bonus payout if you pass them without a hit.
- **Wanted Level** (0-3 stars): rises when you hit a police drone or miss 5 deliveries; from level 2 a chaser drone follows you; drops with 3 deliveries to red balconies.
- **Slipstream** behind taxis (x2 points), **Delivery Fever** (3 deliveries → double coins + shield), **Express Delivery** (timed VIP balcony, x5), "Close call" bonuses.
- **Cargo types**: Standard, Fragile (loses value with dives), Thermal (spoils after 13 s), VIP (x2.5 but raises Wanted Level).
- **Mutators** (optional, with a credit multiplier): Heavy World, Blackout City, Glass Cannon, Speed Demon.
- **Daily Challenge / Daily Seed** and a **Ghost Replay** of your best run.
- **Revive** ("Second Chance"): for 60 coins or a free token, once per run.
- **Mystery Crate** on Game Over: 1 of 3 crates (coins / free revive / temporary skin).
- **Gadgets** before a run (up to 2): Ejector Seat, Package Magnet, Fuel Canister.

**Gliders & progression**
- **26 gliders**, unlocked only with points earned by playing:
  - 14 base gliders (Starter, Swift, Heavy Lifter, Phantom, Pulse-Wave, Hologram, Anti-Grav Heavy, Solar-Wing, Storm Chaser, Iron Courier, Nomad, Riftwalker, Storm Breaker, Titan) with skills like EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity.
  - 12 new gliders, each with its own artwork and a unique mechanic: **Purr-cel** (Lucky Paws), **Aero Lance** (4 packages, very agile), **Gearhead** (Overdrive Gears), **Verdant** (Photosynthesis), **Glacier** (Cryo Field), **Bastion** (Supply Drop), **Specter** (Low Profile), **Vault Runner** (Lucrative Contracts), **Nebula** (Singularity), **Magma** (Inferno Trail), **Runic** (Chrono Rune), **Lifeline** (Revive Beacon).
- **Skill Upgrade Tree**: every skill levels 0→3, and at level 2 you pick a branch.
- **Skin Updates I-III** for every glider you own: Neon Trail, Plasma Trail, Legend Aura — a trail behind the glider, bought in order for extra points (25% / 50% / 90% of the glider's price, minimum base 1000).
- **Slower economy**: glider prices are doubled and earnings reduced (delivery 7 points, 1-3 coins per chunk, near-miss 3), so unlocking takes time.
- **Titan** carries 8 packages and can still climb fully loaded; **Heavy Lifter** is lighter than before.
- **5 background environments** (Neon City, Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring): a new one unlocks every 3 gliders you own, and each run picks one of the unlocked ones at random. Purely decorative.
- **25 Achievements** unlocking cosmetic colours, **20 Daily Contracts** (4 random per day), a **milestone reward** (free Phantom at 10,000 m total), a **Field Guide** (obstacles, bosses, pickups, cargo types), and **Stats** (100% offline).

**Technical / UI**
- 100% offline, zero network calls; AsyncStorage save (key `@delivery_glider/save_v6`).
- Neon/cyberpunk graphics (react-native-svg + illustrated sprites), multi-layer parallax background, consistent UI with `OctagonPanel`/`OctagonButton`.
- Full EL/EN across the app; music + synthesized SFX with one mute button.
- Expo SDK 57 (React Native 0.86.2, React 19.2.3), Android min SDK 29 → target/compile SDK 36, New Architecture.

### ⚠️ Important (read before building)

0. **No real-money purchases.** Only points earned by playing. There is no billing SDK, no price in €/$, no network call.
1. **Music**: looping track `assets/audio/music.mp3` (royalty-free), quieter than the SFX, controlled by the mute button (`src/audio/AudioManager.js`).
2. **SFX are 100% synthesized** (`tools/gen_sfx.py` → `assets/audio/*.wav`), so no copyright concerns. Playback via `expo-audio`.
3. **Graphics**: code-drawn vector/SVG plus PNG sprites for gliders, bosses and UI frames.
4. **Path without spaces**: the project folder (e.g. `delivery-glider`) must not contain spaces, or the native build breaks on Windows.
5. **Mechanic interpretations**: Gadgets are bought once and freely equipped; shields/corrosion delay death by one hit; Grav-Inverter only flips gravity.

### Project structure

```
App.js                         # root navigation
app.json / eas.json            # Expo & EAS config
src/
  constants/gameConfig.js      # physics, zones, weather, combo, economy, bosses, mutators, package types
  i18n/translations.js, i18n.js# EL/EN dictionary + translator
  game/
    useGameLoop.js             # core: physics, collisions, delivery, combo, weather, bosses, parcels
    chunks.js                  # chunk pool, route branching, spawner
    randomizer.js              # random layouts (procedural + shuffle), seed-aware
    parcels.js                 # pick-up parcels
    gliders.js, newGliders.js  # 14 + 12 gliders
    gliderSkills.js            # skills of the 12 new gliders
    gliderSprites.js           # artwork of the new gliders
    economy.js                 # Skin Update costs
    environments.js            # 5 background environments + unlock rules
    achievements.js, contracts.js, seededRandom.js
  store/storage.js, GameContext.js
  audio/AudioManager.js
  components/                  # sprites, HUD, ParallaxBackground, GliderTrail, SkinUpdatesRow, ParcelSprite, ...
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, FieldGuide, ...
assets/                        # icon, splash, sprites (gliders, bosses, UI), audio
tools/gen_sfx.py
android/                       # native project (expo prebuild)
```

### Development

```bash
cd delivery-glider
npm install
npx expo start
```
Scan the QR with Expo Go, or press `a` for an emulator.

### Build with Android Studio

1. `npm install`. 2. Open **Android Studio** → **File → Open** → the `delivery-glider/android` folder. 3. Wait for the Gradle sync (needs JDK 17+, AGP 8.12, Android SDK Platform 36). 4. **Run ▶** or **Build → Generate Signed Bundle / APK**.
If you only change JS in `src/`, just Run again; if you change `app.json`: `npx expo prebuild --platform android --clean`.

### Build with EAS (cloud)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production   # .aab for Google Play
eas build --platform android --profile preview      # .apk for testing
```

### Release / Google Play
Bump `versionCode` (and `version`) in `app.json` before every new build, and upload the `mapping.txt` (R8) to the Play Console.
