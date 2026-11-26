// Quotes supplied by the author from the launch conversation; excerpts are marked.
// Public profile names and images checked through api.fxtwitter.com on 2026-09-10.
// Images are local snapshots so the landing doesn't depend on X at render time.
export const LAUNCH_POST = "https://x.com/ozzyxs1a/status/2082917975141613811";
export const LIBRARY_FEATURE = "https://21st.dev/@ddoemonn/library/interior-dev";
// OrcDev, "4 Open Source Tools That Feel Illegal To Be Free"; the link opens at the part about interior.
export const VIDEO_FEATURE = "https://www.youtube.com/watch?v=ZeXz1CHnCFg&t=368s";

export const testimonials = [
  {
    name: "Andrius 🇱🇹",
    handle: "kilnuslt",
    quote: "…but this one provides really useful components that you don't see everywhere else. Good job.",
    excerpt: true,
    avatarSource: "https://pbs.twimg.com/profile_images/2069050046176202752/hkWxp5rc_normal.jpg",
  },
  {
    name: "Nabin Khair",
    handle: "khairnabin",
    quote: "time to bookmark",
    excerpt: false,
    avatarSource: "https://pbs.twimg.com/profile_images/2084642106119962624/4NRFh2Pp_normal.jpg",
  },
  {
    name: "K I R A N",
    handle: "thedvlpr",
    quote: "This looks really nice.",
    excerpt: false,
    avatarSource: "https://pbs.twimg.com/profile_images/1834852772266885120/-dSxFK8__normal.jpg",
  },
  {
    name: "Zohair Ajmal",
    handle: "zohairx2",
    quote: "Such a clean design it is.",
    excerpt: true,
    avatarSource: "https://pbs.twimg.com/profile_images/2053172216960069632/lY2WJVf2_normal.jpg",
  },
  {
    name: "qcore",
    handle: "qwrurodhs",
    quote: "thank you, clear and beautifully work!",
    excerpt: false,
    avatarSource: "https://pbs.twimg.com/profile_images/2077436159693635584/HuVJDbgu_normal.jpg",
  },
  {
    name: "John",
    handle: "johnbuildss",
    quote: "tbh this pure gold!",
    excerpt: false,
    avatarSource: "https://pbs.twimg.com/profile_images/2004616282079887360/Cup1BQJR_normal.jpg",
  },
] as const;

// Verbatim short reactions/excerpts from the supplied launch replies.
// Handles retain provenance without displaying names or avatars.
export const reactions = [
  { handle: "johnbuildss", quote: "tbh this pure gold!" },
  { handle: "zohairx2", quote: "Such a clean design it is." },
  { handle: "khairnabin", quote: "time to bookmark" },
  { handle: "LaireLaFlare", quote: "beaut." },
  { handle: "prajwalkpatil", quote: "Feels smooth!" },
  { handle: "kamellperry_", quote: "This is gonna be good" },
  { handle: "qwrurodhs", quote: "thank you, clear and beautifully work!" },
  { handle: "Andev_kyn", quote: "Crazy work keep going!🔥" },
  { handle: "EgorSelivanov", quote: "Amazing work!" },
  { handle: "rakibprodev", quote: "nice, you just got a follow!" },
  { handle: "koushik406", quote: "looks good" },
  { handle: "thedvlpr", quote: "This looks really nice." },
  { handle: "tarun_soni_", quote: "Good stuff" },
  { handle: "PierreHenryBap", quote: "Looks nice." },
] as const;
