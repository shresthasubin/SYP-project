import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Menu,
  X,
  Ticket,
  ChevronDown,
  LogOut,
  Bell,
  MapPin,
  Search,
  Crosshair,
  Building2,
  Mountain,
  Landmark,
  Castle,
  Home,
  Tent,
} from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { API_BASE_URL } from "../config/api.js";
import "../../index.css";
import biratnagarImg from "../../assets/location/biratnagar.png";
import butwalImg from "../../assets/location/butwal.png";
import chitwanImg from "../../assets/location/chitwan.png";
import dharanImg from "../../assets/location/dharan.png";
import inaruwaImg from "../../assets/location/inaruwa.png";
import itahariImg from "../../assets/location/itahari.png";
import janakpurImg from "../../assets/location/janakpur.png";
import kathmanduImg from "../../assets/location/kathmandu.png";
import lalitpurImg from "../../assets/location/lalitpur.png";
import pokharaImg from "../../assets/location/pokhara.png";
import dhankutaImg from "../../assets/location/dhankuta.png";
import damakImg from "../../assets/location/damak.png";
import lumbiniImg from "../../assets/location/lumbini.png";
import birgunjImg from "../../assets/location/birgunj.png";
const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/movies", label: "Movies" },
  { to: "/locations", label: "Locations" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const NEPALI_CITIES = [
  { name: "Kathmandu", icon: Landmark, lat: 27.7172, lon: 85.324, image: kathmanduImg },
  { name: "Pokhara", icon: Mountain, lat: 28.2096, lon: 83.9856, image: pokharaImg },
  { name: "Lalitpur", icon: Building2, lat: 27.6644, lon: 85.3188, image: lalitpurImg },
  { name: "Biratnagar", icon: Home, lat: 26.4525, lon: 87.2718, image: biratnagarImg },
  {name:"Dhankuta", icon: Castle, lat: 26.9833, lon: 87.3333, image: dhankutaImg},
 {name:"Lumbini", icon: Landmark, lat: 27.4844, lon: 83.2761, image: lumbiniImg},
 { name: "Damak", icon: Home, lat: 26.75, lon: 87.2833, image: damakImg },
 { name: "Butwal", icon: Home, lat: 27.6866, lon: 83.4323, image: butwalImg },
 { name: "Chitwan", icon: Tent, lat: 27.5291, lon: 84.3542, image: chitwanImg },
 { name: "Dharan", icon: Building2, lat: 26.8142, lon: 87.2797, image: dharanImg },
 {name:"Birgunj", icon: Home, lat: 27.0000, lon: 84.8667, image: birgunjImg},
  { name: "Inaruwa", icon: Home, lat: 26.6068, lon: 87.1478, image: inaruwaImg },
  { name: "Itahari", icon: Home, lat: 26.663, lon: 87.274, image: itahariImg },
  { name: "Janakpur", icon: Landmark, lat: 26.7288, lon: 85.926, image: janakpurImg },
];

const ALL_NEPAL_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bharatpur",
  "Pokhara",
  "Biratnagar",
  "Birgunj",
  "Dharan",
  "Itahari",
  "Janakpurdham",
  "Jitpur Simara",
  "Kalaiya",
  "Hetauda",
  "Butwal",
  "Ghorahi",
  "Tulsipur",
  "Nepalgunj",
  "Dhangadhi",
  "Anbu Khaireni",
  "Baglung",
  "Baisi",
  "Bajhang",
  "Bandipur",
  "Banepa",
  "Bangad Kupinde",
  "Barahathawa",
  "Barbardiya",
  "Barhabise",
  "Barhathawa",
  "Belauri",
  "Belbari",
  "Belkotgadhi",
  "Belkotgadi",
  "Beni",
  "Besisahar",
  "Bhadrapur",
  "Bhagawatimai",
  "Bhajani",
  "Bhaktapur",
  "Bhangaha",
  "Bheri",
  "Bhimad",
  "Bhimeshwar",
  "Bhimsen Thapa",
  "Bhirkot",
  "Bhojpur",
  "Bhojpur M",
  "Bhumikasthan",
  "Bideha",
  "Bidur",
  "Binayi Triveni",
  "Birendranagar",
  "Birgunj M",
  "Birtamod",
  "Bodebarsain",
  "Budhanilkantha",
  "Budhiganga",
  "Bungal",
  "Bungamati",
  "Byas",
  "Chainpur",
  "Chandannath",
  "Chandragiri",
  "Chapakot",
  "Chaurjahari",
  "Chautara Sangachokgadhi",
  "Dahachok",
  "Dakshinkali",
  "Damak",
  "Dapcha",
  "Dasharathchand",
  "Deumai",
  "Dhangadhimai",
  "Dhangadhi M",
  "Dharan Sub M",
  "Dhulikhel",
  "Dhunibeshi",
  "Diktel Rupakot Majhuwagadhi",
  "Dipayal Silgadhi",
  "Dudhouli",
  "Duhabi",
  "Dullu",
  "Gadhimai",
  "Galkot",
  "Gaindakot",
  "Gaur",
  "Gauradaha",
  "Ghorahi Sub M",
  "Godaita",
  "Godavari",
  "Gokarneshwar",
  "Golbazar",
  "Gorkha",
  "Gosaikunda",
  "Gujara",
  "Gulmi Durbar",
  "Hanumannagar Kankalini",
  "Haripur",
  "Haripurwa",
  "Hariwan",
  "Helambu",
  "Hetauda Sub M",
  "Ilam",
  "Inaruwa",
  "Ishnath",
  "Jaleshwar",
  "Janaki",
  "Jaya Prithvi",
  "Jiri",
  "Kabilas",
  "Kageshwori Manohara",
  "Kailali",
  "Kakarbhitta",
  "Kaligandaki",
  "Kalika",
  "Kamalamai",
  "Kanchanrup",
  "Kankai",
  "Kapilvastu",
  "Karjanha",
  "Katahariya",
  "Katari",
  "Kawasoti",
  "Khadak",
  "Khalanga",
  "Khandachakra",
  "Khairhani",
  "Kirtipur",
  "Kohalpur",
  "Kolhabi",
  "Krishnanagar",
  "Kshireshwarnath",
  "Kusma",
  "Lahan",
  "Lalbandi",
  "Lamahi",
  "Lekam",
  "Lekbeshi",
  "Loharpatti",
  "Madhav Narayan",
  "Madhyapur Thimi",
  "Madhyabindu",
  "Madhyanepal",
  "Madhuwan",
  "Malarani",
  "Malangwa",
  "Mangalsen",
  "Manthali",
  "Mayadevi",
  "Mechinagar",
  "Melamchi",
  "Mithila",
  "Mithila Bihari",
  "Musikot, Western Rukum",
  "Musikot, Gulmi",
  "Muzhila",
  "Nagarjun",
  "Nalgad",
  "Namobuddha",
  "Narayan",
  "Narayani",
  "Narayangarh",
  "Narayani M",
  "Nawadurga",
  "Nepa",
  "Nepalgunj Sub M",
  "Nijgadh",
  "Nilkantha",
  "Pakhribas",
  "Palungtar",
  "Panauti",
  "Parashuram",
  "Paroha",
  "Phidim",
  "Phungling",
  "Pokhariya",
  "Prithvi Narayan",
  "Pyuthan",
  "Rajbiraj",
  "Rajdevi",
  "Rajpur",
  "Ramdhuni",
  "Ramechhap",
  "Ramgram",
  "Rapti",
  "Ratnanagar",
  "Ratuwamai",
  "Resunga",
  "Rolpa",
  "Ruru",
  "Sainamaina",
  "Sandhikharka",
  "Sankharapur",
  "Shahidnagar",
  "Shikhar",
  "Shivaraj",
  "Shuklagandaki",
  "Shuklaphanta",
  "Simraungadh",
  "Siraha",
  "Sitganga",
  "Sundar Haraicha",
  "Suryabinayak",
  "Suryodaya",
  "Swargadwari",
  "Tansen",
  "Tarakeshwar",
  "Thaha",
  "Thakurbaba",
  "Tilottama",
  "Tokha",
  "Tribenimunicipality",
  "Tripura Sundari",
  "Triveni",
  "Tulsipur Sub M",
  "Urlabari",
  "Waling",
  "Bhanu",
  "Bidur M",
  "Dudhauli",
  "Aathbiskot",
  "Balarampur",
  "Bagchaur",
  "Bahudarmai",
  "Bannigadhi Jayagadh",
  "Barahachhetra",
  "Belauri M",
  "Bungal M",
  "Champadevi",
  "Chandrapur",
  "Duhabi M",
  "Ghodaghodi",
  "Jaleshwar M",
  "Jumla",
  "Kamal",
  "Khandbari",
  "Kirtipur M",
  "Mahakali",
  "Madhyabindu M",
  "Mahalaxmi",
  "Mayadevi M",
  "Mechinagar M",
  "Mirchaiya",
  "Pakriwas",
  "Phungling (Taplejung)",
  "Putalibazar",
  "Rajarani",
  "Ramnagar",
  "Rampur",
  "Shankharapur",
  "Siddharthanagar",
  "Siddharthanagar M",
  "Sitganga M",
  "Sukhadh",
  "Surunga",
  "Tansen M",
  "Thakurdwara",
  "Triyuga",
  "Vyas",
  "Aathabis",
  "Aathrai Tribeni",
  "Agyauli",
  "Anarmani",
  "Arghakhanchi",
  "Arjundhara",
  "Badimalika",
  "Bagchaur M",
  "Baitadi",
  "Balara",
  "Bardaghat",
  "Bardaghat M",
  "Bardibas",
  "Barhabise M",
  "Belaka",
  "Bhagwati",
  "Bharatpur M",
  "Bhimad M",
  "Bhimdatta",
  "Bhojpur M (new)",
  "Birtamod M",
  "Bode Barsain",
  "Bodebarsain M",
  "Buddhabhumi",
  "Chandannath M",
  "Damak M",
  "Devchuli",
  "Dhangadhi",
  "Dhulikhel M",
  "Dhunibeshi M",
  "Dipayal Silgadhi M",
  "Gadhawa",
  "Gaindakot M",
  "Galkot M",
  "Ghodaghodi M",
  "Godawari",
  "Harion",
  "Inaruwa M",
  "Ishwarpur",
  "Jiri M",
  "Kamalbazar",
  "Kanchanpur",
  "Kankai M",
  "Kapilvastu M",
  "Katari M",
  "Kawasoti M",
  "Kohalpur M",
  "Laligurans",
  "Lamki Chuha",
  "Mahagadhimai",
  "Maharajgunj",
  "Mithila Bihari M",
  "Nagarjun M",
  "Nalgad M",
  "Naugad",
  "Neelkantha",
  "Padampur",
  "Panchkhal",
  "Paroha M",
  "Pokhariya M",
  "Punarbas",
  "Pyuthan M",
  "Rajapur",
  "Rajarani M",
  "Shadanand",
  "Shahid Lakhan",
  "Shikhar M",
  "Shuklagandaki M",
  "Siddhakali",
  "Siddharthanagar Sub M",
  "Sirijangha",
  "Sukhad",
  "Surunga M",
  "Taplejung",
  "Thimi",
  "Tikapur",
  "Tribeni",
  "Triveni M",
  "Tulsipur",
  "Waling M",
];

