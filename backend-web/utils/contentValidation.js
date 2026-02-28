// ============ BLACK PEPPER KEYWORDS (ENGLISH) ============
const BLACK_PEPPER_KEYWORDS_EN = [
  "black pepper", "pepper", "piper nigrum", "pipersmart", "bunga",
  "disease", "diseased", "infection", "infected", "fungal", "bacterial", "viral",
  "leaf spot", "leaf spots", "root rot", "foot rot", "stem blight", "leaf blight",
  "pollu", "anthracnose", "canker", "phyllachora", "healthy", "unhealthy", "sick", "sickness",
  "cultivation", "cultivated", "cultivating", "farming", "farm", "farmer", "farmland",
  "planting", "planted", "plant", "plants", "crop", "crops", "agriculture", "agricultural",
  "growing", "growth", "propagation", "propagate", "vine", "vines", "trellising",
  "ripeness", "ripe", "unripe", "maturity", "mature", "grade", "grading", "quality",
  "color", "size", "flavor", "aroma", "potency",
  "pest", "pests", "insect", "insects", "bug", "bugs", "mite", "mites", "scale",
  "spider mite", "mealy bug", "pest management", "integrated pest", "ipm",
  "pesticide", "fungicide", "bactericide", "insecticide", "treatment", "treating",
  "prevention", "prevent", "preventing", "control", "controlling",
  "soil", "soils", "fertility", "fertile", "nutrient", "nutrients", "macronutrient",
  "micronutrient", "nitrogen", "phosphorus", "potassium", "calcium", "magnesium",
  "fertilizer", "fertilize", "fertilizing", "fertilization", "manure", "compost",
  "organic", "mulch", "mulching", "pH", "acidic", "alkaline", "drainage", "drain",
  "humus", "organic matter",
  "irrigation", "irrigate", "irrigating", "water", "watering", "rainfall", "rainfall patterns",
  "monsoon", "dry season", "wet season", "moisture", "humid", "humidity", "drought",
  "waterlogging", "flooded", "flood", "rain", "dry",
  "harvest", "harvesting", "harvested", "yield", "yields", "production", "productive",
  "productivity", "output", "return", "returns", "profit", "income", "revenue",
  "economic", "market", "marketing", "selling", "buyer", "export", "trading",
  "pruning", "prune", "pruned", "trimming", "trim", "trimmed", "maintenance",
  "care", "caring", "management", "managing", "upkeep", "training", "train",
  "variety", "cultivar", "varieties", "cultivars", "hybrid", "hybrid variety",
  "selection", "breeding", "genetics", "genetic", "traits", "resistance", "resistant",
  "disease resistant", "high yielding", "elite", "improved variety",
  "climate", "weather", "temperature", "humidity", "rainfall", "wind", "sunlight",
  "shade", "shaded", "sun exposure", "tropical", "subtropical", "season", "seasons",
  "monsoon", "rainfall pattern", "weather condition", "climate condition", "atmospheric",
  "farm", "farming", "plantation", "field", "garden", "region", "area", "location",
  "tropical region", "highlands", "lowlands", "slope", "terrain",
  "tool", "tools", "equipment", "machinery", "machine", "implement", "implements",
  "harvester", "grinder", "processor", "dryer", "shade", "trellis", "stake", "pole",
  "study", "research", "trial", "experiment", "testing", "test", "practice",
  "technique", "method", "approach", "tip", "tips", "advice", "recommendation",
  "guide", "tutorial", "training", "education", "learn", "learning",
  "success", "successful", "best practice", "best practices", "effective", "efficient",
  "improvement", "improved", "innovation", "solution", "problem solving",
  "achievement", "accomplishment", "yield increase", "increase production",
  "health benefit", "nutritional", "nutrition", "antioxidant", "anti-inflammatory",
  "medicinal", "culinary", "spice", "seasoning", "condiment",
  "farming business", "pepper farming", "agribusiness", "cooperate", "cooperative",
  "farmer group", "farming community", "sustainable", "sustainability",
  "investment", "cost", "expense", "savings", "profit margin",
  "morphology", "phenotype", "genotype", "photosynthesis", "transpiration",
  "root system", "stem", "leaf", "flowering", "fruiting", "berry", "berries",
  "piperine", "volatile oil", "oleoresin"
];

