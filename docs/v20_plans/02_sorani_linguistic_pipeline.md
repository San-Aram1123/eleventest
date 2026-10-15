# Audar V20 Plan: Kurdish Sorani Linguistic Pipeline

## 1. The Sorani-First Priority (P0)

Kurdish Sorani (`ckb`, Central Kurdish) comprises **80% of the entire Audar V20 dataset** (240,000 candidate recordings). 
It must receive specialized linguistic engineering rather than generic Arabic-script treatment.

> [!IMPORTANT]
> Never sacrifice Kurdish Sorani linguistic accuracy, natural phrasing, or correct pronunciation for exaggerated theatrical emotion. If an emotional inflection alters phoneme identity or renders the word unintelligible to a native speaker, the sample must be rejected.

---

## 2. Linguistic and Dialect Standards

### 2.1 Grammar and Register
* **Central Kurdish Grammar:** Strict adherence to ergative past-tense constructions, accurate pronominal clitics (`-م`, `-ت`, `-ی`, `-مان`, `-تان`, `-یان`), and proper definiteness markers (`-ەکە`, `-ەکان`).
* **Register Stratification:**
  * *Colloquial Conversational:* For intimate, anxious, joyful, and dramatic dialogue.
  * *Literary / Narrative:* For long-form narration, nostalgic reflections, and storytelling.
  * *Formal Public:* For commanding, neutral, and determined delivery.
* **No Literal Translations:** Scripts must be drafted or reviewed by native speakers. Direct machine translation of English expressions (e.g. translating "feeling blue" or English sentence idioms directly into Sorani) is strictly prohibited.

---

## 3. Strict Script Validation & Unicode Normalization

Sorani orthography utilizes a modified Perso-Arabic alphabet with distinct Unicode characters and rules that must not be corrupted by standard Arabic normalization engines.

### 3.1 Character Disambiguation Rules

| Sound / Phoneme | Sorani Character | Unicode Codepoint | Prohibited Arabic Substitute | Prohibited Codepoint |
|:---|:---|:---|:---|:---|
| **Kaf (ک)** | Kurdish Kaf | `U+06A9` (ARABIC LETTER KEHEH) | Arabic Kaf (ك) | `U+0643` |
| **Yeh (ی)** | Kurdish Yeh | `U+06CC` (ARABIC LETTER FARSI YEH) | Arabic Yeh (ي) / Dotless (ى) | `U+064A` / `U+0649` |
| **Gaf (گ)** | Kurdish Gaf | `U+06AF` (ARABIC LETTER GAF) | N/A | N/A |
| **Pe (پ)** | Kurdish Pe | `U+067E` (ARABIC LETTER PEH) | Arabic Ba (ب) | `U+0628` |
| **Che (چ)** | Kurdish Che | `U+0686` (ARABIC LETTER TCHEH) | Arabic Jim (ج) | `U+062C` |
| **Zhe (ژ)** | Kurdish Zhe | `U+0698` (ARABIC LETTER JEH) | Arabic Zay (ز) | `U+0632` |
| **Heavy L (ڵ)** | Kurdish L | `U+06B5` (ARABIC LETTER VE) | Standard Lam (ل) | `U+0644` |
| **Heavy R (ڕ)** | Kurdish R | `U+0695` (ARABIC LETTER REH WITH SMALL V BELOW)| Standard Reh (ر) | `U+0631` |
| **Vowel O (ۆ)** | Kurdish O | `U+06C6` (ARABIC LETTER OE) | Standard Waw (و) | `U+0648` |
| **Vowel E (ێ)** | Kurdish E | `U+06CE` (ARABIC LETTER YEH WITH SMALL V) | Standard Yeh (ی) | `U+06CC` |
| **Vowel A (ە)** | Kurdish Ae | `U+06D5` (ARABIC LETTER AE) | Arabic Ta Marbuta (ة) / Ha (ه) | `U+0629` / `U+0647` |

