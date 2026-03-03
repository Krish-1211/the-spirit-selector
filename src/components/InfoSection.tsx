import { Truck, ShieldCheck, GlassWater, Award } from "lucide-react";

const features = [
    {
        icon: Truck,
        title: "White-Glove Delivery",
        description: "Same-day delivery from our temperature-controlled fleet directly to your door."
    },
    {
        icon: ShieldCheck,
        title: "Expert Curation",
        description: "Every bottle in our collection is hand-selected and verified by certified sommeliers."
    },
    {
        icon: GlassWater,
        title: "Curated Tasting Experiences",
        description: "Customized tasting notes and pairing recommendations with every purchase."
    },
    {
        icon: Award,
        title: "Reserve Guarantee",
        description: "We stand by the quality of every drop. If you're not satisfied, we'll make it right."
    }
];

export default function InfoSection() {
    return (
        <section className="bg-background py-20 border-t border-border">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-6 rounded-full bg-card p-5 text-primary transition-transform duration-300 group-hover:scale-110 border border-border">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 font-serif text-xl font-bold text-foreground">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-video overflow-hidden rounded-sm">
                        <img
                            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop"
                            alt="Premium Tasting"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="mb-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
                            Elevating the Art of Fine Spirits
                        </h2>
                        <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                            At Reserve, we believe that choosing a spirit is more than just a purchase—it's the beginning of an experience. Our mission is to bridge the gap between world-class distilleries and your private collection.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Whether you're looking for a rare vintage scotch to celebrate a milestone or a perfectly balanced gin for your weekend garden party, our team of experts is here to guide you through our meticulously curated cellar.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