// ============ BLACK PEPPER KEYWORDS (TAGALOG) ============
const BLACK_PEPPER_KEYWORDS_TL = [
  // Main topics
  'pamimili', 'pimiento', 'pilipili', 'hapon', 'bunga ng pamimili',
  
  // Diseases & Health
  'sakit', 'sakit na halaman', 'may sakit', 'infeksyon', 'fungi', 'fungal',
  'bakteri', 'viral', 'makatarungan', 'asahan', 'nagkakasakit', 'malusog', 'hindi malusog',
  'sakit ng bulaklak', 'sakit ng ugat', 'leaf spot', 'blemish', 'blemishes',
  'anthracnose', 'canker', 'pollu', 'pagkasira', 'siraan',
  
  // Cultivation & Farming
  'pagtanim', 'pagtatanim', 'pagtanim ng pamimili', 'magsanim', 'magtanim',
  'pagsasaad', 'ani', 'magsani', 'anihin', 'ani ng buwakas', 'agrikultura',
  'halaman', 'halimbawa na halaman', 'puno', 'halaman ng puno', 'luntian',
  'hacienda', 'sakahan', 'sakahan ng pamimili', 'bukid', 'larangan',
  'paglaki', 'lumaki', 'pagtubo', 'tumubig', 'pagpapalakas',
  
  // Ripeness & Quality
  'hinihinog', 'hininog', 'matandang prutas', 'hindi pa matanda', 'kalidad',
  'mahusay na kalidad', 'mataas na kalidad', 'magandang kulay', 'tamang sukat',
  'timpla', 'amoy', 'tamis', 'asim',
  
  // Pests & Prevention
  'alalahanin', 'insekto', 'bubuyog', 'ahas', 'ibon', 'hayop na makakasama',
  'pagkain ng halaman', 'pagkakaaliw ng halaman', 'panlaban sa halaman',
  'pestisida', 'bulong', 'gamot', 'lunas', 'pangangalaga', 'pangproteksyon',
  'proteksyon', 'pagprotekta', 'pagiwas sa sakit', 'pagiwas sa peste',
  'natural na paraan', 'organic na pamamaraan', 'composting',
  
  // Soil & Nutrition
  'lupa', 'lupang mabunga', 'lupang ganda', 'substra', 'basura ng halaman',
  'basura ng pamimili', 'organiko', 'organic matter', 'potasa', 'nitrogen',
  'fossil', 'calcium', 'magnesium', 'bitamina', 'vitamins', 'minerals',
  'pataba', 'magpataba', 'pagpapayaman ng lupa', 'compost', 'composting',
  'manyano', 'mulch', 'abo', 'damihan ang halaman', 'dampuagan', 'buhay sa lupa',
  
  // Water Management
  'tubig', 'pagtubig', 'irigasyon', 'pag-irigasyon', 'ulan', 'ulan pa lang',
  'amihan', 'habagat', 'tag-ulan', 'tag-araw', 'tuyot', 'basa', 'lason ng halaman',
  'kahalumigmigan', 'katigasan', 'pagkabasag', 'pagkatunog', 'baha',
  
  // Harvesting & Yield
  'ani', 'magsani', 'anihin', 'pag-ani', 'bunga', 'prutas', 'tangdaan',
  'ani ng puso', 'ani ng bahay', 'ani ng taon', 'ani per ektarya',
  'produkto', 'produktibong', 'produksyon', 'gawin ng maraming halaman',
  'kita', 'kikita', 'kumita', 'pera', 'halaga', 'presyo', 'benta',
  'negosyo', 'negosyador', 'merkado', 'pamimili', 'pagbebenta',
  
  // Pruning & Maintenance
  'gupit', 'gupitin', 'pag-ukit', 'pag-aalaga', 'alagaan', 'pag-iingat',
  'pag-ayos', 'ayusin', 'disenyo', 'design', 'trapolina', 'staking',
  'pagsusunod', 'pag-unawa', 'pag-aaral', 'pag-aralan', 'espesyalista',
  
  // Variety & Genetics
  'uri', 'klase', 'ibat ibang uri', 'ibat ibang klase', 'tipak',
  'pamimili na mataas ang ani', 'pamimili na matibay', 'pamimili na makabago',
  'pinili', 'serbisyo ng serbisyo', 'hybrid', 'hibrido', 'disenyo',
  'buhay', 'asal', 'katangian', 'katangian ng halaman', 'tiyaga',
  
  // Climate & Weather
  'panahon', 'klima', 'mainit', 'lamig', 'ulan', 'araw', 'gabi',
  'tag-init', 'tag-lamig', 'tag-ulan', 'tag-araw', 'monsoon', 'tropical',
  'seasonal', 'tag-araw', 'tag-ulan', 'payap', 'malakas na hangin', 'bahaghari',
  
  // Regions & Geography
  'lugar', 'probinsya', 'rehiyon', 'lungsod', 'baryo', 'sakahan', 'lupain',
  'mataas na lugar', 'mababang lugar', 'bundok', 'ilog', 'lakeshore',
  
  // Tools & Equipment
  'kasangkapan', 'kagamitan', 'tool', 'cutter', 'pruner', 'sprayer', 'pump',
  'makina', 'tractor', 'harrow', 'plough', 'iba pang kagamitan',
  
  // Research & Learning
  'pag-aaral', 'pag-aralan', 'pag-eksperimento', 'eksperimento', 'trial',
  'pagsubok', 'subukan', 'pamamaraan', 'paraan', 'lihim ng tagumpay',
  'aral', 'pagsasanay', 'pagsasanay', 'edukasyon', 'edukado',
  'tulong', 'gabay', 'gumagabay', 'konsultante', 'eksperto',
  
  // Success & Best Practices
  'tagumpay', 'matagumpay', 'magaling', 'mahusay', 'napakaganda',
  'pagsisikap', 'pag-uusap', 'nag-uusap', 'nakikinig', 'koponan',
  'sama-sama', 'pandaigdig', 'pandaigdigang kalidad', 'international',
  
  // Business & Economics
  'negosyo', 'negosyante', 'magbebenta', 'bumibili', 'mamimili',
  'kooperatiba', 'samahan', 'pagkakaisa', 'united farmers', 'grupo ng magsasaka',
  'pangmatagalan', 'investment', 'presyo', 'halaga', 'tubo', 'kita',
  'gastos', 'bayad', 'bayaran', 'utang', 'pautang',
  
  // Sustainability
  'mapanatili', 'manatili', 'pangmatagalan na solusyon', 'organic farming',
  'sustainable farming', 'sustainable agriculture', 'kalikasan',
  'kapaligiran', 'protekta ang kapaligiran', 'green', 'berde',
  
  // Nutrition & Health
  'kalusugan', 'kamalayang pangkalusugan', 'pangkalusugan', 'nutritious',
  'pampalakas', 'antioksidante', 'lasa', 'timpla ng pagkain', 'sahog'
];