const normalizeCityName = (name) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\bsub\s*m\b/g, " ")
    .replace(/\bm\b/g, " ")
    .replace(/municipality/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (name) =>
  name.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const PRIMARY_CITY_NAMES = new Set(NEPALI_CITIES.map((city) => normalizeCityName(city.name)));
const OTHER_NEPALI_CITIES = (() => {
  const seen = new Set();
  const list = [];
  for (const rawCity of ALL_NEPAL_CITIES) {
    const normalized = normalizeCityName(rawCity);
    if (!normalized || PRIMARY_CITY_NAMES.has(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    list.push({ value: toTitleCase(normalized), label: toTitleCase(normalized) });
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
})();

const toRad = (v) => (v * Math.PI) / 180;
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const LOCATION_CITY_STORAGE_KEY = "selected_city";
const LOCATION_CITY_EVENT = "city-changed";
const ALL_NEPAL_CITY = "All Nepal";

const formatNotificationTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 1) return "Just now";
  if (Math.abs(minutes) < 60) return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(days, "day");

  return date.toLocaleDateString();
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_CITY_STORAGE_KEY) || "Kathmandu";
    } catch {
      return "Kathmandu";
    }
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { isDark } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const locationRef = useRef(null);

  const displayName = useMemo(() => {
    const fromUser = user?.fullname || user?.fullName || user?.name;
    if (fromUser) return fromUser;
    if (user?.email) return user.email.split("@")[0];
    return "Profile";
  }, [user]);

  const profileInitial = useMemo(
    () => (displayName?.trim()?.[0] || "P").toUpperCase(),
    [displayName],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item?.isRead).length,
    [notifications],
  );

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return NEPALI_CITIES;
    return NEPALI_CITIES.filter((city) => city.name.toLowerCase().includes(q));
  }, [citySearch]);

  const filteredOtherCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return OTHER_NEPALI_CITIES;
    return OTHER_NEPALI_CITIES.filter((city) => city.label.toLowerCase().includes(q));
  }, [citySearch]);

  const shellClass = isDark
    ? scrolled
      ? "border-white/20 bg-secondary/95 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-lg"
      : "border-white/10 bg-secondary/80 backdrop-blur-md"
    : scrolled
      ? "border-black/10 bg-white/95 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-lg"
      : "border-black/10 bg-white/90 backdrop-blur-md";

  const tabShellClass = isDark
    ? "border-white/10 bg-primary/40"
    : "border-black/10 bg-black/[0.03]";

  const subtleBtnClass = isDark
    ? "border-white/10 bg-primary/40 hover:border-white/20 hover:bg-white/10"
    : "border-black/10 bg-black/[0.03] hover:border-black/20 hover:bg-black/[0.06]";

  const signInClass = isDark
    ? "border-white/15 hover:bg-white/10"
    : "border-black/15 hover:bg-black/[0.05]";

  const mobilePanelClass = isDark
    ? "border-white/10 bg-secondary/95"
    : "border-black/10 bg-white/95";

  const profilePanelClass = isDark
    ? "border-white/10 bg-secondary/95"
    : "border-black/10 bg-white/95";

  const locationPanelClass = isDark
    ? "border-white/15 bg-[#111827]"
    : "border-black/15 bg-white";

  const navInactiveClass = "nav-item text-text-secondary";
  const navActiveClass = "nav-item nav-item-active";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
    setLocationOpen(false);
    setLocationError("");
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setNotificationsError("");
      setNotificationsLoading(false);
      return;
    }

    let active = true;

    const fetchNotifications = async ({ silent = false } = {}) => {
      if (!silent) setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/notification/get-notification/${user.id}`,
          { withCredentials: true },
        );

        if (!active) return;
        const items = Array.isArray(response.data?.data) ? response.data.data : [];
        setNotifications(
          items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
        );
      } catch (error) {
        if (!active) return;
        setNotificationsError(error.response?.data?.message || "Failed to load notifications");
      } finally {
        if (active && !silent) setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    const intervalId = window.setInterval(() => fetchNotifications({ silent: true }), 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, user?.id]);

  const markNotificationAsRead = async (notificationId) => {
    const id = Number(notificationId);
    if (!Number.isInteger(id) || id <= 0) return;

    setNotifications((prev) => prev.map((item) => (
      Number(item.id) === id ? { ...item, isRead: true } : item
    )));

    try {
      await axios.put(
        `${API_BASE_URL}/notification/get-notification/${id}/read`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      setNotifications((prev) => prev.map((item) => (
        Number(item.id) === id ? { ...item, isRead: false } : item
      )));
      setNotificationsError(error.response?.data?.message || "Failed to mark notification as read");
    }
  };

  const applySelectedCity = (cityName) => {
    setSelectedCity(cityName);
    try {
      localStorage.setItem(LOCATION_CITY_STORAGE_KEY, cityName);
      window.dispatchEvent(new CustomEvent(LOCATION_CITY_EVENT, { detail: { city: cityName } }));
    } catch {
      // no-op if storage/events are unavailable
    }
  };

  const detectCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let nearest = NEPALI_CITIES[0];
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const city of NEPALI_CITIES) {
          const d = haversineKm(latitude, longitude, city.lat, city.lon);
          if (d < bestDistance) {
            bestDistance = d;
            nearest = city;
          }
        }

        applySelectedCity(nearest.name);
        setLocationOpen(false);
        setDetectingLocation(false);
      },
      (error) => {
        let msg = "Unable to detect your location.";
        if (error.code === 1) msg = "Location permission denied.";
        if (error.code === 2) msg = "Location unavailable.";
        if (error.code === 3) msg = "Location request timed out.";
        setLocationError(msg);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <nav className="sticky top-0 left-0 z-50 w-full px-4 py-4 md:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 md:px-5 ${shellClass}`}
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-text-primary md:text-xl"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-accent text-white">
            <Ticket size={15} />
          </span>
          Cinema Hub
        </Link>

        <ul className={`hidden items-center gap-1 rounded-xl border p-1 md:flex ${tabShellClass}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg border border-transparent px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? navActiveClass
                      : navInactiveClass
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <div className="relative" ref={locationRef}>
            <button
              onClick={() => setLocationOpen((prev) => !prev)}
              className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
            >
              <MapPin size={15} className="text-accent" />
              <span>{selectedCity}</span>
              <ChevronDown
                size={15}
                className={`transition-transform ${locationOpen ? "rotate-180" : ""}`}
              />
            </button>

            {locationOpen && (
              <div className={`absolute -right-55 mt-8 w-[1280px] max-w-[92vw] rounded-2xl border p-4 shadow-2xl ${locationPanelClass}`}>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search for your city"
                    className={`w-full rounded-lg border px-9 py-2 text-sm outline-none ${subtleBtnClass}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  disabled={detectingLocation}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline "
                >
                  <Crosshair size={14} />
                  {detectingLocation ? "Detecting..." : "Detect my location"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applySelectedCity(ALL_NEPAL_CITY);
                    setLocationOpen(false);
                  }}
                  className="ml-4 mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                >
                  <MapPin size={14} />
                  Show halls all over Nepal
                </button>
                {locationError ? (
                  <p className="mt-2 text-xs text-rose-400">{locationError}</p>
                ) : null}
                <p className="mt-4 text-center text-sm font-semibold text-text-secondary">
                  Popular Cities in Nepal
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7">
                  {filteredCities.map((city) => {
                    const Icon = city.icon;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          applySelectedCity(city.name);
                          setLocationOpen(false);
                        }}
                        className="flex flex-col items-center gap-0.5 rounded-lg border border-transparent px-1 py-1 text-center text-xs text-text-secondary transition hover:border-white/20 hover:bg-white/5 hover:text-text-primary"
                      >
                        {city.image ? (
                          <img
                            src={city.image}
                            alt={`${city.name} location`}
                            className="h-20 w-24 rounded-lg object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="rounded-lg bg-black/20 p-2">
                            <Icon size={24} className={city.name === selectedCity ? "text-accent" : ""} />
                          </span>
                        )}
                        <span className="line-clamp-1">{city.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-text-secondary">
                  Other Cities in Nepal
                </p>
                <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-white/10 p-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {filteredOtherCities.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      onClick={() => {
                        applySelectedCity(city.value);
                        setLocationOpen(false);
                      }}
                      className="rounded-md border border-white/20 px-2 py-1 text-left text-xs font-medium text-text-secondary transition hover:border-accent hover:text-text-primary"
                    >
                      {city.label}
                    </button>
                    ))}
                  </div>
                </div>
               
              </div>
            )}
          </div>

          {loading ? (
            <span className={`rounded-lg border px-4 py-2 text-sm font-semibold text-text-secondary ${signInClass}`}>
              Loading...
            </span>
          ) : isAuthenticated ? (
            <>
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                  className={`relative rounded-lg border p-2 text-text-primary transition-colors ${signInClass}`}
                  aria-label="Open notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {notificationsOpen && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-xl border p-3 shadow-2xl ${profilePanelClass}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">Notifications</p>
                      <span className="text-xs text-text-secondary">{unreadCount} unread</span>
                    </div>

                    {notificationsLoading ? (
                      <p className="text-sm text-text-secondary">Loading notifications...</p>
                    ) : notificationsError ? (
                      <p className="text-sm text-rose-400">{notificationsError}</p>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm text-text-secondary">No notifications yet.</p>
                    ) : (
                      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                        {notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (!item.isRead) markNotificationAsRead(item.id);
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                              item.isRead ? "border-white/10 bg-white/[0.03]" : "border-accent/30 bg-accent/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text-primary">{item.title || "Notification"}</p>
                                <p className="mt-1 text-xs text-text-secondary">{item.message || ""}</p>
                              </div>
                              {!item.isRead ? <span className="mt-1 h-2 w-2 rounded-full bg-accent" /> : null}
                            </div>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-text-secondary/80">
                              {formatNotificationTime(item.createdAt)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {profileInitial}
                  </span>
                  <span className="max-w-28 truncate">{displayName}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-xl border p-3 shadow-2xl ${profilePanelClass}`}
                  >
                    <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="mb-3 truncate text-xs text-text-secondary">
                      {user?.email || "Signed in user"}
                    </p>
                    <Link
                      to="/profile"
                      className="block rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent hover:text-white"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="mt-2 flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent hover:text-white"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className={`rounded-lg border px-4 py-2 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="ml-3 flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLocationOpen((prev) => !prev)}
            className={`rounded-lg border p-2 text-text-primary ${subtleBtnClass}`}
            aria-label="Choose city"
          >
            <MapPin size={18} className="text-accent" />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={`rounded-lg border p-2 text-text-primary ${subtleBtnClass}`}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className={`mx-auto mt-2 max-w-6xl rounded-2xl border p-3 backdrop-blur-md md:hidden ${mobilePanelClass}`}>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setLocationOpen((prev) => !prev);
                setOpen(false);
              }}
              className={`mb-1 flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold text-text-primary ${signInClass}`}
            >
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} className="text-accent" />
                {selectedCity}
              </span>
              <ChevronDown size={15} />
            </button>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg border border-transparent px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? navActiveClass : navInactiveClass
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/movies"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-accent px-3 py-2 text-center text-sm font-bold text-white"
            >
              Book Now
            </Link>
            {loading ? (
              <span className={`mt-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-secondary ${signInClass}`}>
                Loading...
              </span>
            ) : isAuthenticated ? (
              <div className={`mt-1 rounded-lg border p-3 ${tabShellClass}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {profileInitial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="truncate text-xs text-text-secondary">{user?.email || ""}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-primary ${signInClass}`}
                >
                  View Profile
                </Link>
                <div className="mt-3 rounded-lg border border-white/10 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <Bell size={15} />
                      Notifications
                    </span>
                    <span className="text-xs text-text-secondary">{unreadCount} unread</span>
                  </div>
                  {notificationsLoading ? (
                    <p className="text-xs text-text-secondary">Loading notifications...</p>
                  ) : notificationsError ? (
                    <p className="text-xs text-rose-400">{notificationsError}</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-xs text-text-secondary">No notifications yet.</p>
                  ) : (
                    <div className="max-h-52 space-y-2 overflow-y-auto">
                      {notifications.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (!item.isRead) markNotificationAsRead(item.id);
                          }}
                          className={`w-full rounded-md border px-2 py-2 text-left ${
                            item.isRead ? "border-white/10 bg-white/[0.03]" : "border-accent/30 bg-accent/10"
                          }`}
                        >
                          <p className="text-xs font-semibold text-text-primary">{item.title || "Notification"}</p>
                          <p className="mt-1 text-[11px] text-text-secondary">{item.message || ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className={`mt-1 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-text-primary ${signInClass}`}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={`mt-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-primary ${signInClass}`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {locationOpen && (
        <div className={`mx-auto mt-2 max-w-6xl rounded-2xl border p-4 md:hidden ${locationPanelClass}`}>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search for your city"
              className={`w-full rounded-lg border px-9 py-2 text-sm outline-none ${subtleBtnClass}`}
            />
          </div>
          <button
            type="button"
            onClick={detectCurrentLocation}
            disabled={detectingLocation}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            <Crosshair size={14} />
            {detectingLocation ? "Detecting..." : "Detect my location"}
          </button>
          <button
            type="button"
            onClick={() => {
              applySelectedCity(ALL_NEPAL_CITY);
              setLocationOpen(false);
            }}
            className="ml-4 mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            <MapPin size={14} />
            Show halls all over Nepal
          </button>
          {locationError ? (
            <p className="mt-2 text-xs text-rose-400">{locationError}</p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {filteredCities.map((city) => {
              const Icon = city.icon;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    applySelectedCity(city.name);
                    setLocationOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-2 text-sm transition"
                >
                  {city.image ? (
                    <img
                      src={city.image}
                      alt={`${city.name} location`}
                      className="h-12 w-16 rounded-md object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Icon
                      size={18}
                      className={`${
                        city.name === selectedCity ? "text-accent" : "text-text-secondary"
                      }`}
                    />
                  )}
                  <span>{city.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-text-secondary">
            Other Cities in Nepal
          </p>
          <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredOtherCities.map((city) => (
              <button
                key={city.value}
                type="button"
                onClick={() => {
                  applySelectedCity(city.value);
                  setLocationOpen(false);
                }}
                className="rounded-md border border-white/20 px-2 py-1 text-left text-xs font-medium text-text-secondary transition hover:border-accent hover:text-text-primary"
              >
                {city.label}
              </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex justify-center">
          
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
