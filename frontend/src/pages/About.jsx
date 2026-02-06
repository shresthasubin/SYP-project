import React from "react";
import { Earth,ArrowUpRight } from "lucide-react";

const About = () => {
  const members = [
    {
      id: 1,
      name: "Elena Vance",
      role: "Head of Booking Operations",
      favoriteGenre: "Concerts",
      favoriteEvent: "Coachella 2023",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQUKHZHy1Sp4myIMzRNZJ1ywZYTv6H0M07PVGaFkn2bowXKi5uDw2i9jpLGgNicGk7_WcES2RgDNVprE050kJzuBK6PpDlPMIextFV7DlrPo-Y-oIcTyELXW4Y_0_OM-Ue9tdtRFA_Ys7QTpS6Igxw1oYYn6StLBJzdDuYnYLEmAAVYirGPs8PwAi1ifTtOgySfwhjcdj1wsTg1VXrtulRHLnyTvCy8dKdho14ykSNfWIOYu1xpMcNGDda2ZW24QXeqV64cgcUELAl",
    },
    {
      id: 2,
      name: "Marcus Thorne",
      role: "Customer Experience Lead",
      favoriteGenre: "Sports Events",
      favoriteEvent: "NBA Finals",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB4DrVWgmyrzn77QAByMmBD9SkV5fS5sV6Cb7RPac7sXnW_S-LAMJxn73g-8px_xCDMECBdDUnUyo7C3rJBjOad2p06KFsnVAwUw49RxNsu8OR6avvSSFJs_KPMA1fbzzpt-KV3D9efpexbVCMzEol0tvDvRtZFTJ8mGMfJBOOMhnBK6FtUWjld8a6xZ3DVEykwWSJ6Bf_KuZg2p_AJzAqWdd5N54jewPHBt7T-plagjQt1C8nbG_4it-MpS0EK28XvCGwr_QHms9Hu",
    },
    {
      id: 3,
      name: "Sarah Chen",
      role: "Technology & Innovation Head",
      favoriteGenre: "Theater & Arts",
      favoriteEvent: "Broadway's Hamilton",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCXg5-sWRNSCKSVeVp3FQ8NhA3BfsYiBIWUVdCHDeaY8CN8RXkQrY4wJeeUqL-yZLHaGveSxRXy5MvSi4EpC2nF1bVO7YRMgFzl1QGr1r52nPAhoAn79nlPI4YxvKFojURjo-Y1gAopjKAaOkWOmVzxenUzEN7dgk6UfAY7FnSx4OHIxxkmeWLw9_n80HiVBiVVSWF9LrH49Jm0l9eACNrvRDAXBoU9zjdJHSohMqTVEQAOaXz0k2Pxtzmrr_0ULTL--lFo2CdUvAEv",
    },
  ];

  const stats = [
    {
      number: "5M+",
      label: "Tickets Sold",
      growth: "+25% Growth",
    
    },
    {
      number: "10,000+",
      label: "Events Listed",
      growth: "+18% Growth",
     
    },
    {
      number: "50+",
      label: "Cities Covered",
      growth: "Expanding Monthly",
     
    },
  ];

  return (
    <main className="w-full">
      {/* Who We Are / Narrative Section */}
      <section className="py-24 px-6 lg:px-20 bg-primary dark:bg-primary">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent">
                <span className="material-symbols-outlined text-sm">
                  History of 
                </span>
                <span className="text-xs font-bold tracking-widest uppercase">
                  CINEMA HUB
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary dark:text-text-primary">
                Seamless Events, Unforgettable Experiences
              </h2>
              <p className="text-text-secondary dark:text-text-secondary text-lg leading-relaxed">
                We started with a simple goal: to make event booking effortless and accessible to everyone. In an era of complex ticketing systems, we chose the path of simplicity and reliability.
              </p>
              <p className="text-text-secondary dark:text-text-secondary text-lg leading-relaxed">
                Every event on our platform is carefully curated and verified. We don't just sell tickets; we provide seamless experiences, secure transactions, and exceptional support for event organizers and attendees alike.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 lg:pt-0">
              <div className="p-8 rounded-xl border border-secondary dark:border-secondary bg-secondary dark:bg-secondary flex flex-col gap-4">
                <span className="material-symbols-outlined text-accent text-4xl">
                  VISIBILITY
                </span>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary">
                  The Vision
                </h3>
                <p className="text-text-secondary dark:text-text-secondary text-sm">
                  To be the world's leading platform for seamless event discovery and booking across concerts, sports, theater, and more.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-secondary dark:border-secondary bg-secondary dark:bg-secondary flex flex-col gap-4">
                <span className="material-symbols-outlined text-accent text-4xl">
                  DEPLOYMENT
                </span>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary">
                  The Execution
                </h3>
                <p className="text-text-secondary dark:text-text-secondary text-sm">
                  A modern booking platform built for speed, security, and exceptional user experience from discovery to checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers that Define Us */}
      <section className="py-20 px-6 lg:px-20 bg-secondary dark:bg-secondary">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-text-primary dark:text-text-primary text-3xl font-bold">
              Numbers That Define Us
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group p-8 text-center rounded-2xl bg-accent/10 border border-accent/20 hover:bg-accent/20 dark:hover:bg-accent/30 transition-all duration-300"
              >
                <div className="text-accent text-5xl font-black mb-2 tracking-tighter">
                  {stat.number}
                </div>
                <p className="text-text-primary dark:text-text-primary font-medium uppercase tracking-[0.2em] text-xs">
                  {stat.label}
                </p>
                <div className="mt-4 flex items-center justify-center gap-1 text-accent text-sm">
                {idx==2?(<Earth/>):<ArrowUpRight/>}
                  <span>{stat.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet our members */}
      <section className="py-24 px-6 lg:px-20 bg-primary dark:bg-primary">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-bold text-text-primary dark:text-text-primary">
                Meet Our members
              </h2>
              <p className="text-text-secondary dark:text-text-secondary mt-2">
                The experts behind your seamless experience.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <div
                key={member.id}
                className="group relative bg-secondary dark:bg-secondary rounded-2xl overflow-hidden border border-secondary dark:border-secondary transition-all hover:shadow-2xl hover:shadow-accent/5 dark:hover:shadow-accent/10"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    alt={`Professional member ${member.name} portrait`}
                    src={member.image}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-1 text-text-primary dark:text-text-primary">
                    {member.name}
                  </h3>
                  <p className="text-accent text-sm font-bold tracking-widest uppercase mb-6">
                    {member.role}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent/20 text-accent">
                        <span className="material-symbols-outlined text-sm">
                          theaters
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-text-secondary">
                          Favorite Event Type
                        </p>
                        <p className="text-sm font-medium text-text-primary dark:text-text-primary">
                          {member.favoriteGenre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent/20 text-accent">
                        <span className="material-symbols-outlined text-sm">
                          star
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-text-secondary">
                          Memorable Event
                        </p>
                        <p className="text-sm font-medium italic text-text-primary dark:text-text-primary">
                          "{member.favoriteEvent}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-20 bg-red-600 dark:bg-secondary">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <h2 className="text-white dark:text-text-primary text-4xl font-black tracking-tight leading-none">
            Ready to experience amazing events?
          </h2>
          <p className="text-white/80 dark:text-text-secondary text-lg font-medium max-w-xl">
            Join millions of event enthusiasts and book your next unforgettable experience with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button className="bg-stone-800 text-white border-2 border-stone-900 px-10 py-4 rounded-lg font-bold hover:bg-stone-700 transition-colors uppercase tracking-widest text-sm dark:bg-red-600 dark:text-white dark:border-white dark:hover:bg-red-500">
              Browse Events
            </button>
            <button className="bg-red-600 text-white border-2 border-red-700 px-10 py-4 rounded-lg font-bold hover:bg-red-500 transition-colors uppercase tracking-widest text-sm dark:bg-red-600 dark:text-white dark:border-white dark:hover:bg-red-500">
              List Your Event
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
