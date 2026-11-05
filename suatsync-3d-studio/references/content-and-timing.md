# Content and timing

## Edition

- **Chant:** พระคาถาชินบัญชร (Chinabunchorn / Jinapañjara), traditional Thai recension.
- **Reference transcription:** Thai Wikisource, [`พระคาถาชินบัญชร`](https://th.wikisource.org/wiki/พระคาถาชินบัญชร), retrieved 4 November 2026. Page licence CC BY-SA 4.0; the underlying chant is public domain.
- **Displayed Thai text:** the Wikisource recension, with spaces added for chanting breath and without
  the optional extra line some editions append after verse 9.
- **Roman text:** a pronunciation guide written for this project. It follows the Thai recension's
  pronunciation rather than a single Pali critical edition; vowel lengths and retroflex consonants are
  marked where the chant tradition supports them.
- **Thai and English meanings:** original plain-language glosses. They summarise the sense of each
  verse; they are not a word-by-word translation and are not presented as authoritative.
- **Video:** Joao Felix, “บทสวดมนต์พระคาถาชินบัญชร 9 จบ ฉบับสมบูรณ์ดั่งเดิม”, YouTube
  `LAo569-mflM`, measured length **5,837 s (1:37:17)**. Embedded, never re-hosted.

The app is a practice aid. It does not claim to replace a teacher, a temple, or an official chanting
book.

## Structure

| Section | Lines | Contents |
| --- | --- | --- |
| Intro | 3 | Namo 3×, two homage lines (ปุตตะกาโม …) |
| Rounds 1–9 | 15 each | ชินบัญชร คาถาที่ 1–15 |
| Dedication | 2 | Metta (สัพเพ สัตตา …), dedication to relatives |

Each of the nine rounds repeats the same fifteen verses. The app stores the verses once and reuses
them for every round; nothing is duplicated in the dataset.

## The fifteen verses

Thai script is the canonical display. Roman is shown in the app's Roman mode and as a secondary line
when Thai is selected. The English column is a short theme, not the full gloss.

| # | Thai Pali (incipit) | Roman (incipit) | Theme |
| --- | --- | --- | --- |
| 1 | ชะยาสะนากะตา พุทธา เชตะวา มารัง สะวาหะนัง … | Jayāsanāgatā buddhā, chetvā māraṃ savāhinaṃ … | The Buddhas on the seat of victory, having conquered Māra |
| 2 | ตัณหังกะราทะโย พุทธา อัฏฐะวีสะติ นายะกา … | Taṇhaṅkarādayo buddhā, aṭṭhavīsati nāyakā … | The twenty-eight Buddhas established on my head |
| 3 | สีเส ปะติฏฐิโต มัยหัง พุทโธ ธัมโม ทะวิโลจะเน … | Sīse patiṭṭhito mayhaṃ, buddho dhammo dvilocane … | Buddha at the head, Dhamma at the eyes, Sangha at the heart |
| 4 | หะทะเย เม อะนุรุทโธ สารีปุตโต จะ ทักขิเณ … | Hadaye me anuruddho, sāriputto ca dakkhiṇe … | Anuruddha, Sāriputta, Koṇḍañña, Moggallāna around me |
| 5 | ทักขิเณ สะวะเน มัยหัง อาสุง อานันทะ ราหุโล … | Dakkhiṇe savane mayhaṃ, āsuṃ ānanda-rāhulā … | Ānanda, Rāhula, Kassapa and Mahānāma at my ears |
| 6 | เกสันเต ปิฏฐิภาคัสมิง สุริโย วะ ปะภังกะโร … | Kesante piṭṭhibhāgasmiṃ, suriyo va pabhāṅkaro … | Sobhita at the crown, radiant as the sun |
| 7 | กุมาระกัสสะโป เถโร มะเหสี จิตตะวาทะโก … | Kumārakassapo thero, mahesī cittavādako … | Kumārakassapa at my mouth, a mine of virtue |
| 8 | ปุณโณ อังคุลิมาโล จะ อุปาลี นันทะ สีวะลี … | Puṇṇo aṅgulimālo ca, upāli nandasīvalī … | Five elders as blessings on my brow |
| 9 | เสสาสีติ มะหาเถรา วิชิตา ชินะสาวะกา … | Sesāsīti mahātherā, vijitā jinasāvakā … | The remaining eighty elders throughout my body |
| 10 | ระตะนัง ปุระโต อาสิ ทักขิเณ เมตตะสุตตะกัง … | Rataṇaṃ purato āsi, dakkhiṇe mettasuttakaṃ … | Ratanasutta, Mettasutta, Dhajaggasutta, Aṅgulimālasutta |
| 11 | ขันธะโมระปะริตตัญจะ อาฏานาฏิยะสุตตะกัง … | Khandhamoraparittañca, āṭānāṭiyasuttakaṃ … | Parittas as a roof; the rest as ramparts |
| 12 | ชินาณาวะระสังยุตตา สัตตะปาการะลังกะตา … | Jināṇāvarasaṃyuttā, sattapākāralaṅkatā … | Seven ramparts; dangers of wind, bile and the like |
| 13 | อาสิเสสา วินะยัง ยันตุ อะนันตะชินะเตชะสา … | Āsīsesā vinaṃ yantu, anantajinatejasā … | By boundless Jina power, may misfortune cease |
| 14 | ชินะปัญชะระมัชฌัมหิ วิหะรันตัง มะฮีตะเล … | Jinapañjaramajjhamhi, viharantaṃ mahītale … | May the great beings of the Jinapañjara protect me |
| 15 | อิจเจวะมันโต สุคุตโต สุรักโข … | Icchevamanto sugutto surakkho … | Guarded, victorious, protected by the true Dhamma |

Full text, Roman transliteration, Thai meaning and English gloss live in `VERSES` in `script.js`.
`docs/CONTENT.md` is a map, not the source of truth.

### Textual notes

- The Namo appears three times in the intro. The app displays “(3 จบ)” once and gives the line a
  larger weight rather than repeating it three times.
- Some Thai editions print an additional line after verse 9 (“เอตาสีติ มะหาเถรา …”). This edition
  follows the Wikisource text without that duplicate.
- Thai chanting books vary in spelling (e.g. `นะโม` vs `นโม`, `ปุตตะกาโม` vs `ปุตฺตกโม`). The app
  uses the phonetic Thai recension. Do not silently mix editions.
- The Roman guide is for following the audio, not for Pali study. A critical edition would use
  different consonant and vowel conventions.

## Default timeline

The video has no chapters. These markers are an informed estimate: a short intro, nine equal rounds,
and a dedication at the end. They are **not** measured from the audio.

| Section | Starts at | Length |
| --- | --- | --- |
| Intro | 0:00 | 4:00 |
| Round 1 | 4:00 | 9:49 |
| Round 2 | 13:49 | 9:49 |
| Round 3 | 23:37 | 9:49 |
| Round 4 | 33:26 | 9:49 |
| Round 5 | 43:14 | 9:49 |
| Round 6 | 53:03 | 9:49 |
| Round 7 | 1:02:51 | 9:49 |
| Round 8 | 1:12:40 | 9:49 |
| Round 9 | 1:22:28 | 9:49 |
| Dedication | 1:32:17 | 5:00 |

The exact seconds are in `defaultMarkers()`; they are computed as `240 + (5537 − 240) × r / 9` for
round `r = 0…8`, with the dedication at 5,537 s. Total: 5,837 s.

### Calibration

1. Open **Sync Lab**.
2. Play the video and pause at the first word of the intro (usually 0:00), each round, and the
   dedication.
3. Press **Use current** on the matching row.
4. Save. Markers must increase strictly; the app refuses overlaps.
5. `Restore defaults` returns to the estimates above.

Calibration is stored per browser. It is not part of the public dataset and is not exported with the
project.

### Why proportional line timing

The chant has no published per-line timestamps for this video, and a teacher's pauses vary. Assigning
each line a share of its section proportional to its Pali length gives a stable, readable approximation
that adapts to any duration. If you later obtain real timestamps, extend the line schema with
`start`/`end` and update `lineAt`; keep the current fallback for uncalibrated data.

## Translation policy

- Thai: natural contemporary Thai, retaining Pali proper names in Thai transcription.
- English: plain modern English, retaining Pali names with diacritics where useful.
- Do not add doctrine that is not in the verse. Keep the tone devotional but explanatory.
- The UI labels are product copy, not scripture; they can be localised freely.

## Licensing summary

| Material | Status |
| --- | --- |
| Pali chant | Traditional, public domain |
| Wikisource transcription | CC BY-SA 4.0, attributed |
| Thai/English glosses and UI copy | CC BY-SA 4.0, original to this project |
| Source code and design | MIT |
| YouTube video | All rights with Joao Felix; embedded only |

See [../ATTRIBUTION.md](../ATTRIBUTION.md) for the full record.
