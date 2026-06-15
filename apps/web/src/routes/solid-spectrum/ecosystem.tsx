import { createFileRoute } from "@tanstack/solid-router";
import { Header } from "@/components";
import { PageLayout } from "@proyecto-viviana/ui/PageLayout";
import { ProjectCard } from "@proyecto-viviana/ui/ProjectCard";

export const Route = createFileRoute("/solid-spectrum/ecosystem")({
  component: Ecosystem,
});

function Ecosystem() {
  return (
    <PageLayout withHeader>
      <Header />

      <main id="main-content" class="mx-auto max-w-6xl px-6 py-12">
        <h1 class="text-4xl font-semibold text-primary-100 drop-shadow-title-card">Ecosystem.</h1>
        <p class="font-sen text-lg text-primary-300 pb-8">
          The proyecto-viviana ecosystem: packages, tools, and applications built with our component
          library.
        </p>

        {/* Core Packages */}
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-primary-200 mb-4">Core Packages</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ProjectCard
              name="@proyecto-viviana/solid-spectrum"
              imageSrc="/images/ecosystem/ui.svg"
              size="sm"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solid-spectrum"
            />
            <ProjectCard
              name="@proyecto-viviana/solidaria-components"
              imageSrc="/images/ecosystem/solidaria.svg"
              size="sm"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solidaria-components"
            />
            <ProjectCard
              name="@proyecto-viviana/solidaria"
              imageSrc="/images/ecosystem/solidaria.svg"
              size="sm"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solidaria"
            />
            <ProjectCard
              name="@proyecto-viviana/solid-stately"
              imageSrc="/images/ecosystem/solid-stately.svg"
              size="sm"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solid-stately"
            />
          </div>
        </section>

        {/* Applications */}
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-primary-200 mb-4">Applications</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectCard
              name="PROYECTO VIVIANA"
              imageSrc="/images/ecosystem/proyecto-viviana.png"
              size="lg"
              href="https://proyecto-viviana.uy"
            />
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <h2 class="text-2xl font-semibold text-primary-200 mb-4">Coming Soon</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ProjectCard
              name="viviana-native"
              imageSrc="/images/ecosystem/native.svg"
              size="sm"
              inactive
            />
            <ProjectCard
              name="viviana-cli"
              imageSrc="/images/ecosystem/cli.svg"
              size="sm"
              inactive
            />
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