### 3.2 Zero-Width Non-Joiner (ZWNJ) Handling
The Zero-Width Non-Joiner (`U+200C`) is mandatory in Sorani orthography to prevent incorrect cursive ligatures across morphological boundaries:
* **Imperfective Prefix:** `دە` + ZWNJ + verb stem (e.g., `دە‌ڕۆم` `[de‌řom]`, never joined as `دەڕۆم` if font distorts, or separated with space `دە ڕۆم`).
* **Negative Prefix:** `نا` + ZWNJ + verb stem (e.g., `نا‌زانم`).
* **Comparative Suffix:** word + ZWNJ + `تر` (e.g., `باش‌تر`).
* **Deictic Suffixes:** word + ZWNJ + `ەوە` (e.g., `ماڵ‌ەوە`).

### 3.3 Codepoint-Safe Character Offset Calculation
> [!CAUTION]
> **Never calculate character offsets by slicing UTF-8 bytes.**
> In Kurdish Sorani, UTF-8 encoded characters consume 2 to 3 bytes per codepoint, and complex graphemes (combining marks, ZWNJ) alter byte lengths.
> All alignment, token span, and emotion boundary calculations must use **Unicode codepoints / grapheme cluster indices**.

```python
# Prohibited:
start_idx = len(text[:boundary].encode('utf-8'))

# Mandatory:
import unicodedata
normalized_text = unicodedata.normalize('NFC', raw_text)
codepoint_offset = len(normalized_text[:boundary_char_index])
```

---

## 4. Script Factory Module Architecture

The Script Factory produces contextual, linguistically verified text prompts for TTS generation.

```
┌────────────────────────────────────────────────────────┐
│                  Script Factory Engine                 │
└────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│ Contextual Banks │               │ Scenario Planner │
│ - 50 Emotion VOC │               │ - 2-Emotion Dual │
│ - Idiomatic text │               │ - 3-5 Sequence   │
│ - Long-form mon  │               │ - Gradual Curves │
└──────────────────┘               └──────────────────┘
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│           Sorani Linguistic Validator & Linter         │
│ - Kaf/Yeh/ZWNJ enforcement                             │
│ - Punctuation & rhythm balance                         │
│ - Ergative grammar & loanword audit                    │
│ - Codepoint-safe deduplication hashing (SHA-256)      │
└────────────────────────────────────────────────────────┘
```

### 4.1 Script Archetypes for Continuous Emotion
1. **Dramatic Conversational Shifts:**
   * `[neutral] هەواڵێکم پێ گەیشت لەسەر کارەکەت، [sad] بەڵام بەداخەوە ئەوە نەبوو کە هیوامان بۆ دەخواست، [angry] کێ بەرپرسیارە لەم هەڵە گەورەیە؟`
2. **Intimate / Narrative Reflections:**
   * `[nostalgic] ئەو ڕۆژانەم بیر دێتەوە کە لە گوندەکە پێکەوە پیاسەمان دەکرد... [sigh] [tender] ئێستاش هەر کاتێک بیرت دەکەمەوە، دڵم ئارام دەبێتەوە.`
3. **Suspense / Fear Transitions:**
   * `[curious] کێ لەوێیە؟ دەنگێک لە پشت دەرگاکەوە هات... [fearful] تکایە وەڵام بدەرەوە! [panicked] دەرگاکە کرایەوە!`

---

## 5. Verification Protocol & Quality Metrics

Every generated script must pass the automated linguistic filter before submission to TTS generation:
* **Clean Orthography Score:** Zero forbidden Arabic characters (`U+0643`, `U+064A`, `U+0629`).
* **ZWNJ Correctness:** Verified presence before designated verbal prefixes and suffixes.
* **Dialect Flagging:** Explicit metadata tag (`ckb-erbil`, `ckb-sulaymaniyah`, `ckb-mukriani`) when colloquial phonetic variants are scripted.
* **Native Listener Screening:** A native Sorani linguist validates sample batches during Phase 3 to establish pronunciation accuracy benchmarks.