// ============ BAD WORDS (ENGLISH) ============
const BAD_WORDS_EN = [
  // Curse words
  'damn', 'hell', 'shit', 'fuck', 'fucking', 'fucker', 'crap', 'crappy',
  'piss', 'pissed', 'cock', 'asshole', 'bastard', 'bitch', 'bitching',
  'motherfucker', 'mother fucker', 'shithead', 'dickhead', 'asshat',
  'dumbass', 'dumb ass', 'jackass', 'jack ass', 'smartass', 'smart ass',
  'dipshit', 'dipstick', 'horseshit', 'bullshit', 'bugger', 'bugger off',
  'blasted', 'bloody', 'prick', 'twat', 'wanker', 'git', 'arsehole',
  'arse', 'knobhead', 'pillock', 'bellend', 'tosser', 'numpty',
  
  // Sexual harassment/abuse
  'pussy', 'dick', 'tits', 'boobs', 'breasts', 'ass', 'arse', 'butt',
  'slut', 'whore', 'prostitute', 'cum', 'jizz', 'sperm', 'semen',
  'horny', 'slurp', 'suck', 'blow job', 'blowjob', 'handjob', 'hand job',
  'sex', 'sexy', 'rape', 'raped', 'rapist', 'molest', 'molestation',
  'assault', 'sexually assault', 'sexual assault', 'grope', 'groping',
  'harassment', 'harass', 'harassing', 'catcall', 'objectify', 'objectification',
  'pervert', 'perverted', 'pedophile', 'pedophilia', 'incest',
  'threesome', 'orgy', 'anal', 'sodomy', 'lesbian', 'lesbians',
  'gay', 'homo', 'queer', 'fag', 'faggot', 'dyke',
  'transgender', 'tranny', 'trap', 'sissy', 'cross-dressing',
  'nude', 'naked', 'porn', 'pornography', 'xxx', 'adult content',
  
  // Assault/Aggression
  'kill', 'killing', 'murdered', 'murder', 'suicide', 'suicidal',
  'bomb', 'bombing', 'explosion', 'terrorist', 'terrorism', 'shoot',
  'stab', 'stabbing', 'punch', 'hit', 'beating', 'beat', 'assault',
  'fight', 'fighting', 'violence', 'violent', 'brutal', 'brutality',
  'torture', 'torturing', 'pain', 'suffer', 'suffering', 'injury',
  'hurt', 'hurting', 'abuse', 'abusive', 'domestic violence',
  'gang', 'gang rape', 'mugging', 'robbery', 'thief', 'steal',
  
  // Insults & Derogatory
  'stupid', 'idiot', 'moron', 'imbecile', 'retard', 'retarded',
  'dumb', 'dumber', 'dumbest', 'slow', 'mentally disabled', 'disabled',
  'loser', 'failure', 'pathetic', 'worthless', 'useless', 'trash',
  'garbage', 'scum', 'piece of shit', 'filth', 'filthy', 'disgusting',
  'ugly', 'repulsive', 'gross', 'grotesque', 'abomination',
  'lazy', 'bum', 'hobo', 'vagrant', 'beggar', 'peasant', 'savage',
  'barbarian', 'uncivilized', 'primitive', 'backwards', 'inferior',
  
  // Racial/Ethnic Slurs (select offensive terms)
  'nigger', 'nigga', 'nig', 'negro', 'colored', 'n-word',
  'chink', 'ching chong', 'chinaman', 'geisha', 'anime', 'oriental',
  'spic', 'beaner', 'mexican', 'wetback', 'taco', 'burrito',
  'raghead', 'towelhead', 'sand nigger', 'arab', 'terrorist',
  'curry', 'paki', 'dot', 'brownies', 'indian', 'injun',
  'kike', 'sheeny', 'gold digger', 'miserly', 'jewish', 'jew down',
  'wop', 'guinea', 'mafia', 'italian', 'greaseball',
  'polack', 'pole', 'vodka', 'communist', 'russian',
  'poor white trash', 'hillbilly', 'redneck', 'cracker', 'honkey',
  
  // Religious Slurs
  'god damn', 'goddamn', 'jesus christ', 'christ', 'holy shit',
  'jesus fucking christ', 'for god sake', 'blasphemy', 'blasphemous',
  'heretic', 'infidel', 'atheist', 'satanic', 'devil worship',
  'gospel', 'cross', 'crucifix', 'priest', 'monk', 'nun',
  'religion', 'faith', 'prayer', 'prayer shaming',
  'pope', 'vatican', 'church scandal', 'abuse', 'pedophile priest',
  
  // Disability Slurs
  'retard', 'retarded', 'cripple', 'crippled', 'gimpy', 'blind',
  'deaf', 'deaf and dumb', 'dumb', 'mute', 'wheelchair', 'handicapped',
  'crazy', 'psycho', 'insane', 'mental', 'loco', 'bonkers',
  'schizo', 'bipolar', 'autism', 'autistic', 'asperger',
  
  // Weight/Appearance Slurs
  'fat', 'fatty', 'obese', 'pig', 'cow', 'whale', 'chubby', 'chunky',
  'skinny', 'skeleton', 'anorexic', 'rail thin', 'bony',
  'pimply', 'acne', 'ugly', 'hideous', 'repulsive', 'grotesque',
  
  // Cyberbullying/Harassment
  'kys', 'kill yourself', 'kms', 'ctb', 'jump', 'hang yourself',
  'loser', 'noob', 'newbie', 'troll', 'troll on', 'hater', 'hating',
  'flamebait', 'flame war', 'doxx', 'doxing', 'swatting',
  'cancel', 'cancelled', 'call out', 'shame', 'shaming',
  'cringe', 'cringey', 'cringe worthy', 'simp', 'simpering',
  'incel', 'neckbeard', 'weeb', 'otaku', 'degenerate'
];

