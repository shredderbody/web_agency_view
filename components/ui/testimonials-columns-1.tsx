"use client";
import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className} style={{ overflow: "hidden" }}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
        style={{ background: "var(--paper)" }}
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="card max-w-xs w-full"
                style={{ padding: "1.6rem", boxShadow: "var(--shadow-sm)" }}
              >
                <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>
                  {text}
                </p>
                <div className="flex items-center gap-3" style={{ marginTop: "1.1rem" }}>
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="rounded-full"
                    style={{ width: "2.4rem", height: "2.4rem", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div className="flex flex-col" style={{ gap: "0.1rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", lineHeight: 1.3, color: "var(--ink)" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", lineHeight: 1.3 }}>
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
