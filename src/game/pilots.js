// ---- Pilot stories, personal challenges, gold/unique skins -------------------
// Each glider has a pilot with 3 chapters unlocked by that glider's Mastery
// level (1, 3, 5). Reaching Mastery 5 also unlocks the pilot's unique skin
// colour and the GOLD trail. Each glider also has one personal challenge,
// completed by flying THAT glider; it grants a badge + a guaranteed rare part.
export const CHAPTER_LEVELS = [1, 3, 5];

// id: [pilotName, [en, el] x3, [challengeStat, target]]
const D = {
  starter: ["Nick", ["Nick's first shift: a rusty glider and a map full of balconies.", "Η πρώτη βάρδια του Nick: ένα σκουριασμένο glider και ένας χάρτης γεμάτος μπαλκόνια."], ["He learns the city's wind by heart, one rooftop at a time.", "Μαθαίνει τον άνεμο της πόλης απ' έξω, ταράτσα την ταράτσα."], ["Rusty or not, the Starter has never missed a delivery since.", "Σκουριασμένο ή όχι, το Starter δεν έχει χάσει παράδοση από τότε."], ["deliveries", 6]],
  swift: ["Mira", ["Mira hates waiting. The Swift hates it even more.", "Η Mira μισεί την αναμονή. Το Swift ακόμα περισσότερο."], ["She cuts corners through gaps the dispatcher never mapped.", "Περνά από κενά που ο dispatcher δεν έχει χαρτογραφήσει."], ["Three packages, zero delay: the legend of the 4-minute city.", "Τρία δέματα, μηδέν καθυστέρηση: ο θρύλος της πόλης των 4 λεπτών."], ["meters", 1500]],
  heavy_lifter: ["Old Boris", ["Boris carried pianos before he carried parcels.", "Ο Μπόρις κουβαλούσε πιάνα πριν κουβαλήσει δέματα."], ["He says weight is just another kind of wind.", "Λέει ότι το βάρος είναι απλώς άλλο ένα είδος ανέμου."], ["Eight packages, one swing: the dock still talks about it.", "Οκτώ δέματα με μία κίνηση: το λιμάνι το θυμάται ακόμα."], ["deliveries", 10]],
  phantom: ["Cipher", ["Nobody has seen Cipher's face, only the glow of the Phantom.", "Κανείς δεν έχει δει το πρόσωπο του Cipher, μόνο τη λάμψη του Phantom."], ["Cipher leaves deliveries on balconies before the lights even flick on.", "Αφήνει παραδόσεις πριν προλάβουν να ανάψουν τα φώτα."], ["Rumor says the Phantom delivers to addresses that don't exist.", "Φήμες λένε ότι το Phantom παραδίδει σε διευθύνσεις που δεν υπάρχουν."], ["maxCombo", 5]],
  pulse_wave: ["Ray", ["Ray tunes his glider to the city's heartbeat.", "Ο Ray συντονίζει το glider του στον παλμό της πόλης."], ["Every pulse of the engine lands a delivery on the beat.", "Κάθε παλμός του κινητήρα προσγειώνει μια παράδοση στο ρυθμό."], ["The night skyline now flashes in time with his wings.", "Ο ορίζοντας τη νύχτα αναβοσβήνει πια στο ρυθμό των φτερών του."], ["meters", 2000]],
  hologram: ["Iris", ["Iris is never where the cameras say she is.", "Η Iris δεν είναι ποτέ εκεί που λένε οι κάμερες."], ["Her glider splits into a dozen copies; only one carries the cargo.", "Το glider της γίνεται δώδεκα αντίγραφα· μόνο ένα κουβαλά το φορτίο."], ["Even the police radar writes her down as 'weather'.", "Ακόμα και το ραντάρ της αστυνομίας τη γράφει ως 'καιρό'."], ["maxCombo", 6]],
  anti_grav_heavy: ["Dr. Lume", ["Dr. Lume quit the lab when the lab refused to fly.", "Ο Δρ. Lume έφυγε από το εργαστήριο όταν αυτό αρνήθηκε να πετάξει."], ["His anti-gravity core makes a ton feel like a feather.", "Ο πυρήνας αντι-βαρύτητας κάνει έναν τόνο να μοιάζει με πούπουλο."], ["Cargo floats beside him like a loyal flock.", "Το φορτίο αιωρείται δίπλα του σαν πιστό κοπάδι."], ["deliveries", 9]],
  solar_wing: ["Helia", ["Helia flies only when the sun is up, and always collects it.", "Η Helia πετά μόνο με ήλιο, και πάντα τον μαζεύει."], ["Her wings drink light and turn it into coins.", "Τα φτερά της πίνουν φως και το κάνουν νομίσματα."], ["At sunset the whole district turns to watch her pass.", "Στο ηλιοβασίλεμα η γειτονιά γυρίζει να τη δει να περνά."], ["parcels", 4]],
  storm_chaser: ["Gale", ["Gale follows storm fronts for fun and for tips.", "Ο Gale ακολουθεί μέτωπα καταιγίδας για πλάκα και για φιλοδωρήματα."], ["He reads lightning like a delivery schedule.", "Διαβάζει τους κεραυνούς σαν πρόγραμμα παραδόσεων."], ["The storm opened a path for him, and he never looked back.", "Η καταιγίδα του άνοιξε δρόμο και δεν κοίταξε πίσω."], ["meters", 2500]],
  iron_courier: ["Sgt. Hale", ["Sgt. Hale retired from the army, not from duty.", "Ο λοχίας Hale αποστρατεύτηκε, όχι από το καθήκον."], ["His armored hull has stopped more than one stray missile.", "Το θωρακισμένο κύτος έχει σταματήσει πάνω από ένα αδέσποτο βλήμα."], ["The city's guardians now ask him for escort duty.", "Οι φρουροί της πόλης τον ζητούν πια για συνοδεία."], ["bosses", 1]],
  nomad: ["Safi", ["Safi has no address; the whole city is her home.", "Η Safi δεν έχει διεύθυνση· όλη η πόλη είναι το σπίτι της."], ["She trades routes with other nomads for stories.", "Ανταλλάσσει διαδρομές με άλλους νομάδες για ιστορίες."], ["Every balcony has a name she remembers.", "Κάθε μπαλκόνι έχει ένα όνομα που θυμάται."], ["orders", 2]],
  riftwalker: ["Kade", ["Kade slipped through a crack in the sky and never closed it.", "Ο Kade γλίστρησε σε μια ρωγμή του ουρανού και δεν την έκλεισε ποτέ."], ["Walls are suggestions when the rift is open.", "Οι τοίχοι είναι απλές προτάσεις όταν η ρωγμή είναι ανοιχτή."], ["He delivers to yesterday's balconies as easily as today's.", "Παραδίδει σε χθεσινά μπαλκόνια εύκολα όσο και σε σημερινά."], ["meters", 1800]],
  storm_breaker: ["Thora", ["Thora cracked her first storm in a dock-yard bet.", "Η Thora έσπασε την πρώτη της καταιγίδα σε ένα στοίχημα στο λιμάνι."], ["Thunder obeys her now, mostly.", "Οι βροντές την υπακούν πια, κυρίως."], ["Dispatch calls her when the sky refuses to clear.", "Ο dispatch τη φωνάζει όταν ο ουρανός αρνείται να ανοίξει."], ["bosses", 2]],
  titan: ["Atlas", ["Atlas is slow to start and impossible to stop.", "Ο Atlas αργεί να ξεκινήσει και είναι αδύνατον να σταματήσει."], ["His titan frame carries eight loads like a sunrise.", "Το σκελετό του Titan κουβαλά οκτώ φορτία σαν ανατολή."], ["Folks say the city's skyline leans toward him when he flies.", "Λένε ότι ο ορίζοντας γέρνει προς το μέρος του όταν πετά."], ["deliveries", 14]],
  purrcel: ["Mochi", ["Mochi is a cat; the glider was a gift.", "Ο Mochi είναι γάτα· το glider ήταν δώρο."], ["He naps on the cargo and still arrives early.", "Κοιμάται πάνω στο φορτίο και φτάνει πάντα νωρίς."], ["Nine lives, nine delivery routes, zero complaints.", "Εννιά ζωές, εννιά διαδρομές, μηδέν παράπονα."], ["orders", 3]],
  aero_lance: ["Jett", ["Jett was a racing pilot before he went legit.", "Ο Jett ήταν πιλότος αγώνων πριν γίνει νόμιμος."], ["He threads the lance through gaps no one else dares to fly.", "Περνά το lance από κενά που κανείς δεν τολμά."], ["The city races held a minute of silence when he went pro.", "Οι αγώνες της πόλης έκαναν ενός λεπτού σιγή όταν έγινε επαγγελματίας."], ["meters", 2200]],
  gearhead: ["Rusty", ["Rusty can't leave a screw unturned.", "Ο Rusty δεν αφήνει βίδα ατσίγαριστη."], ["Every flight he swaps one gear 'just to see'.", "Σε κάθε πτήση αλλάζει ένα γρανάζι 'για να δει'."], ["The Gearhead is now more spare parts than glider, and it flies perfectly.", "Το Gearhead είναι πια περισσότερο ανταλλακτικά παρά glider, και πετά τέλεια."], ["deliveries", 10]],
  verdant: ["Flora", ["Flora grows tomatoes on her wings.", "Η Flora καλλιεργεί ντομάτες στα φτερά της."], ["Her glider breathes: the more it flies, the greener it gets.", "Το glider της αναπνέει: όσο πετά, τόσο πρασινίζει."], ["Whole rooftops now bloom along her route.", "Ολόκληρες ταράτσες ανθίζουν στη διαδρομή της."], ["parcels", 5]],
  glacier: ["Boreas", ["Boreas grew up where it never stops snowing.", "Ο Boreas μεγάλωσε εκεί που δεν σταματά να χιονίζει."], ["His cryo field freezes the sky for a second, long enough.", "Το cryo πεδίο του παγώνει τον ουρανό για ένα δευτερόλεπτο, αρκετό."], ["Summer deliveries arrive cold. Customers tip more.", "Οι καλοκαιρινές παραδόσεις φτάνουν παγωμένες. Οι πελάτες δίνουν περισσότερα."], ["orders", 3]],
  bastion: ["Captain Rook", ["Rook guards what others would drop.", "Ο Rook φυλάει ό,τι άλλοι θα άφηναν να πέσει."], ["Supply drops follow his route like breadcrumbs of safety.", "Τα supply drops ακολουθούν τη διαδρομή του σαν ψίχουλα ασφάλειας."], ["The bastion stands: no parcel has fallen on his watch.", "Το φρούριο στέκει: κανένα δέμα δεν έπεσε στη βάρδια του."], ["deliveries", 12]],
  specter: ["Wisp", ["Wisp prefers the shadows between billboards.", "Ο Wisp προτιμά τις σκιές ανάμεσα στις διαφημιστικές πινακίδες."], ["Low profile, high stakes: she flies where radar sleeps.", "Χαμηλό προφίλ, υψηλά διακυβεύματα: πετά όπου το ραντάρ κοιμάται."], ["Her name appears on no manifest, and no complaint either.", "Το όνομά της δεν υπάρχει σε κανένα manifest, ούτε σε κανένα παράπονο."], ["maxCombo", 5]],
  vault_runner: ["Kestrel", ["Kestrel carries what banks won't.", "Η Kestrel κουβαλά ό,τι οι τράπεζες δεν θέλουν."], ["Contracts pay extra when no one is asking questions.", "Τα συμβόλαια πληρώνουν περισσότερο όταν κανείς δεν ρωτά."], ["Her vault is locked, her route is hers alone.", "Το χρηματοκιβώτιό της είναι κλειδωμένο, η διαδρομή μόνο δική της."], ["orders", 4]],
  nebula: ["Lyra", ["Lyra swears she was born between two stars.", "Η Lyra ορκίζεται ότι γεννήθηκε ανάμεσα σε δύο αστέρια."], ["Her singularity pulls coins from across the sky.", "Η ιδιομορφία της τραβά νομίσματα από όλον τον ουρανό."], ["Even gravity bends to say hello.", "Ακόμα και η βαρύτητα λυγίζει να τη χαιρετήσει."], ["parcels", 5]],
  magma: ["Ember", ["Ember keeps her engine hot enough to melt asphalt.", "Η Ember κρατά τον κινητήρα αρκετά ζεστό για να λιώνει άσφαλτο."], ["Her trail glows long after she has gone.", "Το ίχνος της λάμπει πολύ μετά το πέρασμά της."], ["The volcano district named a street after her.", "Η γειτονιά του ηφαιστείου έδωσε το όνομά της σε έναν δρόμο."], ["meters", 2000]],
  runic: ["Ysolde", ["Ysolde carves runes into every wing before takeoff.", "Η Ysolde χαράζει ρούνους σε κάθε φτερό πριν την απογείωση."], ["Time hesitates around her glider.", "Ο χρόνος διστάζει γύρω από το glider της."], ["The last rune isn't written yet; she says it never will be.", "Ο τελευταίος ρούνος δεν έχει γραφτεί ακόμα· λέει ότι ποτέ δεν θα γραφτεί."], ["maxCombo", 6]],
  lifeline: ["Medic Aya", ["Aya flies where the sirens can't reach.", "Η Aya πετά εκεί που οι σειρήνες δεν φτάνουν."], ["Her beacon has saved more than one courier's shift.", "Το beacon της έχει σώσει τη βάρδια πάνω από ενός courier."], ["When Aya is in the air, the whole network breathes easier.", "Όταν η Aya είναι στον αέρα, όλο το δίκτυο αναπνέει πιο εύκολα."], ["deliveries", 8]],
};

