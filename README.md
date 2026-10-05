# The Delivery Glider 🛸📦

**🇬🇷 [Ελληνικά](#-ελληνικά) · 🇬🇧 [English](#-english)**

---

## 🇬🇷 Ελληνικά

Offline 2D endless-runner για Android, χτισμένο με Expo / React Native.
Neo-Athens Grid, 2088 — παραδίδεις δέματα πετώντας ανάμεσα σε μπαλκόνια,
ιπτάμενα ταξί και drones της αστυνομίας, διαχειριζόμενος το βάρος του glider σου.

### 🎮 Πώς παίζεται

- **Κράτα πατημένο** στην οθόνη για να ανέβει το glider σου — άσε το και πέφτει (όσα περισσότερα δέματα κουβαλάς, τόσο πιο γρήγορα πέφτεις). Στην αρχή κάθε run η βαρύτητα μπαίνει σταδιακά μέσα σε ~2", μια ήπια φθίνουσα καμπύλη αντί για απότομο drop, ώστε να προλαβαίνεις να προσανατολιστείς.
- **Swipe δεξιά** κοντά σε φωτισμένο μπαλκόνι για να παραδώσεις ένα δέμα.
- **Swipe κάτω** για απότομη βουτιά — χρήσιμο για να αποφύγεις εμπόδια από πάνω σου.
- Μάζεψε **νομίσματα** πετώντας από πάνω τους, και πρόσεχε τα **weather events** (π.χ. Acid Rain, Blackout) που αλλάζουν προσωρινά τους κανόνες.
- Συνεχόμενες παραδόσεις χωρίς crash χτίζουν **combo multiplier** — όσο πιο risky παίζεις, τόσο περισσότερους πόντους μαζεύεις.
- Κάθε glider στο Garage έχει ένα μοναδικό **active/passive skill** (π.χ. EMP Blast, Phase Shift) — δες περιγραφή στο Garage πριν διαλέξεις.
- Interactive tutorial μέσα στην εφαρμογή (Menu → "ΠΩΣ ΠΑΙΖΕΤΑΙ"), οπότε δεν χρειάζεται να διαβάσεις τίποτα εκτός app.
- Κουμπί **EL/EN** πάνω-δεξιά στο Menu (δίπλα στο mute) αλλάζει άμεσα όλη τη γλώσσα της εφαρμογής.

### Τι περιλαμβάνει

- Πλήρης game loop: βαρύτητα ανάλογη με τα δέματα, tap/hold-to-fly, swipe-to-deliver, swipe-down dive
- Procedural chunk generation με πυκνότητα εμποδίων που αυξάνεται ανά ζώνη (extra hazards, όχι μόνο ταχύτητα), και κινούμενα εμπόδια που ξεκινούν ήδη από τα 60m
- Combo multiplier: συνεχόμενες παραδόσεις μέσα σε μικρό χρονικό παράθυρο αυξάνουν πολλαπλασιαστή πόντων (έως x5) — risk/reward loop
- "Close call" bonus πόντοι όταν περνάς ξυστά από εμπόδιο χωρίς να χτυπήσεις
- Zone milestone banners με μπόνους πόντους κάθε φορά που μπαίνεις σε πιο δύσκολη ζώνη
- Screen shake στο crash + προειδοποιητική κόκκινη λάμψη στις άκρες της οθόνης όταν πλησιάζεις όριο
- Dynamic difficulty σε 7 ζώνες: Rookie District → Rookie District (κινούμενα εμπόδια από τα 60m) → Transit Lanes → Megacity Core → Hyper-Speed Chaos → Blackout Sprawl → Metro Undercity (μόνιμοι τοίχοι σήραγγας, η πρόκληση εκεί είναι ακρίβεια, όχι ταχύτητα)
- Soft difficulty ramp: οι πρώτες 5 προσπάθειες ενός νέου παίκτη έχουν πιο αργή ταχύτητα κόσμου και λιγότερα τυχαία extra hazards, με γραμμική επιστροφή στο 100% δυσκολία
- Wind Corridors: μόνιμα κάθετα ρεύματα αέρα σε συγκεκριμένα σημεία της πόλης, με οπτικά βέλη (↑/↓) πριν μπεις μέσα
- Ελαφρύ χρωματικό tint ανά ζώνη (vignette) για οπτική ταυτότητα — χωρίς να επηρεάζει την αναγνωσιμότητα
- Weather/City Events: Solar Flare (αντεστραμμένοι χειρισμοί), Acid Rain (μέτρημα διάβρωσης, κρύψου χαμηλά), Police Blockade (προειδοποίηση + ζώνη-θανάτου), Sandstorm (τυρβώδεις άνεμοι), Blackout (σκοτεινιάζει η οθόνη + ξεθωριάζει το HUD) — τυχαία κάθε 60-120"
- Power-up orbs στην πίστα: Overclock (ταχύτητα + ατρωσία + καταστρέφει εμπόδια), Nano-Repair (ασπίδα 1 χτυπήματος), Grav-Inverter (αντιστροφή βαρύτητας)
- Wanted Level (0-3 αστέρια, colorblind-friendly με γεμάτα/κενά αστέρια + αριθμητικό badge): ανεβαίνει αν χτυπήσεις police drone ή χάσεις 5 παραδόσεις στη σειρά· level 2+ φέρνει επίμονο "chaser" drone από πίσω· κατεβαίνει με 3 συνεχόμενες παραδόσεις σε κόκκινα (illegal) μπαλκόνια
- Weather banner με μοναδικό icon ανά event (☀ ☣ 🚨 🌪 ☾), αναγνωρίσιμο χωρίς να βασίζεσαι σε χρώμα
- Slipstream/Drafting: μείνε πίσω από ιπτάμενο ταξί για λίγο και παίρνεις x2 πόντους για μερικά δευτερόλεπτα
- Delivery Fever: 3 παραδόσεις στη σειρά ενεργοποιούν 6" διπλής αξίας νομισμάτων + ασπίδα
- Express Delivery: σπάνιο VIP μπαλκόνι με μετρητή 5" — πρόλαβέ το για x5 νομίσματα + turbo
- Mystery Crate στο Game Over: διάλεξε 1 από 3 κλειστά κουτιά, δωρεάν νομίσματα/free revive/προσωρινό skin
- Gadgets/Loadout πριν το run: Ejector Seat, Package Magnet, Fuel Canister — αγοράζονται μία φορά με πόντους, εξοπλίζεις έως 2 ανά run
- Garage: 14 ξεκλειδώσιμα gliders (6 βασικά + 8 με μοναδικά Active/Passive Skills: EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity), μόνο με πόντους (credits) που μαζεύεις παίζοντας — καμία αγορά με πραγματικά χρήματα, καμία in-app purchase, κανένα billing SDK
- Skill Upgrade Tree: κάθε skill glider αναβαθμίζεται 0→3 (μικρότερο cooldown, μεγαλύτερη ακτίνα/διάρκεια/μαγνήτης) με πόντους, στο Garage
- 19 Achievements που ξεκλειδώνουν αμιγώς cosmetic skins (χρώματα glider)
- Milestone rewards: δωρεάν glider (Phantom) στα 10.000m lifetime distance, χωρίς credits — με progress bar στο Stats screen
- Στατιστικά Παίκτη (STATS screen): συνολική απόσταση, συνολικές παραδόσεις, καλύτερο combo, νομίσματα lifetime, EMP/Slipstream/Revive μετρητές, weather events που επέζησες, απόσταση σε Blackout, καλύτερο Phase Shift pull, κ.λπ. (100% offline, AsyncStorage)
- Neo-Coins/Data-Cubes διάσπαρτα στην πίστα σε "coin trails", μαζεύονται πετώντας από πάνω τους
- **Ποικιλία πακέτων**: κάθε φορά που γεμίζει το φορτίο (αρχή run + κάθε drone-station refuel), κάθε θέση παίρνει τυχαία έναν από 4 τύπους — Standard, **Fragile** (🍶, χάνει αξία αν κάνεις swipe-down dive όσο το κουβαλάς), **Thermal** (🌡️, χρονόμετρο παράδοσης — αργεί και χαλάει), **VIP** (⭐, x2.5 πόντοι αλλά ανεβάζει αμέσως το Wanted Level). Το HUD δείχνει το τρέχον φορτίο σαν σειρά εικονιδίων — κάθε παράδοση γίνεται απόφαση, όχι επανάληψη
- **Διακλαδώσεις διαδρομής**: κάθε 500m εμφανίζεται ένα fork chunk — πάνω ζώνη (risk/reward: police drones, wind corridor, red/yellow μπαλκόνια) ή κάτω ζώνη (ασφαλής: στατικά εμπόδια, μόνο green μπαλκόνια). Η επιλογή είναι απλά το ύψος πτήσης σου· floating-text signage + μόνιμο διακριτικό tint σε κάθε band σε προειδοποιούν πριν δεσμευτείς
- **Juice**: hit-stop (σύντομο freeze-frame ~55-70ms) σε near-miss/police contact, και camera punch-in zoom σε κάθε επιτυχημένη παράδοση — καθαρά οπτική ανατροφοδότηση, μηδενική επίδραση σε timers/φυσική
- **Mutators**: προαιρετικό hard-mode πριν από κάθε run (διαλέγεις στο Loadout screen, 0 ή 1 ενεργό) — Heavy World (διπλή βαρύτητα), Blackout City (μόνιμο σκοτάδι όλο το run, το HUD μένει ορατό), Glass Cannon (καμία ασπίδα/revive — ένα χτύπημα και τέλος), Speed Demon (+40% ταχύτητα). Κάθε ένα δίνει credits multiplier (x1.4-x1.8) ως αντιστάθμισμα της δυσκολίας
- **Daily Challenge (100% τοπικό, χωρίς server)**: προαιρετικό toggle στο Loadout — ενεργοποιώντας το, όλη η γεννήτρια του κόσμου (chunks, εμπόδια, καιρός, φορτίο) τρέχει πάνω σε seeded PRNG βασισμένο στη σημερινή ημερομηνία, οπότε κάθε φορά που παίζεις τη σημερινή πρόκληση στο ίδιο κινητό θα δεις **ακριβώς το ίδιο track** — σπάσε το δικό σου ρεκόρ της ημέρας. Δεν υπάρχει κοινόχρηστο leaderboard (θα απαιτούσε server/σύνδεση δικτύου, αντίθετο στη 100% offline φιλοσοφία), αλλά η πρόκληση είναι δίκαιη ανά συσκευή
- **Ghost Replay**: το καλύτερο run σου (απόσταση) καταγράφεται αυτόματα στο παρασκήνιο· στο επόμενο run εμφανίζεται σαν διάφανο glider που πετάει ακριβώς όπου ήσουν εσύ στην ίδια απόσταση — καθαρά οπτικό, καμία επίδραση στο gameplay
- **Boss Encounters**: 3 εφάπαξ μάχες ανά run, με πραγματικό, μοναδικό art (illustrated sprite sheet) — **Sky Wyvern** (230m, κυνηγάει το ύψος σου + ρίχνει fireballs), **Giant Seagull** (620m, weave + ξαφνικά ram dashes + ρίχνει ψάρια), **Mechanical Drone** (1280m, απρόβλεπτο hover + missiles). Κάθε boss είναι ένα πραγματικό, animated (2-frame flap) entity με δικό του collision, συν ξεχωριστό σύστημα **projectiles** που πρέπει να αποφύγεις ανεξάρτητα από το ίδιο το boss. Καθάρισε τη μάχη χωρίς να χτυπηθείς για bonus credits (300-600)
- **Πλήρες Skill Tree**: στο level 2, κάθε skill (εκτός Reinforced Hull) διακλαδίζεται σε 2 κατευθύνσεις — διάλεξε ποια από τις δύο διαστάσεις του θα συνεχίσει να σκαλάρει στα levels 2-3 (π.χ. Phase Shift: Extended Phase vs Wide Pull, EMP Blast: Wide Blast vs Rapid Recharge). Η επιλογή αλλάζει ελεύθερα (δωρεάν respec) από το Garage· reuse-άρει 100% τις ήδη υπάρχουσες μηχανικές, μηδενικό ρίσκο σε ισορροπία
- **Story/NPCs**: η Nyx, dispatcher της Astra-Express, σχολιάζει με ένα σύντομο στίχο — μια ημερήσια εναλλασσόμενη γραμμή στο Menu, και μια αντίδραση στο Game Over ανάλογα με το πώς πήγε το run (crashed early/decent/great/νέο ρεκόρ). Κάθε boss έχει πλέον όνομα και ατάκα (Λοχαγός Βος, Bloodhound, The Static) στην εμφάνισή του. Καθαρά flavor text, πλήρως EL/EN, μηδενική επίδραση στο gameplay
- "Second Chance" Revive: στο πρώτο crash, αν έχεις ≥100 νομίσματα, μπορείς να συνεχίσεις από το ίδιο σημείο με 3" ατρωσία — αυστηρά μία φορά ανά run
- 100% offline τοπική αποθήκευση (AsyncStorage) — high score, credits, owned gliders, επιλεγμένο glider, mute, γλώσσα
- Neon/cyberpunk vector γραφικά (react-native-svg) — glider, εμπόδια, μπαλκόνια, floating score/combo text
- Πλούσιο, πολυεπίπεδο parallax background: starfield, μακρινό "megastructure" layer, μακρινή εναέρια κίνηση, fog/haze bands, περιστασιακό searchlight sweep, αιωρούμενα holographic ads, ambient dust particles — καθαρά διακοσμητικά, μηδενική επίδραση σε collision/δυσκολία
- Illustrated hero background σε όλα τα screens (Menu/Garage/Achievements/Stats/Daily Contracts) + ενιαία UI chrome με πραγματικά illustrated neon frame sprites (custom sprite sheet, 10 χρώματα × 3 μεγέθη), μέσω επαναχρησιμοποιήσιμων `OctagonPanel`/`OctagonButton` components — αυτόματο nearest-color matching ώστε οποιοδήποτε hex χρώμα (π.χ. το χρώμα κάθε glider) να διαλέγει το πλησιέστερο διαθέσιμο neon frame
- **14 ξεχωριστά glider sprites** (custom sprite sheet) — κάθε glider έχει πλέον το δικό του μοναδικό σχέδιο drone στο πραγματικό gameplay, όχι κοινό art. Η αντιστοίχιση glider↔sprite έγινε με optimal (Hungarian algorithm) χρωματική ταύτιση ανάμεσα στο configured χρώμα κάθε glider και το dominant hue κάθε sprite — μαθηματικά βέλτιστη συνολικά, αν και 1-2 ζευγάρια είναι θεματικά όχι τέλεια (π.χ. περιορισμός του διαθέσιμου παλέτας των 14 σχεδίων)
- Background μουσική (looping, χαμηλότερη ένταση από τα SFX) + πλήρως συνθετικά ηχητικά εφέ — δείτε παρακάτω
- Πλήρες Language Toggle (EL/EN) σε όλη την εφαρμογή — menu, tutorial, game over, stats, garage, loadout, daily contracts, achievements, mystery crate, revive prompt, weather banners, όλες οι περιγραφές gliders/gadgets/achievements/contracts. Τα κύρια ονόματα (π.χ. "Riftwalker", "Metro Undercity", "Century Club") παραμένουν ίδια και στις δύο γλώσσες σκόπιμα, ως proper nouns
- App icon / adaptive icon / splash ρυθμισμένα
- Expo SDK 57 (React Native 0.86.2), `app.json` ρυθμισμένο για Android min SDK 29 (Android 10) → target/compile SDK 36 (Android 16)

### ⚠️ Σημαντικοί περιορισμοί (διάβασέ τα πριν κάνεις build)

0. **Καμία αγορά με πραγματικά χρήματα.** Το Garage χρησιμοποιεί μόνο πόντους
   (credits) που μαζεύεις παίζοντας (παραδόσεις + drone refuel stations) —
   δεν υπάρχει πουθενά στον κώδικα billing SDK, Google Play Billing, τιμή σε
   €/$, ή οποιαδήποτε κλήση δικτύου για πληρωμή. Αν ποτέ θελήσω να προσθέσω
   πραγματικές in-app purchases, θα χρειαστεί να ενσωματώσω ξεχωριστά κάποιο
   billing plugin (π.χ. `react-native-iap`) — δεν υπάρχει τίποτα τέτοιο εδώ.
1. **Background μουσική.** Το looping track (`assets/audio/music.mp3`) είναι
   no-copyright/royalty-free και παίζει συνεχόμενα από το άνοιγμα της
   εφαρμογής (Menu + in-run), σε χαμηλότερη ένταση από τα SFX ώστε να μην τα
   σκεπάζει. Ελέγχεται από το ίδιο mute button με τα SFX
   (`src/audio/AudioManager.js`).
2. **Τα SFX είναι 100% συνθετικά**, φτιαγμένα προγραμματιστικά (sine/square
   waves + filtered noise) με το `tools/gen_sfx.py` — καθόλου δείγματα από
   το internet, άρα καθόλου θέμα πνευματικών δικαιωμάτων. Αρχεία:
   `assets/audio/*.wav` (thrust, deliver, pickup, crash, click, swipe).
   Μπορείς να τρέξεις ξανά `python3 tools/gen_sfx.py` και να πειράξεις τις
   παραμέτρους (συχνότητες, διάρκειες) αν θες διαφορετικό sound design. Η
   αναπαραγωγή γίνεται μέσω `expo-audio` (το `expo-av` καταργήθηκε από το SDK).
3. **Τα γραφικά είναι vector/SVG**, σχεδιασμένα σε κώδικα — όχι ζωγραφισμένα
   PNG sprites. Αν θέλω πιο "painted" αισθητική, μπορώ να αντικαταστήσω
   οποιοδήποτε component στο `src/components/*Sprite.js` με δικό μου PNG
   spritesheet.
4. **Χρειάζεται path χωρίς κενά.** Ο φάκελος του project πρέπει να έχει όνομα
   χωρίς κενά (π.χ. `delivery-glider`, όχι `The Delivery Glider`) — τα native
   build tools (NDK/CMake) σε Windows σπάνε αν η διαδρομή έχει κενά.
5. **Κάποιες μηχανικές είναι δικές μου ερμηνείες** πάνω στο 1-hit-death
   μοντέλο του παιχνιδιού: τα Gadgets είναι μόνιμα αγορασμένα (όχι
   αναλώσιμα ανά χρήση, απλώς εξοπλίζονται/αφαιρούνται ελεύθερα)· το Acid
   Rain/corrosion και το "shield" δεν είναι πολλαπλών-ζωών σύστημα, απλά
   καθυστερούν το θάνατο κατά μία επιπλέον χτύπημα/βαθμίδα· το Grav-Inverter
   αντιστρέφει μόνο τη βαρύτητα, όχι τα visuals του glider.

### Δομή Project

```
App.js                        # root navigation (Menu/Game/GameOver/Garage/...)
app.json                      # Expo config (icon, splash, Android package, min/target SDK)
src/
  constants/gameConfig.js     # physics, difficulty zones, weather, combo/near-miss config, χρώματα
  i18n/
    translations.js           # κεντρικό EL/EN dictionary για όλη την εφαρμογή
    i18n.js                   # translator helper (t(key, vars))
  game/
    chunks.js                 # procedural chunk pool + spawner + extra hazards + wind corridors ανά ζώνη
    gliders.js                # ξεκλειδώσιμα gliders (μόνο με πόντους, καμία αγορά)
    achievements.js           # achievements + τα cosmetic skins που ξεκλειδώνουν
    contracts.js               # daily contracts pool
    useGameLoop.js             # ο πυρήνας: physics, collisions, delivery, combo, near-miss, milestones, weather
  store/
    storage.js                 # AsyncStorage save/load (offline)
    GameContext.js              # global state (save data, mute, γλώσσα, actions)
  audio/AudioManager.js         # SFX + μουσική player (expo-audio) + mute
  components/                  # SVG sprites, HUD, MuteButton, LanguageToggleButton, WeatherBanner, κ.λπ.
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, ...
assets/
  icon.png, adaptive-icon.png, splash.png
  audio/*.wav, music.mp3       # συνθετικά SFX + background μουσική
tools/gen_sfx.py               # το script που παράγει τα SFX (Python, χωρίς dependencies)
android/                       # native project (ήδη δημιουργημένος με expo prebuild)
```

### Πώς να το τρέξεις (development)

Χρειάζεσαι Node.js (LTS) και λογαριασμό expo.dev.

```bash
cd delivery-glider
npm install
npx expo start
```

Σκάναρε το QR code με το Expo Go app στο Android κινητό σου για δοκιμή,
ή πάτα `a` για Android emulator αν έχεις στημένο Android Studio.

### Πώς να το κάνεις export μέσω Android Studio (τοπικό build)

Αυτό το project περιλαμβάνει ήδη τον έτοιμο native `android/` φάκελο
(δημιουργήθηκε με `npx expo prebuild`), οπότε δεν χρειάζεται να τρέξω
prebuild ξανά — ανοίγω κατευθείαν σε Android Studio.

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
`C:\Users\me\delivery-glider`, όχι `C:\Users\me\The Delivery Glider`) —
διαφορετικά το native build (`generateStubPCH`/CMake) σκάει σε Windows.

