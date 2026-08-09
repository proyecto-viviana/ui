/* /solid-spectrum layout route. Its two jobs are to load the package's own
   stylesheet and to put the whole subtree inside a Provider.

   @proyecto-viviana/solid-spectrum ships UNSTYLED: every component is painted by
   the S2 style() macro, whose atoms are collected into dist/styles.css at build
   time. Nothing in the app imported it. It is loaded here rather than at the root
   so it stays off the viviana-ui surfaces (landing, Theme Studio, /showcase),
   which paint from their own register.

   The Provider is not optional. lightningcss downlevels every light-dark() value
   in that stylesheet into a var() pair guarded by --lightningcss-light /
   --lightningcss-dark, and those two are only ever declared by the atoms
   setColorScheme() emits — which Provider is what applies. Without it both halves
   of the pair fall back at once and a fill like light-dark(#3b63fb, #345bf8)
   computes to the garbage "#3b63fb#345bf8", i.e. an invalid background-color,
   i.e. transparent. That is why every variant Button on the docs pages rendered
   as bare text. Its colorScheme tracks the site's own toggle so the two agree. */
import { Outlet, createFileRoute } from "@tanstack/solid-router";
import { Provider } from "@proyecto-viviana/solid-spectrum";
import spectrumStyles from "@proyecto-viviana/solid-spectrum/styles.css?url";
import { useTheme } from "@/utils/theme";

export const Route = createFileRoute("/solid-spectrum")({
  head: () => ({
    links: [{ rel: "stylesheet", href: spectrumStyles }],
  }),
  component: SolidSpectrumLayout,
});

function SolidSpectrumLayout() {
  const { isDark } = useTheme();
  return (
    <Provider
      colorScheme={isDark() ? "dark" : "light"}
      background="base"
      style={{ background: "transparent" }}
    >
      <Outlet />
    </Provider>
  );
}
