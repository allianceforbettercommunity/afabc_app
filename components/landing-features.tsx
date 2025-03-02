export function LandingFeatures() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our comprehensive platform helps you manage policy campaigns effectively.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
          <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
            <div className="space-y-2">
              <h3 className="font-bold">Issue Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Organize programs and policy campaigns by issue with powerful filtering and sorting.
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
          <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
            <div className="space-y-2">
              <h3 className="font-bold">Politician Database</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of politicians you interact with and maintain detailed profiles.
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
          <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
            <div className="space-y-2">
              <h3 className="font-bold">Interaction Logging</h3>
              <p className="text-sm text-muted-foreground">
                Record and analyze all meetings and interactions with politicians.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}