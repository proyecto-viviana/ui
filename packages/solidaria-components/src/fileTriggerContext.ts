import { createContext } from "solid-js";

// Private cooperation between FileTrigger and Button. Raw children keep the
// wrapper press path; registered Button roots own their native press events.
export const FileTriggerContext = createContext<{
  open: () => void;
  register: (element: HTMLElement) => () => void;
} | null>(null);
