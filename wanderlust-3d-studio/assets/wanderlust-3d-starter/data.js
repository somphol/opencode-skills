/* ==========================================================================
   Wanderlust 3D — content dataset
   --------------------------------------------------------------------------
   Every destination is a plain object so the catalogue can be edited without
   touching layout or behaviour. Images are Unsplash CDN assets; the renderer
   appends sizing/format parameters, so keep `image` as the bare CDN URL.

   Image licence: Unsplash License (free to use, no attribution required).
   See CREDITS.md for the full source list.
   ========================================================================== */

(function () {
  'use strict';

  const img = (id) => `https://images.unsplash.com/photo-${id}`;

  const DATA = {
    meta: {
      name: 'Wanderlust 3D',
      version: '1.0.0',
      updated: '2026-11-06',
      currency: 'USD',
      disclaimer:
        'Budgets, seasons and opening details are indicative planning notes, not live bookings. Confirm with official sources before you travel.'
    },

    regions: [
      {
        id: 'japan',
        name: 'Japan',
        localName: '日本',
        tagline: 'Ancient ritual, neon future',
        tabNote: 'Culture · Food · Nature',
        short:
          'Temple gardens, mountain onsen and the world’s most delicious late-night alleys.',
        description:
          'An archipelago where a 1,200-year-old garden and a ten-storey neon arcade can share the same afternoon. Japan rewards slow travel: one neighbourhood at a time, one bowl at a time.',
        image: img('1493976040374-85c8e12f0c0e'),
        imageAlt: 'A lantern-lit street leading to a pagoda in Kyoto at dusk',
        accent: '#c34f5c',
        accentSoft: '#f8e4e3',
        ink: '#3c1720',
        bestTime: 'Mar–May · Oct–Nov',
        dailyBudget: 161,
        language: 'Japanese',
        currency: 'JPY',
        stats: [
          { label: 'Best window', value: 'Mar–May' },
          { label: 'Shoulder season', value: 'Oct–Nov' },
          { label: 'Avg. daily', value: '$161' }
        ]
      },
      {
        id: 'italy',
        name: 'Italy',
        localName: 'Italia',
        tagline: 'Art, coastlines and la dolce vita',
        tabNote: 'Art · Coast · Cuisine',
        short:
          'Imperial stone, Renaissance light and cliffside lemon groves — best measured in long lunches.',
        description:
          'From imperial stone to cliffside lemon groves, Italy is a country best measured in long lunches and longer views. Every region keeps its own dialect, kitchen and sense of time.',
        image: img('1499678329028-101435549a4e'),
        imageAlt: 'Positano’s pastel houses stacked above the Tyrrhenian Sea at sunset',
        accent: '#b8653f',
        accentSoft: '#f7e8dc',
        ink: '#3b2116',
        bestTime: 'Apr–May · Sep–Oct',
        dailyBudget: 199,
        language: 'Italian',
        currency: 'EUR',
        stats: [
          { label: 'Best window', value: 'Apr–May' },
          { label: 'Shoulder season', value: 'Sep–Oct' },
          { label: 'Avg. daily', value: '$199' }
        ]
      },
      {
        id: 'costa-rica',
        name: 'Costa Rica',
        localName: 'Costa Rica',
        tagline: 'Pura vida, between two oceans',
        tabNote: 'Wildlife · Surf · Forest',
        short:
          'Cloud forest mornings, Pacific surf and a national motto that doubles as a travel philosophy.',
        description:
          'Two oceans, a spine of volcanoes and cloud forests, and a national motto that doubles as a travel philosophy: pura vida. This is small-country travel with outsized biodiversity.',
        image: img('1441974231531-c6227db76b6e'),
        imageAlt: 'Sunlight filtering through the canopy of a Costa Rican cloud forest',
        accent: '#1f8a63',
        accentSoft: '#def1e8',
        ink: '#0d2f24',
        bestTime: 'Dec–Apr · Jul–Aug',
        dailyBudget: 131,
        language: 'Spanish',
        currency: 'CRC',
        stats: [
          { label: 'Dry season', value: 'Dec–Apr' },
          { label: 'Green season', value: 'May–Nov' },
          { label: 'Avg. daily', value: '$131' }
        ]
      }
    ],

    destinations: [
      /* ------------------------------- JAPAN ------------------------------- */
      {
        id: 'kyoto',
        regionId: 'japan',
        name: 'Kyoto',
        country: 'Japan',
        tagline: 'The ancient cultural heart',
        image: img('1493976040374-85c8e12f0c0e'),
        imageAlt: 'Yasaka Pagoda rising above the wooden machiya houses of Higashiyama, Kyoto',
        gallery: [
          {
            image: img('1493976040374-85c8e12f0c0e'),
            alt: 'Yasaka Pagoda and lantern-lit lanes in Kyoto'
          },
          {
            image: img('1480796927426-f609979314bd'),
            alt: 'A traditional Kyoto storefront with noren curtains and bicycles'
          },
          {
            image: img('1490806843957-31f4c9a91c65'),
            alt: 'Mount Fuji framed by cherry blossoms'
          }
        ],
        bestTime: 'Late March–May · October–November',
        bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
        dailyBudget: 160,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Japanese',
        currency: 'JPY',
        vibes: ['Culture', 'History', 'Foodie', 'Wellness'],
        lat: 35.0116,
        lng: 135.7681,
        overview:
          'Kyoto was Japan’s imperial capital for more than a thousand years, and it still moves at a courtly pace. Mornings belong to temple gardens and silent stone lanes; evenings to tiny counters serving seasonal kaiseki. The city is compact enough to cross by bicycle, but layered enough that a week only scratches the surface.',
        attractions: [
          {
            name: 'Fushimi Inari Taisha',
            type: 'Shrine · 2–3 hrs',
            description:
              'Thousands of vermilion torii climb Mount Inari behind the main shrine. Start before 7am to walk the lower gates in near silence.'
          },
          {
            name: 'Kiyomizu-dera',
            type: 'Temple · 1–2 hrs',
            description:
              'A UNESCO temple founded in 778, famous for its wooden stage above a maple-filled valley. Combine it with a wander through Higashiyama.'
          },
          {
            name: 'Arashiyama Bamboo Grove',
            type: 'Landscape · 1 hr',
            description:
              'The path through the bamboo is short but unforgettable at first light. Pair it with Tenryu-ji’s Zen garden and the Togetsukyo bridge.'
          }
        ],
        cuisine: [
          { name: 'Kaiseki', note: 'A multi-course seasonal tasting menu — Kyoto’s defining culinary art.' },
          { name: 'Yudofu', note: 'Silken tofu simmered in kombu broth, especially good near Nanzen-ji.' },
          { name: 'Nishin soba', note: 'Cold soba topped with sweet-simmered herring; a Kyoto classic.' },
          { name: 'Matcha', note: 'Whisked in Uji, south of the city, where Japan’s finest tea is grown.' }
        ],
        culture:
          'Kyoto runs on quiet courtesy. Do not photograph geiko or maiko without permission, remove shoes where indicated, and avoid eating while walking through temple districts. Many shrines close at 5pm, so plan outdoor walks for the evening.',
        seasonNote:
          'Spring brings cherry blossom and crowds; autumn brings maple colour and even bigger crowds. December–February is cold but dramatically quieter, and January temple sales are a local spectacle.',
        itineraryTip:
          'Split the city east and west: Higashiyama and Gion one day, Arashiyama and the northwest temples the next. Book one splurge kaiseki dinner and keep the rest casual.',
        audiences: ['Culture seekers', 'Couples', 'Slow travellers'],
        budgetBreakdown: { stay: 85, food: 45, transport: 15, activities: 15 }
      },
      {
        id: 'tokyo',
        regionId: 'japan',
        name: 'Tokyo',
        country: 'Japan',
        tagline: 'Neon tomorrow, Edo yesterday',
        image: img('1540959733332-eab4deabeeaf'),
        imageAlt: 'The illuminated crossing at Shibuya, Tokyo, seen from above',
        gallery: [
          {
            image: img('1540959733332-eab4deabeeaf'),
            alt: 'Crowds crossing the neon-lit scramble at Shibuya'
          },
          {
            image: img('1503899036084-c55cdd92da26'),
            alt: 'A narrow Tokyo street glowing with signs at night'
          },
          {
            image: img('1553621042-f6e147245754'),
            alt: 'A wooden tray of freshly made sushi'
          }
        ],
        bestTime: 'March–May · October–November',
        bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
        dailyBudget: 190,
        idealNights: 4,
        budgetLevel: 'mid',
        language: 'Japanese',
        currency: 'JPY',
        vibes: ['City', 'Foodie', 'Culture', 'Nightlife'],
        lat: 35.6762,
        lng: 139.6503,
        overview:
          'Tokyo is not one city but dozens stitched together by trains. Each neighbourhood has a distinct personality: Asakusa’s temple lanes, Shibuya’s controlled chaos, Shimokitazawa’s vintage shops, Kiyosumi’s coffee roasters. The pleasure is in choosing a few and letting the rest blur past the window.',
        attractions: [
          {
            name: 'Senso-ji',
            type: 'Temple · 1–2 hrs',
            description:
              'Tokyo’s oldest temple, approached through the Nakamise shopping street. Arrive at opening time to see the lanterns without the tour groups.'
          },
          {
            name: 'Shibuya Crossing & Sky',
            type: 'City view · 1–2 hrs',
            description:
              'Watch the scramble from street level, then go up to Shibuya Sky for a rooftop view that makes the scale legible.'
          },
          {
            name: 'Meiji Jingu',
            type: 'Shrine · 1–2 hrs',
            description:
              'A forest shrine dedicated to Emperor Meiji, minutes from Harajuku. The gravel paths and towering torii feel miles from the city.'
          }
        ],
        cuisine: [
          { name: 'Edomae sushi', note: 'Counter-style sushi with warm rice and a brush of nikiri soy.' },
          { name: 'Ramen', note: 'Try a shoyu bowl in old Tokyo or a rich tonkotsu shop in Shinjuku.' },
          { name: 'Monjayaki', note: 'The runny, savoury griddle pancake of Tsukishima.' },
          { name: 'Melonpan', note: 'Crisp sugar-crusted bread, best warm from a bakery.' }
        ],
        culture:
          'Trains are quiet; phone calls belong on the platform. Queues are sacred, tipping is not expected, and cash still works better than you think. The city is safe, but keep a Suica card and a small coin purse handy.',
        seasonNote:
          'Cherry blossom season is beautiful and expensive. October–November is crisp and clear. Summer is humid and typhoon-prone; winter is dry, bright and underrated.',
        itineraryTip:
          'Base yourself near a JR Yamanote line station. Group each day by neighbourhood rather than by sight, and leave one evening free for a tiny six-seat bar you found on foot.',
        audiences: ['Food lovers', 'City explorers', 'First-time Japan'],
        budgetBreakdown: { stay: 100, food: 50, transport: 20, activities: 20 }
      },
      {
        id: 'hakone',
        regionId: 'japan',
        name: 'Hakone',
        country: 'Japan',
        tagline: 'Onsen, Fuji views and slow trains',
        image: img('1490806843957-31f4c9a91c65'),
        imageAlt: 'Snow-capped Mount Fuji behind pink cherry blossoms',
        gallery: [
          {
            image: img('1490806843957-31f4c9a91c65'),
            alt: 'Mount Fuji framed by cherry blossom branches'
          },
          {
            image: img('1493976040374-85c8e12f0c0e'),
            alt: 'A traditional street in Kyoto'
          },
          {
            image: img('1480796927426-f609979314bd'),
            alt: 'A Japanese shopfront with bicycles parked outside'
          }
        ],
        bestTime: 'April–May · October–November',
        bestMonths: ['Apr', 'May', 'Oct', 'Nov'],
        dailyBudget: 210,
        idealNights: 2,
        budgetLevel: 'luxury',
        language: 'Japanese',
        currency: 'JPY',
        vibes: ['Nature', 'Mountains', 'Wellness', 'Romance'],
        lat: 35.2324,
        lng: 139.1069,
        overview:
          'Hakone is Tokyo’s mountain escape: a volcanic valley of steaming vents, cedar-lined lakes and ryokan with private hot-spring baths. The classic loop — train, funicular, cable car, pirate ship — sounds gimmicky until you are standing on deck with Fuji on one side and a forested crater on the other.',
        attractions: [
          {
            name: 'Lake Ashi',
            type: 'Lake · 2 hrs',
            description:
              'Cruise the caldera lake for the classic Fuji reflection view. Clear mornings in autumn and winter are your best odds.'
          },
          {
            name: 'Owakudani',
            type: 'Volcanic valley · 1 hr',
            description:
              'Sulphur vents, mountain views and black eggs cooked in the hot springs. Check volcanic alerts before you go.'
          },
          {
            name: 'Hakone Open-Air Museum',
            type: 'Art museum · 2 hrs',
            description:
              'A sculpture park with works by Henry Moore and a Picasso pavilion, set against the mountains.'
          }
        ],
        cuisine: [
          { name: 'Juwari soba', note: 'Pure buckwheat noodles, often served cold with a delicate dipping broth.' },
          { name: 'Kuro-tamago', note: 'Black-shelled eggs from Owakudani, said to add seven years to your life.' },
          { name: 'Onsen manju', note: 'Steamed red-bean buns sold near the hot-spring towns.' },
          { name: 'Local sake', note: 'Kanagawa breweries make clean, food-friendly bottles.' }
        ],
        culture:
          'Onsen etiquette is simple: wash thoroughly before entering, no swimwear, no towels in the water. Many baths do not allow visible tattoos — check with your ryokan or book a private bath. Dinner is usually served at a fixed time.',
        seasonNote:
          'Spring and autumn are the classic windows. Winter offers the clearest Fuji views but shorter days. June–July is rainy; August is humid. Book ryokan well ahead for autumn foliage.',
        itineraryTip:
          'Stay two nights in a ryokan, do the loop on the middle day, and keep the first evening free for a bath before dinner. The Hakone Free Pass covers most transport.',
        audiences: ['Couples', 'Wellness seekers', 'Slow travellers'],
        budgetBreakdown: { stay: 120, food: 45, transport: 25, activities: 20 }
      },
      {
        id: 'osaka',
        regionId: 'japan',
        name: 'Osaka',
        country: 'Japan',
        tagline: 'The kitchen of Japan',
        image: img('1590559899731-a382839e5549'),
        imageAlt: 'The glowing signs and crowded walkways of Dotonbori, Osaka',
        gallery: [
          {
            image: img('1590559899731-a382839e5549'),
            alt: 'Dotonbori’s neon signs reflected in the canal'
          },
          {
            image: img('1553621042-f6e147245754'),
            alt: 'A tray of sushi rolls'
          },
          {
            image: img('1503899036084-c55cdd92da26'),
            alt: 'A busy Tokyo street at night'
          }
        ],
        bestTime: 'March–May · October–November',
        bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
        dailyBudget: 135,
        idealNights: 2,
        budgetLevel: 'mid',
        language: 'Japanese',
        currency: 'JPY',
        vibes: ['Foodie', 'City', 'Nightlife', 'Culture'],
        lat: 34.6937,
        lng: 135.5023,
        overview:
          'Osaka is Japan with the collar undone. It is louder, warmer and more openly greedy than Kyoto, and its motto — kuidaore, eat until you drop — is a legitimate travel strategy. Use it as a base for Kyoto and Nara, but give the city itself at least one full evening.',
        attractions: [
          {
            name: 'Dotonbori',
            type: 'Neon district · evening',
            description:
              'The canal-side strip of giant signs, takoyaki stalls and bar hoppers. Walk it after dark, then escape to the side lanes.'
          },
          {
            name: 'Osaka Castle',
            type: 'Castle · 2 hrs',
            description:
              'A reconstructed keep in a moat-ringed park. The museum inside tells the story of unification; the park is lovely in cherry season.'
          },
          {
            name: 'Kuromon Ichiba',
            type: 'Market · 1–2 hrs',
            description:
              'A covered market of seafood, wagyu skewers and fruit. Go hungry, carry cash, and avoid the most touristy front stalls.'
          }
        ],
        cuisine: [
          { name: 'Takoyaki', note: 'Molten octopus dumplings, best eaten standing at the stall.' },
          { name: 'Okonomiyaki', note: 'Savoury cabbage pancake; Osaka style mixes everything into the batter.' },
          { name: 'Kushikatsu', note: 'Deep-fried skewers with a strict no-double-dipping rule.' },
          { name: 'Kitsune udon', note: 'Udon with sweet fried tofu — simple comfort food.' }
        ],
        culture:
          'Osaka is informal and chatty. Slurping noodles is fine, standing bars are common, and strangers may talk to you. The one rule that matters: never double-dip a kushikatsu skewer into the shared sauce.',
        seasonNote:
          'Spring and autumn are ideal. Summer is hot and festival-heavy, especially Tenjin Matsuri in July. Winter is mild and quiet, with excellent food-value menus.',
        itineraryTip:
          'Stay near Namba or Umeda. Spend one evening in Dotonbori and one in the quieter Tenma bar district. A day trip to Nara is easier from Osaka than Kyoto.',
        audiences: ['Food lovers', 'Night owls', 'Friends'],
        budgetBreakdown: { stay: 70, food: 40, transport: 12, activities: 13 }
      },
      {
        id: 'okinawa',
        regionId: 'japan',
        name: 'Okinawa',
        country: 'Japan',
        tagline: 'Island time in the Ryukyu sun',
        image: img('1510414842594-a61c69b5ae57'),
        imageAlt: 'A turquoise cove framed by subtropical greenery on the Okinawan coast',
        gallery: [
          {
            image: img('1510414842594-a61c69b5ae57'),
            alt: 'A rocky turquoise cove on the Okinawan coast'
          },
          {
            image: img('1544551763-46a013bb70d5'),
            alt: 'A scuba diver surrounded by a school of fish'
          },
          {
            image: img('1507525428034-b723cf961d3e'),
            alt: 'A quiet tropical beach at sunset'
          }
        ],
        bestTime: 'April–June · October–November',
        bestMonths: ['Apr', 'May', 'Jun', 'Oct', 'Nov'],
        dailyBudget: 150,
        idealNights: 4,
        budgetLevel: 'mid',
        language: 'Japanese · Okinawan',
        currency: 'JPY',
        vibes: ['Beaches', 'Nature', 'Wellness', 'Adventure'],
        lat: 26.3344,
        lng: 127.8056,
        overview:
          'Okinawa is Japan’s subtropical other: a former Ryukyu kingdom with its own language, cuisine and easygoing pace. The main island rewards a rental car — north for coral reefs and the Churaumi aquarium, south for castle ruins and quiet coves — and the smaller islands reward even less planning.',
        attractions: [
          {
            name: 'Okinawa Churaumi Aquarium',
            type: 'Aquarium · 3 hrs',
            description:
              'Home to whale sharks and manta rays in the vast Kuroshio Sea tank. Book a timed ticket and go early.'
          },
          {
            name: 'Cape Manzamo',
            type: 'Cliff view · 45 min',
            description:
              'A limestone cliff shaped like an elephant’s trunk, with a sweeping view of the East China Sea. Best at sunset.'
          },
          {
            name: 'Shurijo Castle',
            type: 'Heritage site · 2 hrs',
            description:
              'The ceremonial heart of the Ryukyu Kingdom. Reconstruction after the 2019 fire is ongoing, so check what is open.'
          }
        ],
        cuisine: [
          { name: 'Okinawa soba', note: 'Flat wheat noodles in a pork-and-bonito broth, topped with braised pork.' },
          { name: 'Goya champuru', note: 'Bitter melon stir-fried with tofu, egg and pork.' },
          { name: 'Rafute', note: 'Slow-braised pork belly, sweet and meltingly soft.' },
          { name: 'Shima tofu', note: 'Dense island tofu with a nutty, almost cheese-like texture.' }
        ],
        culture:
          'Respect sacred utaki groves and village shrines. Reef-safe sunscreen and no touching coral are non-negotiable. The island runs on a slower clock than Tokyo; plan fewer stops and leave room for a second swim.',
        seasonNote:
          'April–June is warm and relatively dry; October–November is pleasant and quieter. July–September is hot, humid and typhoon season. Winter is mild enough for walks but too cool for most swimming.',
        itineraryTip:
          'Rent a car at Naha and split the island: two nights north near Churaumi, two nights south near Naha. Book snorkel or dive trips for the morning, when the water is calmest.',
        audiences: ['Beach lovers', 'Divers', 'Families'],
        budgetBreakdown: { stay: 80, food: 40, transport: 15, activities: 15 }
      },

      /* ------------------------------- ITALY ------------------------------- */
      {
        id: 'rome',
        regionId: 'italy',
        name: 'Rome',
        country: 'Italy',
        tagline: 'Eternal layers, everyday drama',
        image: img('1552832230-c0197dd311b5'),
        imageAlt: 'The Colosseum in Rome glowing under a blue evening sky',
        gallery: [
          {
            image: img('1552832230-c0197dd311b5'),
            alt: 'The Colosseum at dusk'
          },
          {
            image: img('1543429257-3eb0b65d9c58'),
            alt: 'Florence’s skyline at sunset'
          },
          {
            image: img('1499678329028-101435549a4e'),
            alt: 'Positano on the Amalfi Coast at sunset'
          }
        ],
        bestTime: 'April–May · September–October',
        bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
        dailyBudget: 180,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Italian',
        currency: 'EUR',
        vibes: ['History', 'Culture', 'Foodie', 'City'],
        lat: 41.9028,
        lng: 12.4964,
        overview:
          'Rome is a city of visible layers: republican stone, imperial brick, baroque plaster and Fascist marble, all sharing the same street corner. The historic centre is walkable, but the best moments happen between the monuments — a morning espresso, a fountain refill, a plate of pasta in Trastevere after dark.',
        attractions: [
          {
            name: 'Colosseum & Roman Forum',
            type: 'Ancient site · half day',
            description:
              'Book a timed ticket that includes the Forum and Palatine Hill. Go at opening or late afternoon to avoid the worst heat and crowds.'
          },
          {
            name: 'Vatican Museums',
            type: 'Museum · 3–4 hrs',
            description:
              'The Sistine Chapel is the headline, but the map gallery and Raphael rooms deserve time. Book the first entry slot.'
          },
          {
            name: 'Pantheon',
            type: 'Ancient monument · 45 min',
            description:
              'A perfectly proportioned Roman dome with an open oculus. Entry is timed; combine it with Piazza Navona and gelato.'
          }
        ],
        cuisine: [
          { name: 'Cacio e pepe', note: 'Pasta, pecorino and black pepper — three ingredients, no shortcuts.' },
          { name: 'Supplì', note: 'Fried rice croquettes with a molten mozzarella centre.' },
          { name: 'Carciofi alla romana', note: 'Artichokes braised with mint, garlic and olive oil.' },
          { name: 'Maritozzo', note: 'A sweet bun split and filled with whipped cream, eaten at breakfast.' }
        ],
        culture:
          'Coffee is drunk standing at the bar, usually in one shot. Churches require covered shoulders and knees. The drinking fountains are safe and excellent — carry a bottle. Dinner starts late; 8pm is early.',
        seasonNote:
          'April–May and September–October are ideal. July–August is hot and crowded. Winter is mild, crowd-free and good for museums, though some trattorias close for holidays.',
        itineraryTip:
          'Pick two anchor sights per day and leave the rest to wandering. Book the Colosseum and Vatican in advance, and cross the river to Trastevere for dinner at least once.',
        audiences: ['History lovers', 'Food lovers', 'First-time Europe'],
        budgetBreakdown: { stay: 95, food: 45, transport: 15, activities: 25 }
      },
      {
        id: 'florence',
        regionId: 'italy',
        name: 'Florence',
        country: 'Italy',
        tagline: 'Renaissance in the golden hour',
        image: img('1476362174823-3a23f4aa6d76'),
        imageAlt: 'Florence’s Duomo and terracotta rooftops seen from above',
        gallery: [
          {
            image: img('1476362174823-3a23f4aa6d76'),
            alt: 'Florence Cathedral and the city’s terracotta rooftops'
          },
          {
            image: img('1543429257-3eb0b65d9c58'),
            alt: 'Florence at sunset with the Duomo on the skyline'
          },
          {
            image: img('1552832230-c0197dd311b5'),
            alt: 'The Colosseum in Rome'
          }
        ],
        bestTime: 'April–May · September–October',
        bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
        dailyBudget: 175,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Italian',
        currency: 'EUR',
        vibes: ['Culture', 'History', 'Foodie', 'Romance'],
        lat: 43.7696,
        lng: 11.2558,
        overview:
          'Florence is small enough to cross on foot and dense enough to fill a month. The Renaissance is the obvious draw, but the city’s real pleasure is its scale: a coffee, a church, a market, a bridge, a glass of Chianti, all within twenty minutes of each other.',
        attractions: [
          {
            name: 'Uffizi Galleries',
            type: 'Museum · 3 hrs',
            description:
              'Botticelli, Leonardo and a corridor of Renaissance masterpieces. Book the first slot and head straight for the Botticelli rooms.'
          },
          {
            name: 'Duomo complex',
            type: 'Cathedral · 2–3 hrs',
            description:
              'Brunelleschi’s dome is the city’s engineering miracle. Climb it for the view, then visit the baptistery and Giotto’s campanile.'
          },
          {
            name: 'Ponte Vecchio',
            type: 'Bridge · 30 min',
            description:
              'The goldsmiths’ bridge over the Arno. See it from the riverbank at sunset, then walk up to Piazzale Michelangelo.'
          }
        ],
        cuisine: [
          { name: 'Bistecca alla fiorentina', note: 'A thick T-bone grilled rare, sold by weight — share it.' },
          { name: 'Ribollita', note: 'Tuscan bread-and-bean soup, thick enough to stand a spoon in.' },
          { name: 'Lampredotto', note: 'Slow-cooked tripe in a roll, the city’s favourite street food.' },
          { name: 'Gelato', note: 'Look for small batches and natural colours; skip the towering neon displays.' }
        ],
        culture:
          'Museum bags must be checked, and large backpacks are often refused. Aperitivo is a civilized institution. The Oltrarno side of the river is where locals eat; the streets around the Duomo are for looking, not dining.',
        seasonNote:
          'Spring and early autumn are ideal. Summer is hot and museum queues peak. Winter is quiet and atmospheric, with crisp light and lower prices. September’s grape harvest is a good excuse to visit Chianti.',
        itineraryTip:
          'Book Uffizi and the Duomo climb for separate days. Spend one afternoon in the Oltrarno, and take a half-day bus or train to Siena or Lucca if you need a break from crowds.',
        audiences: ['Art lovers', 'Couples', 'Slow travellers'],
        budgetBreakdown: { stay: 90, food: 45, transport: 15, activities: 25 }
      },
      {
        id: 'venice',
        regionId: 'italy',
        name: 'Venice',
        country: 'Italy',
        tagline: 'A city built on water and whispers',
        image: img('1514890547357-a9ee288728e0'),
        imageAlt: 'Santa Maria della Salute and the Grand Canal in Venice at dusk',
        gallery: [
          {
            image: img('1514890547357-a9ee288728e0'),
            alt: 'Santa Maria della Salute across the Grand Canal'
          },
          {
            image: img('1523906834658-6e24ef2386f9'),
            alt: 'A gondola passing beneath the Rialto Bridge'
          },
          {
            image: img('1533104816931-20fa691ff6ca'),
            alt: 'Whitewashed Mediterranean steps framed by flowers'
          }
        ],
        bestTime: 'April–May · September–October',
        bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
        dailyBudget: 220,
        idealNights: 2,
        budgetLevel: 'luxury',
        language: 'Italian · Venetian',
        currency: 'EUR',
        vibes: ['Culture', 'Romance', 'History', 'Foodie'],
        lat: 45.4408,
        lng: 12.3155,
        overview:
          'Venice is best understood as a series of small decisions: which bridge to cross, which calle to follow, whether to stop for a cicchetto at 11am. The headline sights are magnificent, but the city’s real magic is in the quiet edges — Cannaregio at dawn, the lagoon light, the sound of water against stone.',
        attractions: [
          {
            name: 'St Mark’s Basilica',
            type: 'Basilica · 1–2 hrs',
            description:
              'A gold-mosaic interior that justifies every cliché. Book a timed entry and dress modestly; the Pala d’Oro is worth the extra ticket.'
          },
          {
            name: 'Doge’s Palace',
            type: 'Palace · 2–3 hrs',
            description:
              'The seat of the Venetian republic, with the Bridge of Sighs and a superb collection. Combine it with the basilica in one morning.'
          },
          {
            name: 'Grand Canal by vaporetto',
            type: 'Water bus · 1 hr',
            description:
              'Line 1 is the cheapest Grand Canal tour in the world. Ride it end-to-end at golden hour, standing at the back if you can.'
          }
        ],
        cuisine: [
          { name: 'Cicchetti', note: 'Small bar snacks — baccalà, crostini, meatballs — eaten standing with a spritz.' },
          { name: 'Risotto al nero di seppia', note: 'Cuttlefish-ink risotto, dark, briny and unmistakably Venetian.' },
          { name: 'Fritto misto', note: 'Lightly fried lagoon seafood, best with a squeeze of lemon.' },
          { name: 'Spritz', note: 'Select, Aperol or Campari with prosecco and soda, served over ice.' }
        ],
        culture:
          'Do not sit on bridges or picnic on steps; signage and fines are real. Churches ask for covered shoulders. Acqua alta can flood low areas in autumn and winter — pack waterproof shoes and check tide forecasts.',
        seasonNote:
          'April–May and September–October are the sweet spot. Summer is hot, humid and crowded. Winter is atmospheric and quiet but can bring acqua alta; the Venice Carnival in February is spectacular if you book early.',
        itineraryTip:
          'Stay two nights on the island, not on the mainland. Walk the outer sestieri early and late, when day-trippers leave. A vaporetto pass pays for itself quickly.',
        audiences: ['Couples', 'Art lovers', 'Honeymooners'],
        budgetBreakdown: { stay: 125, food: 50, transport: 20, activities: 25 }
      },
      {
        id: 'amalfi-coast',
        regionId: 'italy',
        name: 'Amalfi Coast',
        country: 'Italy',
        tagline: 'Cliffside colour, lemon-scented air',
        image: img('1499678329028-101435549a4e'),
        imageAlt: 'Pastel houses on the cliffs of Positano above the sea at sunset',
        gallery: [
          {
            image: img('1499678329028-101435549a4e'),
            alt: 'Positano’s cliffside houses at sunset'
          },
          {
            image: img('1533104816931-20fa691ff6ca'),
            alt: 'Whitewashed stairs and pink flowers above the Mediterranean'
          },
          {
            image: img('1514890547357-a9ee288728e0'),
            alt: 'Venice’s Grand Canal at dusk'
          }
        ],
        bestTime: 'May–June · September',
        bestMonths: ['May', 'Jun', 'Sep'],
        dailyBudget: 230,
        idealNights: 4,
        budgetLevel: 'luxury',
        language: 'Italian',
        currency: 'EUR',
        vibes: ['Beaches', 'Romance', 'Foodie', 'Nature'],
        lat: 40.6333,
        lng: 14.6029,
        overview:
          'The Amalfi Coast is a 50-kilometre argument between land and sea, with villages stacked into the cliffs like they were poured there. It is undeniably romantic and undeniably busy; the trick is to move by boat, start early, and spend at least one afternoon doing absolutely nothing.',
        attractions: [
          {
            name: 'Path of the Gods',
            type: 'Hike · 3–4 hrs',
            description:
              'A ridge trail from Bomerano to Nocelle with vertiginous coastal views. Start early, carry water, and take the bus back from Positano.'
          },
          {
            name: 'Positano',
            type: 'Village · half day',
            description:
              'The postcard town of stacked pastel houses and pebble beaches. Explore early, then escape the midday crush with a long lunch.'
          },
          {
            name: 'Ravello',
            type: 'Village & gardens · half day',
            description:
              'Cooler, quieter and higher up, with Villa Cimbrone’s Terrace of Infinity and Villa Rufolo’s gardens.'
          }
        ],
        cuisine: [
          { name: 'Lemon pasta', note: 'Fresh pasta with lemon zest, butter and parmesan — bright and simple.' },
          { name: 'Alici di Cetara', note: 'Anchovies from the coast, fresh or preserved in oil.' },
          { name: 'Sfogliatella', note: 'A flaky shell filled with ricotta, candied orange and cinnamon.' },
          { name: 'Limoncello', note: 'Ice-cold lemon liqueur, made with the coast’s fragrant sfusato lemons.' }
        ],
        culture:
          'Ferries are faster and more reliable than the coastal road in summer. Beach clubs charge for loungers; public beaches are free but pebbly. Dress for churches, and don’t underestimate the steps — pack light.',
        seasonNote:
          'May–June and September are ideal: warm sea, open ferries and manageable crowds. July–August is peak season, hot and expensive. Many hotels and restaurants close from November to March.',
        itineraryTip:
          'Base in Positano or Praiano for four nights. Use ferries for Amalfi and Capri, and do the Path of the Gods before the heat. Book restaurants with sea views well ahead.',
        audiences: ['Couples', 'Honeymooners', 'Food lovers'],
        budgetBreakdown: { stay: 130, food: 55, transport: 20, activities: 25 }
      },
      {
        id: 'dolomites',
        regionId: 'italy',
        name: 'Dolomites',
        country: 'Italy',
        tagline: 'Alpine light above the clouds',
        image: img('1476514525535-07fb3b4ae5f1'),
        imageAlt: 'A wooden boat on the turquoise water of Lago di Braies in the Dolomites',
        gallery: [
          {
            image: img('1476514525535-07fb3b4ae5f1'),
            alt: 'A boat on Lago di Braies with the Dolomites behind'
          },
          {
            image: img('1464822759023-fed622ff2c3b'),
            alt: 'A green alpine valley beneath snow-dusted peaks'
          },
          {
            image: img('1473448912268-2022ce9509d8'),
            alt: 'A clear river running through a pine forest'
          }
        ],
        bestTime: 'June–September · December–March',
        bestMonths: ['Jun', 'Jul', 'Aug', 'Sep', 'Dec', 'Jan', 'Feb', 'Mar'],
        dailyBudget: 190,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Italian · German · Ladin',
        currency: 'EUR',
        vibes: ['Mountains', 'Nature', 'Adventure', 'Wellness'],
        lat: 46.5405,
        lng: 12.1356,
        overview:
          'The Dolomites are not a single place but a range of valleys, each with its own language and microculture. In summer the draw is hiking between rifugi and cable cars; in winter it is skiing and long lunches in wood-panelled huts. Either way, the light at altitude is the main event.',
        attractions: [
          {
            name: 'Tre Cime di Lavaredo',
            type: 'Hike · 3–4 hrs',
            description:
              'The classic loop around three towering rock faces. Drive to Rifugio Auronzo early; the toll road and parking fill fast.'
          },
          {
            name: 'Lago di Braies',
            type: 'Lake · 1–2 hrs',
            description:
              'The most photographed lake in the range. Arrive before 8am or after 5pm to avoid the day-trip crush.'
          },
          {
            name: 'Seceda',
            type: 'Cable car & ridge · half day',
            description:
              'A dramatic ridgeline above Val Gardena, reached by cable car from Ortisei. Easy walks and serious views.'
          }
        ],
        cuisine: [
          { name: 'Canederli', note: 'Bread dumplings in broth, often with speck and cheese.' },
          { name: 'Speck', note: 'Smoked Alpine ham, served on boards with rye bread and pickles.' },
          { name: 'Polenta', note: 'The mountain staple, paired with mushrooms, cheese or game.' },
          { name: 'Strudel', note: 'Apple-and-pastry comfort, best with a dollop of cream.' }
        ],
        culture:
          'Mountain weather changes fast: carry a shell, water and a headlamp even on short hikes. Many rifugi are cash-friendly and close in shoulder season. Stay on marked trails, and remember that Ladin culture is alive here, not a performance.',
        seasonNote:
          'July–September is prime hiking; June can still have snow at altitude. December–March is ski season, with Christmas and February school holidays at their busiest. May and November are quiet but many lifts and huts close.',
        itineraryTip:
          'Pick one valley as a base — Val Gardena or Val di Funes — rather than trying to cover the whole range. Book rifugi for lunch, not just dinner, and keep one day flexible for weather.',
        audiences: ['Hikers', 'Adventure travellers', 'Photographers'],
        budgetBreakdown: { stay: 95, food: 45, transport: 30, activities: 20 }
      },

      /* ----------------------------- COSTA RICA ----------------------------- */
      {
        id: 'monteverde',
        regionId: 'costa-rica',
        name: 'Monteverde',
        country: 'Costa Rica',
        tagline: 'Cloud forest, slow mornings',
        image: img('1441974231531-c6227db76b6e'),
        imageAlt: 'Tall trees and dappled sunlight in the Monteverde cloud forest',
        gallery: [
          {
            image: img('1441974231531-c6227db76b6e'),
            alt: 'Sunlight filtering through cloud forest trees'
          },
          {
            image: img('1473448912268-2022ce9509d8'),
            alt: 'A clear forest river surrounded by pines'
          },
          {
            image: img('1536147116438-62679a5e01f2'),
            alt: 'A close-up canopy of vivid green leaves'
          }
        ],
        bestTime: 'December–April',
        bestMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        dailyBudget: 120,
        idealNights: 3,
        budgetLevel: 'budget',
        language: 'Spanish',
        currency: 'CRC',
        vibes: ['Nature', 'Adventure', 'Wellness', 'Wildlife'],
        lat: 10.3009,
        lng: -84.8255,
        overview:
          'Monteverde is a cool, green world suspended in the clouds. The forest here is a haven for quetzals, orchids and epiphytes, and the town is a launchpad for hanging bridges, night walks and coffee farms. Bring a rain jacket and expect the weather to change its mind.',
        attractions: [
          {
            name: 'Monteverde Cloud Forest Reserve',
            type: 'Reserve · half day',
            description:
              'The classic cloud-forest experience, with guided walks and a chance of seeing resplendent quetzals. Book an early entry and a naturalist guide.'
          },
          {
            name: 'Hanging bridges',
            type: 'Canopy walk · 2–3 hrs',
            description:
              'Suspended bridges through the canopy offer a different perspective on the forest. Go early for birds and fewer people.'
          },
          {
            name: 'Coffee farm tour',
            type: 'Food & culture · 2 hrs',
            description:
              'Learn how shade-grown coffee moves from cherry to cup. The farms around Monteverde are small, family-run and genuinely informative.'
          }
        ],
        cuisine: [
          { name: 'Gallo pinto', note: 'Rice and beans with onion, coriander and Lizano sauce — the national breakfast.' },
          { name: 'Casado', note: 'A plate of rice, beans, plantain, salad and grilled protein.' },
          { name: 'Monteverde coffee', note: 'Shade-grown, high-altitude beans with a clean, bright cup.' },
          { name: 'Local cheese', note: 'The Monteverde cheese factory is a local institution.' }
        ],
        culture:
          'The cloud forest is fragile: stay on trails, keep voices low and never feed wildlife. A guided night walk is worth it, but use red light and no flash. Cash is useful in small sodas; the nearest hospital is far away.',
        seasonNote:
          'December–April is the driest window, though cloud forest means mist year-round. May–November is greener and quieter, with afternoon rain. Temperatures are cool at night — pack layers.',
        itineraryTip:
          'Give yourself three nights: one for the reserve, one for bridges and coffee, one as a weather buffer. The road from the Pan-American highway is winding; avoid arriving after dark.',
        audiences: ['Nature lovers', 'Birders', 'Families'],
        budgetBreakdown: { stay: 60, food: 30, transport: 15, activities: 15 }
      },
      {
        id: 'manuel-antonio',
        regionId: 'costa-rica',
        name: 'Manuel Antonio',
        country: 'Costa Rica',
        tagline: 'Where the jungle meets the Pacific',
        image: img('1519046904884-53103b34b206'),
        imageAlt: 'A palm-lined tropical beach with a thatched shade structure',
        gallery: [
          {
            image: img('1519046904884-53103b34b206'),
            alt: 'A palm-fringed tropical beach'
          },
          {
            image: img('1507525428034-b723cf961d3e'),
            alt: 'A calm beach at sunset'
          },
          {
            image: img('1502680390469-be75c86b636f'),
            alt: 'A surfer riding a turquoise wave'
          }
        ],
        bestTime: 'December–April',
        bestMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        dailyBudget: 145,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Spanish',
        currency: 'CRC',
        vibes: ['Beaches', 'Nature', 'Wildlife', 'Romance'],
        lat: 9.3922,
        lng: -84.1372,
        overview:
          'Manuel Antonio is the rare place where a national park, a surf beach and a cluster of excellent restaurants sit within walking distance. The park is small but astonishingly alive — sloths, capuchins, iguanas and raccoons — and the Pacific sunsets are a nightly event.',
        attractions: [
          {
            name: 'Manuel Antonio National Park',
            type: 'National park · half day',
            description:
              'A compact park of trails, beaches and wildlife. Book tickets online, arrive at opening, and hire a licensed guide for the best sightings.'
          },
          {
            name: 'Playa Espadilla',
            type: 'Beach · flexible',
            description:
              'The long beach outside the park has surf at one end and calmer water at the other. Good for a lazy afternoon.'
          },
          {
            name: 'Sunset sail',
            type: 'Boat trip · 3–4 hrs',
            description:
              'A catamaran or sailboat trip along the coast, often with snorkelling and a sunset return. Book a small-group operator.'
          }
        ],
        cuisine: [
          { name: 'Ceviche', note: 'Fresh fish cured in lime with onion and coriander, served cold.' },
          { name: 'Patacones', note: 'Twice-fried green plantain discs, a perfect salty snack.' },
          { name: 'Arroz con mariscos', note: 'Costa Rican seafood rice, fragrant with peppers and herbs.' },
          { name: 'Tropical fruit', note: 'Mango, papaya, pineapple and mamón — best from a roadside stand.' }
        ],
        culture:
          'Park capacity is limited and tickets are not sold at the gate. Keep a respectful distance from wildlife, never feed monkeys, and use reef-safe sunscreen. The road between Quepos and Manuel Antonio is steep; taxis are cheap.',
        seasonNote:
          'December–April is dry and sunny, with the busiest weeks around Christmas and Easter. May–November is greener and quieter, with morning sun and afternoon showers. September is usually the wettest month.',
        itineraryTip:
          'Stay three nights, enter the park on your first morning, and keep the afternoon for the beach. Book a guided park walk — you will see far more than you would alone.',
        audiences: ['Wildlife lovers', 'Families', 'Couples'],
        budgetBreakdown: { stay: 80, food: 35, transport: 15, activities: 15 }
      },
      {
        id: 'tamarindo',
        regionId: 'costa-rica',
        name: 'Tamarindo',
        country: 'Costa Rica',
        tagline: 'Surf, sunsets and pura vida',
        image: img('1502680390469-be75c86b636f'),
        imageAlt: 'A surfer carving through a bright turquoise wave',
        gallery: [
          {
            image: img('1502680390469-be75c86b636f'),
            alt: 'A surfer riding a turquoise wave'
          },
          {
            image: img('1519046904884-53103b34b206'),
            alt: 'A palm-lined tropical beach'
          },
          {
            image: img('1507525428034-b723cf961d3e'),
            alt: 'A tropical beach at sunset'
          }
        ],
        bestTime: 'November–April',
        bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        dailyBudget: 130,
        idealNights: 4,
        budgetLevel: 'mid',
        language: 'Spanish',
        currency: 'CRC',
        vibes: ['Beaches', 'Adventure', 'Nightlife', 'Wellness'],
        lat: 10.2993,
        lng: -85.8371,
        overview:
          'Tamarindo is Costa Rica’s most sociable beach town: a long crescent of sand, reliable surf, and enough restaurants and bars to keep you happily barefoot for a week. It is not the wildest corner of the country, but it is one of the easiest to love.',
        attractions: [
          {
            name: 'Surf lessons at Playa Tamarindo',
            type: 'Surf · 2 hrs',
            description:
              'A gentle beach break that suits beginners, with plenty of schools and board rentals. Go at high tide for the friendliest waves.'
          },
          {
            name: 'Playa Grande & Las Baulas',
            type: 'Beach & turtle reserve · half day',
            description:
              'A quieter beach across the estuary, part of a leatherback turtle nesting reserve. Night tours are seasonal and strictly guided.'
          },
          {
            name: 'Estuary kayak',
            type: 'Mangrove tour · 2–3 hrs',
            description:
              'Paddle through mangroves with a guide to spot herons, crabs and crocodiles at a safe distance.'
          }
        ],
        cuisine: [
          { name: 'Fish tacos', note: 'Grilled or fried catch with cabbage, lime and a cold beer.' },
          { name: 'Ceviche', note: 'Sea bass or snapper cured in lime, served with tortilla chips.' },
          { name: 'Gallo pinto', note: 'The everyday rice-and-beans breakfast that keeps surfers going.' },
          { name: 'Coconut water', note: 'Straight from the green coconut, ideally after a surf session.' }
        ],
        culture:
          'Surf etiquette matters: don’t drop in, don’t snake waves, and give beginners space. Turtle tours are regulated — never approach a nesting turtle without a licensed guide. The sun is fierce; shade and water are not optional.',
        seasonNote:
          'November–April is dry and sunny, with consistent offshore surf. May–October is greener, cheaper and still surfable, with afternoon storms. September–October can be very wet.',
        itineraryTip:
          'Four nights is enough to surf, take a turtle tour and do nothing for a day. Stay within walking distance of the beach and book a morning surf lesson early in the trip.',
        audiences: ['Surfers', 'Friends', 'Beach lovers'],
        budgetBreakdown: { stay: 70, food: 35, transport: 10, activities: 15 }
      },
      {
        id: 'tortuguero',
        regionId: 'costa-rica',
        name: 'Tortuguero',
        country: 'Costa Rica',
        tagline: 'Canals, turtles and deep green',
        image: img('1473448912268-2022ce9509d8'),
        imageAlt: 'A calm river winding through a dense green tropical forest',
        gallery: [
          {
            image: img('1473448912268-2022ce9509d8'),
            alt: 'A river winding through dense tropical forest'
          },
          {
            image: img('1441974231531-c6227db76b6e'),
            alt: 'Sunlight through a lush forest canopy'
          },
          {
            image: img('1536147116438-62679a5e01f2'),
            alt: 'A dense canopy of green leaves'
          }
        ],
        bestTime: 'February–April · July–October',
        bestMonths: ['Feb', 'Mar', 'Apr', 'Jul', 'Aug', 'Sep', 'Oct'],
        dailyBudget: 110,
        idealNights: 2,
        budgetLevel: 'budget',
        language: 'Spanish',
        currency: 'CRC',
        vibes: ['Nature', 'Wildlife', 'Adventure', 'Beaches'],
        lat: 10.5421,
        lng: -83.5041,
        overview:
          'Tortuguero is reached only by boat or small plane, and that is the point. A maze of jungle canals, black-water lagoons and a long protected beach make it one of Costa Rica’s great wildlife destinations — especially during green turtle nesting season.',
        attractions: [
          {
            name: 'Canal boat tour',
            type: 'Wildlife · 3 hrs',
            description:
              'A slow boat through the canals is the best way to see monkeys, sloths, caimans and an astonishing number of birds. Go at dawn.'
          },
          {
            name: 'Green turtle nesting',
            type: 'Seasonal · night tour',
            description:
              'July–October is peak nesting season. Tours are strictly licensed, quiet and unforgettable; book through your lodge.'
          },
          {
            name: 'Tortuguero village',
            type: 'Local culture · 1–2 hrs',
            description:
              'A small Caribbean village with reggae, rice-and-beans and a turtle conservation centre. Slow down and talk to people.'
          }
        ],
        cuisine: [
          { name: 'Rice and beans', note: 'Caribbean-style, cooked with coconut milk and thyme.' },
          { name: 'Coconut fish', note: 'Fresh catch simmered in a coconut sauce with peppers.' },
          { name: 'Patacones', note: 'Crisp plantain rounds, served with beans or dip.' },
          { name: 'Agua de sapo', note: 'A refreshing ginger-and-lime drink, despite the name.' }
        ],
        culture:
          'There are no cars in the village; boats are the taxis. Turtle tours are regulated for a reason — no white light, no flash, no touching. Bring insect repellent, a rain jacket and cash; ATMs are scarce.',
        seasonNote:
          'February–April is drier and good for wildlife. July–October is wetter but peak turtle nesting. November–January is quiet and can be very rainy. The Caribbean side has its own weather pattern, so check forecasts.',
        itineraryTip:
          'Two nights is the minimum: arrive by boat, take an afternoon canal tour, then a dawn tour and a turtle walk in season. Pack light — the boat ride can be wet.',
        audiences: ['Wildlife lovers', 'Photographers', 'Adventurers'],
        budgetBreakdown: { stay: 60, food: 30, transport: 10, activities: 10 }
      },
      {
        id: 'corcovado',
        regionId: 'costa-rica',
        name: 'Corcovado & Drake Bay',
        country: 'Costa Rica',
        tagline: 'The wildest edge of Costa Rica',
        image: img('1507525428034-b723cf961d3e'),
        imageAlt: 'A remote tropical beach at sunset with calm water and soft clouds',
        gallery: [
          {
            image: img('1507525428034-b723cf961d3e'),
            alt: 'A remote tropical beach at sunset'
          },
          {
            image: img('1473448912268-2022ce9509d8'),
            alt: 'A river in a dense tropical forest'
          },
          {
            image: img('1519046904884-53103b34b206'),
            alt: 'A palm-lined beach'
          }
        ],
        bestTime: 'December–April',
        bestMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        dailyBudget: 150,
        idealNights: 3,
        budgetLevel: 'mid',
        language: 'Spanish',
        currency: 'CRC',
        vibes: ['Nature', 'Wildlife', 'Adventure', 'Beaches'],
        lat: 8.55,
        lng: -83.5833,
        overview:
          'Corcovado National Park is one of the most biologically intense places on Earth: tapirs, jaguars, scarlet macaws and four monkey species in a single tract of rainforest. Drake Bay is the gateway — a loose string of lodges, jungle paths and empty beaches where the road ends and the wild begins.',
        attractions: [
          {
            name: 'Sirena Station',
            type: 'Guided hike · day trip',
            description:
              'The park’s main ranger station, reached by boat. A licensed guide is mandatory; the day trip is long but extraordinary for wildlife.'
          },
          {
            name: 'Drake Bay',
            type: 'Coast · flexible',
            description:
              'A remote bay with diving, snorkelling and humpback whale watching (seasonal). The sunsets are spectacular.'
          },
          {
            name: 'Corcovado trails',
            type: 'Rainforest · guided',
            description:
              'Trails are muddy, hot and alive. Go with a guide, carry water, and expect to walk slowly because there is so much to see.'
          }
        ],
        cuisine: [
          { name: 'Fresh tuna', note: 'Caught locally and often simply seared or grilled.' },
          { name: 'Patacones', note: 'The reliable side dish of the Costa Rican coast.' },
          { name: 'Ceviche', note: 'Citrus-cured fish, best eaten after a day on the water.' },
          { name: 'Tropical fruit', note: 'Mango, pineapple and papaya, sweeter than you remember.' }
        ],
        culture:
          'A licensed guide is required inside Corcovado. No drones, no feeding wildlife, no off-trail shortcuts. Drake Bay is remote: bring cash, any medication you need, and a headlamp. Power and internet can be intermittent.',
        seasonNote:
          'December–April is the dry season and the best window for park access. May–November is wetter, greener and cheaper, but boats and trails can be disrupted. Whale watching peaks around August–October and December–April, depending on the species.',
        itineraryTip:
          'Stay three nights in Drake Bay and book the Sirena day trip early — permits are limited. Leave a buffer day for weather, and don’t schedule a tight flight connection after the boat back.',
        audiences: ['Wildlife lovers', 'Adventurers', 'Photographers'],
        budgetBreakdown: { stay: 80, food: 40, transport: 15, activities: 15 }
      }
    ],

    routes: [
      {
        id: 'japan-classic',
        name: 'Japan, slowly',
        days: 15,
        regionId: 'japan',
        image: img('1493976040374-85c8e12f0c0e'),
        imageAlt: 'Kyoto’s Yasaka Pagoda at dusk',
        summary:
          'Tokyo energy, a ryokan reset in Hakone, then Kyoto and Osaka at walking pace. The classic first-time Japan arc, with room to breathe.',
        destinationIds: ['tokyo', 'hakone', 'kyoto', 'osaka'],
        pace: 'Balanced',
        budgetFrom: 2450
      },
      {
        id: 'italy-slow',
        name: 'Italy by train & sea',
        days: 14,
        regionId: 'italy',
        image: img('1499678329028-101435549a4e'),
        imageAlt: 'Positano at sunset',
        summary:
          'Rome’s layers, Florence’s galleries, Venice’s water and a final exhale on the Amalfi Coast. Book the big sights, leave the rest loose.',
        destinationIds: ['rome', 'florence', 'venice', 'amalfi-coast'],
        pace: 'Slow',
        budgetFrom: 2810
      },
      {
        id: 'costa-rica-pura-vida',
        name: 'Pura vida, coast to cloud',
        days: 12,
        regionId: 'costa-rica',
        image: img('1441974231531-c6227db76b6e'),
        imageAlt: 'Cloud forest canopy in Monteverde',
        summary:
          'Cloud forest, Pacific surf and a remote jungle finale. A compact loop for wildlife lovers who still want a hammock afternoon.',
        destinationIds: ['monteverde', 'manuel-antonio', 'tamarindo', 'tortuguero'],
        pace: 'Active',
        budgetFrom: 1560
      }
    ]
  };

  // Freeze the shape so later code cannot accidentally mutate the source data.
  if (typeof Object.freeze === 'function') {
    DATA.regions.forEach(Object.freeze);
    DATA.destinations.forEach((d) => {
      Object.freeze(d.vibes);
      Object.freeze(d.bestMonths);
      Object.freeze(d.attractions);
      Object.freeze(d.cuisine);
      Object.freeze(d.audiences);
      Object.freeze(d.gallery);
      Object.freeze(d.budgetBreakdown);
      Object.freeze(d);
    });
    DATA.routes.forEach(Object.freeze);
    Object.freeze(DATA.regions);
    Object.freeze(DATA.destinations);
    Object.freeze(DATA.routes);
    Object.freeze(DATA.meta);
    Object.freeze(DATA);
  }

  window.WANDERLUST_DATA = DATA;
})();
