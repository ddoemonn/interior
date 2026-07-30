# interior.dev — 80 Component

Kaynak: `lib/registry.ts` + `lib/registry.meta.ts` (tek doğruluk kaynağı).
Bir slug meta haritasında görünüyorsa component `ready` sayılır.

| # | Component | Çözdüğü problem |
|---|---|---|
| **01** | **ACTION FEEDBACK** | |
| 01.1 | Copy Button | Copy to tick, width locked, reverts after 2s |
| 01.2 | Loading Button | Label to state without layout shift |
| 01.3 | Hold to Confirm | A guard rail in front of destructive actions |
| 01.4 | Like Burst | Optimistic like that survives rapid taps |
| 01.5 | Ripple | Touch feedback from the pointer origin |
| 01.6 | Icon Morph | Play/pause, menu/close as one mechanism |
| 01.7 | Press Depth | The feeling that the press landed |
| **02** | **INPUT** | |
| 02.1 | Floating Label | The label makes room instead of disappearing |
| 02.2 | Inline Validation | Error message that does not shove the form |
| 02.3 | Password Strength | Strength read segment by segment |
| 02.4 | OTP Input | Auto advance, paste, error recovery |
| 02.5 | Tag Input | Enter adds, backspace highlights then removes |
| 02.6 | Expanding Search | Icon to field with focus handled |
| **03** | **ASYNC** | |
| 03.1 | Skeleton Swap | Skeleton to content with zero layout shift |
| 03.2 | Progress Bar | Indeterminate handing over to determinate |
| 03.3 | Load More | Sentinel that loads before you hit the end |
| 03.4 | Streaming Text | Token by token with a caret |
| 03.5 | Retry State | Error to retry without losing context |
| **04** | **NOTIFICATION** | |
| 04.1 | Toast Stack | Stacked, expands on hover, swipes away |
| 04.2 | Collapsible Banner | Folds to its title, or lets go entirely |
| 04.3 | Badge Odometer | The count rolls instead of blinking |
| 04.4 | Presence Avatars | Join and leave as a layout change |
| 04.5 | Typing Indicator | Someone is writing |
| 04.6 | New Items Pill | New content without stealing your scroll |
| **05** | **OVERLAY** | |
| 05.1 | Modal | Backdrop, scroll lock, focus trap |
| 05.2 | Bottom Sheet | Snap points driven by velocity |
| 05.3 | Popover | Knows its origin, flips on collision |
| 05.4 | Tooltip Group | Delayed once, instant after that |
| 05.5 | Command Palette | Results reorder as you type |
| 05.6 | Drawer | Side panel that keeps its place |
| 05.7 | Context Menu | Opens from the pointer, not the corner |
| 05.8 | Dropdown | Active highlight travels between items |
| **06** | **NAVIGATION** | |
| 06.1 | Tabs | One indicator shared across tabs |
| 06.2 | Segmented Control | Thumb slides, label inverts through it |
| 06.3 | Accordion | height auto, done correctly |
| 06.4 | Wizard Steps | Transition knows forward from back |
| 06.5 | Breadcrumb Collapse | Shortens without losing the path |
| **07** | **SCROLL** | |
| 07.1 | Sticky Header | Condenses as you go down |
| 07.2 | Reading Progress | How much is left |
| 07.3 | Scroll Spy | The section you are actually in |
| 07.4 | Snap Carousel | Momentum that lands on a slide |
| 07.5 | Hide on Scroll | Toolbar yields to the content |
| **08** | **DATA** | |
| 08.1 | Number Ticker | Digit columns roll to the new value |
| 08.2 | Animated Counter | Counts from zero to the value, formatting intact |
| 08.3 | Progress Frame | Stroke travels the perimeter, not a circle |
| 08.4 | Sortable Table | Rows travel to their new order |
| 08.5 | Filter Grid | Filtering rearranges, it does not blink |
| 08.6 | Value Flash | Marks what just changed |
| 08.7 | Bar Chart | Bars grow from their baseline |
| **09** | **GESTURE** | |
| 09.1 | Drag Reorder | Drag to sort, with the gap opening |
| 09.2 | Swipe Actions | Actions hidden under a list row |
| 09.3 | Slider Detents | Stops you can feel |
| 09.4 | Swipe Deck | A stack you decide through |
| 09.5 | Kanban Drag | Across columns without losing the card |
| 09.6 | Resizable Panels | Split view with a real handle |
| 09.7 | Long Press | Intent confirmed by time, and cancelled by everything else |
| 09.8 | Pinch Lightbox | Zoom that returns where it started |
| **10** | **CONTENT** | |
| 10.1 | Text Reveal | Words arrive in reading order |
| 10.2 | Logo Marquee | Stops when you look at it |
| 10.3 | Blur-up Image | Placeholder resolves into the photo |
| 10.4 | Show More | Height animates, text does not reflow |
| 10.5 | Code Block | Line highlight and copy |
| 10.6 | Before / After | Two states under one handle |
| 10.7 | Empty State | Nothing here, said well |

