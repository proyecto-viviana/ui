// DateField validation-message catalog, ported verbatim from @react-stately/datepicker's
// intl/*.json (34 locales). Keep in sync with the vendored react-spectrum source on every
// pin bump. Hand-rolled resolver so solid-stately needs no @internationalized/string dep.

export type DateFieldErrorKey =
  | "rangeUnderflow"
  | "rangeOverflow"
  | "rangeReversed"
  | "unavailableDate";

type DateFieldErrorArgs = { minValue?: string; maxValue?: string };
type DateFieldErrorMessage = string | ((args: DateFieldErrorArgs) => string);

const errorStrings: Record<string, Record<DateFieldErrorKey, DateFieldErrorMessage>> = {
  "ar-AE": {
  "rangeOverflow": (args)=>`\u{64A}\u{62C}\u{628} \u{623}\u{646} \u{62A}\u{643}\u{648}\u{646} \u{627}\u{644}\u{642}\u{64A}\u{645}\u{629} ${args.maxValue} \u{623}\u{648} \u{642}\u{628}\u{644} \u{630}\u{644}\u{643}.`,
  "rangeReversed": `\u{62A}\u{627}\u{631}\u{64A}\u{62E} \u{627}\u{644}\u{628}\u{62F}\u{621} \u{64A}\u{62C}\u{628} \u{623}\u{646} \u{64A}\u{643}\u{648}\u{646} \u{642}\u{628}\u{644} \u{62A}\u{627}\u{631}\u{64A}\u{62E} \u{627}\u{644}\u{627}\u{646}\u{62A}\u{647}\u{627}\u{621}.`,
  "rangeUnderflow": (args)=>`\u{64A}\u{62C}\u{628} \u{623}\u{646} \u{62A}\u{643}\u{648}\u{646} \u{627}\u{644}\u{642}\u{64A}\u{645}\u{629} ${args.minValue} \u{623}\u{648} \u{628}\u{639}\u{62F} \u{630}\u{644}\u{643}.`,
  "unavailableDate": `\u{627}\u{644}\u{628}\u{64A}\u{627}\u{646}\u{627}\u{62A} \u{627}\u{644}\u{645}\u{62D}\u{62F}\u{62F}\u{629} \u{63A}\u{64A}\u{631} \u{645}\u{62A}\u{627}\u{62D}\u{629}.`
  },
  "bg-BG": {
  "rangeOverflow": (args)=>`\u{421}\u{442}\u{43E}\u{439}\u{43D}\u{43E}\u{441}\u{442}\u{442}\u{430} \u{442}\u{440}\u{44F}\u{431}\u{432}\u{430} \u{434}\u{430} \u{435} ${args.maxValue} \u{438}\u{43B}\u{438} \u{43F}\u{43E}-\u{440}\u{430}\u{43D}\u{43D}\u{430}.`,
  "rangeReversed": `\u{41D}\u{430}\u{447}\u{430}\u{43B}\u{43D}\u{430}\u{442}\u{430} \u{434}\u{430}\u{442}\u{430} \u{442}\u{440}\u{44F}\u{431}\u{432}\u{430} \u{434}\u{430} \u{435} \u{43F}\u{440}\u{435}\u{434}\u{438} \u{43A}\u{440}\u{430}\u{439}\u{43D}\u{430}\u{442}\u{430}.`,
  "rangeUnderflow": (args)=>`\u{421}\u{442}\u{43E}\u{439}\u{43D}\u{43E}\u{441}\u{442}\u{442}\u{430} \u{442}\u{440}\u{44F}\u{431}\u{432}\u{430} \u{434}\u{430} \u{435} ${args.minValue} \u{438}\u{43B}\u{438} \u{43F}\u{43E}-\u{43A}\u{44A}\u{441}\u{43D}\u{43E}.`,
  "unavailableDate": `\u{418}\u{437}\u{431}\u{440}\u{430}\u{43D}\u{430}\u{442}\u{430} \u{434}\u{430}\u{442}\u{430} \u{43D}\u{435} \u{435} \u{43D}\u{430}\u{43B}\u{438}\u{447}\u{43D}\u{430}.`
  },
  "cs-CZ": {
  "rangeOverflow": (args)=>`Hodnota mus\xed b\xfdt ${args.maxValue} nebo d\u{159}\xedv\u{11B}j\u{161}\xed.`,
  "rangeReversed": `Datum zah\xe1jen\xed mus\xed p\u{159}edch\xe1zet datu ukon\u{10D}en\xed.`,
  "rangeUnderflow": (args)=>`Hodnota mus\xed b\xfdt ${args.minValue} nebo pozd\u{11B}j\u{161}\xed.`,
  "unavailableDate": `Vybran\xe9 datum nen\xed k dispozici.`
  },
  "da-DK": {
  "rangeOverflow": (args)=>`V\xe6rdien skal v\xe6re ${args.maxValue} eller tidligere.`,
  "rangeReversed": `Startdatoen skal v\xe6re f\xf8r slutdatoen.`,
  "rangeUnderflow": (args)=>`V\xe6rdien skal v\xe6re ${args.minValue} eller nyere.`,
  "unavailableDate": `Den valgte dato er ikke tilg\xe6ngelig.`
  },
  "de-DE": {
  "rangeOverflow": (args)=>`Der Wert muss ${args.maxValue} oder fr\xfcher sein.`,
  "rangeReversed": `Das Startdatum muss vor dem Enddatum liegen.`,
  "rangeUnderflow": (args)=>`Der Wert muss ${args.minValue} oder sp\xe4ter sein.`,
  "unavailableDate": `Das ausgew\xe4hlte Datum ist nicht verf\xfcgbar.`
  },
  "el-GR": {
  "rangeOverflow": (args)=>`\u{397} \u{3C4}\u{3B9}\u{3BC}\u{3AE} \u{3C0}\u{3C1}\u{3AD}\u{3C0}\u{3B5}\u{3B9} \u{3BD}\u{3B1} \u{3B5}\u{3AF}\u{3BD}\u{3B1}\u{3B9} ${args.maxValue} \u{3AE} \u{3C0}\u{3B1}\u{3BB}\u{3B1}\u{3B9}\u{3CC}\u{3C4}\u{3B5}\u{3C1}\u{3B7}.`,
  "rangeReversed": `\u{397} \u{3B7}\u{3BC}\u{3B5}\u{3C1}\u{3BF}\u{3BC}\u{3B7}\u{3BD}\u{3AF}\u{3B1} \u{3AD}\u{3BD}\u{3B1}\u{3C1}\u{3BE}\u{3B7}\u{3C2} \u{3C0}\u{3C1}\u{3AD}\u{3C0}\u{3B5}\u{3B9} \u{3BD}\u{3B1} \u{3B5}\u{3AF}\u{3BD}\u{3B1}\u{3B9} \u{3C0}\u{3C1}\u{3B9}\u{3BD} \u{3B1}\u{3C0}\u{3CC} \u{3C4}\u{3B7}\u{3BD} \u{3B7}\u{3BC}\u{3B5}\u{3C1}\u{3BF}\u{3BC}\u{3B7}\u{3BD}\u{3AF}\u{3B1} \u{3BB}\u{3AE}\u{3BE}\u{3B7}\u{3C2}.`,
  "rangeUnderflow": (args)=>`\u{397} \u{3C4}\u{3B9}\u{3BC}\u{3AE} \u{3C0}\u{3C1}\u{3AD}\u{3C0}\u{3B5}\u{3B9} \u{3BD}\u{3B1} \u{3B5}\u{3AF}\u{3BD}\u{3B1}\u{3B9} ${args.minValue} \u{3AE} \u{3BC}\u{3B5}\u{3C4}\u{3B1}\u{3B3}\u{3B5}\u{3BD}\u{3AD}\u{3C3}\u{3C4}\u{3B5}\u{3C1}\u{3B7}.`,
  "unavailableDate": `\u{397} \u{3B5}\u{3C0}\u{3B9}\u{3BB}\u{3B5}\u{3B3}\u{3BC}\u{3AD}\u{3BD}\u{3B7} \u{3B7}\u{3BC}\u{3B5}\u{3C1}\u{3BF}\u{3BC}\u{3B7}\u{3BD}\u{3AF}\u{3B1} \u{3B4}\u{3B5}\u{3BD} \u{3B5}\u{3AF}\u{3BD}\u{3B1}\u{3B9} \u{3B4}\u{3B9}\u{3B1}\u{3B8}\u{3AD}\u{3C3}\u{3B9}\u{3BC}\u{3B7}.`
  },
  "en-US": {
  "rangeUnderflow": (args)=>`Value must be ${args.minValue} or later.`,
  "rangeOverflow": (args)=>`Value must be ${args.maxValue} or earlier.`,
  "rangeReversed": `Start date must be before end date.`,
  "unavailableDate": `Selected date unavailable.`
  },
  "es-ES": {
  "rangeOverflow": (args)=>`El valor debe ser ${args.maxValue} o anterior.`,
  "rangeReversed": `La fecha de inicio debe ser anterior a la fecha de finalizaci\xf3n.`,
  "rangeUnderflow": (args)=>`El valor debe ser ${args.minValue} o posterior.`,
  "unavailableDate": `Fecha seleccionada no disponible.`
  },
  "et-EE": {
  "rangeOverflow": (args)=>`V\xe4\xe4rtus peab olema ${args.maxValue} v\xf5i varasem.`,
  "rangeReversed": `Alguskuup\xe4ev peab olema enne l\xf5ppkuup\xe4eva.`,
  "rangeUnderflow": (args)=>`V\xe4\xe4rtus peab olema ${args.minValue} v\xf5i hilisem.`,
  "unavailableDate": `Valitud kuup\xe4ev pole saadaval.`
  },
  "fi-FI": {
  "rangeOverflow": (args)=>`Arvon on oltava ${args.maxValue} tai sit\xe4 aikaisempi.`,
  "rangeReversed": `Aloitusp\xe4iv\xe4n on oltava ennen lopetusp\xe4iv\xe4\xe4.`,
  "rangeUnderflow": (args)=>`Arvon on oltava ${args.minValue} tai sit\xe4 my\xf6h\xe4isempi.`,
  "unavailableDate": `Valittu p\xe4iv\xe4m\xe4\xe4r\xe4 ei ole k\xe4ytett\xe4viss\xe4.`
  },
  "fr-FR": {
  "rangeOverflow": (args)=>`La valeur doit \xeatre ${args.maxValue} ou ant\xe9rieure.`,
  "rangeReversed": `La date de d\xe9but doit \xeatre ant\xe9rieure \xe0 la date de fin.`,
  "rangeUnderflow": (args)=>`La valeur doit \xeatre ${args.minValue} ou ult\xe9rieure.`,
  "unavailableDate": `La date s\xe9lectionn\xe9e n\u{2019}est pas disponible.`
  },
  "he-IL": {
  "rangeOverflow": (args)=>`\u{5D4}\u{5E2}\u{5E8}\u{5DA} \u{5D7}\u{5D9}\u{5D9}\u{5D1} \u{5DC}\u{5D4}\u{5D9}\u{5D5}\u{5EA} ${args.maxValue} \u{5D0}\u{5D5} \u{5DE}\u{5D5}\u{5E7}\u{5D3}\u{5DD} \u{5D9}\u{5D5}\u{5EA}\u{5E8}.`,
  "rangeReversed": `\u{5EA}\u{5D0}\u{5E8}\u{5D9}\u{5DA} \u{5D4}\u{5D4}\u{5EA}\u{5D7}\u{5DC}\u{5D4} \u{5D7}\u{5D9}\u{5D9}\u{5D1} \u{5DC}\u{5D4}\u{5D9}\u{5D5}\u{5EA} \u{5DC}\u{5E4}\u{5E0}\u{5D9} \u{5EA}\u{5D0}\u{5E8}\u{5D9}\u{5DA} \u{5D4}\u{5E1}\u{5D9}\u{5D5}\u{5DD}.`,
  "rangeUnderflow": (args)=>`\u{5D4}\u{5E2}\u{5E8}\u{5DA} \u{5D7}\u{5D9}\u{5D9}\u{5D1} \u{5DC}\u{5D4}\u{5D9}\u{5D5}\u{5EA} ${args.minValue} \u{5D0}\u{5D5} \u{5DE}\u{5D0}\u{5D5}\u{5D7}\u{5E8} \u{5D9}\u{5D5}\u{5EA}\u{5E8}.`,
  "unavailableDate": `\u{5D4}\u{5EA}\u{5D0}\u{5E8}\u{5D9}\u{5DA} \u{5D4}\u{5E0}\u{5D1}\u{5D7}\u{5E8} \u{5D0}\u{5D9}\u{5E0}\u{5D5} \u{5D6}\u{5DE}\u{5D9}\u{5DF}.`
  },
  "hr-HR": {
  "rangeOverflow": (args)=>`Vrijednost mora biti ${args.maxValue} ili ranije.`,
  "rangeReversed": `Datum po\u{10D}etka mora biti prije datuma zavr\u{161}etka.`,
  "rangeUnderflow": (args)=>`Vrijednost mora biti ${args.minValue} ili kasnije.`,
  "unavailableDate": `Odabrani datum nije dostupan.`
  },
  "hu-HU": {
  "rangeOverflow": (args)=>`Az \xe9rt\xe9knek ${args.maxValue} vagy kor\xe1bbinak kell lennie.`,
  "rangeReversed": `A kezd\u{151} d\xe1tumnak a befejez\u{151} d\xe1tumn\xe1l kor\xe1bbinak kell lennie.`,
  "rangeUnderflow": (args)=>`Az \xe9rt\xe9knek ${args.minValue} vagy k\xe9s\u{151}bbinek kell lennie.`,
  "unavailableDate": `A kiv\xe1lasztott d\xe1tum nem \xe9rhet\u{151} el.`
  },
  "it-IT": {
  "rangeOverflow": (args)=>`Il valore deve essere ${args.maxValue} o precedente.`,
  "rangeReversed": `La data di inizio deve essere antecedente alla data di fine.`,
  "rangeUnderflow": (args)=>`Il valore deve essere ${args.minValue} o successivo.`,
  "unavailableDate": `Data selezionata non disponibile.`
  },
  "ja-JP": {
  "rangeOverflow": (args)=>`\u{5024}\u{306F} ${args.maxValue} \u{4EE5}\u{4E0B}\u{306B}\u{3059}\u{308B}\u{5FC5}\u{8981}\u{304C}\u{3042}\u{308A}\u{307E}\u{3059}\u{3002}`,
  "rangeReversed": `\u{958B}\u{59CB}\u{65E5}\u{306F}\u{7D42}\u{4E86}\u{65E5}\u{3088}\u{308A}\u{524D}\u{306B}\u{3059}\u{308B}\u{5FC5}\u{8981}\u{304C}\u{3042}\u{308A}\u{307E}\u{3059}\u{3002}`,
  "rangeUnderflow": (args)=>`\u{5024}\u{306F} ${args.minValue} \u{4EE5}\u{4E0A}\u{306B}\u{3059}\u{308B}\u{5FC5}\u{8981}\u{304C}\u{3042}\u{308A}\u{307E}\u{3059}\u{3002}`,
  "unavailableDate": `\u{9078}\u{629E}\u{3057}\u{305F}\u{65E5}\u{4ED8}\u{306F}\u{4F7F}\u{7528}\u{3067}\u{304D}\u{307E}\u{305B}\u{3093}\u{3002}`
  },
  "ko-KR": {
  "rangeOverflow": (args)=>`\u{AC12}\u{C740} ${args.maxValue} \u{C774}\u{C804}\u{C774}\u{C5B4}\u{C57C} \u{D569}\u{B2C8}\u{B2E4}.`,
  "rangeReversed": `\u{C2DC}\u{C791}\u{C77C}\u{C740} \u{C885}\u{B8CC}\u{C77C} \u{C774}\u{C804}\u{C774}\u{C5B4}\u{C57C} \u{D569}\u{B2C8}\u{B2E4}.`,
  "rangeUnderflow": (args)=>`\u{AC12}\u{C740} ${args.minValue} \u{C774}\u{D6C4}\u{C5EC}\u{C57C} \u{D569}\u{B2C8}\u{B2E4}.`,
  "unavailableDate": `\u{C120}\u{D0DD}\u{D55C} \u{B0A0}\u{C9DC}\u{B97C} \u{C0AC}\u{C6A9}\u{D560} \u{C218} \u{C5C6}\u{C2B5}\u{B2C8}\u{B2E4}.`
  },
  "lt-LT": {
  "rangeOverflow": (args)=>`Reik\u{161}m\u{117} turi b\u{16B}ti ${args.maxValue} arba ankstesn\u{117}.`,
  "rangeReversed": `Prad\u{17E}ios data turi b\u{16B}ti ankstesn\u{117} nei pabaigos data.`,
  "rangeUnderflow": (args)=>`Reik\u{161}m\u{117} turi b\u{16B}ti ${args.minValue} arba naujesn\u{117}.`,
  "unavailableDate": `Pasirinkta data nepasiekiama.`
  },
  "lv-LV": {
  "rangeOverflow": (args)=>`V\u{113}rt\u{12B}bai ir j\u{101}b\u{16B}t ${args.maxValue} vai agr\u{101}kai.`,
  "rangeReversed": `S\u{101}kuma datumam ir j\u{101}b\u{16B}t pirms beigu datuma.`,
  "rangeUnderflow": (args)=>`V\u{113}rt\u{12B}bai ir j\u{101}b\u{16B}t ${args.minValue} vai v\u{113}l\u{101}kai.`,
  "unavailableDate": `Atlas\u{12B}tais datums nav pieejams.`
  },
  "nb-NO": {
  "rangeOverflow": (args)=>`Verdien m\xe5 v\xe6re ${args.maxValue} eller tidligere.`,
  "rangeReversed": `Startdatoen m\xe5 v\xe6re f\xf8r sluttdatoen.`,
  "rangeUnderflow": (args)=>`Verdien m\xe5 v\xe6re ${args.minValue} eller senere.`,
  "unavailableDate": `Valgt dato utilgjengelig.`
  },
  "nl-NL": {
  "rangeOverflow": (args)=>`Waarde moet ${args.maxValue} of eerder zijn.`,
  "rangeReversed": `De startdatum moet voor de einddatum liggen.`,
  "rangeUnderflow": (args)=>`Waarde moet ${args.minValue} of later zijn.`,
  "unavailableDate": `Geselecteerde datum niet beschikbaar.`
  },
  "pl-PL": {
  "rangeOverflow": (args)=>`Warto\u{15B}\u{107} musi mie\u{107} warto\u{15B}\u{107} ${args.maxValue} lub wcze\u{15B}niejsz\u{105}.`,
  "rangeReversed": `Data rozpocz\u{119}cia musi by\u{107} wcze\u{15B}niejsza ni\u{17C} data zako\u{144}czenia.`,
  "rangeUnderflow": (args)=>`Warto\u{15B}\u{107} musi mie\u{107} warto\u{15B}\u{107} ${args.minValue} lub p\xf3\u{17A}niejsz\u{105}.`,
  "unavailableDate": `Wybrana data jest niedost\u{119}pna.`
  },
  "pt-BR": {
  "rangeOverflow": (args)=>`O valor deve ser ${args.maxValue} ou anterior.`,
  "rangeReversed": `A data inicial deve ser anterior \xe0 data final.`,
  "rangeUnderflow": (args)=>`O valor deve ser ${args.minValue} ou posterior.`,
  "unavailableDate": `Data selecionada indispon\xedvel.`
  },
  "pt-PT": {
  "rangeOverflow": (args)=>`O valor tem de ser ${args.maxValue} ou anterior.`,
  "rangeReversed": `A data de in\xedcio deve ser anterior \xe0 data de fim.`,
  "rangeUnderflow": (args)=>`O valor tem de ser ${args.minValue} ou posterior.`,
  "unavailableDate": `Data selecionada indispon\xedvel.`
  },
  "ro-RO": {
  "rangeOverflow": (args)=>`Valoarea trebuie s\u{103} fie ${args.maxValue} sau anterioar\u{103}.`,
  "rangeReversed": `Data de \xeenceput trebuie s\u{103} fie anterioar\u{103} datei de sf\xe2r\u{219}it.`,
  "rangeUnderflow": (args)=>`Valoarea trebuie s\u{103} fie ${args.minValue} sau ulterioar\u{103}.`,
  "unavailableDate": `Data selectat\u{103} nu este disponibil\u{103}.`
  },
  "ru-RU": {
  "rangeOverflow": (args)=>`\u{417}\u{43D}\u{430}\u{447}\u{435}\u{43D}\u{438}\u{435} \u{434}\u{43E}\u{43B}\u{436}\u{43D}\u{43E} \u{431}\u{44B}\u{442}\u{44C} \u{43D}\u{435} \u{43F}\u{43E}\u{437}\u{436}\u{435} ${args.maxValue}.`,
  "rangeReversed": `\u{414}\u{430}\u{442}\u{430} \u{43D}\u{430}\u{447}\u{430}\u{43B}\u{430} \u{434}\u{43E}\u{43B}\u{436}\u{43D}\u{430} \u{43F}\u{440}\u{435}\u{434}\u{448}\u{435}\u{441}\u{442}\u{432}\u{43E}\u{432}\u{430}\u{442}\u{44C} \u{434}\u{430}\u{442}\u{435} \u{43E}\u{43A}\u{43E}\u{43D}\u{447}\u{430}\u{43D}\u{438}\u{44F}.`,
  "rangeUnderflow": (args)=>`\u{417}\u{43D}\u{430}\u{447}\u{435}\u{43D}\u{438}\u{435} \u{434}\u{43E}\u{43B}\u{436}\u{43D}\u{43E} \u{431}\u{44B}\u{442}\u{44C} \u{43D}\u{435} \u{440}\u{430}\u{43D}\u{44C}\u{448}\u{435} ${args.minValue}.`,
  "unavailableDate": `\u{412}\u{44B}\u{431}\u{440}\u{430}\u{43D}\u{43D}\u{430}\u{44F} \u{434}\u{430}\u{442}\u{430} \u{43D}\u{435}\u{434}\u{43E}\u{441}\u{442}\u{443}\u{43F}\u{43D}\u{430}.`
  },
  "sk-SK": {
  "rangeOverflow": (args)=>`Hodnota mus\xed by\u{165} ${args.maxValue} alebo skor\u{161}ia.`,
  "rangeReversed": `D\xe1tum za\u{10D}iatku mus\xed by\u{165} skor\u{161}\xed ako d\xe1tum konca.`,
  "rangeUnderflow": (args)=>`Hodnota mus\xed by\u{165} ${args.minValue} alebo neskor\u{161}ia.`,
  "unavailableDate": `Vybrat\xfd d\xe1tum je nedostupn\xfd.`
  },
  "sl-SI": {
  "rangeOverflow": (args)=>`Vrednost mora biti ${args.maxValue} ali starej\u{161}a.`,
  "rangeReversed": `Za\u{10D}etni datum mora biti pred kon\u{10D}nim datumom.`,
  "rangeUnderflow": (args)=>`Vrednost mora biti ${args.minValue} ali novej\u{161}a.`,
  "unavailableDate": `Izbrani datum ni na voljo.`
  },
  "sr-SP": {
  "rangeOverflow": (args)=>`Vrednost mora da bude ${args.maxValue} ili starija.`,
  "rangeReversed": `Datum po\u{10D}etka mora biti pre datuma zavr\u{161}etka.`,
  "rangeUnderflow": (args)=>`Vrednost mora da bude ${args.minValue} ili novija.`,
  "unavailableDate": `Izabrani datum nije dostupan.`
  },
  "sv-SE": {
  "rangeOverflow": (args)=>`V\xe4rdet m\xe5ste vara ${args.maxValue} eller tidigare.`,
  "rangeReversed": `Startdatumet m\xe5ste vara f\xf6re slutdatumet.`,
  "rangeUnderflow": (args)=>`V\xe4rdet m\xe5ste vara ${args.minValue} eller senare.`,
  "unavailableDate": `Det valda datumet \xe4r inte tillg\xe4ngligt.`
  },
  "tr-TR": {
  "rangeOverflow": (args)=>`De\u{11F}er, ${args.maxValue} veya \xf6ncesi olmal\u{131}d\u{131}r.`,
  "rangeReversed": `Ba\u{15F}lang\u{131}\xe7 tarihi biti\u{15F} tarihinden \xf6nce olmal\u{131}d\u{131}r.`,
  "rangeUnderflow": (args)=>`De\u{11F}er, ${args.minValue} veya sonras\u{131} olmal\u{131}d\u{131}r.`,
  "unavailableDate": `Se\xe7ilen tarih kullan\u{131}lam\u{131}yor.`
  },
  "uk-UA": {
  "rangeOverflow": (args)=>`\u{417}\u{43D}\u{430}\u{447}\u{435}\u{43D}\u{43D}\u{44F} \u{43C}\u{430}\u{454} \u{431}\u{443}\u{442}\u{438} \u{43D}\u{435} \u{43F}\u{456}\u{437}\u{43D}\u{456}\u{448}\u{435} ${args.maxValue}.`,
  "rangeReversed": `\u{414}\u{430}\u{442}\u{430} \u{43F}\u{43E}\u{447}\u{430}\u{442}\u{43A}\u{443} \u{43C}\u{430}\u{454} \u{43F}\u{435}\u{440}\u{435}\u{434}\u{443}\u{432}\u{430}\u{442}\u{438} \u{434}\u{430}\u{442}\u{456} \u{437}\u{430}\u{432}\u{435}\u{440}\u{448}\u{435}\u{43D}\u{43D}\u{44F}.`,
  "rangeUnderflow": (args)=>`\u{417}\u{43D}\u{430}\u{447}\u{435}\u{43D}\u{43D}\u{44F} \u{43C}\u{430}\u{454} \u{431}\u{443}\u{442}\u{438} \u{43D}\u{435} \u{440}\u{430}\u{43D}\u{456}\u{448}\u{435} ${args.minValue}.`,
  "unavailableDate": `\u{412}\u{438}\u{431}\u{440}\u{430}\u{43D}\u{430} \u{434}\u{430}\u{442}\u{430} \u{43D}\u{435}\u{434}\u{43E}\u{441}\u{442}\u{443}\u{43F}\u{43D}\u{430}.`
  },
  "zh-CN": {
  "rangeOverflow": (args)=>`\u{503C}\u{5FC5}\u{987B}\u{662F} ${args.maxValue} \u{6216}\u{66F4}\u{65E9}\u{65E5}\u{671F}\u{3002}`,
  "rangeReversed": `\u{5F00}\u{59CB}\u{65E5}\u{671F}\u{5FC5}\u{987B}\u{65E9}\u{4E8E}\u{7ED3}\u{675F}\u{65E5}\u{671F}\u{3002}`,
  "rangeUnderflow": (args)=>`\u{503C}\u{5FC5}\u{987B}\u{662F} ${args.minValue} \u{6216}\u{66F4}\u{665A}\u{65E5}\u{671F}\u{3002}`,
  "unavailableDate": `\u{6240}\u{9009}\u{65E5}\u{671F}\u{4E0D}\u{53EF}\u{7528}\u{3002}`
  },
  "zh-TW": {
  "rangeOverflow": (args)=>`\u{503C}\u{5FC5}\u{9808}\u{662F} ${args.maxValue} \u{6216}\u{66F4}\u{65E9}\u{3002}`,
  "rangeReversed": `\u{958B}\u{59CB}\u{65E5}\u{671F}\u{5FC5}\u{9808}\u{5728}\u{7D50}\u{675F}\u{65E5}\u{671F}\u{4E4B}\u{524D}\u{3002}`,
  "rangeUnderflow": (args)=>`\u{503C}\u{5FC5}\u{9808}\u{662F} ${args.minValue} \u{6216}\u{66F4}\u{665A}\u{3002}`,
  "unavailableDate": `\u{6240}\u{9078}\u{65E5}\u{671F}\u{7121}\u{6CD5}\u{4F7F}\u{7528}\u{3002}`
  },
};

