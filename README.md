# The Delivery Glider 🛸📦

**🇬🇷 [Ελληνικά](#-ελληνικά) · 🇬🇧 [English](#-english)**

---

## 🇬🇷 Ελληνικά

Offline 2D endless-runner για Android, χτισμένο με Expo / React Native.
Neo-Athens Grid, 2088 — παραδίδεις δέματα πετώντας ανάμεσα σε μπαλκόνια,
ιπτάμενα ταξί και drones της αστυνομίας, διαχειριζόμενος το βάρος του glider σου.

### Τι περιλαμβάνει αυτό το project

- ✅ Πλήρης game loop: βαρύτητα ανάλογη με τα δέματα, tap/hold-to-fly, swipe-to-deliver, swipe-down dive
- ✅ Procedural chunk generation (5 τύποι chunk, τυχαία επιλογή με βάση την απόσταση) + πυκνότητα εμποδίων που πραγματικά αυξάνεται ανά ζώνη (extra hazards, όχι μόνο ταχύτητα)
- ✅ Combo multiplier: συνεχόμενες παραδόσεις μέσα σε μικρό χρονικό παράθυρο αυξάνουν πολλαπλασιαστή πόντων (έως x5) — risk/reward loop
- ✅ "Close call" bonus πόντοι όταν περνάς ξυστά από εμπόδιο χωρίς να χτυπήσεις
- ✅ Zone milestone banners με μπόνους πόντους κάθε φορά που μπαίνεις σε πιο δύσκολη ζώνη
- ✅ Screen shake στο crash + προειδοποιητική κόκκινη λάμψη στις άκρες της οθόνης όταν πλησιάζεις όριο (πριν κρασάρεις)
- ✅ Dynamic difficulty σε **6 ζώνες** (Rookie District → Hyper-Speed Chaos → Blackout Sprawl → **Metro Undercity**), πιο απότομη καμπύλη δυσκολίας
- ✅ Drone refuel stations, delivery particles, collisions (AABB)
- ✅ **Weather/City Events**: Solar Flare (αντεστραμμένοι χειρισμοί), Acid Rain (μέτρημα διάβρωσης, κρύψου χαμηλά), Police Blockade (προειδοποίηση + ζώνη-θανάτου), **Sandstorm** (τυρβώδεις άνεμοι/turbulence στον έλεγχο ύψους), **Blackout** (σκοτεινιάζει η οθόνη + ξεθωριάζει το HUD) — τυχαία κάθε 60-120"
- ✅ **Power-up orbs** στην πίστα: Overclock (ταχύτητα + ατρωσία + καταστρέφει εμπόδια), Nano-Repair (ασπίδα 1 χτυπήματος), Grav-Inverter (αντιστροφή βαρύτητας)
- ✅ **Wanted Level** (0-3 αστέρια): ανεβαίνει αν χτυπήσεις police drone ή χάσεις 5 παραδόσεις στη σειρά· level 2+ φέρνει επίμονο "chaser" drone από πίσω· κατεβαίνει με 3 συνεχόμενες παραδόσεις σε κόκκινα (illegal) μπαλκόνια
- ✅ **Slipstream/Drafting**: μείνε πίσω από ιπτάμενο ταξί για λίγο και παίρνεις x2 πόντους για μερικά δευτερόλεπτα
- ✅ **Delivery Fever**: 3 παραδόσεις στη σειρά ενεργοποιούν 6" διπλής αξίας νομισμάτων + ασπίδα
- ✅ **Express Delivery**: σπάνιο VIP μπαλκόνι με μετρητή 5"— πρόλαβέ το για x5 νομίσματα + turbo
- ✅ **Mystery Crate** στο Game Over: διάλεξε 1 από 3 κλειστά κουτιά, δωρεάν νομίσματα/free revive/προσωρινό skin
- ✅ **Gadgets/Loadout** πριν το run: Ejector Seat, Package Magnet, Fuel Canister — αγοράζονται μία φορά με πόντους, εξοπλίζεις έως 2 ανά run
- ✅ Garage: **14 ξεκλειδώσιμα gliders** (6 βασικά + 8 με μοναδικά Active/Passive Skills: EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, **Phase Shift**, **Storm Immunity**), μόνο με πόντους (credits) που μαζεύει ο παίκτης παίζοντας — **καμία αγορά με πραγματικά χρήματα, καμία in-app purchase, κανένα billing SDK**
- ✅ **Skill Upgrade Tree**: κάθε skill glider αναβαθμίζεται 0→3 (μικρότερο cooldown, μεγαλύτερη ακτίνα/διάρκεια/μαγνήτης) με πόντους, στο Garage
- ✅ **19 Achievements** που ξεκλειδώνουν αμιγώς cosmetic skins (χρώματα glider) — οθόνη "ACHIEVEMENTS" από το Menu
- ✅ **Στατιστικά Παίκτη**: νέα οθόνη "STATS" από το Menu — συνολική απόσταση, συνολικές παραδόσεις, καλύτερο combo, νομίσματα lifetime, EMP/Slipstream/Revive μετρητές, κ.λπ. (100% offline, AsyncStorage)
- ✅ Neo-Coins/Data-Cubes διάσπαρτα στην πίστα σε "coin trails", μαζεύονται πετώντας από πάνω τους
- ✅ "Second Chance" Revive: στο πρώτο crash, αν έχεις ≥100 νομίσματα, μπορείς να συνεχίσεις από το ίδιο σημείο με 3" ατρωσία — αυστηρά μία φορά ανά run
- ✅ 100% offline τοπική αποθήκευση (AsyncStorage) — high score, credits, owned gliders, επιλεγμένο glider, mute
- ✅ Neon/cyberpunk vector γραφικά (react-native-svg) — parallax background, glider, εμπόδια, μπαλκόνια, floating score/combo text
- ✅ Ηχητικά εφέ (SFX) — δείτε παρακάτω
- ✅ Το Logo.png / Splash_Screen.png που έστειλες χρησιμοποιούνται ως app icon / adaptive icon / splash
- ✅ Expo SDK 57 (React Native 0.86.2), `app.json` ρυθμισμένο για Android min SDK 29 (Android 10) → target/compile SDK 36 (Android 16)

### ⚠️ Σημαντικοί περιορισμοί (διάβασέ τα πριν κάνεις build)

0. **Καμία αγορά με πραγματικά χρήματα.** Το Garage χρησιμοποιεί μόνο πόντους
   (credits) που μαζεύει ο παίκτης παίζοντας (παραδόσεις + drone refuel
   stations) — δεν υπάρχει πουθενά στον κώδικα billing SDK, Google Play
   Billing, τιμή σε €/$, ή οποιαδήποτε κλήση δικτύου για πληρωμή. Αν ποτέ
   θελήσεις να προσθέσεις πραγματικές in-app purchases, θα χρειαστεί να
   ενσωματώσεις ξεχωριστά κάποιο billing plugin (π.χ. `react-native-iap`) —
   δεν υπάρχει τίποτα τέτοιο εδώ.
1. **Background μουσική.** Υπάρχει ένα looping background track
   (`assets/audio/music.mp3`, ανέβηκε από εσένα, no-copyright/royalty-free)
   που παίζει συνεχόμενα από το άνοιγμα της εφαρμογής (Menu + in-run), σε
   χαμηλότερη ένταση από τα SFX ώστε να μην τα σκεπάζει. Ελέγχεται από το
   ίδιο mute button με τα SFX (`src/audio/AudioManager.js`).
2. **Τα SFX είναι 100% συνθετικά**, φτιαγμένα προγραμματιστικά (sine/square waves +
   filtered noise) με το `tools/gen_sfx.py` — καθόλου δείγματα από το internet,
   άρα καθόλου θέμα πνευματικών δικαιωμάτων. Αρχεία: `assets/audio/*.wav`
   (thrust, deliver, pickup, crash, click, swipe). Μπορείς να τρέξεις ξανά
   `python3 tools/gen_sfx.py` και να πειράξεις τις παραμέτρους (συχνότητες,
   διάρκειες) αν θες διαφορετικό sound design. Η αναπαραγωγή γίνεται μέσω
   `expo-audio` (το `expo-av` καταργήθηκε από το SDK).
3. **Τα γραφικά είναι vector/SVG**, σχεδιασμένα σε κώδικα — όχι ζωγραφισμένα PNG
   sprites στο ίδιο επίπεδο λεπτομέρειας με το Logo/Splash που ανέβασες. Αν
   θες πιο "painted" αισθητική, μπορείς να αντικαταστήσεις οποιοδήποτε
   component στο `src/components/*Sprite.js` με δικό σου PNG spritesheet.
4. **Χρειάζεται path χωρίς κενά.** Ο φάκελος του project πρέπει να έχει όνομα
   χωρίς κενά (π.χ. `delivery-glider`, όχι `The Delivery Glider`) — τα native
   build tools (NDK/CMake) σε Windows σπάνε αν η διαδρομή έχει κενά.
5. **Δεν έχει τρέξει build σε πραγματική συσκευή εδώ.** Ο κώδικας γράφτηκε
   προσεκτικά, αλλά επιβεβαιώθηκε ότι δουλεύει μόνο μέσω δοκιμών του χρήστη σε
   πραγματικό Android Studio/συσκευή — όχι στο περιβάλλον όπου φτιάχτηκε.
6. **Απλοποιήσεις στο μεγάλο update (weather/power-ups/wanted/gadgets κ.λπ.):**
   τα Gadgets είναι μόνιμα αγορασμένα (όχι αναλώσιμα ανά χρήση, απλώς
   εξοπλίζονται/αφαιρούνται ελεύθερα)· το Acid Rain/corrosion και το "shield"
   είναι δικές μου ερμηνείες πάνω στο 1-hit-death μοντέλο του παιχνιδιού
   (δεν υπάρχει πολλαπλών-ζωών σύστημα)· το Grav-Inverter αντιστρέφει μόνο τη
   βαρύτητα, όχι τα visuals του glider. Όλα δουλεύουν, απλά μην περιμένεις
   1-προς-1 αντιστοιχία με κάθε λεπτομέρεια του doc.

### 🆕 Πρόσφατος εμπλουτισμός (νέα αρχεία/αλλαγές παρακάτω)

1. **Background μουσική** — `assets/audio/music.mp3` (δικό σου, no-copyright),
   loop, ελεγχόμενη από το ίδιο mute button. Δες `src/audio/AudioManager.js`
   και `src/store/GameContext.js`.
2. **5η ζώνη "Blackout Sprawl"** (από τα 2200m) — πυκνά police
   drones/robo-pigeons, κόκκινα (illegal) μπαλκόνια. Δες
   `src/constants/gameConfig.js` (`DIFFICULTY.zones`) και
   `src/game/chunks.js` (`blackoutSprawl` template, `getZoneIndex`).
3. **2 νέα Weather Events**: **Sandstorm** (τυρβώδεις άνεμοι — δυσκολεύει τον
   έλεγχο ύψους) και **Blackout** (σκοτεινιάζει η οθόνη, ξεθωριάζει το HUD).
   Δες `WEATHER.events` στο `gameConfig.js`, physics στο `useGameLoop.js`,
   οπτικά στο `GameScreen.js`/`HUD.js`.
4. **2 νέα gliders με νέα skills**:
   - **Riftwalker** (active, double-tap): *Phase Shift* — άυλος ~2.2", περνάς
     μέσα από εμπόδια χωρίς Wanted Level, μαζεύει αυτόματα κοντινά νομίσματα.
   - **Storm Breaker** (passive): *Storm Immunity* — μισή διάβρωση Acid Rain,
     χωρίς αντιστροφή χειρισμών στο Solar Flare, ορατό HUD στο Blackout,
     +30% credits όσο διαρκεί weather event.
   Δες `src/game/gliders.js`, `SKILLS`/`SKILL_UPGRADES` στο `gameConfig.js`,
   λογική στο `useGameLoop.js`.
5. **Νέα οθόνη "STATS"** — συνολική απόσταση, συνολικές παραδόσεις, καλύτερο
   combo, νομίσματα lifetime, EMP/Slipstream/Revive μετρητές κ.λπ. Νέο
   `src/screens/StatsScreen.js`, κουμπί στο `MenuScreen.js`, routing στο
   `App.js`, νέα πεδία στο `stats` object του `src/store/storage.js` (safe
   merge — δεν χάνεται το save file υπαρχόντων παικτών).

### 🆕 Πρόσφατος εμπλουτισμός #2

1. **4 νέα Achievements**: Storm Chaser (3 weather events σε 1 run), Ghost
   Runner (20+ νομίσματα σε ένα Phase Shift), Blind Flight (500m+ lifetime
   μέσα σε Blackout), Zone 5 (έφτασε στο Blackout Sprawl). Δες
   `src/game/achievements.js`.
2. **6η ζώνη "Metro Undercity"** (από τα 3200m) — μόνιμοι "τοίχοι σήραγγας"
   περιορίζουν τον κάθετο χώρο στο 56% της οθόνης (24%-80%), με μικρότερα
   sine amplitudes στα εμπόδια· η πρόκληση είναι ακρίβεια, όχι ταχύτητα (η
   `speedMult` είναι σκόπιμα χαμηλότερη από της Zone 5). Δες
   `DIFFICULTY.zones` στο `gameConfig.js`, `metroUndercity` chunk στο
   `chunks.js`, τα νέα tunnel-aware όρια crash στο `useGameLoop.js`, και τα
   οπτικά "τοίχους" στο `GameScreen.js`.
3. **Milestone rewards στο Stats screen** — δωρεάν glider (Phantom) στα
   10.000m lifetime distance, χωρίς credits. Progress bar στο ίδιο το Stats
   screen, notice card στο Game Over. Δες `MILESTONES`/`checkMilestones` στο
   `storage.js`.
4. **Colorblind-friendly UI**: `WantedStars` πλέον δείχνει γεμάτα (★) vs
   κενά (☆) αστέρια — σχήμα, όχι μόνο χρώμα/φωτεινότητα — συν αριθμητικό
   badge. `WeatherBanner` πλέον έχει μοναδικό icon ανά weather event (☀ ☣ 🚨
   🌪 ☾) ώστε να αναγνωρίζεται χωρίς να διαβάζεις χρώμα.

### Δομή Project

```
App.js                        # root navigation (Menu/Game/GameOver/Garage)
app.json                      # Expo config (icon, splash, Android package, min/target SDK)
src/
  constants/gameConfig.js     # physics, difficulty zones, combo/near-miss config, χρώματα
  game/
    chunks.js                 # procedural chunk pool + spawner + extra hazards ανά ζώνη
    gliders.js                # ξεκλειδώσιμα gliders (μόνο με πόντους, καμία αγορά)
    useGameLoop.js             # ο πυρήνας: physics, collisions, delivery, combo, near-miss, milestones
  store/
    storage.js                 # AsyncStorage save/load (offline)
    GameContext.js              # global state (save data, mute, actions)
  audio/AudioManager.js         # SFX player (expo-audio) + mute
  components/                  # SVG sprites: Rider, Obstacle, Balcony, Parallax, HUD, MuteButton, FloatingText
  screens/                     # Menu, Game, GameOver, Garage
assets/
  icon.png, adaptive-icon.png, splash.png   # από τα δικά σου αρχεία
  audio/*.wav                  # συνθετικά SFX
tools/gen_sfx.py               # script που παρήγαγε τα SFX (Python, χωρίς dependencies)
android/                       # native project (ήδη δημιουργημένος με expo prebuild)
```

### Πώς να το τρέξεις (development)

Χρειάζεσαι Node.js (LTS) και λογαριασμό expo.dev.

```bash
cd delivery-glider
npm install
npx expo start
```
### Πώς να το κάνεις export μέσω Android Studio (τοπικό build)

Αυτό το project **περιλαμβάνει ήδη τον έτοιμο native `android/` φάκελο**
(δημιουργήθηκε με `npx expo prebuild`), οπότε δεν χρειάζεται να τρέξεις
prebuild μόνος σου — ανοίγεις κατευθείαν σε Android Studio.

1. Κάνε `npm install` πρώτα (βήμα παραπάνω) — χρειάζεται για το JS bundle.
2. Άνοιξε το **Android Studio**.
3. **File → Open** και διάλεξε τον φάκελο `delivery-glider/android` (όχι τον
   ριζικό φάκελο `delivery-glider` — τον υποφάκελο `android`).
4. Περίμενε να τελειώσει το Gradle sync (πρώτη φορά μπορεί να πάρει αρκετά
   λεπτά — κατεβάζει dependencies).
5. Σύνδεσε Android συσκευή (USB debugging ενεργό) ή ξεκίνα έναν emulator.
6. Πάτα **Run ▶** για να εγκατασταθεί απευθείας στη συσκευή/emulator, **ή**
   πήγαινε **Build → Generate Signed Bundle / APK** για να βγάλεις τελικό
   `.apk`/`.aab` (θα σου ζητήσει να φτιάξεις/επιλέξεις keystore — αν δεν
   έχεις, το Android Studio σε καθοδηγεί να φτιάξεις καινούργιο).

Το `minSdkVersion` (29 = Android 10) και `targetSdkVersion`/`compileSdkVersion`
(36 = Android 16) είναι ήδη γραμμένα μέσα στο `android/gradle.properties`, το
app icon και το splash είναι ήδη στο `android/app/src/main/res/`, άρα δεν
χρειάζεται καμία επιπλέον ρύθμιση.

⚠️ Χρειάζεσαι μια αρκετά πρόσφατη έκδοση Android Studio (με ενσωματωμένο JDK 17+
και υποστήριξη AGP 8.12) — αν έχεις πολύ παλιά έκδοση, κάνε πρώτα Help → Check
for Updates. Επίσης θα σου ζητήσει να κατεβάσεις το Android SDK Platform 36
("Baklava") μέσω του SDK Manager αν δεν το έχεις ήδη — το κάνει αυτόματα με
ένα κλικ όταν ανοίξεις το project.

⚠️ **Ο φάκελος του project πρέπει να έχει path χωρίς κενά** (π.χ.
`C:\Users\σένα\delivery-glider`, όχι `C:\Users\σένα\The Delivery Glider`) —
διαφορετικά το native build (`generateStubPCH`/CMake) σκάει σε Windows.

**Αν αλλάξεις κώδικα JS/React** (π.χ. σε `src/`) μετά το άνοιγμα σε Android
Studio: απλά ξανατρέξε **Run ▶** — το Gradle ξαναχτίζει αυτόματα το JS bundle
μέσα στο APK. Δεν χρειάζεται να ξανατρέξεις `expo prebuild`, εκτός αν
αλλάξεις κάτι στο `app.json` (icon, package name, plugins κ.λπ.) — τότε
χρειάζεται:
```bash
npx expo prebuild --platform android --clean
```
ώστε ο `android/` φάκελος να ενημερωθεί με τις νέες ρυθμίσεις.

### Εναλλακτικά: build μέσω expo.dev (EAS Build, cloud)

```bash
npm install -g eas-cli
eas login
eas build:configure          # θα σου δώσει projectId, βάλε το στο app.json
eas build --platform android --profile production
```

Το `eas.json` υπάρχει ήδη έτοιμο στο project (profiles `preview` και `production`).
Χρησιμοποίησε το `preview` profile (buildType `apk`) αν θες ένα .apk να
εγκαταστήσεις απευθείας σε συσκευή για δοκιμή, ή `production` (.aab) για
Google Play.

### Android compatibility

`app.json` → `plugins` → `expo-build-properties` έχει οριστεί:
- `minSdkVersion: 29` (Android 10)
- `targetSdkVersion / compileSdkVersion: 36` (Android 16) — καλύπτει την απαίτηση
  του Google Play από **31/8/2026** για νέες υποβολές/updates

Το project τρέχει σε **Expo SDK 57** (React Native 0.86.2, React 19.2.3), με
Android Gradle Plugin **8.12.0** — πάνω από το ελάχιστο 8.9.0 που απαιτεί
επίσημα η Google για compileSdk 36. Χρησιμοποιεί New Architecture (Fabric/
TurboModules), υποχρεωτικό σε αυτή την έκδοση του React Native.

Το παιχνίδι δεν κάνει καμία κλήση δικτύου (zero network requests) — δουλεύει
πλήρως σε Flight Mode.

---

## 🇬🇧 English

An offline 2D endless-runner for Android, built with Expo / React Native.
Neo-Athens Grid, 2088 — deliver packages while gliding between balconies,
flying taxis, and police drones, managing your glider's weight as you go.

### What this project includes

- ✅ Full game loop: gravity scales with carried packages, tap/hold-to-fly, swipe-to-deliver, swipe-down dive
- ✅ Procedural chunk generation (5 chunk types, randomly picked based on distance) + obstacle density that actually increases per zone (extra hazards, not just speed)
- ✅ Combo multiplier: chaining deliveries within a short time window raises a credit multiplier (up to x5) — a risk/reward loop
- ✅ "Close call" bonus points for passing close to an obstacle without hitting it
- ✅ Zone milestone banners with bonus points each time you enter a harder zone
- ✅ Screen shake on crash + a warning red glow at the screen edges as you approach the bounds (before crashing)
- ✅ Dynamic difficulty across 4 zones (Rookie District → Hyper-Speed Chaos), with a steeper difficulty curve
- ✅ Drone refuel stations, delivery particles, AABB collisions
- ✅ Garage: **12 unlockable gliders** (6 base + 6 with unique Active/Passive Skills: EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull), using only in-game points (credits) earned by playing — **no real-money purchases, no in-app purchases, no billing SDK anywhere**
- ✅ **Skill Upgrade Tree**: each skill glider levels up 0→3 (shorter cooldown, bigger radius/duration/magnet) using credits, in the Garage
- ✅ **9 Achievements** that unlock purely cosmetic glider skins — new "ACHIEVEMENTS" screen from the Menu
- ✅ Neo-Coins/Data-Cubes scattered along the track in "coin trails", collected by flying over them
- ✅ "Second Chance" Revive: on your first crash, if you have ≥100 coins, you can continue from the exact same spot with 3s of invincibility — strictly once per run
- ✅ 100% offline local storage (AsyncStorage) — high score, credits, owned gliders, selected glider, mute preference
- ✅ Neon/cyberpunk vector graphics (react-native-svg) — parallax background, glider, obstacles, balconies, floating score/combo text
- ✅ Sound effects (SFX) — see below
- ✅ The Logo.png / Splash_Screen.png you provided are used as the app icon / adaptive icon / splash screen
- ✅ Expo SDK 57 (React Native 0.86.2), `app.json` configured for Android min SDK 29 (Android 10) → target/compile SDK 36 (Android 16)

### ⚠️ Important limitations (read before you build)

0. **No real-money purchases.** The Garage only uses points (credits) earned
   by playing (deliveries + drone refuel stations) — there is no billing SDK,
   no Google Play Billing, no price in €/$, and no network call for payment
   anywhere in the code. If you ever want to add real in-app purchases,
   you'd need to integrate a separate billing plugin (e.g. `react-native-iap`)
   — nothing like that exists here.
1. **Background music.** There is a looping background track
   (`assets/audio/music.mp3`, supplied by you, no-copyright/royalty-free)
   that plays continuously from app launch (Menu + in-run), at a lower
   volume than the SFX so it never buries them. Controlled by the same mute
   button as the SFX (`src/audio/AudioManager.js`).
2. **The SFX are 100% synthesized**, generated programmatically (sine/square
   waves + filtered noise) via `tools/gen_sfx.py` — no samples from the
   internet, so zero copyright concerns. Files: `assets/audio/*.wav`
   (thrust, deliver, pickup, crash, click, swipe). You can re-run
   `python3 tools/gen_sfx.py` and tweak the parameters (frequencies,
   durations) for a different sound design. Playback uses `expo-audio`
   (the older `expo-av` was removed from the SDK).
3. **The graphics are vector/SVG**, drawn in code — not painted PNG sprites
   at the same level of detail as the Logo/Splash you uploaded. If you want
   a more "painted" look, you can replace any component in
   `src/components/*Sprite.js` with your own PNG spritesheet.
4. **Needs a path with no spaces.** The project folder name must not contain
   spaces (e.g. `delivery-glider`, not `The Delivery Glider`) — native build
   tools (NDK/CMake) on Windows break if the path contains spaces.
5. **Has not been build-tested on a real device from this environment.** The
   code was written carefully, but it was only confirmed to actually work
   through the user's own testing in Android Studio / on a real device —
   not in the environment it was written in.

### Project structure

```
App.js                        # root navigation (Menu/Game/GameOver/Garage)
app.json                      # Expo config (icon, splash, Android package, min/target SDK)
src/
  constants/gameConfig.js     # physics, difficulty zones, combo/near-miss config, colors
  game/
    chunks.js                 # procedural chunk pool + spawner + extra hazards per zone
    gliders.js                # unlockable gliders (points-only, no purchases)
    useGameLoop.js             # the core: physics, collisions, delivery, combo, near-miss, milestones
  store/
    storage.js                 # AsyncStorage save/load (offline)
    GameContext.js              # global state (save data, mute, actions)
  audio/AudioManager.js         # SFX player (expo-audio) + mute
  components/                  # SVG sprites: Rider, Obstacle, Balcony, Parallax, HUD, MuteButton, FloatingText
  screens/                     # Menu, Game, GameOver, Garage
assets/
  icon.png, adaptive-icon.png, splash.png   # from your own uploaded files
  audio/*.wav                  # synthesized SFX
tools/gen_sfx.py               # the script that generated the SFX (pure Python, no dependencies)
android/                       # native project (already generated via expo prebuild)
```

### How to run it (development)

You need Node.js (LTS) and an expo.dev account.

```bash
cd delivery-glider
npm install
npx expo start
```

### How to export it via Android Studio (local build)

This project **already includes the ready-made native `android/` folder**
(generated with `npx expo prebuild`), so you don't need to run prebuild
yourself — you open Android Studio directly.

1. Run `npm install` first (step above) — needed for the JS bundle.
2. Open **Android Studio**.
3. **File → Open** and select the `delivery-glider/android` folder (not the
   root `delivery-glider` folder — the `android` subfolder).
4. Wait for the Gradle sync to finish (the first time can take a while — it
   downloads dependencies).
5. Connect an Android device (USB debugging enabled) or start an emulator.
6. Press **Run ▶** to install directly on the device/emulator, **or** go to
   **Build → Generate Signed Bundle / APK** to produce the final `.apk`/`.aab`
   (it will ask you to create/select a keystore — if you don't have one,
   Android Studio walks you through creating a new one).

`minSdkVersion` (29 = Android 10) and `targetSdkVersion`/`compileSdkVersion`
(36 = Android 16) are already written into `android/gradle.properties`, and
the app icon and splash are already in `android/app/src/main/res/`, so no
extra configuration is needed.

⚠️ You need a reasonably recent version of Android Studio (with bundled
JDK 17+ and AGP 8.12 support) — if yours is very old, run Help → Check for
Updates first. It will also ask you to download Android SDK Platform 36
("Baklava") via the SDK Manager if you don't already have it — it does this
automatically with one click when you open the project.

⚠️ **The project folder must have a path with no spaces** (e.g.
`C:\Users\you\delivery-glider`, not `C:\Users\you\The Delivery Glider`) —
otherwise the native build (`generateStubPCH`/CMake) fails on Windows.

**If you change JS/React code** (e.g. in `src/`) after opening Android
Studio: just press **Run ▶** again — Gradle automatically rebuilds the JS
bundle inside the APK. You don't need to re-run `expo prebuild` unless you
change something in `app.json` (icon, package name, plugins, etc.) — in that
case you need:
```bash
npx expo prebuild --platform android --clean
```
so the `android/` folder picks up the new settings.

### Alternative: build via expo.dev (EAS Build, cloud)

```bash
npm install -g eas-cli
eas login
eas build:configure          # gives you a projectId, put it in app.json
eas build --platform android --profile production
```

`eas.json` is already set up in the project (`preview` and `production`
profiles). Use the `preview` profile (buildType `apk`) if you want an .apk
to install directly on a device for testing, or `production` (.aab) for
Google Play.

### Android compatibility

`app.json` → `plugins` → `expo-build-properties` is set to:
- `minSdkVersion: 29` (Android 10)
- `targetSdkVersion / compileSdkVersion: 36` (Android 16) — covers Google
  Play's requirement, effective **August 31, 2026**, for new submissions/updates

The project runs on **Expo SDK 57** (React Native 0.86.2, React 19.2.3), with
Android Gradle Plugin **8.12.0** — above the 8.9.0 minimum Google officially
requires for compileSdk 36. It uses the New Architecture (Fabric/
TurboModules), which is mandatory in this version of React Native.

The game makes zero network calls — it works fully in Airplane Mode.

