import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-DOdXph7E.mjs";
import { i as TriangleAlert, s as Plane } from "../_libs/lucide-react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/i18n-CG9nqHv2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var APP_NAME = "ZiggyWizzAir";
function PlaneMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
			className: "size-[58%] -rotate-45",
			strokeWidth: 2.25,
			"aria-hidden": true
		})
	});
}
function TakeoffSplash({ overlay, caption = "Taking off" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center overflow-hidden bg-bg", overlay ? "absolute inset-0 z-50" : "h-dvh"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "takeoff-stage relative flex h-40 w-full items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "takeoff-contrail",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
				className: "takeoff-plane size-14 text-fg",
				strokeWidth: 1.75,
				"aria-hidden": true
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "takeoff-title mt-2 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold tracking-tight",
				children: APP_NAME
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xs text-muted",
				children: caption
			})]
		})]
	});
}
var LOCALES = [{
	id: "en",
	label: "English"
}, {
	id: "pl",
	label: "Polski"
}];
var catalog = {
	"login.tagline": {
		en: "Start in Demo on live prices. One click takes you live when you are ready.",
		pl: "Zaczynasz od wersji demo — wirtualne pieniądze, prawdziwe ceny. Potem jednym kliknięciem wchodzisz na swój prawdziwy portfel."
	},
	"login.orEmail": {
		en: "or email",
		pl: "albo e-mail"
	},
	"login.email": {
		en: "Email",
		pl: "E-mail"
	},
	"login.password": {
		en: "Password",
		pl: "Hasło"
	},
	"login.signIn": {
		en: "Sign in",
		pl: "Zaloguj się"
	},
	"login.createDesk": {
		en: "Create account",
		pl: "Załóż konto"
	},
	"login.newHere": {
		en: "New here? Create an account",
		pl: "Nie masz konta? Załóż je"
	},
	"login.haveDesk": {
		en: "Already have an account? Sign in",
		pl: "Masz już konto? Zaloguj się"
	},
	"login.needCreds": {
		en: "Email and a password of at least 8 characters.",
		pl: "E-mail i hasło — minimum 8 znaków."
	},
	"login.disabled": {
		en: "Sign-in is disabled.",
		pl: "Logowanie jest wyłączone."
	},
	"login.continueWith": {
		en: "Continue with {label}",
		pl: "Kontynuuj przez {label}"
	},
	"login.failed": {
		en: "Sign-in failed",
		pl: "Logowanie nie wyszło"
	},
	"login.createFail": {
		en: "Could not create the account",
		pl: "Nie udało się założyć konta"
	},
	"login.inFail": {
		en: "Could not sign in",
		pl: "Nie udało się zalogować"
	},
	"login.badCreds": {
		en: "No account for that email, or the password does not match. If this is your first time — create an account.",
		pl: "Nie ma konta z tym e-mailem albo hasło się nie zgadza. Jeśli jesteś tu pierwszy raz — załóż konto."
	},
	"login.exists": {
		en: "That email already has an account — sign in instead.",
		pl: "Ten e-mail ma już konto — zaloguj się."
	},
	"login.language": {
		en: "Language",
		pl: "Język"
	},
	"nav.market": {
		en: "Market",
		pl: "Rynek"
	},
	"nav.portfolio": {
		en: "Portfolio",
		pl: "Portfel"
	},
	"nav.floor": {
		en: "Floor",
		pl: "Agenci"
	},
	"nav.settings": {
		en: "Settings",
		pl: "Ustawienia"
	},
	"header.liveTape": {
		en: "Live prices",
		pl: "Ceny na żywo"
	},
	"header.tapeStale": {
		en: "Prices stalled",
		pl: "Ceny nieaktualne"
	},
	"header.connecting": {
		en: "Connecting",
		pl: "Łączenie"
	},
	"header.autopilotOn": {
		en: "Autopilot on — the desk keeps working after you leave.",
		pl: "Autopilot włączony — agenci handlują też gdy wyjdziesz."
	},
	"header.paperLine": {
		en: "Real prices. Virtual money. Your account saves.",
		pl: "Prawdziwe ceny. Wirtualne pieniądze. Konto się zapisuje."
	},
	"header.liveLine": {
		en: "Live wallet. Real Hyperliquid balances.",
		pl: "Prawdziwy portfel Hyperliquid."
	},
	"header.autopilot": {
		en: "Autopilot",
		pl: "Autopilot"
	},
	"header.autopilotTip": {
		en: "When on, agents keep probing after you close the app. One small 3% trade per name — they will not add to an open trade.",
		pl: "Gdy włączony, agenci handlują też po zamknięciu aplikacji. Jedna mała pozycja (3% kapitału) na spółkę — nie dokładają do już otwartej."
	},
	"header.convene": {
		en: "Ask the floor",
		pl: "Zwołaj radę"
	},
	"header.inSession": {
		en: "In session",
		pl: "Rada pracuje"
	},
	"header.conveneTip": {
		en: "Five agents debate. Asking never trades. Demo until you switch to Live.",
		pl: "Pięciu agentów rozmawia o rynku. Samo pytanie nie kupuje ani nie sprzedaje. Dopóki jesteś w Demo, wszystko jest wirtualne."
	},
	"header.equity": {
		en: "Equity",
		pl: "Kapitał"
	},
	"header.cash": {
		en: "Cash",
		pl: "Gotówka"
	},
	"header.pnl": {
		en: "P&L",
		pl: "Wynik"
	},
	"header.resetDesk": {
		en: "Reset the demo book",
		pl: "Wyczyść portfel demo"
	},
	"header.resetDeskBody": {
		en: "Clears positions, trades, and the last debate. Starts a fresh $100,000 virtual session. Live prices stay.",
		pl: "Czyści pozycje, transakcje i ostatnią rozmowę agentów. Zaczyna od nowa od 100 000 USD wirtualnych. Ceny na żywo zostają."
	},
	"header.resetBook": {
		en: "Reset demo",
		pl: "Wyczyść demo"
	},
	"mode.demo": {
		en: "Demo",
		pl: "Demo"
	},
	"mode.live": {
		en: "Live",
		pl: "Na żywo"
	},
	"mode.demoSub": {
		en: "virtual money",
		pl: "wirtualne pieniądze"
	},
	"mode.liveSub": {
		en: "real wallet",
		pl: "prawdziwy portfel"
	},
	"mode.demoHint": {
		en: "Virtual $100,000. Real prices. Nothing leaves this account.",
		pl: "Wirtualne 100 000 USD. Prawdziwe ceny. Z Twojego portfela nic nie schodzi."
	},
	"mode.liveHint": {
		en: "Real Hyperliquid wallet. Demo book stays untouched.",
		pl: "Twój prawdziwy portfel na Hyperliquid. Demo zostaje nietknięte."
	},
	"mode.gateTitle": {
		en: "Switch to Live",
		pl: "Wejdź na wersję na żywo"
	},
	"mode.gateBody": {
		en: "Live shows your real Hyperliquid balance and positions. Connect MetaMask first. Demo stays on this account.",
		pl: "Wersja na żywo pokazuje prawdziwe saldo i pozycje z Hyperliquid. Najpierw połącz MetaMask. Twoje demo zostaje na koncie."
	},
	"mode.connect": {
		en: "Connect MetaMask",
		pl: "Połącz MetaMask"
	},
	"mode.watchOnly": {
		en: "Watch is read-only. Connect MetaMask to go live.",
		pl: "Podgląd adresu jest tylko do odczytu. Żeby wejść na żywo, połącz MetaMask."
	},
	"mode.liveOn": {
		en: "Live mode on",
		pl: "Jesteś na żywo"
	},
	"mode.demoOn": {
		en: "Back to demo",
		pl: "Z powrotem w demo"
	},
	"mode.banner": {
		en: "Live: real wallet. Demo trades stay on the other side of this switch.",
		pl: "Jesteś na żywo — to prawdziwy portfel. Transakcje z Demo czekają po drugiej stronie przełącznika."
	},
	"mode.demoBanner": {
		en: "You are in Demo — virtual money, real prices. Switch to Live when you want your real wallet.",
		pl: "Jesteś w Demo — wirtualne pieniądze, prawdziwe ceny. Kiedy będziesz gotów, wejdź na żywo."
	},
	"mode.goLive": {
		en: "Go live",
		pl: "Przejdź na żywo"
	},
	"mode.placeBlocked": {
		en: "Live orders from this desk are not signed yet. Demo is for practice — switch back to Demo to fill.",
		pl: "Z tej aplikacji jeszcze nie składamy prawdziwych zleceń. Ćwicz w Demo — wróć tam, żeby złożyć wirtualne zlecenie."
	},
	"mode.needWallet": {
		en: "Connect MetaMask before going live.",
		pl: "Najpierw połącz MetaMask, potem wejdź na żywo."
	},
	"settings.title": {
		en: "Settings",
		pl: "Ustawienia"
	},
	"settings.language": {
		en: "Language",
		pl: "Język"
	},
	"settings.languageBody": {
		en: "Login screen and the desk. Agents answer in this language.",
		pl: "Ekran logowania i cały pulpit. Agenci odpowiadają w tym języku."
	},
	"settings.appearance": {
		en: "Appearance",
		pl: "Wygląd"
	},
	"settings.appearanceBody": {
		en: "Desk chrome. Numbers and fills stay the same.",
		pl: "Kolory pulpitu. Liczby i transakcje bez zmian."
	},
	"settings.dark": {
		en: "Dark",
		pl: "Ciemny"
	},
	"settings.light": {
		en: "Light",
		pl: "Jasny"
	},
	"settings.system": {
		en: "System",
		pl: "Jak w telefonie"
	},
	"settings.tour": {
		en: "Walkthrough",
		pl: "Przewodnik"
	},
	"settings.tourBody": {
		en: "Demo vs live, the agents, and how to deposit USDC to Hyperliquid.",
		pl: "Demo i wersja na żywo, agenci oraz jak wpłacić USDC na Hyperliquid."
	},
	"settings.replayTour": {
		en: "Replay walkthrough",
		pl: "Obejrzyj przewodnik"
	},
	"settings.reset": {
		en: "Reset demo trades",
		pl: "Wyczyść transakcje demo"
	},
	"settings.resetBody": {
		en: "Clears positions, trades, and the last debate. Starts $100,000 virtual. Live prices stay.",
		pl: "Czyści pozycje, transakcje i ostatnią rozmowę agentów. Zaczyna od 100 000 USD wirtualnych. Ceny na żywo zostają."
	},
	"settings.handle": {
		en: "Handle",
		pl: "Nick"
	},
	"settings.handleLocked": {
		en: "Locked. This name stays on the desk.",
		pl: "Zablokowany. Tego niku nie zmienisz."
	},
	"settings.handlePick": {
		en: "Pick once. You cannot change it later.",
		pl: "Wybierz raz. Później się nie da zmienić."
	},
	"settings.lock": {
		en: "Lock",
		pl: "Zablokuj"
	},
	"settings.handleFail": {
		en: "Could not lock the handle.",
		pl: "Nie udało się zablokować niku."
	},
	"settings.signOut": {
		en: "Sign out",
		pl: "Wyloguj"
	},
	"settings.signOutBody": {
		en: "Leaves this session. The book stays on the account.",
		pl: "Wychodzisz z sesji. Portfel zostaje na koncie."
	},
	"settings.signingOut": {
		en: "Signing out…",
		pl: "Wylogowywanie…"
	},
	"settings.mode": {
		en: "Demo or Live",
		pl: "Demo albo na żywo"
	},
	"settings.modeBody": {
		en: "Practice with virtual money, then switch to your real Hyperliquid wallet.",
		pl: "Najpierw poćwicz na wirtualnych pieniądzach, potem jednym kliknięciem wejdź na prawdziwy portfel Hyperliquid."
	},
	"tour.skip": {
		en: "Skip",
		pl: "Pomiń"
	},
	"tour.back": {
		en: "Back",
		pl: "Wstecz"
	},
	"tour.next": {
		en: "Next",
		pl: "Dalej"
	},
	"tour.gotIt": {
		en: "Got it",
		pl: "Jasne"
	},
	"tour.openSettings": {
		en: "Open Settings",
		pl: "Otwórz ustawienia"
	},
	"tour.1.kicker": {
		en: "The desk",
		pl: "Pulpit"
	},
	"tour.1.title": {
		en: "Start in Demo. It saves.",
		pl: "Zaczynasz od Demo. Zapisuje się."
	},
	"tour.1.body": {
		en: "{app} starts with $100,000 of virtual money on live prices. Trades, chat, and the agents stick to this account. Reset in Settings wipes the demo book, not the login.",
		pl: "{app} startuje ze 100 000 USD wirtualnych na prawdziwych cenach. Transakcje, czat i agenci zostają na koncie. Reset w ustawieniach czyści tylko demo, nie logowanie."
	},
	"tour.2.kicker": {
		en: "Tape",
		pl: "Notowania"
	},
	"tour.2.title": {
		en: "Two price feeds. One desk.",
		pl: "Dwa źródła cen. Jeden pulpit."
	},
	"tour.2.body": {
		en: "Charts are Yahoo Finance, one-minute bars. Agents size off Hyperliquid prices. Demo fills stay virtual until you switch to Live.",
		pl: "Wykresy biorą się z Yahoo Finance. Wielkość zlecenia agenci biorą z cen Hyperliquid. W Demo transakcje są wirtualne — prawdziwe pieniądze ruszają dopiero po kliknięciu Na żywo."
	},
	"tour.3.kicker": {
		en: "Floor",
		pl: "Agenci"
	},
	"tour.3.title": {
		en: "Five agents. Asking talks. The floor can trade.",
		pl: "Pięciu agentów. Pytanie to rozmowa. Rada może handlować."
	},
	"tour.3.body": {
		en: "Vesper rides trends, Ash fades extremes, Kai reads flow, Damian reads headlines, Iris sizes risk. Asking never trades. Convene or Autopilot can print a demo ticket.",
		pl: "Vesper jedzie z trendem, Ash gra przeciwnie, Kai patrzy kto kupuje, Damian czyta wiadomości, Iris pilnuje ryzyka. Pytanie nigdy nie składa zlecenia. Rada albo Autopilot mogą otworzyć pozycję w Demo."
	},
	"tour.4.kicker": {
		en: "Book",
		pl: "Portfel"
	},
	"tour.4.title": {
		en: "Portfolio is the open book.",
		pl: "Portfel to otwarte pozycje."
	},
	"tour.4.body": {
		en: "Open trades, cash, win rate, and period P&L live under Portfolio. Close a name from the strip. Autopilot keeps probing in the background — one 3% name, no add to an open trade.",
		pl: "Otwarte pozycje, gotówka, skuteczność i wynik za okres są w Portfelu. Zamknij spółkę z paska na górze. Autopilot handluje w tle — jedna pozycja 3%, bez dokładania do już otwartej."
	},
	"tour.5.kicker": {
		en: "Live",
		pl: "Na żywo"
	},
	"tour.5.title": {
		en: "Flip the switch when you are ready.",
		pl: "Kliknij Na żywo, kiedy będziesz gotów."
	},
	"tour.5.body": {
		en: "Header Demo / Live. Live needs MetaMask. Native USDC on Arbitrum, min $5 — under that is lost. Keep 0.001 ETH on Arbitrum for gas. Amount → Deposit to Hyperliquid → sign. Credits in about a minute. Demo stays on this account.",
		pl: "U góry: Demo / Na żywo. Wersja na żywo wymaga MetaMaska. Zwykłe USDC w sieci Arbitrum, minimum 5 USD — mniej przepada. Zostaw 0,001 ETH na Arbitrum na opłatę sieci. Kwota → Wpłać na Hyperliquid → podpisz. Wpływ ok. minuty. Demo zostaje na tym koncie."
	},
	"wallet.title": {
		en: "Live · MetaMask",
		pl: "Na żywo · MetaMask"
	},
	"wallet.body": {
		en: "Native USDC on Arbitrum funds the board as Hyperliquid perps. Demo trades stay virtual.",
		pl: "Zwykłe USDC na Arbitrum zasilają cały rynek jako kontrakty Hyperliquid. Transakcje w Demo zostają wirtualne."
	},
	"wallet.connect": {
		en: "Connect MetaMask",
		pl: "Połącz MetaMask"
	},
	"wallet.connecting": {
		en: "Connecting…",
		pl: "Łączenie…"
	},
	"wallet.watchPh": {
		en: "or paste 0x to watch",
		pl: "albo wklej 0x do podglądu"
	},
	"wallet.watch": {
		en: "Watch",
		pl: "Podgląd"
	},
	"wallet.watching": {
		en: "Watching",
		pl: "Podgląd"
	},
	"wallet.wallet": {
		en: "Wallet",
		pl: "Portfel"
	},
	"wallet.hyperliquid": {
		en: "Hyperliquid",
		pl: "Hyperliquid"
	},
	"wallet.perpsEquity": {
		en: "Perps equity",
		pl: "Kapitał na kontraktach"
	},
	"wallet.hlSpot": {
		en: "HL spot USDC",
		pl: "USDC na Hyperliquid (gotówka)"
	},
	"wallet.withdrawable": {
		en: "Withdrawable {amount}",
		pl: "Do wypłaty {amount}"
	},
	"wallet.noPerps": {
		en: "No HL perps yet. Deposit native Arbitrum USDC — min ${min}.",
		pl: "Brak kontraktów na Hyperliquid. Wpłać zwykłe USDC na Arbitrum — min. {min} USD."
	},
	"wallet.deposit": {
		en: "Deposit to Hyperliquid",
		pl: "Wpłać na Hyperliquid"
	},
	"wallet.depositing": {
		en: "Depositing…",
		pl: "Wpłata…"
	},
	"wallet.depositBody": {
		en: "Real USDC. Min ${min}. Under that is lost. Keep {keep} ETH on Arbitrum for gas (~$2–3). One deposit ≈ {gas} ETH. Below {warn} ETH MetaMask often fails.",
		pl: "Prawdziwe USDC. Min. {min} USD. Mniej przepada. Zostaw {keep} ETH na Arbitrum na opłatę sieci (ok. 2–3 USD). Jedna wpłata ≈ {gas} ETH. Poniżej {warn} ETH MetaMask często się wywraca."
	},
	"wallet.needUsdc": {
		en: "Need ${min}+ native USDC on Arbitrum. ETH-chain USDC and USDC.e do not credit.",
		pl: "Potrzeba min. {min} USD zwykłego USDC na Arbitrum. USDC z Ethereum i USDC.e nie wejdą."
	},
	"wallet.needEth": {
		en: "Arbitrum ETH is {eth} — send {keep} ETH to this address before depositing.",
		pl: "ETH na Arbitrum: {eth} — wyślij {keep} ETH na ten adres przed wpłatą."
	},
	"wallet.max": {
		en: "Max",
		pl: "Max"
	},
	"wallet.arbScan": {
		en: "View on Arbiscan",
		pl: "Zobacz na Arbiscan"
	},
	"wallet.watchOnly": {
		en: "Watch is read-only. Connect MetaMask to deposit.",
		pl: "Podgląd jest tylko do odczytu. Połącz MetaMask, żeby wpłacić."
	},
	"wallet.refresh": {
		en: "Refresh",
		pl: "Odśwież"
	},
	"wallet.disconnect": {
		en: "Disconnect",
		pl: "Odłącz"
	},
	"wallet.mapped": {
		en: "Mapped: {names}.",
		pl: "Dostępne: {names}."
	},
	"wallet.breakdown": {
		en: "Arbitrum native {arb} · ETH chain {eth}{e}",
		pl: "Arbitrum (zwykłe USDC) {arb} · sieć Ethereum {eth}{e}"
	},
	"wallet.usdcE": {
		en: " · USDC.e {amount} (not accepted)",
		pl: " · USDC.e {amount} (nieprzyjmowane)"
	},
	"wallet.reading": {
		en: "Reading token balances…",
		pl: "Czytam salda…"
	},
	"wallet.sendReal": {
		en: "Send real USDC",
		pl: "Wyślij prawdziwe USDC"
	},
	"wallet.sendRealBody": {
		en: "{amount} native USDC on Arbitrum goes to Hyperliquid Bridge2. Credits this same address. Not paper. Min ${min} — less is lost forever.",
		pl: "{amount} zwykłego USDC na Arbitrum idzie mostem Hyperliquid. Wpływa na ten sam adres. To nie jest demo. Min. {min} USD — mniej przepada na zawsze."
	},
	"wallet.signMm": {
		en: "Sign in MetaMask",
		pl: "Podpisz w MetaMask"
	},
	"wallet.long": {
		en: "LONG",
		pl: "DŁUGA"
	},
	"wallet.short": {
		en: "SHORT",
		pl: "KRÓTKA"
	},
	"floor.agents": {
		en: "Agents",
		pl: "Agenci"
	},
	"floor.chat": {
		en: "Chat",
		pl: "Czat"
	},
	"floor.tape": {
		en: "Tape",
		pl: "Dziennik"
	},
	"floor.council": {
		en: "Council",
		pl: "Rada"
	},
	"floor.idle": {
		en: "Idle",
		pl: "Cisza"
	},
	"floor.reading": {
		en: "Reading the tape…",
		pl: "Patrzą na notowania…"
	},
	"floor.proposed": {
		en: "Proposed",
		pl: "Propozycja"
	},
	"floor.place": {
		en: "Place",
		pl: "Złóż zlecenie"
	},
	"floor.dismiss": {
		en: "Dismiss",
		pl: "Odrzuć"
	},
	"floor.you": {
		en: "You",
		pl: "Ty"
	},
	"floor.ask": {
		en: "Ask",
		pl: "Pytanie"
	},
	"floor.onWire": {
		en: "On the wire…",
		pl: "Czytają wiadomości…"
	},
	"floor.askEmpty": {
		en: "Ask Vesper, Ash, Kai, Damian or Iris. They talk. Asking never fills — Convene or Autopilot does.",
		pl: "Pytaj Vesper, Ash, Kai, Damiana albo Iris. Gadają. Pytanie nie otwiera pozycji — robi to rada albo Autopilot."
	},
	"floor.askPh": {
		en: "Ask a name, a close, or a size…",
		pl: "Spytaj o spółkę, zamknięcie albo wielkość…"
	},
	"floor.askHint": {
		en: "Asking never trades. Convene debates; Place or Autopilot fills.",
		pl: "Pytanie nigdy nie kupuje ani nie sprzedaje. Rada debatuje; Złóż zlecenie albo Autopilot otwiera pozycję."
	},
	"floor.hold": {
		en: "Hold",
		pl: "Czekam"
	},
	"floor.chipTell": {
		en: "What's the tell on {symbol}?",
		pl: "Co się dzieje z {symbol}?"
	},
	"floor.chipClose": {
		en: "Should I close {symbol}?",
		pl: "Zamykać {symbol}?"
	},
	"floor.chipProbe": {
		en: "Size a probe in {symbol}",
		pl: "Mała pozycja na {symbol}?"
	},
	"floor.chipWire": {
		en: "What's on the wire?",
		pl: "Co w wiadomościach?"
	},
	"floor.filled": {
		en: "Council ticket filled",
		pl: "Rada otworzyła pozycję"
	},
	"floor.autopilotLive": {
		en: "Autopilot · live",
		pl: "Autopilot · działa"
	},
	"mood.risk-on": {
		en: "risk-on",
		pl: "chętni do ryzyka"
	},
	"mood.risk-off": {
		en: "risk-off",
		pl: "ostrożnie, bez ryzyka"
	},
	"mood.cautious": {
		en: "cautious",
		pl: "ostrożnie"
	},
	"role.vesper": {
		en: "Momentum",
		pl: "Trend"
	},
	"role.ash": {
		en: "Mean reversion",
		pl: "Gra przeciwnie"
	},
	"role.kai": {
		en: "Flow",
		pl: "Kto kupuje"
	},
	"role.damian": {
		en: "Wire",
		pl: "Wiadomości"
	},
	"role.iris": {
		en: "Risk chair",
		pl: "Ryzyko"
	},
	"mandate.vesper": {
		en: "Ride expansion. Cut the names that stall.",
		pl: "Jedzie z trendem. Zamyka spółki, które stają."
	},
	"mandate.ash": {
		en: "Fade stretches. Buy panic, sell euphoria.",
		pl: "Gra przeciwnie do skrajności. Kupuje panikę, sprzedaje euforię."
	},
	"mandate.kai": {
		en: "Read the tape and the open book, not the model.",
		pl: "Patrzy na ceny i otwarte pozycje, nie na teorie."
	},
	"mandate.damian": {
		en: "Read the headlines. Trade the story, not the rumor.",
		pl: "Czyta nagłówki. Handluje historią, nie plotką."
	},
	"mandate.iris": {
		en: "Size the book. Veto concentration. Round-trip fees (open+close) stay ≤ 5% of notional.",
		pl: "Dobiera wielkość. Blokuje zbyt duże zaangażowanie. Opłaty za otwarcie i zamknięcie ≤ 5% wartości pozycji."
	},
	"ticket.buy": {
		en: "buy",
		pl: "kup"
	},
	"ticket.sell": {
		en: "sell",
		pl: "sprzedaj"
	},
	"ticket.qty": {
		en: "Qty",
		pl: "Ilość"
	},
	"ticket.max": {
		en: "Max",
		pl: "Max"
	},
	"ticket.close": {
		en: "Close",
		pl: "Zamknij"
	},
	"ticket.filled": {
		en: "{side} {symbol} filled",
		pl: "{side} {symbol} zrealizowane"
	},
	"ticket.closed": {
		en: "{symbol} closed",
		pl: "{symbol} zamknięte"
	},
	"chart.select": {
		en: "Select a name.",
		pl: "Wybierz spółkę."
	},
	"chart.yahoo": {
		en: "Yahoo Finance · 1-minute",
		pl: "Yahoo Finance · 1 minuta"
	},
	"chart.hlMid": {
		en: "HL mid {px}",
		pl: "Cena Hyperliquid {px}"
	},
	"chart.hlPending": {
		en: "HL mid pending",
		pl: "Cena Hyperliquid czeka"
	},
	"chart.tf": {
		en: "TF",
		pl: "Interwał"
	},
	"chart.prev": {
		en: "Prev",
		pl: "Poprz."
	},
	"chart.high": {
		en: "High",
		pl: "Max"
	},
	"chart.low": {
		en: "Low",
		pl: "Min"
	},
	"chart.connecting": {
		en: "Connecting to tape",
		pl: "Łączenie z cenami"
	},
	"board.title": {
		en: "Board",
		pl: "Rynek"
	},
	"tape.title": {
		en: "Tape",
		pl: "Dziennik"
	},
	"tape.wait": {
		en: "Waiting on the wire.",
		pl: "Czekam na wiadomości."
	},
	"tape.fill": {
		en: "fill",
		pl: "transakcja"
	},
	"tape.wire": {
		en: "wire",
		pl: "wiadomość"
	},
	"tape.open": {
		en: "Demo open. $100,000 virtual. Waiting on live prices.",
		pl: "Demo otwarte. 100 000 USD wirtualnych. Czekam na ceny."
	},
	"tape.liveOn": {
		en: "Live prices on. Demo fills stay virtual until you switch to Live.",
		pl: "Ceny na żywo włączone. Transakcje w Demo zostają wirtualne, dopóki nie klikniesz Na żywo."
	},
	"tape.autoOn": {
		en: "Autopilot on. Desk stays live after you leave — one 3% probe per name, no add.",
		pl: "Autopilot włączony. Działa też po wyjściu — jedna pozycja 3% na spółkę, bez dokładania."
	},
	"tape.autoOff": {
		en: "Autopilot off. Book still saves; the floor waits.",
		pl: "Autopilot wyłączony. Portfel nadal się zapisuje; agenci czekają."
	},
	"tape.reset": {
		en: "Book reset. $100,000 virtual. Live prices still on.",
		pl: "Portfel wyczyszczony. 100 000 USD wirtualnych. Ceny na żywo nadal działają."
	},
	"tape.autoFlat": {
		en: "Autopilot flattened {symbol} — signal flipped.",
		pl: "Autopilot zamknął {symbol} — sygnał się odwrócił."
	},
	"tape.councilAi": {
		en: "{summary}",
		pl: "{summary}"
	},
	"tape.councilLocal": {
		en: "Cloud unreachable. Agents answered from the numbers on screen. {summary}",
		pl: "Brak połączenia z chmurą. Agenci odpowiedzieli na podstawie tego, co widać na pulpicie. {summary}"
	},
	"opened.title": {
		en: "Opened trades",
		pl: "Otwarte pozycje"
	},
	"opened.empty": {
		en: "None open. Buy or sell from the ticket, or ask the floor.",
		pl: "Nic otwartego. Kup albo sprzedaj ze zlecenia, albo zwołaj radę."
	},
	"opened.closeFail": {
		en: "Could not close",
		pl: "Nie udało się zamknąć"
	},
	"opened.liveEmpty": {
		en: "No Hyperliquid perps yet. Deposit USDC, then positions show here.",
		pl: "Brak kontraktów na Hyperliquid. Wpłać USDC, wtedy pozycje pokażą się tutaj."
	},
	"port.alloc": {
		en: "Allocation of equity",
		pl: "Podział kapitału"
	},
	"port.equity": {
		en: "Equity",
		pl: "Kapitał"
	},
	"port.cash": {
		en: "Cash",
		pl: "Gotówka"
	},
	"port.long": {
		en: "long",
		pl: "długa"
	},
	"port.short": {
		en: "short",
		pl: "krótka"
	},
	"port.deployed": {
		en: "deployed",
		pl: "w pozycjach"
	},
	"port.winrate": {
		en: "Winrate",
		pl: "Skuteczność"
	},
	"port.noClosed": {
		en: "No closed trades",
		pl: "Brak zamkniętych"
	},
	"port.floating": {
		en: "Floating P&L",
		pl: "Wynik otwartych"
	},
	"port.realized": {
		en: "Realized",
		pl: "Zrealizowane"
	},
	"alerts.title": {
		en: "Alerts",
		pl: "Powiadomienia"
	},
	"alerts.empty": {
		en: "No fills yet.",
		pl: "Jeszcze zero transakcji."
	},
	"alerts.emptyBody": {
		en: "No fills yet. Ticket, Convene or Autopilot prints here.",
		pl: "Jeszcze zero transakcji. Zlecenie, rada albo Autopilot pojawią się tutaj."
	},
	"alerts.away": {
		en: "Away pings",
		pl: "Powiadomienia poza aplikacją"
	},
	"alerts.awayOn": {
		en: "Ping when Autopilot trades after you leave.",
		pl: "Dostaniesz powiadomienie, gdy Autopilot handluje po wyjściu."
	},
	"alerts.blocked": {
		en: "This window blocks OS alerts.",
		pl: "To okno blokuje powiadomienia systemowe."
	},
	"alerts.aria": {
		en: "Notifications",
		pl: "Powiadomienia"
	},
	"alerts.awayAria": {
		en: "Away fill alerts",
		pl: "Powiadomienia o transakcjach poza aplikacją"
	},
	"alerts.needApp": {
		en: "This window cannot show OS alerts. Open the installed app.",
		pl: "To okno nie pokaże powiadomień systemowych. Otwórz zainstalowaną aplikację."
	},
	"alerts.blockedToast": {
		en: "Alerts blocked — enable them in the browser if you want pings.",
		pl: "Powiadomienia zablokowane — włącz je w przeglądarce, jeśli chcesz dostać sygnał."
	},
	"alerts.onTitle": {
		en: "ZiggyWizzAir alerts on",
		pl: "Powiadomienia ZiggyWizzAir włączone"
	},
	"alerts.onBody": {
		en: "You'll be pinged when Autopilot opens or closes a name after you leave.",
		pl: "Dostaniesz sygnał, gdy Autopilot otworzy albo zamknie pozycję po wyjściu."
	},
	"alerts.onToast": {
		en: "Alerts on. Autopilot will ping you when it opens or closes a name.",
		pl: "Powiadomienia włączone. Autopilot da znać przy otwarciu albo zamknięciu pozycji."
	},
	"alerts.needStandalone": {
		en: "OS alerts need a standalone window. The tape still records fills.",
		pl: "Powiadomienia systemowe potrzebują osobnego okna. Dziennik i tak zapisuje transakcje."
	},
	"alerts.offToast": {
		en: "Away pings off. The inbox still lists fills.",
		pl: "Powiadomienia poza aplikacją wyłączone. Lista nadal pokazuje transakcje."
	},
	"splash.waiting": {
		en: "Waiting on live prices",
		pl: "Czekam na ceny"
	},
	"splash.takeoff": {
		en: "Taking off",
		pl: "Start"
	},
	"splash.opening": {
		en: "Opening the desk",
		pl: "Otwieram pulpit"
	},
	"toast.councilClosed": {
		en: "Floor closed",
		pl: "Rada skończyła rozmowę"
	},
	"toast.councilLocal": {
		en: "Can't reach the cloud. Agents answered from what's on screen.",
		pl: "Nie da się połączyć z chmurą. Agenci odpowiedzieli na podstawie tego, co widać na pulpicie."
	},
	"toast.councilStalled": {
		en: "Floor stalled",
		pl: "Rada stanęła"
	},
	"toast.answered": {
		en: "{name} answered",
		pl: "{name} odpowiedział"
	},
	"toast.localDesk": {
		en: "{name} answered without the cloud",
		pl: "{name} odpowiedział bez połączenia z chmurą"
	},
	"err.irisSize": {
		en: "Iris veto — size or concentration.",
		pl: "Iris blokuje — za duża pozycja albo za dużo w jednej spółce."
	},
	"err.irisCash": {
		en: "Iris veto — not enough cash.",
		pl: "Iris blokuje — za mało gotówki."
	},
	"err.tape": {
		en: "Waiting on live prices.",
		pl: "Czekam na ceny."
	},
	"err.size": {
		en: "Set a size.",
		pl: "Ustaw wielkość zlecenia."
	},
	"err.noTrade": {
		en: "No open trade.",
		pl: "Brak otwartej pozycji."
	},
	"err.noTicket": {
		en: "No ticket waiting.",
		pl: "Brak zlecenia do złożenia."
	},
	"err.livePlace": {
		en: "Live orders from this desk are not signed yet. Switch to Demo to practice.",
		pl: "Zleceń na żywo z pulpitu jeszcze nie podpisujemy. Wróć do Demo, żeby poćwiczyć."
	},
	"side.long": {
		en: "Long",
		pl: "Długa"
	},
	"side.short": {
		en: "Short",
		pl: "Krótka"
	},
	"ticket.qtyAria": {
		en: "Quantity",
		pl: "Ilość"
	},
	"ticket.buyCap": {
		en: "Buy",
		pl: "Kup"
	},
	"ticket.sellCap": {
		en: "Sell",
		pl: "Sprzedaj"
	},
	"ticket.shortCap": {
		en: "Short",
		pl: "Krótka"
	},
	"ticket.flat": {
		en: "Flat size",
		pl: "Wielkość pozycji"
	},
	"ticket.noPos": {
		en: "No position",
		pl: "Brak pozycji"
	},
	"ticket.sellOpens": {
		en: "No position · sell opens a short",
		pl: "Brak pozycji · sprzedaż otwiera krótką"
	},
	"ticket.heldLong": {
		en: "Long {qty} @ {avg}",
		pl: "Długa {qty} @ {avg}"
	},
	"ticket.heldShort": {
		en: "Short {qty} @ {avg}",
		pl: "Krótka {qty} @ {avg}"
	},
	"port.total": {
		en: "Total P&L",
		pl: "Wynik łącznie"
	},
	"port.day": {
		en: "Day",
		pl: "Dzień"
	},
	"port.week": {
		en: "Week",
		pl: "Tydzień"
	},
	"port.month": {
		en: "Month",
		pl: "Miesiąc"
	},
	"port.year": {
		en: "Year",
		pl: "Rok"
	},
	"port.openMarks": {
		en: "Open marks",
		pl: "Wycena otwartych"
	},
	"port.openedN": {
		en: "Opened",
		pl: "Otwarte"
	},
	"port.oneTrade": {
		en: "1 trade",
		pl: "1 pozycja"
	},
	"port.nTrades": {
		en: "{n} trades",
		pl: "{n} pozycji"
	},
	"port.fills": {
		en: "Fills",
		pl: "Transakcje"
	},
	"port.noPrints": {
		en: "No prints yet.",
		pl: "Jeszcze zero transakcji."
	},
	"port.closeNote": {
		en: "close",
		pl: "zamknięcie"
	},
	"wallet.mm": {
		en: "MetaMask",
		pl: "MetaMask"
	},
	"wallet.usdc": {
		en: "USDC",
		pl: "USDC"
	},
	"wallet.eth": {
		en: "ETH",
		pl: "ETH"
	},
	"wallet.maxPh": {
		en: "max {amount}",
		pl: "max {amount}"
	},
	"header.resetAria": {
		en: "Reset demo",
		pl: "Wyczyść demo"
	},
	"opened.closeAria": {
		en: "Close {symbol}",
		pl: "Zamknij {symbol}"
	},
	"board.tape": {
		en: "tape",
		pl: "notowania"
	}
};
var KEY$1 = "zw-locale";
var listeners = /* @__PURE__ */ new Set();
function emit() {
	for (const fn of listeners) fn();
}
function readRaw() {
	if (typeof window === "undefined") return null;
	try {
		const v = window.localStorage.getItem(KEY$1);
		if (v === "en" || v === "pl") return v;
	} catch {}
	return null;
}
function detect() {
	if (typeof navigator === "undefined") return "en";
	return (navigator.language || "en").toLowerCase().startsWith("pl") ? "pl" : "en";
}
var current = null;
function getLocale() {
	if (current) return current;
	current = readRaw() ?? detect();
	return current;
}
function setLocale(next) {
	current = next;
	try {
		window.localStorage.setItem(KEY$1, next);
	} catch {}
	if (typeof document !== "undefined") document.documentElement.lang = next;
	emit();
}
function subscribeLocale(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
function t(key, vars, locale = getLocale()) {
	let s = catalog[key]?.[locale] ?? catalog[key]?.en ?? key;
	if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
	return s;
}
function txError(message, locale = getLocale()) {
	const key = {
		"Iris veto — size or concentration.": "err.irisSize",
		"Iris veto — not enough cash.": "err.irisCash",
		"Waiting on the live tape.": "err.tape",
		"Size the ticket.": "err.size",
		"No open trade.": "err.noTrade",
		"No ticket on the rail.": "err.noTicket",
		"Live orders from this desk are not signed yet. Switch to Demo to practice.": "err.livePlace"
	}[message];
	return key ? t(key, void 0, locale) : message;
}
function useLocale() {
	return (0, import_react.useSyncExternalStore)(subscribeLocale, getLocale, () => "en");
}
function useT() {
	const locale = useLocale();
	return (0, import_react.useCallback)((key, vars) => t(key, vars, locale), [locale]);
}
function LanguageSwitch({ compact }) {
	const locale = useLocale();
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"aria-label": t("settings.language"),
		"data-language-switch": "",
		className: cn("grid grid-cols-2 gap-1 rounded-lg bg-surface p-1", compact && "max-w-[12rem]"),
		children: LOCALES.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setLocale(row.id),
			"aria-pressed": locale === row.id,
			"data-locale": row.id,
			className: cn("flex h-11 items-center justify-center rounded-md text-sm font-medium", locale === row.id ? "bg-elevated text-fg" : "text-muted"),
			children: row.label
		}, row.id))
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-61qQF9sn.js
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var KEY = "quorum-appearance";
function readAppearance() {
	if (typeof window === "undefined") return "dark";
	try {
		const raw = window.localStorage.getItem(KEY);
		if (raw === "light" || raw === "dark" || raw === "system") return raw;
	} catch {}
	return "dark";
}
function resolveAppearance(mode) {
	if (mode !== "system") return mode;
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function applyAppearance(mode) {
	if (typeof document === "undefined") return;
	const resolved = resolveAppearance(mode);
	const root = document.documentElement;
	root.classList.toggle("light", resolved === "light");
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", resolved === "light" ? "#f4f4f5" : "#09090b");
	try {
		window.localStorage.setItem(KEY, mode);
	} catch {}
}
var Ctx = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [appearance, setAppearanceState] = (0, import_react.useState)("dark");
	const [resolved, setResolved] = (0, import_react.useState)("dark");
	(0, import_react.useLayoutEffect)(() => {
		const mode = readAppearance();
		setAppearanceState(mode);
		setResolved(resolveAppearance(mode));
		applyAppearance(mode);
	}, []);
	(0, import_react.useEffect)(() => {
		if (appearance !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: light)");
		const onChange = () => {
			setResolved(resolveAppearance("system"));
			applyAppearance("system");
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [appearance]);
	const value = (0, import_react.useMemo)(() => ({
		appearance,
		resolved,
		setAppearance: (mode) => {
			setAppearanceState(mode);
			setResolved(resolveAppearance(mode));
			applyAppearance(mode);
		}
	}), [appearance, resolved]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useAppearance() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useAppearance needs ThemeProvider");
	return ctx;
}
function LocaleHydrator({ children }) {
	const locale = useLocale();
	(0, import_react.useLayoutEffect)(() => {
		document.documentElement.lang = locale;
	}, [locale]);
	return children;
}
function TooltipProvider({ delayDuration = 200, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		...props
	});
}
function Tooltip({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, { ...props });
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function TooltipContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 max-w-xs rounded-md bg-elevated px-2.5 py-1.5 text-xs text-fg shadow-[var(--shadow-border)]", className),
		...props
	}) });
}
var styles_default = "/assets/styles-B5RtVJji.css";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#09090b"
			},
			{
				name: "description",
				content: "Paper-trading desk. Four AI agents, live tape, your book."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaleHydrator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedToaster, {})] }) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
function ThemedToaster() {
	const { resolved } = useAppearance();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: resolved,
		position: "bottom-right",
		toastOptions: { className: "bg-elevated text-fg shadow-[var(--shadow-border)]" }
	});
}
var $$splitComponentImporter$1 = () => import("./routes-DRGdL766.mjs");
var Route$2 = createFileRoute("/")({
	loader: () => ({
		ok: false,
		error: "boot"
	}),
	staleTime: Infinity,
	pendingMs: Infinity,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./login-B2e4KHc2.mjs");
var Route$1 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	LoginRoute: Route$1.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$3
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { TooltipTrigger as a, LanguageSwitch as c, cn as d, t as f, useT as h, TooltipContent as i, PlaneMark as l, useLocale as m, Route$2 as n, useAppearance as o, txError as p, Tooltip as r, APP_NAME as s, router_exports as t, TakeoffSplash as u };