**Αν αλλάξω κώδικα JS/React** (π.χ. σε `src/`) μετά το άνοιγμα σε Android
Studio: απλά ξανατρέχω **Run ▶** — το Gradle ξαναχτίζει αυτόματα το JS bundle
μέσα στο APK. Δεν χρειάζεται να ξανατρέξω `expo prebuild`, εκτός αν αλλάξω
κάτι στο `app.json` (icon, package name, plugins κ.λπ.) — τότε χρειάζεται:
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

Το `eas.json` υπάρχει ήδη έτοιμο στο project (profiles `preview` και
`production`). Χρησιμοποιώ το `preview` profile (buildType `apk`) όταν θέλω
ένα .apk να εγκαταστήσω απευθείας σε συσκευή για δοκιμή, ή `production`
(.aab) για Google Play.

### Android compatibility

`app.json` → `plugins` → `expo-build-properties` έχει οριστεί:
- `minSdkVersion: 29` (Android 10)
- `targetSdkVersion / compileSdkVersion: 36` (Android 16) — καλύπτει την
  απαίτηση του Google Play από 31/8/2026 για νέες υποβολές/updates

Το project τρέχει σε Expo SDK 57 (React Native 0.86.2, React 19.2.3), με
Android Gradle Plugin 8.12.0 — πάνω από το ελάχιστο 8.9.0 που απαιτεί
επίσημα η Google για compileSdk 36. Χρησιμοποιεί New Architecture (Fabric/
TurboModules), υποχρεωτικό σε αυτή την έκδοση του React Native.

