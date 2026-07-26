"use client";

import { motion } from "framer-motion";
import { Annotation, HandDrawnCircle } from "./Doodles";

export function Problem() {
  return (
    <section className="relative px-6 md:px-12 max-w-[1000px] mx-auto border-b border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-16 items-start">
        
        {/* Left: Section Header */}
        <div className="sticky top-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <div className="text-[12px] font-bold tracking-widest text-slate-400 uppercase">The Problem</div>
            <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-slate-900 leading-tight">
              Knowledge rots <br/> in pull requests.
            </h2>
          </motion.div>
        </div>

        {/* Right: Editorial Notebook Style */}
        <div className="flex flex-col gap-12 text-[16px] md:text-[18px] text-slate-600 leading-[1.7] relative">
          
          <Annotation text="Lost context!" className="absolute -top-8 right-0 hidden md:block" delay={0.2} />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <p>
              When a project scales, the reasoning behind critical technical choices vanishes into old Slack threads and closed PRs. Six months later, nobody remembers why <strong className="text-slate-900 font-semibold">Zustand</strong> was chosen over <strong className="text-slate-900 font-semibold">Redux</strong>.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="pl-6 border-l-2 border-slate-200 relative"
          >
            <HandDrawnCircle className="absolute -left-12 top-4 w-24 h-24 hidden md:block pointer-events-none" delay={0.4} />
            <p className="italic text-slate-500 mb-6">
              "Without enforcement, new engineers unknowingly reverse previous decisions, leading to a tangled codebase and weeks of lost onboarding time."
            </p>
            <p className="italic text-slate-500">
              "Teams struggle to maintain a unified architecture pattern. One microservice uses REST, the next uses GraphQL, completely violating the original design requirements."
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <h3 className="text-[20px] font-semibold text-slate-900 mb-3">Enforce a Single Source of Truth</h3>
            <p className="mb-4">
              Traditional documentation doesn't work. It requires manual updates, which means it is out of date the moment it is written.
            </p>
            <p>
              DevBoard solves this by deeply integrating into your development workflow. It helps you <strong className="text-slate-900 font-semibold">keep and maintain a single architecture design</strong> as per your project's exact requirements. By automatically analyzing every commit, it ensures that your foundational rules—whether it's using specific libraries, enforcing folder structures, or standardizing API patterns—are universally applied and never forgotten.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
