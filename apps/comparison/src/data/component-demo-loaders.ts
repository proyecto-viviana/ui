/** Per-slug demo module loaders. Catalogue/hero import keys only — never call these for every slug. */

function mergeDemoModules<A extends object, B extends object>(a: A, b: B): A & B {
  return Object.assign({}, a, b);
}

function mergeThreeDemoModules<A extends object, B extends object, C extends object>(
  a: A,
  b: B,
  c: C,
): A & B & C {
  return Object.assign({}, a, b, c);
}

export const componentDemoLoaders = {
  provider: () => import("./provider-demo"),
  button: () => import("./button-demo"),
  card: () => import("./card-demo"),
  accordion: () => import("./accordion-demo"),
  disclosure: () => import("./disclosure-demo"),
  actionbar: () => import("./actionbar-demo"),
  actionmenu: () => import("./actionmenu-demo"),
  menu: () => import("./menu-demo"),
  breadcrumbs: () => import("./breadcrumbs-demo"),
  checkbox: () => import("./checkbox-demo"),
  checkboxgroup: () => import("./checkboxgroup-demo"),
  switch: () => import("./switch-demo"),
  tabs: () => import("./tabs-demo"),
  avatar: () => import("./avatar-demo"),
  avatargroup: () => import("./avatar-group-demo"),
  image: () => import("./image-demo"),
  skeleton: () => import("./skeleton-demo"),
  link: () => import("./link-demo"),
  badge: () => import("./badge-demo"),
  statuslight: () => import("./statuslight-demo"),
  divider: () => import("./divider-demo"),
  dropzone: () => import("./dropzone-demo"),
  illustratedmessage: () => import("./illustratedmessage-demo"),
  icons: () => import("./icons-demo"),
  illustrations: () => import("./illustrations-demo"),
  inlinealert: () => import("./inlinealert-demo"),
  meter: () => import("./meter-demo"),
  progressbar: () => import("./progress-demo"),
  progresscircle: () => import("./progress-demo"),
  form: () => import("./form-demo"),
  radiogroup: () => import("./radiogroup-demo"),
  numberfield: () => import("./numberfield-demo"),
  colorarea: () => import("./colorarea-demo"),
  colorslider: () => import("./colorslider-demo"),
  colorwheel: () => import("./colorwheel-demo"),
  colorswatch: () => import("./colorswatch-demo"),
  colorswatchpicker: () => import("./colorswatchpicker-demo"),
  colorfield: () => import("./colorfield-demo"),
  rangeslider: () => import("./rangeslider-demo"),
  slider: () => import("./slider-demo"),
  textfield: () => import("./textfield-demo"),
  searchfield: () => import("./searchfield-demo"),
  textarea: () => import("./textarea-demo"),
  dialog: () => import("./dialog-demo"),
  picker: () => import("./picker-demo"),
  combobox: () => import("./combobox-demo"),
  datefield: () => import("./datefield-demo"),
  timefield: () => import("./timefield-demo"),
  datepicker: () => import("./datepicker-demo"),
  daterangepicker: () => import("./daterangepicker-demo"),
  rangecalendar: () => import("./rangecalendar-demo"),
  calendar: () => import("./calendar-demo"),
  actionbutton: () => import("./actionbutton-demo"),
  linkbutton: () =>
    Promise.all([import("./button-demo"), import("./button-family-demo")]).then(([a, b]) =>
      mergeDemoModules(a, b),
    ),
  togglebutton: () =>
    Promise.all([
      import("./actionbutton-demo"),
      import("./button-demo"),
      import("./button-family-demo"),
    ]).then(([a, b, c]) => mergeThreeDemoModules(a, b, c)),
  actionbuttongroup: () =>
    Promise.all([import("./actionbutton-demo"), import("./button-family-demo")]).then(([a, b]) =>
      mergeDemoModules(a, b),
    ),
  buttongroup: () =>
    Promise.all([import("./button-demo"), import("./button-family-demo")]).then(([a, b]) =>
      mergeDemoModules(a, b),
    ),
  togglebuttongroup: () =>
    Promise.all([
      import("./actionbutton-demo"),
      import("./button-demo"),
      import("./button-family-demo"),
    ]).then(([a, b, c]) => mergeThreeDemoModules(a, b, c)),
  segmentedcontrol: () => import("./segmentedcontrol-demo"),
  selectboxgroup: () => import("./selectboxgroup-demo"),
  taggroup: () => import("./taggroup-demo"),
  listview: () => import("./listview-demo"),
  treeview: () => import("./treeview-demo"),
  tableview: () => import("./tableview-demo"),
  cardview: () => import("./cardview-demo"),
  contextualhelp: () => import("./contextualhelp-demo"),
  popover: () => import("./popover-demo"),
  tooltip: () => import("./tooltip-demo"),
  toast: () => import("./toast-demo"),
} as const;

export type ComponentDemoLoaderSlug = keyof typeof componentDemoLoaders;

export function hasComponentControlGroup(slug: string): slug is ComponentDemoLoaderSlug {
  return Object.hasOwn(componentDemoLoaders, slug);
}