**İlerleme: 64 / 64**

Kaldırılanlar:
- **Sparkline** — bir grafik kütüphanesinin en küçük parçası, bir etkileşim değil. Çözdüğü tek problem "çizgi kendini çizsin", o da bir animasyon tercihi
- **Upload Dropzone** — sette en çok kod, en az çözülmüş problem. Bir kuyruk, bir transport sözleşmesi, bir drag hedefi ve satır başına progress; dördü de ayrı işler ve hiçbiri bu setin cevaplamak için var olduğu türden bir soru değil
- **Page Transition** — yarım saniyeyi tarayıcının varsayılan crossfade'ine devrediyordu; kendi girişini de o yüzden kapatıyordu. Geriye kalan şey bir `key` değişimi ve bir yükseklik animasyonu, ikisi de component olmayı hak etmiyor
- **Mobile Dock** — masaüstü bir dokümantasyon sitesinde denenemeyen, dolayısıyla doğrulanamayan bir mobil kabuk. Tabs + overflow menüsünden başka bir şey çözmüyordu
- **Expand to Detail** — `layoutId` ile büyüyen bir kart; altındaki her garanti zaten Modal'ın garantileri. İki giriş, tek problem
- **Live Dot** — bize gitmedi
- **Undo Snackbar** — geri alma penceresi kendi başına bir component değil; onu isteyen yer zaten bir toast ya da bir satır aksiyonu, ve ikisi de sette var
- **Stat Reveal** — ölçek ve caption gidince geriye kalan şey birebir Animated Counter; o da zaten `startOnView` ile geliyor. İki giriş, tek problem
- **Rotating Words** — DESIGN.md §3'ün yasakladığı boşta dönen döngü, süs için. Çözdüğü tek gerçek problem (kelime değişirken satır kaymasın) bir grid numarası, etkileşim değil
- **Parallax** — verdiği bütün garantiler, kimsenin istemediği bir dekorasyonun etrafına örülmüş savunma işi. En iyi yazılmış olanı, ve en silinebilir olanı
- **Reveal on View** — blur gidince geriye bir doğruluk sarmalayıcısı kalıyor; savunulabilir ama bir component'in taşıyacağından daha az
- **Save State** — aynı bilgiyi dört kanaldan söylüyordu, set zaten kalabalıktı
- **Character Counter** — animasyonu dile uymuyordu, ve sayaç zaten başka alanların içinde yaşıyor
- **Auto-grow Textarea** — yükseklik animasyonu ile imleç konumu her çözümde çakıştı; anında büyütmek doğru cevap ama o da ayrı bir component olmayı hak etmiyor
- **Optimistic Row** — bir satır + switch + geri alma; üçü de kendi başına başka component'lerin işi, ortada çözülen tek bir problem yoktu
- **Pull to Refresh** — mobil bir jest; masaüstü bir dokümantasyon sitesinde denenemiyor, dolayısıyla doğrulanamıyor