Το παιχνίδι δεν κάνει καμία κλήση δικτύου (zero network requests) —
δουλεύει πλήρως σε Flight Mode.

---

## 🇬🇧 English

An offline 2D endless-runner for Android, built with Expo / React Native.
Neo-Athens Grid, 2088 — deliver packages while gliding between balconies,
flying taxis, and police drones, managing your glider's weight as you go.

### 🎮 How to play

- **Hold down** on the screen to make your glider ascend — release and it falls (the more packages you're carrying, the faster you fall). At the start of each run gravity eases in over ~2 seconds, a gentle descending curve instead of an abrupt drop, so you have time to get oriented.
- **Swipe right** near a lit-up balcony to deliver a package.
- **Swipe down** for a sharp dive — useful for dodging obstacles above you.
- Collect **coins** by flying over them, and watch out for **weather events** (e.g. Acid Rain, Blackout) that temporarily change the rules.
- Chaining deliveries without crashing builds a **combo multiplier** — the riskier you play, the more points you rack up.
- Every glider in the Garage has a unique **active/passive skill** (e.g. EMP Blast, Phase Shift) — check its description in the Garage before picking one.
- A full interactive tutorial is built into the app (Menu → "ΠΩΣ ΠΑΙΖΕΤΑΙ" / "HOW TO PLAY"), so you never need to read anything outside the app.
- An **EL/EN** button top-right on the Menu (next to mute) switches the entire app's language instantly.

### What this includes

- Full game loop: gravity scales with carried packages, tap/hold-to-fly, swipe-to-deliver, swipe-down dive
- Procedural chunk generation with obstacle density that increases per zone (extra hazards, not just speed), and moving obstacles that start as early as 60m in
- Combo multiplier: chaining deliveries within a short time window raises a credit multiplier (up to x5) — a risk/reward loop
- "Close call" bonus points for passing close to an obstacle without hitting it
- Zone milestone banners with bonus points each time you enter a harder zone
- Screen shake on crash + a warning red glow at the screen edges as you approach the bounds
- Dynamic difficulty across 7 zones: Rookie District → Rookie District (moving obstacles begin at 60m) → Transit Lanes → Megacity Core → Hyper-Speed Chaos → Blackout Sprawl → Metro Undercity (permanent tunnel walls, the challenge there is precision, not speed)
- Soft difficulty ramp: a new player's first 5 runs get a slower world speed and fewer random extra hazards, linearly returning to 100% difficulty
- Wind Corridors: permanent vertical air currents at fixed spots around the city, with visual arrows (↑/↓) before you enter them
- A light per-zone color tint (vignette) for visual identity — without affecting readability
- Weather/City Events: Solar Flare (reversed controls), Acid Rain (a corrosion meter, take cover low), Police Blockade (a warning then a kill-zone band), Sandstorm (turbulent winds), Blackout (the screen darkens and the HUD fades) — random every 60-120s
- Power-up orbs on the track: Overclock (speed + invincibility + destroys obstacles), Nano-Repair (a one-hit shield), Grav-Inverter (reverses gravity)
- Wanted Level (0-3 stars, colorblind-friendly with filled/outline stars plus a numeric badge): rises if you hit a police drone or miss 5 deliveries in a row; level 2+ brings a persistent "chaser" drone; drops with 3 consecutive deliveries to red (illegal) balconies
- A weather banner with a unique icon per event (☀ ☣ 🚨 🌪 ☾), recognizable without relying on color
- Slipstream/Drafting: stay behind a flying taxi for a moment and get x2 points for a few seconds
- Delivery Fever: 3 deliveries in a row trigger 6s of double coin value plus a shield
- Express Delivery: a rare VIP balcony with a 5s timer — catch it for x5 coins and a turbo boost
- Mystery Crate on Game Over: pick 1 of 3 sealed crates — free coins/a free revive/a temporary skin
- Gadgets/Loadout before a run: Ejector Seat, Package Magnet, Fuel Canister — bought once with points, equip up to 2 per run
- Garage: 14 unlockable gliders (6 base + 8 with unique Active/Passive Skills: EMP Blast, Decoy Drone, Mass Reduction, Coin Magnet & Boost, Turbo Dash, Reinforced Hull, Phase Shift, Storm Immunity), using only in-game points earned by playing — no real-money purchases, no in-app purchases, no billing SDK anywhere
- Skill Upgrade Tree: each skill glider levels up 0→3 (shorter cooldown, bigger radius/duration/magnet) using points, in the Garage
- 19 Achievements that unlock purely cosmetic glider skins
- Milestone rewards: a free glider (Phantom) at 10,000m lifetime distance, no credits needed — with a progress bar on the Stats screen
- A Stats screen: total distance, total deliveries, best combo, lifetime coins, EMP/Slipstream/Revive counters, weather events survived, distance flown in Blackout, best Phase Shift pull, and more (100% offline, AsyncStorage)
- Neo-Coins/Data-Cubes scattered along the track in "coin trails", collected by flying over them
- "Second Chance" Revive: on your first crash, if you have ≥100 coins, you can continue from the exact same spot with 3s of invincibility — strictly once per run
- 100% offline local storage (AsyncStorage) — high score, credits, owned gliders, selected glider, mute preference, language
- Neon/cyberpunk vector graphics (react-native-svg) — glider, obstacles, balconies, floating score/combo text
- Rich, multi-layer parallax background: a starfield, a distant "megastructure" silhouette layer, faraway background air traffic, fog/haze bands, an occasional sweeping searchlight, floating holographic ads, and ambient dust particles — all purely decorative, zero effect on collisions/difficulty
- An illustrated hero background across every screen (Menu/Garage/Achievements/Stats/Daily Contracts) plus consistent UI chrome built from real illustrated neon frame sprites (a custom sprite sheet, 10 colors × 3 sizes), via reusable `OctagonPanel`/`OctagonButton` components — automatic nearest-color matching means any hex color (e.g. each glider's own color) picks the closest available neon frame
- A looping background track (quieter than the SFX) plus fully synthesized sound effects — see below
- A full EL/EN language toggle across the entire app — menu, tutorial, game over, stats, garage, loadout, daily contracts, achievements, mystery crate, revive prompt, weather banners, every glider/gadget/achievement/contract description. Proper nouns (e.g. "Riftwalker", "Metro Undercity", "Century Club") intentionally stay the same in both languages
- App icon / adaptive icon / splash screen configured
- Expo SDK 57 (React Native 0.86.2), `app.json` configured for Android min SDK 29 (Android 10) → target/compile SDK 36 (Android 16)

### ⚠️ Important limitations (read before you build)

0. **No real-money purchases.** The Garage only uses points (credits) earned
   by playing (deliveries + drone refuel stations) — there is no billing SDK,
   no Google Play Billing, no price in €/$, and no network call for payment
   anywhere in the code. If I ever want to add real in-app purchases, I'd
   need to integrate a separate billing plugin (e.g. `react-native-iap`) —
   nothing like that exists here.
1. **Background music.** The looping track (`assets/audio/music.mp3`) is
   no-copyright/royalty-free and plays continuously from app launch (Menu +
   in-run), at a lower volume than the SFX so it never buries them.
   Controlled by the same mute button as the SFX
   (`src/audio/AudioManager.js`).
2. **The SFX are 100% synthesized**, generated programmatically (sine/square
   waves + filtered noise) via `tools/gen_sfx.py` — no samples from the
   internet, so zero copyright concerns. Files: `assets/audio/*.wav`
   (thrust, deliver, pickup, crash, click, swipe). I can re-run
   `python3 tools/gen_sfx.py` and tweak the parameters (frequencies,
   durations) for a different sound design. Playback uses `expo-audio`
   (the older `expo-av` was removed from the SDK).
3. **The graphics are vector/SVG**, drawn in code — not painted PNG sprites.
   If I want a more "painted" look, I can replace any component in
   `src/components/*Sprite.js` with my own PNG spritesheet.
4. **Needs a path with no spaces.** The project folder name must not contain
   spaces (e.g. `delivery-glider`, not `The Delivery Glider`) — native build
   tools (NDK/CMake) on Windows break if the path contains spaces.
5. **A few mechanics are my own interpretation** of the game's 1-hit-death
   model: Gadgets are permanently purchased (not consumed per use, just
   freely equipped/unequipped); Acid Rain/corrosion and the "shield" aren't
   a multi-life system, they just delay death by one extra hit/tick; the
   Grav-Inverter only flips gravity, not the glider's visuals.

### Project structure

```
App.js                        # root navigation (Menu/Game/GameOver/Garage/...)
app.json                      # Expo config (icon, splash, Android package, min/target SDK)
src/
  constants/gameConfig.js     # physics, difficulty zones, weather, combo/near-miss config, colors
  i18n/
    translations.js           # central EL/EN dictionary for the whole app
    i18n.js                   # translator helper (t(key, vars))
  game/
    chunks.js                 # procedural chunk pool + spawner + extra hazards + wind corridors per zone
    gliders.js                # unlockable gliders (points-only, no purchases)
    achievements.js           # achievements + the cosmetic skins they unlock
    contracts.js               # daily contracts pool
    useGameLoop.js             # the core: physics, collisions, delivery, combo, near-miss, milestones, weather
  store/
    storage.js                 # AsyncStorage save/load (offline)
    GameContext.js              # global state (save data, mute, language, actions)
  audio/AudioManager.js         # SFX + music player (expo-audio) + mute
  components/                  # SVG sprites, HUD, MuteButton, LanguageToggleButton, WeatherBanner, etc.
  screens/                     # Menu, Game, GameOver, Garage, Loadout, Stats, Achievements, Contracts, ...
assets/
  icon.png, adaptive-icon.png, splash.png
  audio/*.wav, music.mp3       # synthesized SFX + background music
tools/gen_sfx.py               # the script that generates the SFX (pure Python, no dependencies)
android/                       # native project (already generated via expo prebuild)
```

### How to run it (development)

You need Node.js (LTS) and an expo.dev account.

```bash
cd delivery-glider
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your Android phone to test it, or
press `a` for an Android emulator if you have Android Studio set up.

### How to export it via Android Studio (local build)

This project already includes the ready-made native `android/` folder
(generated with `npx expo prebuild`), so I don't need to run prebuild again
— I open Android Studio directly.

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
`C:\Users\me\delivery-glider`, not `C:\Users\me\The Delivery Glider`) —
otherwise the native build (`generateStubPCH`/CMake) fails on Windows.

**If I change JS/React code** (e.g. in `src/`) after opening Android Studio:
I just press **Run ▶** again — Gradle automatically rebuilds the JS bundle
inside the APK. I don't need to re-run `expo prebuild` unless I change
something in `app.json` (icon, package name, plugins, etc.) — in that case
I need:
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
profiles). I use the `preview` profile (buildType `apk`) when I want an .apk
to install directly on a device for testing, or `production` (.aab) for
Google Play.

### Android compatibility

`app.json` → `plugins` → `expo-build-properties` is set to:
- `minSdkVersion: 29` (Android 10)
- `targetSdkVersion / compileSdkVersion: 36` (Android 16) — covers Google
  Play's requirement, effective August 31, 2026, for new submissions/updates

The project runs on Expo SDK 57 (React Native 0.86.2, React 19.2.3), with
Android Gradle Plugin 8.12.0 — above the 8.9.0 minimum Google officially
requires for compileSdk 36. It uses the New Architecture (Fabric/
TurboModules), which is mandatory in this version of React Native.

The game makes zero network calls — it works fully in Airplane Mode.