// ============ BAD WORDS (TAGALOG) ============
const BAD_WORDS_TL = [
  // Curse words
  'putangina', 'puta', 'putang', 'pukingina', 'pisti', 'tae', 'taeh',
  'gago', 'gagong', 'kupal', 'kupalnyo', 'putol', 'bitin', 'buwisit',
  'yawa', 'yawain', 'baduy', 'bastos', 'bastusin', 'bastusan',
  'buwitre', 'bukangbiryan', 'bukaw', 'tayangan', 'tayang', 'pigil',
  'bwis', 'buwis', 'buwisit', 'bubwit', 'kilos', 'bukaw', 'buwan',
  'umay', 'umaymay', 'bukambuaka', 'puwak', 'pawak', 'pukal',
  'putok', 'putukan', 'tutoy', 'tutuan', 'tuyot', 'tuyo', 'tungal',
  'tangal', 'tanggal', 'tandal', 'ina mo', 'inamo', 'ama mo', 'amamo',
  'tatay mo', 'tataymo', 'nanay mo', 'nanaymo', 'magulang',
  
  // Sexual harassment/abuse
  'suso', 'suswag', 'landi', 'landian', 'kantot', 'kantutan', 'kantots',
  'puke', 'pukilan', 'bayag', 'bayagan', 'pekpek', 'pekpekhin',
  'butas', 'butasin', 'tulad', 'tulasin', 'tayo', 'tayuan', 'titi',
  'titihan', 'sipag', 'sipagan', 'sipa', 'sipain', 'tamod',
  'kama', 'kamasin', 'kaligtasan', 'kultura', 'kaluluwa',
  'diwang', 'diwa', 'diwata', 'diyos', 'espiritu', 'espada',
  'bangkay', 'bangkain', 'basta', 'bastos', 'bastusin',
  'abuso', 'abusuhin', 'taiwas', 'taiwasan', 'saktan', 'sakit',
  'ginagamit', 'ginagamitan', 'gamitin', 'gamit', 'gamitain',
  'silong', 'silungan', 'tangkad', 'tangkain', 'higpit',
  'harass', 'harassment', 'harasing', 'bullying', 'bully',
  'palayain', 'palataran', 'pakiramdaman', 'pakiramdam', 'kaiwanan',
  
  // Assault/Aggression
  'pugot', 'pugutan', 'puksa', 'puksahan', 'sampal', 'sampalan',
  'suntok', 'suntukin', 'buhangos', 'buhangos', 'buntis', 'buntisin',
  'tutwa', 'tutwain', 'labas ng binti', 'labas', 'labasan',
  'takot', 'takutan', 'takuan', 'takutin', 'linlang', 'linlangin',
  'sapantaha', 'sapantahin', 'sigwa', 'sigwain', 'sigwahan',
  'laban', 'labanan', 'labas', 'labasan', 'lumaban', 'lumabas',
  'pakikipag-away', 'pakikipag-laban', 'pakikipagtagpo', 'tagpo',
  'patay', 'patayin', 'pumalag', 'pulagan', 'pula', 'pulahan',
  'bulate', 'bulatein', 'bulacan', 'bulak', 'bulate', 'bulakakin',
  'saksak', 'saksakin', 'pagtatalon', 'pagtarima', 'tikman',
  'tibak', 'tibakan', 'tibasin', 'tibang', 'tibang', 'tibasan',
  'tiklo', 'tikling', 'tibling', 'tibok', 'tibukan', 'tibukan',
  
  // Insults & Derogatory
  'tanga', 'tangakan', 'tangang', 'bobo', 'bobong', 'bobuhan',
  'mangmang', 'mangmangan', 'walang alam', 'walang utak', 'utak ulat',
  'tulo', 'tuluhan', 'tuluing', 'tutol', 'tutolan', 'tumutulong',
  'loser', 'basura', 'basurang', 'basurahan', 'basurilla',
  'salot', 'salutan', 'saluting', 'sukatan', 'sukat', 'sukatin',
  'tutoy', 'tutuing', 'tutuing', 'tuluyan', 'tuluy', 'tulungan',
  'marcopacho', 'makikita', 'makikipag', 'makilahok', 'makiisa',
  'makulit', 'makulitan', 'makukulit', 'mahabang', 'mahaba', 'mahalin',
  'maliit', 'maliliit', 'maliitan', 'malinaw', 'malinaw', 'malinawan',
  'marami', 'maraming', 'maraming', 'marami', 'maraming', 'maraming',
  'mapagkakatiwalaan', 'mapagkakatiwalaan', 'mapag', 'mapagkukunan',
  'hayop', 'hayupin', 'hayupang', 'alaskan', 'alaskahin', 'alaskahan',
  'balbon', 'balbuhan', 'balbong', 'balbutin', 'balbunin',
  'babae', 'babaeng', 'babae', 'lalaki', 'lalaking', 'lalaki',
  'walang kwenta', 'walang kabuluhan', 'walang halaga', 'walang dangal',
  
  // Mockery & Bullying
  'tawa', 'tawahan', 'tawa', 'tawad', 'tawaran', 'tawag',
  'tsismis', 'tsismisan', 'tsismisin', 'tsismoso', 'tsismos', 'tsismoso',
  'sabi-sabi', 'sabi', 'sabi-sabi', 'sabi-sabing', 'sabihan',
  'bugaw', 'bugawan', 'bugawaan', 'bugo', 'bugong', 'bugong',
  'kalat', 'kalatan', 'kalating', 'kalate', 'kalating', 'kalate',
  'sirira', 'siriin', 'sira', 'sirain', 'sirahin', 'sirang',
  'uragang', 'uragan', 'urag', 'uragin', 'uraging', 'urag',
  
  // Disability/Health Slurs
  'bulag', 'buglag', 'bulag', 'bulagin', 'bulagang', 'bulagan',
  'pipi', 'piping', 'pipi', 'pipiin', 'pipiing', 'pipian',
  'tipak', 'tipak', 'tipakan', 'tipaking', 'tipak', 'tipakan',
  'sira ang ulo', 'sira utak', 'gagu', 'gagung', 'gagu', 'gaguhin',
  'loko', 'lokong', 'loko', 'lokohin', 'lokohing', 'lokohan',
  'baliw', 'baliwan', 'baliwan', 'baliwing', 'baliw', 'baliwan',
  'singot', 'singutan', 'singot', 'singutan', 'singoting', 'singutan',
  'tabig', 'tabigan', 'tabig', 'tabigan', 'tabiging', 'tabigan',
  
  // Weight/Appearance Slurs
  'mataba', 'matabang', 'mataba', 'matabahin', 'matabahing', 'taba',
  'payat', 'payatang', 'payat', 'payatin', 'payating', 'payat',
  'panget', 'panggit', 'pangit', 'panggit', 'panggiting', 'pangit',
  'itim', 'itimang', 'itim', 'itimiin', 'itiiming', 'itiim',
  'maputla', 'mapulaang', 'maputla', 'mapulahin', 'mapulahing', 'maputla',
  
  // Cyberbullying
  'alibugha', 'alibughan', 'alibugha', 'alibughan', 'alibughahing',
  'hadlang', 'hadlangan', 'hadlangan', 'hadlanging', 'hadlangan',
  'saknya', 'saknyaan', 'saknyan', 'saknyaan', 'saksak', 'saksakan',
  'pag-atake', 'pag-atake', 'pag-atake', 'pang-atake', 'pag-atakehin'
];

