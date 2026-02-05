import React from "react";

const Contact = () => {
  return (
    <section className="py-20 pt-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-6">Contact Us</h1>
        <p className="text-text-secondary mb-6">
          Have a question? Fill out the form and our support team will get back
          to you quickly.
        </p>
        <form className="bg-secondary p-8 rounded-xl">
          <div className="grid grid-cols-1 gap-4">
            <input
              className="px-4 py-3 rounded bg-primary border border-white/10 text-text-primary placeholder-text-secondary outline-none focus:border-accent"
              placeholder="Your name"
            />
            <input
              className="px-4 py-3 rounded bg-primary border border-white/10 text-text-primary placeholder-text-secondary outline-none focus:border-accent"
              placeholder="Email address"
            />
            <textarea
              rows={6}
              className="px-4 py-3 rounded bg-primary border border-white/10 text-text-primary placeholder-text-secondary outline-none focus:border-accent"
              placeholder="How can we help?"
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-accent text-white rounded-md font-semibold"
              >
                Send message
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
