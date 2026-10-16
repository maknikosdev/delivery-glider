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
- **9 Bosses, τυχαίοι και σε τυχαία σημεία του run** (ο πρώτος στα ~220–420 μ., μετά ένας κάθε ~420–750 μ., από «τσάντα» ώστε να εμφανιστούν όλοι πριν επαναληφθεί κάποιος): Sky Wyvern, Giant Seagull, Mechanical Drone και οι νέοι **Sky Trawler** (support: ρίχνει δώρα — νομίσματα/ασπίδα/boost), **Junker Shark** (χρεώνει και κλέβει δέμα ή νομίσματα), **Storm Wyvern** (ριπές ανέμου που σε σπρώχνουν, αρπάζει δέματα), **Volcanic Goliath** (φλόγες και στήλες λάβας), **Orbital Drone** (λέιζερ και νάρκες), **Phantom Crow** (teleport, αφήνει λάφυρα αλλά και εκρηκτικά φτερά, κλέβει νομίσματα). Πληρωμή αν τους ξεπεράσεις χωρίς να σου κλέψουν τίποτα.
- **Wanted Level** (0-3 αστέρια): ανεβαίνει με χτύπημα σε police drone ή 5 χαμένες παραδόσεις· από level 2 σε κυνηγάει chaser drone· πέφτει με 3 παραδόσεις σε κόκκινα μπαλκόνια.
- **Slipstream** πίσω από ταξί (x2 πόντοι), **Delivery Fever** (3 παραδόσεις → διπλά νομίσματα + ασπίδα), **Express Delivery** (VIP μπαλκόνι με χρονόμετρο, x5), «Close call» μπόνους.
- **Τύποι φορτίου**: Standard, Fragile (χάνει αξία με βουτιές), Thermal (λήγει σε 13″), VIP (x2.5 αλλά ανεβάζει Wanted Level).
- **Mutators** (προαιρετικά, με πολλαπλασιαστή πόντων): Heavy World, Blackout City, Glass Cannon, Speed Demon, **Passenger Run** (μεταφέρεις έως 3 επιβάτες με αμοιβή ×2.2· οι απότομες βουτιές μειώνουν την αμοιβή).
- **Παραγγελίες πελατών**: κάποια μπαλκόνια δείχνουν το είδος φορτίου που ζητούν· σωστό φορτίο = ×2, λάθος = ×0.5.
- **Κανόνες περιβάλλοντος**: κάθε περιβάλλον έχει μικρή επίδραση σε βαρύτητα, ταχύτητα ή πόντους (banner στην αρχή του run).
- **Boss story**: dispatch γραμμές και μηνύματα νίκης για κάθε boss, με ιστορία που ξεκλειδώνει στη Συλλογή.
- **Daily Challenge / Daily Seed** και **Ghost Replay** της καλύτερης πτήσης σου.
- **Revive** («Second Chance»): με 60 νομίσματα ή δωρεάν token, μία φορά ανά run.
- **Mystery Crate** στο Game Over: 1 από 3 κουτιά (νομίσματα / free revive / προσωρινό skin).
- **Gadgets** πριν το run (έως 2): Ejector Seat, Package Magnet, Fuel Canister.

**Gliders & πρόοδος**
- **58 gliders**, ξεκλειδώνονται μόνο με πόντους που μαζεύεις παίζοντας:
  - 14 βασικοί (Starter, Swift, Heavy Lifter, Phantom, Pulse-Wave, Hologram, Anti-Grav Heavy, Solar-Wing, Storm Chaser, Iron Courier, Nomad, Riftwalker, Storm Breaker, Titan) με skills όπως EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity.
  - 12 νέοι, καθένας με δικό του artwork και μοναδική μηχανική: **Purr-cel** (Lucky Paws), **Aero Lance** (4 δέματα, πολύ ευέλικτο), **Gearhead** (Overdrive Gears), **Verdant** (Photosynthesis), **Glacier** (Cryo Field), **Bastion** (Supply Drop), **Specter** (Low Profile), **Vault Runner** (Lucrative Contracts), **Nebula** (Singularity), **Magma** (Inferno Trail), **Runic** (Chrono Rune), **Lifeline** (Revive Beacon).
  - 16 νεότεροι (Frost Wing, Jungle Flyer, Toxic Blades, Inferno, Thunder Bolt, Cupid, Night Hunter, Solar Flare, Biohazard, Mecha Forge, Galaxy, Crystal Shard, Neon Beats, Racing Gear, Ocean Breeze, Alien Tech): ο καθένας έχει **δυνατά και αδύνατα σημεία** (βαρύτητα, ταχύτητα, μαγνήτης, βουτιά, πόντοι, ασπίδα) και 3 περιβάλλοντα όπου είναι **εύκολος** και 3 όπου είναι **δύσκολος**.