// ============ VALIDATION FUNCTIONS ============

/**
 * Check if content is related to black pepper
 * @param {string} content - Text to check
 * @returns {boolean}
 */
exports.isRelatedToBlackPepper = (content) => {
  const lowerContent = content.toLowerCase();
  
  // Check English keywords
  const hasEnglishKeyword = BLACK_PEPPER_KEYWORDS_EN.some(keyword =>
    lowerContent.includes(keyword.toLowerCase())
  );
  
  // Check Tagalog keywords
  const hasTagalogenKeyword = BLACK_PEPPER_KEYWORDS_TL.some(keyword =>
    lowerContent.includes(keyword.toLowerCase())
  );
  
  return hasEnglishKeyword || hasTagalogenKeyword;
};

/**
 * Check if content contains bad words
 * @param {string} content - Text to check
 * @returns {Array} Array of detected bad words (empty if none found)
 */
exports.containsBadWords = (content) => {
  const lowerContent = content.toLowerCase();
  const detectedBadWords = [];
  
  // Check English bad words
  BAD_WORDS_EN.forEach(word => {
    if (lowerContent.includes(word.toLowerCase())) {
      detectedBadWords.push(word);
    }
  });
  
  // Check Tagalog bad words
  BAD_WORDS_TL.forEach(word => {
    if (lowerContent.includes(word.toLowerCase())) {
      detectedBadWords.push(word);
    }
  });
  
  return [...new Set(detectedBadWords)]; // Remove duplicates
};

