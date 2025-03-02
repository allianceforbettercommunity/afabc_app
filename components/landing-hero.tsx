import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          Track Policy Campaigns & Political Interactions
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Organize programs and policy campaigns by issue, track politician interactions, 
          and measure the impact of your advocacy efforts.
        </p>
        <div className="space-x-4">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}