- **Skill Upgrade Tree**: κάθε skill ανεβαίνει 0→3, και στο level 2 διαλέγεις κατεύθυνση (branch).
- **Skin Updates I-III** για κάθε glider που έχεις: Neon Trail, Plasma Trail, Legend Aura — τρέιλ πίσω από το glider, αγοράζονται με τη σειρά με επιπλέον πόντους (25%/50%/90% της τιμής του glider, ελάχιστη βάση 1000).
- **Πιο αργή οικονομία**: οι τιμές των gliders είναι διπλάσιες και τα κέρδη μειωμένα (παράδοση 7 πόντοι, νομίσματα 1-3 ανά chunk, near-miss 3), ώστε το ξεκλείδωμα να παίρνει χρόνο.
- Ο **Titan** μεταφέρει 8 δέματα και μπορεί να ανέβει ακόμα και γεμάτος· ο **Heavy Lifter** είναι ελαφρύτερος από πριν.
- **17 περιβάλλοντα background** (Neon City, Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring + 12 εικονογραφημένα (νέα: **Neon Skyline**, **Cloud Dock**, **Neon Alley**, **Sunset Gorge**, ξεκλειδώνουν με 9/12/14/16 gliders): **Galactic Orbit** (ζώνη αστεροειδών: -5% βαρύτητα, +8% πόντοι, περισσότερα εμπόδια), **Sunken Kingdom** (θησαυρός στο βυθό: νομίσματα-φυσαλίδες, σεντούκια), **Lava Canyon** (+5% ταχύτητα, +12% πόντοι, παγίδες, θερμά ρεύματα), **Sky Islands** (δυνατοί άνεμοι, αιωρούμενα σεντούκια), **Underwater Reef** (-10% βαρύτητα, νομίσματα-φυσαλίδες που πληρώνουν διπλά), **Storm Front** (ριπές ανέμου, +10% πόντοι, βροχή και αστραπές), **Neon Casino** (+5% πόντοι, περισσότερα εμπόδια, neon εφέ), **Ancient Ruins** (περισσότερες στατικές παγίδες, κρυμμένα σεντούκια με δώρα)). Ξεκλειδώνουν με 1/4/5/7/8/10/11/13/15/17/19/21 gliders ή νωρίτερα από trophies, και σε κάθε run επιλέγεται τυχαία ένα από τα ξεκλειδωμένα. Τα 12 εικονογραφημένα έχουν parallax εικόνας με animated εφέ. Κάθε glider έχει δικά του γνώριμα/εχθρικά περιβάλλοντα.
- **15 Trophies για upgrades** (Garage → ΤΡΟΠΑΙΑ): 5 για bosses, 5 για gliders/πιλότους (Mastery, προσωπικές προκλήσεις, Skin Updates), 5 για Hangar (εξαρτήματα, σετ, πλήρης εξοπλισμός). Δίνουν μικρές ανταμοιβές: εξαρτήματα, πόντους, δωρεάν Skin tier ή νωρίτερο ξεκλείδωμα background.
- **Mastery 1–10 ανά glider**: XP από παραδόσεις και μέτρα (Αρχάριος → Κορυφαίος), +1–5% πόντους. Κάθε glider ανήκει σε κατηγορία (Βαρύ, Φρουρός, Ταχύτητα, Νομίσματα, Ταχυδακτυλουργός, Στοιχειακό) και **κάθε level δίνει κάτι και παίρνει κάτι** (βαρύτητα, ταχύτητα, μαγνήτης, βουτιά, πόντοι, ασπίδα). Στα levels 2/4/6/8 διαλέγεις **A ή B** (μόνιμα μέχρι το Prestige), το level 10 είναι capstone. Κάθε glider έχει **γνώριμα και εχθρικά περιβάλλοντα** με bonus/ποινή που μεγαλώνει με το level. **Prestige** στο level 10: reset με μόνιμο ★ (+1% πόντοι, −1% βαρύτητα, μέχρι 5) και ανταμοιβή. Στο Daily Challenge τα perks είναι ανενεργά. Garage → κάρτα glider → ΠΡΟΣΘΕΤΑ & ΠΟΙΝΕΣ.
- **Ζευγάρια gliders** (10): αν έχεις και τα δύο gliders ενός ζευγαριού, παίρνεις passive perk (+1 ασπίδα / +3% πόντοι / +20% μαγνήτης νομισμάτων).
- **Achievements που ξεκλειδώνουν περιεχόμενο**: πόντοι, νέα περιβάλλοντα (Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring), το glider Aero Lance και skin tiers.
- **Hangar** (Garage → HANGAR): μεγάλη προεπισκόπηση του glider με στατιστικά, 3 θέσεις **εξαρτημάτων** (κινητήρας, φτερά, πυρήνας) και **μπόνους σετ** (Ember, Frost, Volt, Terra). Τα εξαρτήματα πέφτουν από bosses, παραγγελίες, προκλήσεις και events (Κοινό/Σπάνιο/Επικό) και αναβαθμίζονται 1→3 με πόντους.
- **Ιστορία πιλότου**: 26 πιλότοι με 3 κεφάλαια που ανοίγουν με το Mastery (επίπεδα 1, 3, 5). Στο Mastery 5: μοναδικό skin πιλότου και **GOLD trail**.
- **Προσωπική πρόκληση ανά glider**: ολοκλήρωσέ την πετώντας με εκείνο το glider και παίρνεις badge + σπάνιο εξάρτημα.
- **Ξεχωριστό trail και ήχος κινητήρα ανά glider**, και animation όταν ανεβαίνει το Mastery.
- **Rival ghost** στο Daily Challenge: ένας αντίπαλος με σταθερό ρυθμό· αν τον ξεπεράσεις όταν τελειώνει το run παίρνεις +150 πόντους.
- **Εβδομαδιαία events** (Fragile, Thermal, VIP, Parcel Rush, Passenger, Coin Rush): αλλάζουν τις παραγγελίες, διπλασιάζουν ένα στατιστικό στους εβδομαδιαίους στόχους και ρίχνουν περιορισμένο εξάρτημα.
- **Συλλογή** (Garage → ΣΥΛΛΟΓΗ): gliders, περιβάλλοντα, bosses με ιστορία, skins, ζευγάρια, τελευταίες ανταμοιβές.
- **Εβδομαδιαίοι στόχοι + μηνιαία Σεζόν** (Garage → ΕΒΔΟΜΑΔΑ): 3 στόχοι/εβδομάδα, πόντοι σεζόν και ανταμοιβές στους 4, 8 και 12 πόντους.
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
    gliders.js, newGliders.js, newGliders2.js  # 14 + 12 + 16 gliders
    gliderSkills.js            # skills των 12 νέων gliders (οι 16 νεότεροι: traits στο newGliders2.js)
    gliderSprites.js           # artwork των νέων gliders
    economy.js                 # κόστος Skin Updates
    environments.js            # 17 περιβάλλοντα background + κανόνες + ξεκλείδωμα
    extraAchievements.js       # 15 trophies για upgrades (boss / glider / hangar)
    progress.js                # mastery, ζευγάρια, εβδομαδιαίοι στόχοι, σεζόν, ανταμοιβές achievements, prestige
    masteryPerks.js            # Mastery 1-10: κατηγορίες, perks/ποινές, επιλογές A/B, affinity
    parts.js, pilots.js        # εξαρτήματα/σετ · πιλότοι, προκλήσεις, skins
    newBosses.js               # 6 νέοι bosses, τυχαίο πρόγραμμα εμφάνισης
    events.js, rival.js        # εβδομαδιαία events · rival ghost
    achievements.js, contracts.js, seededRandom.js
  store/storage.js, GameContext.js
  audio/AudioManager.js
  components/                  # sprites, HUD, ParallaxBackground, GliderTrail, SkinUpdatesRow, GaragePanels, HangarPanel, NewBossSprites, ParcelSprite, ...
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, FieldGuide, ...
assets/                        # icon, splash, sprites (gliders, bosses, UI), backgrounds, audio
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
- **9 Bosses, random and at random points of a run** (the first at ~220–420 m, then one every ~420–750 m, drawn from a shuffled bag so every boss appears before any repeats): Sky Wyvern, Giant Seagull, Mechanical Drone and the new **Sky Trawler** (support: drops gifts — coins/shield/boost), **Junker Shark** (charges and steals a package or coins), **Storm Wyvern** (wind bursts that shove you, snatches packages), **Volcanic Goliath** (fireballs and lava columns), **Orbital Drone** (lasers and mines), **Phantom Crow** (teleports, leaves loot but also explosive feathers, steals coins). Bonus payout if you clear them without being robbed.
- **Wanted Level** (0-3 stars): rises when you hit a police drone or miss 5 deliveries; from level 2 a chaser drone follows you; drops with 3 deliveries to red balconies.
- **Slipstream** behind taxis (x2 points), **Delivery Fever** (3 deliveries → double coins + shield), **Express Delivery** (timed VIP balcony, x5), "Close call" bonuses.
- **Cargo types**: Standard, Fragile (loses value with dives), Thermal (spoils after 13 s), VIP (x2.5 but raises Wanted Level).
- **Mutators** (optional, with a credit multiplier): Heavy World, Blackout City, Glass Cannon, Speed Demon, **Passenger Run** (carry up to 3 passengers for a x2.2 fare; hard dives cut the fare).
- **Customer orders**: some balconies show the cargo they want; match it for x2, deliver the wrong item for x0.5.
- **Environment rules**: each environment has a small effect on gravity, speed or points (banner at the start of a run).
- **Boss story**: dispatch lines and victory messages per boss, with lore unlocked in the Collection.
- **Daily Challenge / Daily Seed** and a **Ghost Replay** of your best run.
- **Revive** ("Second Chance"): for 60 coins or a free token, once per run.
- **Mystery Crate** on Game Over: 1 of 3 crates (coins / free revive / temporary skin).
- **Gadgets** before a run (up to 2): Ejector Seat, Package Magnet, Fuel Canister.