const DEFAULT_LOCALE = "en-US";

function getMessageForLocale(
  key: DateFieldErrorKey,
  locale: string,
): DateFieldErrorMessage {
  const exact = errorStrings[locale];
  if (exact && exact[key] != null) return exact[key];

  const language = locale.split("-")[0];
  const match = Object.keys(errorStrings).find((l) => l.split("-")[0] === language);
  if (match && errorStrings[match][key] != null) return errorStrings[match][key];

  return errorStrings[DEFAULT_LOCALE][key];
}

/** Mirrors LocalizedStringFormatter.format for the datepicker validation messages. */
export function formatDateFieldError(
  locale: string,
  key: DateFieldErrorKey,
  args?: DateFieldErrorArgs,
): string {
  const message = getMessageForLocale(key, locale);
  return typeof message === "function" ? message(args ?? {}) : message;
}

// ---------------------------------------------------------------------------
// Placeholder-text catalog, ported verbatim from @react-stately/datepicker's
// placeholders.ts. Based on the <input type="date"> placeholders used by Chrome
// and Firefox; more languages than React Spectrum's usual translations. Default
// locale is "en".
// ---------------------------------------------------------------------------

const placeholderStrings: Record<string, { year: string; month: string; day: string }> = {
  ach: { year: "mwaka", month: "dwe", day: "nino" },
  af: { year: "jjjj", month: "mm", day: "dd" },
  am: { year: "ዓዓዓዓ", month: "ሚሜ", day: "ቀቀ" },
  an: { year: "aaaa", month: "mm", day: "dd" },
  ar: { year: "سنة", month: "شهر", day: "يوم" },
  ast: { year: "aaaa", month: "mm", day: "dd" },
  az: { year: "iiii", month: "aa", day: "gg" },
  be: { year: "гггг", month: "мм", day: "дд" },
  bg: { year: "гггг", month: "мм", day: "дд" },
  bn: { year: "yyyy", month: "মিমি", day: "dd" },
  br: { year: "bbbb", month: "mm", day: "dd" },
  bs: { year: "gggg", month: "mm", day: "dd" },
  ca: { year: "aaaa", month: "mm", day: "dd" },
  cak: { year: "jjjj", month: "ii", day: "q'q'" },
  ckb: { year: "ساڵ", month: "مانگ", day: "ڕۆژ" },
  cs: { year: "rrrr", month: "mm", day: "dd" },
  cy: { year: "bbbb", month: "mm", day: "dd" },
  da: { year: "åååå", month: "mm", day: "dd" },
  de: { year: "jjjj", month: "mm", day: "tt" },
  dsb: { year: "llll", month: "mm", day: "źź" },
  el: { year: "εεεε", month: "μμ", day: "ηη" },
  en: { year: "yyyy", month: "mm", day: "dd" },
  eo: { year: "jjjj", month: "mm", day: "tt" },
  es: { year: "aaaa", month: "mm", day: "dd" },
  et: { year: "aaaa", month: "kk", day: "pp" },
  eu: { year: "uuuu", month: "hh", day: "ee" },
  fa: { year: "سال", month: "ماه", day: "روز" },
  ff: { year: "hhhh", month: "ll", day: "ññ" },
  fi: { year: "vvvv", month: "kk", day: "pp" },
  fr: { year: "aaaa", month: "mm", day: "jj" },
  fy: { year: "jjjj", month: "mm", day: "dd" },
  ga: { year: "bbbb", month: "mm", day: "ll" },
  gd: { year: "bbbb", month: "mm", day: "ll" },
  gl: { year: "aaaa", month: "mm", day: "dd" },
  he: { year: "שנה", month: "חודש", day: "יום" },
  hr: { year: "gggg", month: "mm", day: "dd" },
  hsb: { year: "llll", month: "mm", day: "dd" },
  hu: { year: "éééé", month: "hh", day: "nn" },
  ia: { year: "aaaa", month: "mm", day: "dd" },
  id: { year: "tttt", month: "bb", day: "hh" },
  is: { year: "áááá", month: "mm", day: "dd" },
  it: { year: "aaaa", month: "mm", day: "gg" },
  ja: { year: "年", month: "月", day: "日" },
  ka: { year: "წწწწ", month: "თთ", day: "რრ" },
  kk: { year: "жжжж", month: "аа", day: "кк" },
  kn: { year: "ವವವವ", month: "ಮಿಮೀ", day: "ದಿದಿ" },
  ko: { year: "연도", month: "월", day: "일" },
  lb: { year: "jjjj", month: "mm", day: "dd" },
  lo: { year: "ປປປປ", month: "ດດ", day: "ວວ" },
  lt: { year: "mmmm", month: "mm", day: "dd" },
  lv: { year: "gggg", month: "mm", day: "dd" },
  meh: { year: "aaaa", month: "mm", day: "dd" },
  ml: { year: "വർഷം", month: "മാസം", day: "തീയതി" },
  ms: { year: "tttt", month: "mm", day: "hh" },
  nb: { year: "åååå", month: "mm", day: "dd" },
  nl: { year: "jjjj", month: "mm", day: "dd" },
  nn: { year: "åååå", month: "mm", day: "dd" },
  no: { year: "åååå", month: "mm", day: "dd" },
  oc: { year: "aaaa", month: "mm", day: "jj" },
  pl: { year: "rrrr", month: "mm", day: "dd" },
  pt: { year: "aaaa", month: "mm", day: "dd" },
  rm: { year: "oooo", month: "mm", day: "dd" },
  ro: { year: "aaaa", month: "ll", day: "zz" },
  ru: { year: "гггг", month: "мм", day: "дд" },
  sc: { year: "aaaa", month: "mm", day: "dd" },
  scn: { year: "aaaa", month: "mm", day: "jj" },
  sk: { year: "rrrr", month: "mm", day: "dd" },
  sl: { year: "llll", month: "mm", day: "dd" },
  sr: { year: "гггг", month: "мм", day: "дд" },
  "sr-Latn": { year: "gggg", month: "mm", day: "dd" },
  sv: { year: "åååå", month: "mm", day: "dd" },
  szl: { year: "rrrr", month: "mm", day: "dd" },
  tg: { year: "сссс", month: "мм", day: "рр" },
  th: { year: "ปปปป", month: "ดด", day: "วว" },
  tr: { year: "yyyy", month: "aa", day: "gg" },
  uk: { year: "рррр", month: "мм", day: "дд" },
  "zh-CN": { year: "年", month: "月", day: "日" },
  "zh-TW": { year: "年", month: "月", day: "日" },
};

const PLACEHOLDER_DEFAULT_LOCALE = "en";

function getPlaceholderStringForLocale(field: "year" | "month" | "day", locale: string): string {
  const exact = placeholderStrings[locale];
  if (exact) return exact[field];

  const language = locale.split("-")[0];
  const direct = placeholderStrings[language];
  if (direct) return direct[field];

  const scan = Object.keys(placeholderStrings).find((l) => l.split("-")[0] === language);
  if (scan) return placeholderStrings[scan][field];

  return placeholderStrings[PLACEHOLDER_DEFAULT_LOCALE][field];
}

/** Mirrors @react-stately/datepicker getPlaceholder. */
export function getPlaceholder(field: string, value: string, locale: string): string {
  // Use the actual placeholder value for the era and day period fields.
  if (field === "era" || field === "dayPeriod") {
    return value;
  }

  if (field === "year" || field === "month" || field === "day") {
    return getPlaceholderStringForLocale(field, locale);
  }

  // For time fields (e.g. hour, minute, etc.), use two dashes as the placeholder.
  return "––";
}
