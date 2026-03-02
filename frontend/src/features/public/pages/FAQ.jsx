import React from "react";

const FAQ = () => (
  <section className="py-20 pt-24">
    <div className="container mx-auto px-6 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-4">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4 text-text-secondary">
        <div>
          <h4 className="font-semibold">How do I book tickets?</h4>
          <p>Go to the movie page and choose a showtime, then book seats.</p>
        </div>
        <div>
          <h4 className="font-semibold">Can I change my seat?</h4>
          <p>You can update seat selection during checkout where allowed.</p>
        </div>
      </div>
    </div>
  </section>
);

export default FAQ;