**Gliders & progression**
- **58 gliders**, unlocked only with points earned by playing:
  - 14 base gliders (Starter, Swift, Heavy Lifter, Phantom, Pulse-Wave, Hologram, Anti-Grav Heavy, Solar-Wing, Storm Chaser, Iron Courier, Nomad, Riftwalker, Storm Breaker, Titan) with skills like EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity.
  - 12 new gliders, each with its own artwork and a unique mechanic: **Purr-cel** (Lucky Paws), **Aero Lance** (4 packages, very agile), **Gearhead** (Overdrive Gears), **Verdant** (Photosynthesis), **Glacier** (Cryo Field), **Bastion** (Supply Drop), **Specter** (Low Profile), **Vault Runner** (Lucrative Contracts), **Nebula** (Singularity), **Magma** (Inferno Trail), **Runic** (Chrono Rune), **Lifeline** (Revive Beacon).
  - 16 newer gliders (Frost Wing, Jungle Flyer, Toxic Blades, Inferno, Thunder Bolt, Cupid, Night Hunter, Solar Flare, Biohazard, Mecha Forge, Galaxy, Crystal Shard, Neon Beats, Racing Gear, Ocean Breeze, Alien Tech): each has **strengths and weaknesses** (gravity, speed, magnet, dive, credits, shield) and 3 backgrounds where it is **easy** and 3 where it is **hard**.
