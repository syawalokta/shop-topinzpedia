import { FEATURES } from "@/lib/constants";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stagger, StaggerItem } from "@/components/shared/motion";

export function Features() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="features-heading">
      <div className="container-page">
        <SectionHeading
          eyebrow="Kenapa TopinzPedia"
          title="Belanja Digital Tanpa Was-Was"
          description="Kami merancang setiap proses — dari pembayaran sampai pengiriman — agar kamu mendapatkan produk premium dengan pengalaman terbaik."
        />

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-5">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title} className="h-full">
              <article className="group h-full rounded-lg border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
