"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  Check,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Link2,
  Palette,
  Star,
  Phone,
  MapPin,
} from "lucide-react";

// Logo Cloud Data - Professional companies
const logos = [
  { name: "Vercel", icon: "▲" },
  { name: "Stripe", icon: "⊳" },
  { name: "Notion", icon: "⊗" },
  { name: "Linear", icon: "→" },
  { name: "Figma", icon: "◯" },
  { name: "GitHub", icon: "◉" },
];

// Features Data
const features = [
  {
    icon: CreditCard,
    title: "Accept payments",
    description:
      "You can monetize your bookings through our Stripe integration.",
  },
  {
    icon: Video,
    title: "Built-in video conferencing",
    description: "Cal Video is our in-house video conferencing platform.",
  },
  {
    icon: Link2,
    title: "Short booking links",
    description:
      "Each booking link can be short which makes it easy to remember.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    description:
      "Our solution has been designed to keep your information private and protected.",
  },
  {
    icon: Globe,
    title: "65+ languages",
    description:
      "Talk to anyone around the globe with support for 65+ languages.",
  },
  {
    icon: Palette,
    title: "Simple customization",
    description: "Easily customize your booking page to fit your brand.",
  },
];

// Testimonials Data
const testimonials = [
  {
    name: "Guillermo Rauch",
    handle: "@rauchg",
    avatar: "GR",
    content:
      "Coolest domain. Check. Coolest mission. Check. Coolest product. Check. Cal.com",
    color: "bg-neutral-700",
  },
  {
    name: "Anurag Banerjee",
    handle: "@anurag_banerjee",
    avatar: "AB",
    content:
      "Switched from Calendly in an instant. Love their open source model. And of course, beautiful design!",
    color: "bg-neutral-600",
  },
  {
    name: "Chris Lee",
    handle: "@chris_lee",
    avatar: "CL",
    content:
      "I've had Cal.com for a year and it's incredible how far they've come. This is by far the best scheduling app on the market today.",
    color: "bg-neutral-800",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                Cal
              </div>
              <span className="font-semibold text-lg">Cal.com</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                How it works
              </Link>
              <Link
                href="#testimonials"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                Pricing
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-medium text-neutral-600 hover:text-neutral-900 transition px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-lg shadow-neutral-900/20"
              >
                Get started
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                Scheduling infrastructure for everyone
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                The better way to{" "}
                <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent">
                  schedule
                </span>{" "}
                your meetings
              </h1>

              <p className="text-xl text-neutral-600 leading-relaxed max-w-xl">
                A fully customizable scheduling software for individuals,
                businesses taking calls and developers building scheduling
                platforms.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-4 text-base font-semibold text-white hover:bg-neutral-800 transition shadow-lg shadow-neutral-900/20"
                >
                  Sign up with email
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 px-8 py-4 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition"
                >
                  Talk to sales
                </Link>
              </div>

              <p className="text-sm text-neutral-500 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card required
              </p>
            </motion.div>

            {/* Right Content - Calendar Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 border border-neutral-200 p-6 lg:p-8">
                {/* Booking Card Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    IV
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Isabella Valce</h3>
                    <p className="text-neutral-500 text-sm">
                      Photoshoot Session
                    </p>
                  </div>
                </div>

                {/* Duration Options */}
                <div className="flex gap-2 mb-6">
                  {["15m", "30m", "45m", "1h"].map((duration, i) => (
                    <button
                      key={duration}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        i === 1
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>

                {/* Mini Calendar */}
                <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">January 2026</span>
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-neutral-200 transition">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <button className="p-1 rounded hover:bg-neutral-200 transition">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="p-2 text-neutral-400 font-medium">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <button
                        key={date}
                        className={`p-2 rounded-lg text-sm transition ${
                          date === 16
                            ? "bg-neutral-900 text-white font-semibold"
                            : date < 16
                            ? "text-neutral-300"
                            : "text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Video className="w-4 h-4" />
                  Cal Video • 30 mins
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full blur-3xl opacity-60" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-60" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 border-y border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500 mb-8">
            Trusted by fast-growing companies around the world
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition"
              >
                <span className="text-2xl font-bold">{logo.icon}</span>
                <span className="text-lg font-semibold">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              With us, appointment scheduling is easy
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Effortless scheduling for business and individuals, powerful
              solutions for fast-growing modern companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200 p-8 h-full">
                <span className="text-6xl font-bold text-neutral-100">01</span>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                    <Calendar className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Connect your calendar
                  </h3>
                  <p className="text-neutral-600">
                    We'll handle all the cross-referencing, so you don't have to
                    worry about double bookings.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200 p-8 h-full">
                <span className="text-6xl font-bold text-neutral-100">02</span>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                    <Clock className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Set your availability
                  </h3>
                  <p className="text-neutral-600">
                    Want to block off weekends? Set up any buffers? We make that
                    easy.
                  </p>
                </div>
                {/* Mini Schedule Preview */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-neutral-100">
                    <span className="text-sm font-medium">Mon</span>
                    <span className="text-sm text-neutral-500">
                      8:30 am - 5:00 pm
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-neutral-100">
                    <span className="text-sm font-medium">Tue</span>
                    <span className="text-sm text-neutral-500">
                      9:00 am - 6:30 pm
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200 p-8 h-full">
                <span className="text-6xl font-bold text-neutral-100">03</span>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                    <Video className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Choose how to meet
                  </h3>
                  <p className="text-neutral-600">
                    It could be a video chat, phone call, or a walk in the park!
                  </p>
                </div>
                {/* Meeting Options */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-neutral-200 text-sm flex items-center gap-1">
                    <Video className="w-4 h-4" /> Cal Video
                  </span>
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-neutral-200 text-sm flex items-center gap-1">
                    <Phone className="w-4 h-4" /> Phone
                  </span>
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-neutral-200 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> In person
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Features
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              …and so much more!
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover a variety of our advanced features. Unlimited and free
              for individuals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:shadow-neutral-200/50 hover:border-neutral-300 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:gap-3 transition-all"
            >
              Explore all features
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Don't just take our word for it
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our users are our best ambassadors. Discover why we're the top
              choice for scheduling meetings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-500">
                      {testimonial.handle}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 whitespace-pre-line">
                  {testimonial.content}
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-neutral-900 rounded-3xl p-12 lg:p-16 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
            </div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                Smarter, simpler scheduling
              </h2>
              <p className="text-neutral-300 text-lg max-w-xl mx-auto">
                Join thousands of businesses and individuals who have
                transformed their scheduling workflow with Cal.com.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 transition shadow-lg"
                >
                  Get started for free
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-700 px-8 py-4 text-base font-semibold text-white hover:bg-neutral-800 transition"
                >
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-bold text-sm">
                  Cal
                </div>
                <span className="font-semibold text-lg">Cal.com</span>
              </Link>
              <p className="text-neutral-400 text-sm">
                Our mission is to connect a billion people by 2031 through
                calendar scheduling.
              </p>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    For Individuals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    For Teams
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    For Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Self-hosted
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-400">
              © 2026 Cal.com, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
