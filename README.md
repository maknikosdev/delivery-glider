# Τελικό update (αντικατάσταση / προσθήκη αρχείων, ίδια δομή με το project σου)

Αντιγραφή αυτούσιων των φακέλων `src/` και `assets/` πάνω στο project (αντικαθιστά τα υπάρχοντα, προσθέτει τα νέα).

## Αντικαθιστά (βασισμένα στα δικά σου αρχεία)
src/constants/gameConfig.js · src/store/GameContext.js · src/game/gliders.js · src/game/chunks.js
src/game/useGameLoop.js · src/screens/GameScreen.js · src/screens/GarageScreen.js
src/i18n/translations.js · src/components/ParallaxBackground.js

## Νέα
src/game/: economy.js, environments.js, randomizer.js, parcels.js, gliderSkills.js, newGliders.js, gliderSprites.js
src/components/: GliderTrail.js, SkinUpdatesRow.js, SpecialRiderSprite.js, ParcelSprite.js
assets/sprites/: glider_<id>.png x12

## Τι περιλαμβάνει
- Titan 8 δέματα / Heavy Lifter ελαφρύτερος, τιμές gliders x2, πιο αργά κέρδη (gameConfig)
- Skin Updates I-III ανά glider (Garage + trail στο gameplay)
- 5 background περιβάλλοντα (νέο ξεκλειδώνει κάθε 3 gliders)
- Random layouts: 50% procedural chunks + ανακατεμένα templates (δουλεύει και με Daily Seed)
- Δέματα προς παραλαβή (pick-up parcels), συγχρονισμένα με τους τύπους φορτίου
- 12 νέοι gliders με δικά τους skills και artwork
- Δεν προστέθηκαν οι "διχάλες" του προηγούμενου patch: το παιχνίδι σου έχει ήδη Route Branching.

## Για να τα δεις
- Field Guide: οι μεταφράσεις hazards.collect_parcel* υπάρχουν, αλλά η γραμμή στο FieldGuideScreen.js θέλει το αρχείο.
- Achievement fleet_commander: αν ελέγχει "14 gliders", άλλαξέ το να ελέγχει GLIDERS.length (τώρα 26).
- Νέο build: ανέβασε versionCode.