/**
 * Get validation result with message
 * @param {string} content - Text to validate
 * @returns {Object} { isValid, hasBadWords, hasBlackPepperKeywords, message }
 */
exports.validateContent = (content) => {
  const badWords = exports.containsBadWords(content);
  const hasKeywords = exports.isRelatedToBlackPepper(content);
  
  if (badWords.length > 0) {
    return {
      isValid: false,
      hasBadWords: true,
      hasBlackPepperKeywords: hasKeywords,
      badWordsFound: badWords,
      message: `⚠️ Your post contains inappropriate language. Please remove: ${badWords.join(', ')}. This is a safe community - please keep discussions respectful.`,
      severity: 'BLOCK'
    };
  }
  
  if (!hasKeywords) {
    return {
      isValid: false,
      hasBadWords: false,
      hasBlackPepperKeywords: false,
      message: `⚠️ Your post doesn't seem related to black pepper farming or cultivation. Please include topics like: diseases, farming practices, ripeness indicators, pests, soil management, harvesting, or regional tips.`,
      severity: 'WARNING'
    };
  }
  
  return {
    isValid: true,
    hasBadWords: false,
    hasBlackPepperKeywords: true,
    message: '✅ Content looks good!',
    severity: 'OK'
  };
};

module.exports = {
  BLACK_PEPPER_KEYWORDS_EN,
  BLACK_PEPPER_KEYWORDS_TL,
  BAD_WORDS_EN,
  BAD_WORDS_TL,
  isRelatedToBlackPepper: exports.isRelatedToBlackPepper,
  containsBadWords: exports.containsBadWords,
  validateContent: exports.validateContent
};
