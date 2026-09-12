"use client";

import DynamicFeature, { EvolutionPanel } from "../components/DynamicFeature";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-12">
      <h1 className="mb-4 text-4xl font-extrabold">Self-Evolving Website</h1>
      <DynamicFeature />
      <EvolutionPanel />
    </main>
  );
}
