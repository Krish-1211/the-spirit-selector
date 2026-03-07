import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Martini } from "lucide-react";


export default function AgeVerificationModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const isVerified = localStorage.getItem("age-verified");
        if (!isVerified) {
            setIsOpen(true);
        }
    }, []);

    const handleVerify = () => {
        localStorage.setItem("age-verified", "true");
        setIsOpen(false);
    };

    const handleReject = () => {
        window.location.href = "https://www.google.com";
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md border-border bg-card p-8 sm:rounded-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center space-y-2">
                        <h1 className="font-serif text-3xl font-bold tracking-widest text-foreground">
                            COMPANY<span className="text-primary">.</span>
                        </h1>
                        <div className="h-0.5 w-12 bg-primary/30" />
                        <Martini className="h-8 w-8 text-primary/80 opacity-50" />
                    </div>

                    <DialogHeader className="space-y-3">
                        <DialogTitle className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Are you 21 or older?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            You must be of legal drinking age to enter this site.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleReject}
                            className="flex-1 border-border bg-transparent font-medium transition-all hover:bg-secondary hover:text-foreground"
                        >
                            No
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleVerify}
                            className="flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Yes
                        </Button>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                        Live Freely. Drink Responsibly.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
