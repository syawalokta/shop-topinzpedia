import { STEPS } from "@/lib/constants";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stagger, StaggerItem } from "@/components/shared/motion";

export function HowToBuy() {
  return (
    <section
      id="cara-beli"
      className="border-y bg-card/50 py-16 md:py-24"
      aria-labelledby="how-to-buy-heading"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Cara Pembelian"
          title="Order Cuma Butuh 3 Langkah"
          description="Tanpa registrasi ribet. Pilih produk, bayar, dan produk langsung meluncur ke kamu."
        />

        <Stagger className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <StaggerItem key={step.step} className="h-full">
              <article className="relative h-full overflow-hidden rounded-lg border bg-card p-6 shadow-soft md:p-7">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-5 font-heading text-[5.5rem] font-extrabold leading-none text-primary/5 dark:text-primary/10"
                >
                  {step.step}
                </span>
                <span className="relative grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-heading text-sm font-bold text-primary-foreground shadow-soft">
                  {index + 1}
                </span>
                <h3 className="relative mt-4 font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
