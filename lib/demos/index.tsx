import type { ComponentType } from "react";
import { AccordionDemo } from "./accordion-demo";
import { BlurUpImageDemo } from "./blur-up-image-demo";
import { BottomSheetDemo } from "./bottom-sheet-demo";
import { CollapsibleBannerDemo } from "./collapsible-banner-demo";
import { CommandPaletteDemo } from "./command-palette-demo";
import { ContextMenuDemo } from "./context-menu-demo";
import { CopyButtonDemo } from "./copy-button-demo";
import { DrawerDemo } from "./drawer-demo";
import { DropdownDemo } from "./dropdown-demo";
import { ExpandingSearchDemo } from "./expanding-search-demo";
import { FilterGridDemo } from "./filter-grid-demo";
import { FloatingLabelDemo } from "./floating-label-demo";
import { HideOnScrollDemo } from "./hide-on-scroll-demo";
import { HoldToConfirmDemo } from "./hold-to-confirm-demo";
import { IconMorphDemo } from "./icon-morph-demo";
import { InlineValidationDemo } from "./inline-validation-demo";
import { LightboxDemo } from "./lightbox-demo";
import { LikeBurstDemo } from "./like-burst-demo";
import { LoadMoreDemo } from "./load-more-demo";
import { LoadingButtonDemo } from "./loading-button-demo";
import { LogoMarqueeDemo } from "./logo-marquee-demo";
import { LongPressDemo } from "./long-press-demo";
import { ModalDemo } from "./modal-demo";
import { NewItemsPillDemo } from "./new-items-pill-demo";
import { OtpInputDemo } from "./otp-input-demo";
import { PaginationDemo } from "./pagination-demo";
import { PasswordStrengthDemo } from "./password-strength-demo";
import { PollResultsDemo } from "./poll-results-demo";
import { PopoverDemo } from "./popover-demo";
import { PresenceAvatarsDemo } from "./presence-avatars-demo";
import { PressDepthDemo } from "./press-depth-demo";
import { ProgressBarDemo } from "./progress-bar-demo";
import { ReadingProgressDemo } from "./reading-progress-demo";
import { RippleDemo } from "./ripple-demo";
import { ScrollSpyDemo } from "./scroll-spy-demo";
import { SegmentedControlDemo } from "./segmented-control-demo";
import { ShowMoreDemo } from "./show-more-demo";
import { SkeletonSwapDemo } from "./skeleton-swap-demo";
import { SliderDetentsDemo } from "./slider-detents-demo";
import { SnapCarouselDemo } from "./snap-carousel-demo";
import { SortableTableDemo } from "./sortable-table-demo";
import { StickyHeaderDemo } from "./sticky-header-demo";
import { StreamingTextDemo } from "./streaming-text-demo";
import { ReorderListDemo } from "./reorder-list-demo";
import { SwipeDeckDemo } from "./swipe-deck-demo";
import { TabsDemo } from "./tabs-demo";
import { TagInputDemo } from "./tag-input-demo";
import { TaskStepsDemo } from "./task-steps-demo";
import { TextRevealDemo } from "./text-reveal-demo";
import { ToastStackDemo } from "./toast-stack-demo";
import { TooltipGroupDemo } from "./tooltip-group-demo";
import { TreeViewDemo } from "./tree-view-demo";
import { TypingIndicatorDemo } from "./typing-indicator-demo";
import { ValueFlashDemo } from "./value-flash-demo";
import { WizardStepsDemo } from "./wizard-steps-demo";

export const bleedDemos = new Set<string>([
  "load-more",
  "new-items-pill",
  "popover",
  "toast-stack",
  "typing-indicator",
]);

export const demos: Record<string, ComponentType> = {
  "accordion": AccordionDemo,
  "blur-up-image": BlurUpImageDemo,
  "bottom-sheet": BottomSheetDemo,
  "collapsible-banner": CollapsibleBannerDemo,
  "command-palette": CommandPaletteDemo,
  "context-menu": ContextMenuDemo,
  "copy-button": CopyButtonDemo,
  "drawer": DrawerDemo,
  "dropdown": DropdownDemo,
  "expanding-search": ExpandingSearchDemo,
  "filter-grid": FilterGridDemo,
  "floating-label": FloatingLabelDemo,
  "hide-on-scroll": HideOnScrollDemo,
  "hold-to-confirm": HoldToConfirmDemo,
  "icon-morph": IconMorphDemo,
  "inline-validation": InlineValidationDemo,
  "lightbox": LightboxDemo,
  "like-burst": LikeBurstDemo,
  "load-more": LoadMoreDemo,
  "loading-button": LoadingButtonDemo,
  "logo-marquee": LogoMarqueeDemo,
  "long-press": LongPressDemo,
  "modal": ModalDemo,
  "new-items-pill": NewItemsPillDemo,
  "otp-input": OtpInputDemo,
  "pagination": PaginationDemo,
  "password-strength": PasswordStrengthDemo,
  "poll-results": PollResultsDemo,
  "popover": PopoverDemo,
  "presence-avatars": PresenceAvatarsDemo,
  "press-depth": PressDepthDemo,
  "progress-bar": ProgressBarDemo,
  "reading-progress": ReadingProgressDemo,
  "ripple": RippleDemo,
  "scroll-spy": ScrollSpyDemo,
  "segmented-control": SegmentedControlDemo,
  "show-more": ShowMoreDemo,
  "skeleton-swap": SkeletonSwapDemo,
  "slider-detents": SliderDetentsDemo,
  "snap-carousel": SnapCarouselDemo,
  "sortable-table": SortableTableDemo,
  "sticky-header": StickyHeaderDemo,
  "streaming-text": StreamingTextDemo,
  "reorder-list": ReorderListDemo,
  "swipe-deck": SwipeDeckDemo,
  "tabs": TabsDemo,
  "tag-input": TagInputDemo,
  "task-steps": TaskStepsDemo,
  "text-reveal": TextRevealDemo,
  "toast-stack": ToastStackDemo,
  "tooltip-group": TooltipGroupDemo,
  "tree-view": TreeViewDemo,
  "typing-indicator": TypingIndicatorDemo,
  "value-flash": ValueFlashDemo,
  "wizard-steps": WizardStepsDemo,
};
