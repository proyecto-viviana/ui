import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
  type LocalizedStrings,
} from "@internationalized/string";

type CalendarPromptKey = "startRangeSelectionPrompt" | "finishRangeSelectionPrompt";
type CalendarLabelKey =
  | "dateRange"
  | "dateSelected"
  | "maximumDate"
  | "minimumDate"
  | "selectedDateDescription"
  | "selectedRangeDescription"
  | "todayDate"
  | "todayDateSelected";
type CalendarLabelVariables = {
  date?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
};
type CalendarLabelMessage = string | ((args: CalendarLabelVariables | undefined) => string);

const calendarPromptStrings: LocalizedStrings<CalendarPromptKey, string> = {
  "ar-AE": {
    startRangeSelectionPrompt: "انقر لبدء عملية تحديد نطاق التاريخ",
    finishRangeSelectionPrompt: "انقر لإنهاء عملية تحديد نطاق التاريخ",
  },
  "bg-BG": {
    startRangeSelectionPrompt: "Натиснете, за да пристъпите към избора на времеви интервал",
    finishRangeSelectionPrompt: "Натиснете, за да довършите избора на времеви интервал",
  },
  "cs-CZ": {
    startRangeSelectionPrompt: "Kliknutím zahájíte výběr rozsahu dat",
    finishRangeSelectionPrompt: "Kliknutím dokončíte výběr rozsahu dat",
  },
  "da-DK": {
    startRangeSelectionPrompt: "Klik for at starte valg af datoområde",
    finishRangeSelectionPrompt: "Klik for at fuldføre valg af datoområde",
  },
  "de-DE": {
    startRangeSelectionPrompt: "Klicken, um die Auswahl des Datumsbereichs zu beginnen",
    finishRangeSelectionPrompt: "Klicken, um die Auswahl des Datumsbereichs zu beenden",
  },
  "el-GR": {
    startRangeSelectionPrompt: "Κάντε κλικ για να ξεκινήσετε την επιλογή εύρους ημερομηνιών",
    finishRangeSelectionPrompt: "Κάντε κλικ για να ολοκληρώσετε την επιλογή εύρους ημερομηνιών",
  },
  "en-US": {
    startRangeSelectionPrompt: "Click to start selecting date range",
    finishRangeSelectionPrompt: "Click to finish selecting date range",
  },
  "es-ES": {
    startRangeSelectionPrompt: "Haga clic para comenzar a seleccionar un rango de fechas",
    finishRangeSelectionPrompt: "Haga clic para terminar de seleccionar rango de fechas",
  },
  "et-EE": {
    startRangeSelectionPrompt: "Klõpsake kuupäevavahemiku valimiseks",
    finishRangeSelectionPrompt: "Klõpsake kuupäevavahemiku valimise lõpetamiseks",
  },
  "fi-FI": {
    startRangeSelectionPrompt: "Aloita päivämääräalueen valinta napsauttamalla tätä.",
    finishRangeSelectionPrompt: "Lopeta päivämääräalueen valinta napsauttamalla tätä.",
  },
  "fr-FR": {
    startRangeSelectionPrompt: "Cliquer pour commencer à sélectionner la plage de dates",
    finishRangeSelectionPrompt: "Cliquer pour finir de sélectionner la plage de dates",
  },
  "he-IL": {
    startRangeSelectionPrompt: "לחץ כדי להתחיל בבחירת טווח התאריכים",
    finishRangeSelectionPrompt: "חץ כדי לסיים את בחירת טווח התאריכים",
  },
  "hr-HR": {
    startRangeSelectionPrompt: "Kliknite da započnete raspon odabranih datuma",
    finishRangeSelectionPrompt: "Kliknite da dovršite raspon odabranih datuma",
  },
  "hu-HU": {
    startRangeSelectionPrompt: "Kattintson a dátumtartomány kijelölésének indításához",
    finishRangeSelectionPrompt: "Kattintson a dátumtartomány kijelölésének befejezéséhez",
  },
  "it-IT": {
    startRangeSelectionPrompt: "Fai clic per selezionare l’intervallo di date",
    finishRangeSelectionPrompt: "Fai clic per completare la selezione dell’intervallo di date",
  },
  "ja-JP": {
    startRangeSelectionPrompt: "クリックして日付範囲の選択を開始",
    finishRangeSelectionPrompt: "クリックして日付範囲の選択を終了",
  },
  "ko-KR": {
    startRangeSelectionPrompt: "날짜 범위 선택을 시작하려면 클릭하십시오.",
    finishRangeSelectionPrompt: "날짜 범위 선택을 완료하려면 클릭하십시오.",
  },
  "lt-LT": {
    startRangeSelectionPrompt: "Spustelėkite, kad pradėtumėte pasirinkti datų intervalą",
    finishRangeSelectionPrompt: "Spustelėkite, kad baigtumėte pasirinkti datų intervalą",
  },
  "lv-LV": {
    startRangeSelectionPrompt: "Noklikšķiniet, lai sāktu datumu diapazona atlasi",
    finishRangeSelectionPrompt: "Noklikšķiniet, lai pabeigtu datumu diapazona atlasi",
  },
  "nb-NO": {
    startRangeSelectionPrompt: "Klikk for å starte valg av datoområde",
    finishRangeSelectionPrompt: "Klikk for å fullføre valg av datoområde",
  },
  "nl-NL": {
    startRangeSelectionPrompt: "Klik om het datumbereik te selecteren",
    finishRangeSelectionPrompt: "Klik om de selectie van het datumbereik te voltooien",
  },
  "pl-PL": {
    startRangeSelectionPrompt: "Kliknij, aby rozpocząć wybór zakresu dat",
    finishRangeSelectionPrompt: "Kliknij, aby zakończyć wybór zakresu dat",
  },
  "pt-BR": {
    startRangeSelectionPrompt: "Clique para iniciar a seleção do intervalo de datas",
    finishRangeSelectionPrompt: "Clique para concluir a seleção do intervalo de datas",
  },
  "pt-PT": {
    startRangeSelectionPrompt: "Clique para começar a selecionar o intervalo de datas",
    finishRangeSelectionPrompt: "Clique para terminar de selecionar o intervalo de datas",
  },
  "ro-RO": {
    startRangeSelectionPrompt: "Apăsaţi pentru a începe selecţia razei pentru dată",
    finishRangeSelectionPrompt: "Apăsaţi pentru a finaliza selecţia razei pentru dată",
  },
  "ru-RU": {
    startRangeSelectionPrompt: "Щелкните, чтобы начать выбор диапазона дат",
    finishRangeSelectionPrompt: "Щелкните, чтобы завершить выбор диапазона дат",
  },
  "sk-SK": {
    startRangeSelectionPrompt: "Kliknutím spustíte výber rozsahu dátumov",
    finishRangeSelectionPrompt: "Kliknutím dokončíte výber rozsahu dátumov",
  },
  "sl-SI": {
    startRangeSelectionPrompt: "Kliknite za začetek izbire datumskega obsega",
    finishRangeSelectionPrompt: "Kliknite za dokončanje izbire datumskega obsega",
  },
  "sr-SP": {
    startRangeSelectionPrompt: "Kliknite da započnete opseg izabranih datuma",
    finishRangeSelectionPrompt: "Kliknite da dovršite opseg izabranih datuma",
  },
  "sv-SE": {
    startRangeSelectionPrompt: "Klicka för att välja datumintervall",
    finishRangeSelectionPrompt: "Klicka för att avsluta val av datumintervall",
  },
  "tr-TR": {
    startRangeSelectionPrompt: "Tarih aralığı seçimini başlatmak için tıklayın",
    finishRangeSelectionPrompt: "Tarih aralığı seçimini tamamlamak için tıklayın",
  },
  "uk-UA": {
    startRangeSelectionPrompt: "Натисніть, щоб почати вибір діапазону дат",
    finishRangeSelectionPrompt: "Натисніть, щоб завершити вибір діапазону дат",
  },
  "zh-CN": {
    startRangeSelectionPrompt: "单击以开始选择日期范围",
    finishRangeSelectionPrompt: "单击以完成选择日期范围",
  },
  "zh-TW": {
    startRangeSelectionPrompt: "按一下以開始選取日期範圍",
    finishRangeSelectionPrompt: "按一下以完成選取日期範圍",
  },
};