export const PILOTS = Object.fromEntries(
  Object.entries(D).map(([id, v]) => [id, { name: v[0], chapters: [v[1], v[2], v[3]].map(([en, el]) => ({ en, el })), challenge: { stat: v[4][0], target: v[4][1] } }])
);

export const CHALLENGE_TEXT = {
  deliveries: { en: "Deliver {n} packages in one run", el: "Παράδωσε {n} δέματα σε ένα run" },
  meters: { en: "Fly {n} m in one run", el: "Πέτα {n} μ. σε ένα run" },
  maxCombo: { en: "Reach a x{n} combo", el: "Φτάσε combo x{n}" },
  bosses: { en: "Clear {n} boss encounter(s) in one run", el: "Ξεπέρασε {n} boss σε ένα run" },
  orders: { en: "Complete {n} customer orders in one run", el: "Ολοκλήρωσε {n} παραγγελίες πελατών σε ένα run" },
  parcels: { en: "Pick up {n} street parcels in one run", el: "Μάζεψε {n} δέματα του δρόμου σε ένα run" },
};

export function challengeStatValue(result, stat) {
  switch (stat) {
    case "deliveries": return result.deliveries || 0;
    case "meters": return Math.round(result.meters || 0);
    case "maxCombo": return result.maxCombo || 0;
    case "bosses": return (result.bossClearedIds || []).length;
    case "orders": return result.ordersCompleted || 0;
    case "parcels": return result.parcelsPickedUp || 0;
    default: return 0;
  }
}

// Deterministic unique skin colour per glider (vivid HSL -> hex).
export function pilotSkinColor(id) {
  // evenly spread hues over the 26 pilots (no two the same)
  const idx = Math.max(0, Object.keys(D).indexOf(id));
  const hue = Math.round((idx * 360) / Object.keys(D).length + 7) % 360;
  const s = 0.85, l = 0.58;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + hue / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Per-glider trail style (0-3) so every glider's trail looks a bit different,
// and a per-glider engine pitch for the thrust sound.
export function trailVariant(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 4;
}
export function enginePitch(gliderConfig) {
  // heavy gliders sound lower, light/agile ones higher
  const wf = gliderConfig.weightFactorMult || 1;
  const tr = gliderConfig.turnRate || 1;
  return Math.max(0.8, Math.min(1.3, 1 + (tr - 1) * 0.35 - (wf - 1) * 0.3));
}