- **Skill Upgrade Tree**: every skill levels 0→3, and at level 2 you pick a branch.
- **Skin Updates I-III** for every glider you own: Neon Trail, Plasma Trail, Legend Aura — a trail behind the glider, bought in order for extra points (25% / 50% / 90% of the glider's price, minimum base 1000).
- **Slower economy**: glider prices are doubled and earnings reduced (delivery 7 points, 1-3 coins per chunk, near-miss 3), so unlocking takes time.
- **Titan** carries 8 packages and can still climb fully loaded; **Heavy Lifter** is lighter than before.
- **17 background environments** (Neon City, Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring + 12 illustrated ones (new: **Neon Skyline**, **Cloud Dock**, **Neon Alley**, **Sunset Gorge**, unlocking at 9/12/14/16 gliders): **Galactic Orbit** (asteroid belt: -5% gravity, +8% credits, more obstacles), **Sunken Kingdom** (treasure deep: bubble coins, chests), **Lava Canyon** (+5% speed, +12% credits, traps, heat updrafts), **Sky Islands** (strong winds, floating chests), **Underwater Reef** (-10% gravity, bubble coins pay double), **Storm Front** (wind gusts, +10% points, rain and lightning), **Neon Casino** (+5% points, more obstacles, neon effects), **Ancient Ruins** (more static traps, hidden chests with gifts)). They unlock at 1/4/5/7/8/10/11/13/15/17/19/21 gliders or earlier through trophies, and each run picks one of the unlocked ones at random. The 12 illustrated ones use image parallax with animated effects. Every glider has its own easy/hard backgrounds.
- **15 upgrade Trophies** (Garage → TROPHIES): 5 for bosses, 5 for gliders/pilots (Mastery, personal challenges, Skin Updates), 5 for the Hangar (parts, sets, full loadout). Small rewards: parts, credits, a free Skin tier or an earlier background unlock.
- **Hangar** (Garage → HANGAR): big glider preview with stats, 3 **part** slots (engine, wings, core) and **set bonuses** (Ember, Frost, Volt, Terra). Parts drop from bosses, orders, challenges and events (Common/Rare/Epic) and are upgraded 1→3 with points.
- **Pilot stories**: 26 pilots with 3 chapters unlocked by Mastery (levels 1, 3, 5). At Mastery 5: a unique pilot skin and a **GOLD trail**.
- **Personal challenge per glider**: complete it flying that glider for a badge + a rare part.
- **Distinct trail and engine sound per glider**, and an animation when Mastery levels up.
- **Rival ghost** in the Daily Challenge: a fixed-pace opponent; beat it when your run ends for +150 points.
- **Weekly events** (Fragile, Thermal, VIP, Parcel Rush, Passenger, Coin Rush): change the orders, double one stat for weekly goals and drop a limited part.
- **Glider Mastery 1–10**: XP from deliveries and distance (Rookie → Apex), +1–5% points. Every glider belongs to a class (Heavy, Guard, Speed, Coin, Trickster, Elemental) and **every level gives something and takes something** (gravity, speed, magnet, dive, credits, shield). At levels 2/4/6/8 you pick **A or B** (permanent until Prestige); level 10 is a capstone. Each glider has **home and hostile environments** whose bonus/penalty grows with level. **Prestige** at level 10: reset for a permanent ★ (+1% credits, −1% gravity, up to 5) plus a reward. Perks are off in the Daily Challenge. Garage → glider card → PERKS & PENALTIES.
- **Glider pairs** (10): own both gliders of a pair to get a passive perk (+1 shield / +3% points / +20% coin magnet).
- **Achievements that unlock content**: points, new environments (Crimson Dunes, Frozen Peaks, Bio Jungle, Orbital Ring), the Aero Lance glider and skin tiers.
- **Collection** (Garage → COLLECTION): gliders, environments, bosses with lore, skins, pairs, latest rewards.
- **Weekly goals + monthly Season** (Garage → WEEKLY): 3 goals per week, season points and rewards at 4, 8 and 12 points.
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
    gliders.js, newGliders.js, newGliders2.js  # 14 + 12 + 16 gliders
    gliderSkills.js            # skills of the 12 new gliders (the 16 newest: traits in newGliders2.js)
    gliderSprites.js           # artwork of the new gliders
    economy.js                 # Skin Update costs
    environments.js            # 17 background environments + rules + unlocks
    extraAchievements.js       # 15 upgrade trophies (boss / glider / hangar)
    progress.js                # mastery, pairs, weekly goals, season, achievement rewards, prestige
    masteryPerks.js            # Mastery 1-10: classes, perks/penalties, A/B choices, affinity
    parts.js, pilots.js        # parts/sets · pilots, challenges, skins
    newBosses.js               # 6 new bosses, random spawn schedule
    events.js, rival.js        # weekly events · rival ghost
    achievements.js, contracts.js, seededRandom.js
  store/storage.js, GameContext.js
  audio/AudioManager.js
  components/                  # sprites, HUD, ParallaxBackground, GliderTrail, SkinUpdatesRow, GaragePanels, HangarPanel, NewBossSprites, ParcelSprite, ...
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, FieldGuide, ...
assets/                        # icon, splash, sprites (gliders, bosses, UI), backgrounds, audio
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


## 📅 Daily Runs & 🎯 Training Courses (Garage → RUNS)
**EL:** 15 διαφορετικά Daily Runs (ένα ανοιχτό κάθε φορά· το επόμενο ανοίγει 24 ώρες μετά το τελευταίο που ολοκλήρωσες) με σταθερό περιβάλλον/στόχο, πόντους, Mastery XP, σφραγίδα στο glider και 9 Daily τρόπαια. Επιπλέον 15 εύκολες Πίστες Εξάσκησης (όποτε θες): κανονικοί εχθροί και μπαλκόνια, έξτρα καρδιές (+1 ασπίδα) και Overclock, γραμμή τερματισμού, 3 αστέρια, αλλά μόνο 30% των πόντων.

**EN:** 15 distinct Daily Runs (one open at a time; the next unlocks 24 h after your last completion) with a fixed environment/goal, credits, Mastery XP, a stamp on your glider and 9 Daily trophies. Plus 15 easier Training Courses (any time): normal enemies and balconies, extra hearts (+1 shield) and Overclock orbs, a finish line, 3 stars, but only 30% of credits.

## 🌀 Portal Balconies
**EL:** Σε τυχαία παράδοση (~35%, τουλάχιστον 100 μ. μεταξύ τους, έως 12 ανά run) ο courier μεταφέρεται σε άλλο background και συνεχίζει εκεί, χάνοντας ~10% των πόντων του run. Ισχύουν οι κανόνες/affinity του νέου περιβάλλοντος. Δεν ενεργοποιείται σε Daily/Training runs.

**EN:** On a random delivery (~35%, at least 100 m apart, up to 12 per run) the courier is whisked to another background and keeps running there, dropping ~10% of the run's credits. The new environment's rules/affinity apply. Disabled in Daily/Training runs.

## ⚔️ Gameplay depth (v2.0)
**EL:** 🎯 **Mini-objectives**: κάθε ~300 μ. εμφανίζεται τυχαία πρόκληση (π.χ. 3 παρ' ολίγον, 2 παραδόσεις χωρίς dive) με bonus πόντων. 🌀 **Πύλες**: μεταφορά σε τυχαίο άλλο κόσμο, με μικρή απώλεια πόντων. ↗ **Combo drop**: swipe πάνω-δεξιά για παράδοση με στενό παράθυρο, ×1.5 κέρδη, combo +2 (αν αστοχήσεις, το combo μηδενίζεται). 💥 **Bosses 2 φάσεων**: στη μέση της συνάντησης γίνονται έξαλλοι (πιο γρήγορες επιθέσεις)· καθαρό clear σε φάση 2 δίνει σπάνιο εξάρτημα.

**EN:** 🎯 **Mini-objectives**: every ~300 m a random challenge appears (e.g. 3 close calls, 2 deliveries without diving) with a credit bonus. 🌀 **Portals**: whisked to a random other world, losing a few credits. ↗ **Combo drop**: swipe up-right for a tight-window delivery, x1.5 pay, combo +2 (miss and your combo resets). 💥 **Two-phase bosses**: they enrage halfway through the encounter (faster attacks); a clean clear in phase 2 drops a rare part.

## 🚀 Gameplay & Glider upgrades (v2.1)
**EL:** **Μέσα στο run (χωρίς παύση, όλα τυχαία):** ✨ *Boons* — προσωρινές ενισχύσεις μετά από κάθε boss, ολοκληρωμένο στόχο ή Ιερό (10 τύποι, στοιβάζονται). 🧭 *Στάσεις διαδρομής* ανά ~500 μ.: Ασφαλής Ζώνη, Θησαυρός, Ούριος Άνεμος, Ρίψη Εφοδίων, Ιερό Ενισχύσεων. 👑⏱💰 *Πελάτες*: VIP (×1.8), βιαστικός (×2.2 αν προλάβεις σε 9 δευτ.) και γενναιόδωρος (+45). **Garage → ΕΞΕΛΙΞΗ:** ✦ *Ascension* (3 επίπεδα, απαιτεί Prestige), 🎓 *Ικανότητες* (3 κλάδοι × 5 βαθμοί), 🎚️ *Tuning* (6 βαθμοί σε Ισχύ/Ευκινησία/Χωρητικότητα) και 📖 *Ιστορία πιλότου* (5 κεφάλαια, το τελευταίο δίνει epic εξάρτημα).

**EN:** **In-run (never pauses, always random):** ✨ *Boons* — temporary perks after every boss, completed objective or Shrine (10 kinds, stackable). 🧭 *Route stops* every ~500 m: Safe Zone, Treasure Run, Tailwind, Supply Drop, Boon Shrine. 👑⏱💰 *Live customers*: VIP (x1.8), rushed (x2.2 if you make it within 9 s) and generous (+45). **Garage → UPGRADE:** ✦ *Ascension* (3 tiers, needs Prestige), 🎓 *Talents* (3 branches x 5 ranks), 🎚️ *Tuning* (6 points across Power/Agility/Cargo) and 📖 *Pilot Story* (5 chapters, the last pays an epic part).
