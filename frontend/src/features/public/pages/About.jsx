import React from "react";
import { Link } from "react-router-dom";
import { Clapperboard, ShieldCheck, Users, TrendingUp, Globe2, Star } from "lucide-react";

const stats = [
  { number: "5M+", label: "Tickets Booked", icon: TrendingUp },
  { number: "200+", label: "Cinema Partners", icon: Users },
  { number: "50+", label: "Cities Served", icon: Globe2 },
];

const team = [
  {
    id: 1,
    name: "Elena Vance",
    role: "Head of Booking Operations",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQUKHZHy1Sp4myIMzRNZJ1ywZYTv6H0M07PVGaFkn2bowXKi5uDw2i9jpLGgNicGk7_WcES2RgDNVprE050kJzuBK6PpDlPMIextFV7DlrPo-Y-oIcTyELXW4Y_0_OM-Ue9tdtRFA_Ys7QTpS6Igxw1oYYn6StLBJzdDuYnYLEmAAVYirGPs8PwAi1ifTtOgySfwhjcdj1wsTg1VXrtulRHLnyTvCy8dKdho14ykSNfWIOYu1xpMcNGDda2ZW24QXeqV64cgcUELAl",
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "Customer Experience Lead",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4DrVWgmyrzn77QAByMmBD9SkV5fS5sV6Cb7RPac7sXnW_S-LAMJxn73g-8px_xCDMECBdDUnUyo7C3rJBjOad2p06KFsnVAwUw49RxNsu8OR6avvSSFJs_KPMA1fbzzpt-KV3D9efpexbVCMzEol0tvDvRtZFTJ8mGMfJBOOMhnBK6FtUWjld8a6xZ3DVEykwWSJ6Bf_KuZg2p_AJzAqWdd5N54jewPHBt7T-plagjQt1C8nbG_4it-MpS0EK28XvCGwr_QHms9Hu",
  },
  {
    id: 3,
    name: "Sarah Chen",
    role: "Technology & Innovation Head",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXg5-sWRNSCKSVeVp3FQ8NhA3BfsYiBIWUVdCHDeaY8CN8RXkQrY4wJeeUqL-yZLHaGveSxRXy5MvSi4EpC2nF1bVO7YRMgFzl1QGr1r52nPAhoAn79nlPI4YxvKFojURjo-Y1gAopjKAaOkWOmVzxenUzEN7dgk6UfAY7FnSx4OHIxxkmeWLw9_n80HiVBiVVSWF9LrH49Jm0l9eACNrvRDAXBoU9zjdJHSohMqTVEQAOaXz0k2Pxtzmrr_0ULTL--lFo2CdUvAEv",
  },
];

const About = () => {
  return (
    <main className="pb-4 pt-24">
      <section className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.20),transparent_45%)]" />
          <div className="relative space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Clapperboard size={14} />
              About Cinema Hub
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-text-primary md:text-5xl">
              Built to make movie booking smooth, fast, and reliable.
            </h1>
            <p className="max-w-3xl text-sm text-text-secondary md:text-base">
              Cinema Hub connects audiences and theaters through one focused platform. From discovering what is playing to choosing seats and confirming bookings, every step is designed to be clear and friction-free.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black p-6">
            <h2 className="mb-3 text-2xl font-bold text-text-primary">Our Vision</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              To become the most trusted movie-booking experience where discovering films, selecting theaters, and reserving seats feel effortless for every viewer.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black p-6">
            <h2 className="mb-3 text-2xl font-bold text-text-primary">Our Promise</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Consistent performance, transparent booking flows, and dependable support for users, theater partners, and admins across all core features.
            </p>
          </article>
        </div>
      </section>

      <section className="container mx-auto px-6 py-6">
        <h2 className="mb-6 text-3xl font-bold text-text-primary">Numbers That Define Us</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-2xl border border-accent/20 bg-accent/10 p-6"
              >
                <Icon className="mb-4 text-accent" size={20} />
                <p className="text-4xl font-black tracking-tight text-accent">{item.number}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
                  {item.label}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-text-primary">Team Behind The Platform</h2>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-3 py-1 text-xs font-semibold text-text-secondary">
            <ShieldCheck size={14} />
            Trusted Operations
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <article
              key={member.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="h-72 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-bold text-text-primary">{member.name}</h3>
                <p className="text-sm font-semibold text-accent">{member.role}</p>
                <p className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  <Star size={12} className="text-accent" fill="currentColor" />
                  Focused on quality cinema experience
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto mt-8 px-6 py-4">
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-[#2a0a0a] to-black p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Hall Admin</p>
          <h2 className="mt-2 text-3xl font-extrabold text-text-primary">Join CinemaHub as a Hall Admin</h2>
          <p className="mt-3 max-w-3xl text-sm text-text-secondary md:text-base">
            Register as a hall admin to manage your cinema, schedules, and daily hall operations on CinemaHub.
          </p>
          <div className="mt-5">
            <Link
              to="/hall-staff/apply"
              className="inline-flex items-center rounded-lg bg-[#d72626] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#d72626]/20 transition hover:bg-[#bb1f1f]"
            >
              Apply as Hall Admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