const calendarPromptDictionary = new LocalizedStringDictionary(calendarPromptStrings);

const calendarLabelStrings: LocalizedStrings<CalendarLabelKey, CalendarLabelMessage> = {
  "en-US": {
    dateRange: (args) => `${args?.startDate} to ${args?.endDate}`,
    dateSelected: (args) => `${args?.date} selected`,
    maximumDate: "Last available date",
    minimumDate: "First available date",
    selectedDateDescription: (args) => `Selected Date: ${args?.date}`,
    selectedRangeDescription: (args) => `Selected Range: ${args?.dateRange}`,
    todayDate: (args) => `Today, ${args?.date}`,
    todayDateSelected: (args) => `Today, ${args?.date} selected`,
  },
  "fr-FR": {
    dateRange: (args) => `${args?.startDate} à ${args?.endDate}`,
    dateSelected: (args) => `${args?.date} sélectionné`,
    maximumDate: "Dernière date disponible",
    minimumDate: "Première date disponible",
    selectedDateDescription: (args) => `Date sélectionnée : ${args?.date}`,
    selectedRangeDescription: (args) => `Plage sélectionnée : ${args?.dateRange}`,
    todayDate: (args) => `Aujourd'hui, ${args?.date}`,
    todayDateSelected: (args) => `Aujourd’hui, ${args?.date} sélectionné`,
  },
  "ar-AE": {
    dateRange: (args) => `${args?.startDate} إلى ${args?.endDate}`,
    dateSelected: (args) => `${args?.date} المحدد`,
    maximumDate: "آخر تاريخ متاح",
    minimumDate: "أول تاريخ متاح",
    selectedDateDescription: (args) => `تاريخ محدد: ${args?.date}`,
    selectedRangeDescription: (args) => `المدى الزمني المحدد: ${args?.dateRange}`,
    todayDate: (args) => `اليوم، ${args?.date}`,
    todayDateSelected: (args) => `اليوم، ${args?.date} محدد`,
  },
};
const calendarLabelDictionary = new LocalizedStringDictionary(calendarLabelStrings);

export function formatCalendarPrompt(locale: string, key: CalendarPromptKey): string {
  return new LocalizedStringFormatter(locale, calendarPromptDictionary).format(key);
}

export function formatCalendarLabel(
  locale: string,
  key: CalendarLabelKey,
  variables?: CalendarLabelVariables,
): string {
  return new LocalizedStringFormatter(locale, calendarLabelDictionary).format(key, variables);
}
