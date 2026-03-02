import React from "react";
import {
  CircleUserRound,
  Ticket,
  Wallet,
  CreditCard,
  Heart,
  Settings,
  MapPin,
  Clock3,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import avatar from "../assets/avatar.png";
import dunePoster from "../assets/Dune.jpg";
import oppenheimerPoster from "../assets/Oppenheimer.jpg";
import interstellarPoster from "../assets/interstellar.jpg";
import batmanPoster from "../assets/Batman.png";

const MENU_ITEMS = [
  { label: "My Account", icon: CircleUserRound },
  { label: "My Tickets", icon: Ticket, active: true },
  { label: "My Wallet", icon: Wallet },
  { label: "Payments", icon: CreditCard },
  { label: "My Watchlist", icon: Heart },
  { label: "Settings", icon: Settings },
];

const UPCOMING = [
  {
    id: "u1",
    title: "Dune: Part Two",
    dateTime: "Tuesday, Jul 8, 10:30",
    venue: "Regal Gallery Place",
    seats: "4 Tickets • B6, B7, B8, B9",
    poster: dunePoster,
    status: "Upcoming",
  },
];

const PAST = [
  {
    id: "p1",
    title: "Oppenheimer",
    dateTime: "Tuesday, Jul 1, 10:30",
    venue: "Regal Gallery Place & 4DX",
    seats: "3 Tickets • H6, H7, H8",
    poster: oppenheimerPoster,
    status: "Completed",
  },
  {
    id: "p2",
    title: "Interstellar",
    dateTime: "Friday, Jun 21, 08:15",
    venue: "Regal City Center",
    seats: "2 Tickets • D5, D6",
    poster: interstellarPoster,
    status: "Completed",
  },
  {
    id: "p3",
    title: "The Batman",
    dateTime: "Sunday, Jun 9, 09:00",
    venue: "Regal Gallery Place & 4DX",
    seats: "2 Tickets • E3, E4",
    poster: batmanPoster,
    status: "Completed",
  },
];

const TicketRow = ({ ticket }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1022]/90 p-4 transition-all duration-300 hover:border-[#e7df58]/50 hover:bg-[#101934] md:p-5">
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e7df58]/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 md:h-28 md:w-28" />
    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <img
          src={ticket.poster}
          alt={`${ticket.title} poster`}
          className="h-20 w-14 rounded-lg object-cover shadow-lg shadow-black/30"
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-white">{ticket.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
            <Clock3 size={14} className="text-[#e7df58]" />
            {ticket.dateTime}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={14} className="text-[#e7df58]" />
            {ticket.venue}
          </p>
          <p className="mt-1 text-sm text-slate-400">{ticket.seats}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
            ticket.status === "Upcoming"
              ? "border-[#e7df58]/60 bg-[#e7df58]/15 text-[#f3ec7d]"
              : "border-slate-500/50 bg-slate-500/15 text-slate-300"
          }`}
        >
          {ticket.status}
        </span>
        <button className="inline-flex items-center gap-2 rounded-lg border border-white/35 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-[#e7df58] hover:text-[#e7df58]">
          View Details
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </article>
);

const TicketSection = ({ title, subtitle, tickets }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        {tickets.length} {tickets.length === 1 ? "item" : "items"}
      </span>
    </div>
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} />
      ))}
    </div>
  </section>
);

const Profile = () => {
  return (
    <div className="min-h-screen bg-[#020614] pb-16 pt-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(231,223,88,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(48,84,204,0.16),transparent_36%)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-[280px_1fr] md:px-6">
        <aside className="rounded-2xl border border-white/10 bg-[#050b1f]/90 p-5 shadow-xl shadow-black/40">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="User avatar"
              className="h-16 w-16 rounded-xl border border-white/15 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">Luna Caldwell</p>
              <p className="truncate text-sm text-slate-400">l.caldwell@gmail.com</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {MENU_ITEMS.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base transition-colors ${
                  active
                    ? "bg-[#e7df58]/15 font-semibold text-[#f3ec7d]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border border-white/10 bg-[#050b1f]/85 p-5 shadow-xl shadow-black/40 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e7df58]">Profile Panel</p>
              <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">My Tickets</h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-300 md:flex">
              <CalendarClock size={15} className="text-[#e7df58]" />
              Updated Just Now
            </div>
          </div>

          <div className="space-y-10">
            <TicketSection
              title="Upcoming Tickets & Orders"
              subtitle="Your next movie nights are lined up."
              tickets={UPCOMING}
            />
            <TicketSection
              title="Past Tickets & Orders"
              subtitle="Recent bookings you have completed."
              tickets={PAST}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
