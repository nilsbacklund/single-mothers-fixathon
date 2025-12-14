import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import fatimaPhoto from "@/assets/testimonial-fatima.jpg";
import andriyPhoto from "@/assets/testimonial-andriy.jpg";
import sannePhoto from "@/assets/testimonial-sanne.jpg";
import partnerLogo from "@/assets/partner-singlesupermom.png";

interface Testimonial {
  key: "fatima" | "andriy" | "sanne";
  name: string;
  photo: string;
}

const testimonialData: Testimonial[] = [
  {
    key: "fatima",
    name: "Fatima",
    photo: fatimaPhoto,
  },
  {
    key: "andriy",
    name: "Andriy",
    photo: andriyPhoto,
  },
  {
    key: "sanne",
    name: "Sanne",
    photo: sannePhoto,
  },
];

const RotatingTestimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-64">
      {/* Photo */}
      <div className="relative h-36 w-36 rounded-full overflow-hidden bg-muted/40 flex-shrink-0">
        {testimonialData.map((testimonial, index) => (
          <img
            key={index}
            src={testimonial.photo}
            alt={`${testimonial.name}'s portrait`}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              index === activeIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>

      {/* Testimonial content - fixed height with centered content */}
      <div className="relative h-36 w-full mt-6">
        {testimonialData.map((testimonial, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 flex flex-col justify-center text-center transition-opacity duration-700",
              index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <blockquote className="text-sm text-muted-foreground leading-relaxed italic">
              "{t(`testimonials.${testimonial.key}.quote`)}"
            </blockquote>
            <div className="text-xs text-muted-foreground/50 mt-3">
              — {testimonial.name} · {t(`testimonials.${testimonial.key}.context`)}
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center mt-4">
        {testimonialData.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === activeIndex
                ? "w-4 bg-muted-foreground/30"
                : "w-1 bg-muted-foreground/15 hover:bg-muted-foreground/25"
            )}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Partnership */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <span className="text-sm text-muted-foreground/50">{t("hero.partnership")}</span>
        <img 
          src={partnerLogo} 
          alt="Single SuperMom" 
          className="h-10 opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};

export default RotatingTestimonials;
