---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Upstream/local source map

Authority order: local installed `@react-spectrum/s2@1.3.0` for styled/API S2; `react-aria-components@1.17.0` for component composition; `react-aria@3.48.0` for ARIA/focus/keyboard; `react-stately@3.46.0` for state; vendored `apps/comparison/vendor/s2-docs` for docs/viewer examples and prop tables.

| Component | Slug | Local implementation seeds | Upstream S2 seeds | RAC / RA / RS hints | Route | Notes | Tests |
|---|---|---:|---:|---|---|---|---:|
| Accordion | `accordion` | 2 | 7 | RAC 0, RA 0, RS 0 | yes | `accordion-validation-notes.md` | 2 |
| ActionBar | `actionbar` | 4 | 7 | RAC 0, RA 0, RS 0 | yes | `actionbar-validation-notes.md` | 2 |
| ActionButton | `actionbutton` | 4 | 10 | RAC 1, RA 1, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 1 |
| ActionButtonGroup | `actionbuttongroup` | 1 | 7 | RAC 2, RA 1, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 0 |
| ActionMenu | `actionmenu` | 3 | 6 | RAC 1, RA 1, RS 0 | yes | `actionmenu-validation-notes.md` | 2 |
| Avatar | `avatar` | 3 | 10 | RAC 0, RA 0, RS 0 | yes | `avatar-validation-notes.md` | 2 |
| AvatarGroup | `avatargroup` | 1 | 7 | RAC 1, RA 0, RS 0 | yes | `avatargroup-validation-notes.md` | 0 |
| Badge | `badge` | 3 | 10 | RAC 0, RA 0, RS 0 | yes | `badge-validation-notes.md` | 1 |
| Breadcrumbs | `breadcrumbs` | 8 | 7 | RAC 1, RA 1, RS 0 | yes | `breadcrumbs-validation-notes.md` | 2 |
| Button | `button` | 10 | 10 | RAC 3, RA 3, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 6 |
| ButtonGroup | `buttongroup` | 1 | 7 | RAC 3, RA 2, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 0 |
| Calendar | `calendar` | 10 | 10 | RAC 2, RA 2, RS 2 | yes | `calendar-validation-notes.md` | 3 |
| Card | `card` | 5 | 10 | RAC 0, RA 0, RS 0 | yes | `card-cardview-validation-notes.md` | 1 |
| CardView | `cardview` | 3 | 7 | RAC 0, RA 0, RS 0 | yes | missing | 1 |
| Checkbox | `checkbox` | 10 | 10 | RAC 2, RA 2, RS 1 | yes | `checkbox-validation-notes.md` | 2 |
| CheckboxGroup | `checkboxgroup` | 0 | 7 | RAC 3, RA 2, RS 1 | yes | `checkboxgroup-validation-notes.md` | 1 |
| ColorArea | `colorarea` | 1 | 7 | RAC 1, RA 1, RS 2 | yes | `colorarea-validation-notes.md` | 1 |
| ColorField | `colorfield` | 2 | 7 | RAC 1, RA 2, RS 2 | yes | `colorfield-validation-notes.md` | 1 |
| ColorSlider | `colorslider` | 1 | 7 | RAC 2, RA 3, RS 2 | yes | `colorslider-validation-notes.md` | 1 |
| ColorSwatch | `colorswatch` | 5 | 10 | RAC 2, RA 1, RS 1 | yes | `colorswatch-validation-notes.md` | 2 |
| ColorSwatchPicker | `colorswatchpicker` | 3 | 7 | RAC 2, RA 1, RS 1 | yes | `colorswatchpicker-validation-notes.md` | 1 |
| ColorWheel | `colorwheel` | 1 | 7 | RAC 1, RA 1, RS 2 | yes | `colorwheel-validation-notes.md` | 1 |
| ComboBox | `combobox` | 10 | 7 | RAC 1, RA 1, RS 1 | yes | `combobox-validation-notes.md` | 1 |
| ContextualHelp | `contextualhelp` | 5 | 7 | RAC 1, RA 0, RS 0 | yes | `contextualhelp-validation-notes.md` | 1 |
| DateField | `datefield` | 4 | 7 | RAC 1, RA 2, RS 1 | yes | `datefield-validation-notes.md` | 1 |
| DatePicker | `datepicker` | 10 | 7 | RAC 1, RA 1, RS 1 | yes | `datepicker-validation-notes.md` | 1 |
| DateRangePicker | `daterangepicker` | 4 | 7 | RAC 1, RA 1, RS 1 | yes | `daterangepicker-validation-notes.md` | 1 |
| Dialog | `dialog` | 10 | 10 | RAC 1, RA 1, RS 0 | yes | `dialog-validation-notes.md` | 1 |
| Disclosure | `disclosure` | 10 | 7 | RAC 2, RA 1, RS 2 | yes | `disclosure-validation-notes.md` | 1 |
| Divider | `divider` | 2 | 7 | RAC 0, RA 1, RS 0 | yes | `divider-validation-notes.md` | 1 |
| DropZone | `dropzone` | 4 | 7 | RAC 1, RA 1, RS 0 | yes | `dropzone-validation-notes.md` | 1 |
| Form | `form` | 10 | 7 | RAC 1, RA 4, RS 0 | yes | `form-validation-notes.md` | 1 |
| Icons | `icons` | 2 | 10 | RAC 0, RA 0, RS 0 | no | missing | 0 |
| IllustratedMessage | `illustratedmessage` | 2 | 7 | RAC 0, RA 0, RS 0 | no | `illustratedmessage-validation-notes.md` | 0 |
| Illustrations | `illustrations` | 0 | 10 | RAC 0, RA 0, RS 0 | no | missing | 0 |
| Image | `image` | 6 | 10 | RAC 0, RA 0, RS 0 | yes | `image-validation-notes.md` | 1 |
| InlineAlert | `inlinealert` | 2 | 7 | RAC 0, RA 0, RS 0 | yes | `inlinealert-validation-notes.md` | 0 |
| Link | `link` | 10 | 10 | RAC 1, RA 1, RS 0 | yes | `link-validation-notes.md` | 1 |
| LinkButton | `linkbutton` | 3 | 3 | RAC 2, RA 2, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 0 |
| ListView | `listview` | 2 | 7 | RAC 0, RA 0, RS 0 | yes | `listview-validation-notes.md` | 1 |
| Menu | `menu` | 10 | 9 | RAC 1, RA 1, RS 1 | yes | `menu-validation-notes.md` | 4 |
| Meter | `meter` | 6 | 7 | RAC 1, RA 1, RS 0 | yes | `meter-validation-notes.md` | 1 |
| NumberField | `numberfield` | 10 | 7 | RAC 1, RA 2, RS 1 | yes | `numberfield-validation-notes.md` | 1 |
| Picker | `picker` | 6 | 7 | RAC 4, RA 2, RS 3 | yes | `picker-validation-notes.md` | 4 |
| Popover | `popover` | 7 | 7 | RAC 1, RA 1, RS 0 | yes | `popover-validation-notes.md` | 0 |
| ProgressBar | `progressbar` | 3 | 7 | RAC 1, RA 1, RS 0 | yes | `progressbar-validation-notes.md` | 0 |
| ProgressCircle | `progresscircle` | 2 | 7 | RAC 0, RA 0, RS 0 | yes | `progresscircle-validation-notes.md` | 0 |
| Provider | `provider` | 4 | 7 | RAC 1, RA 4, RS 0 | yes | `provider-validation-notes.md` | 0 |
| RadioGroup | `radiogroup` | 2 | 7 | RAC 2, RA 1, RS 1 | yes | `radiogroup-validation-notes.md` | 1 |
| RangeCalendar | `rangecalendar` | 5 | 7 | RAC 2, RA 2, RS 1 | yes | `rangecalendar-validation-notes.md` | 1 |
| RangeSlider | `rangeslider` | 2 | 6 | RAC 1, RA 2, RS 0 | yes | `rangeslider-validation-notes.md` | 1 |
| SearchField | `searchfield` | 10 | 7 | RAC 1, RA 2, RS 1 | yes | `searchfield-validation-notes.md` | 1 |
| SegmentedControl | `segmentedcontrol` | 4 | 7 | RAC 0, RA 0, RS 0 | yes | `segmentedcontrol-validation-notes.md` | 0 |
| SelectBoxGroup | `selectboxgroup` | 2 | 7 | RAC 2, RA 1, RS 0 | yes | `selectboxgroup-validation-notes.md` | 0 |
| Skeleton | `skeleton` | 2 | 10 | RAC 0, RA 0, RS 0 | yes | `skeleton-validation-notes.md` | 1 |
| Slider | `slider` | 10 | 7 | RAC 2, RA 3, RS 2 | yes | `slider-validation-notes.md` | 3 |
| StatusLight | `statuslight` | 2 | 7 | RAC 0, RA 0, RS 0 | yes | `statuslight-validation-notes.md` | 1 |
| Switch | `switch` | 10 | 10 | RAC 1, RA 1, RS 0 | yes | `switch-validation-notes.md` | 1 |
| TableView | `tableview` | 0 | 7 | RAC 1, RA 1, RS 0 | yes | `tableview-validation-notes.md` | 1 |
| Tabs | `tabs` | 10 | 10 | RAC 1, RA 0, RS 0 | yes | `tabs-validation-notes.md` | 1 |
| TagGroup | `taggroup` | 3 | 7 | RAC 2, RA 1, RS 0 | yes | `taggroup-validation-notes.md` | 1 |
| TextArea | `textarea` | 4 | 3 | RAC 2, RA 0, RS 0 | no | `textarea-validation-notes.md` | 1 |
| TextField | `textfield` | 10 | 7 | RAC 2, RA 2, RS 0 | yes | `textfield-validation-notes.md` | 1 |
| TimeField | `timefield` | 4 | 7 | RAC 1, RA 2, RS 1 | yes | `timefield-validation-notes.md` | 1 |
| Toast | `toast` | 10 | 10 | RAC 1, RA 1, RS 1 | no | `toast-validation-notes.md` | 1 |
| ToggleButton | `togglebutton` | 8 | 10 | RAC 3, RA 3, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 0 |
| ToggleButtonGroup | `togglebuttongroup` | 4 | 6 | RAC 4, RA 3, RS 0 | yes | `button-family-validation-notes.md`<br>`button-validation-notes.md`<br>`togglebutton-validation-notes.md`<br>`togglebuttongroup-validation-notes.md` | 0 |
| Tooltip | `tooltip` | 10 | 7 | RAC 1, RA 1, RS 1 | yes | `tooltip-validation-notes.md` | 1 |
| TreeView | `treeview` | 1 | 7 | RAC 1, RA 1, RS 0 | yes | `treeview-validation-notes.md` | 1 |
