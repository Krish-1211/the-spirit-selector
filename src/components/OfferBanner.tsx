import { Button } from "@/components/ui/button";

export default function OfferBanner() {
    return (
        <section className="bg-card py-24">
            <div className="container relative overflow-hidden rounded-lg bg-primary/10 p-12 md:p-20 text-center">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

                <div className="relative z-10 mx-auto max-w-2xl">
                    <span className="mb-4 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                        Limited Time Offer
                    </span>
                    <h2 className="mb-6 font-serif text-3xl font-bold text-foreground md:text-5xl">
                        Join the Reserve Elite Rewards Club
                    </h2>
                    <p className="mb-10 text-lg text-muted-foreground">
                        Get early access to rare bottle drops, free shipping on all orders, and exclusive
                        tasting event invites. Sign up today and get $25 off your first order over $100.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="h-14 px-10 rounded-sm font-bold uppercase tracking-widest">
                            Join Now
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-10 rounded-sm font-bold uppercase tracking-widest border-primary text-primary">
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
