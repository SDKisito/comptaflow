import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';

const FeaturedCarousel = ({ integrations = [], onConnect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (integrations?.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === integrations?.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [integrations?.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? integrations?.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === integrations?.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!integrations || integrations?.length === 0) {
    return null;
  }

  const currentIntegration = integrations?.[currentIndex];

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg overflow-hidden">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Intégrations en vedette
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {currentIntegration?.logoUrl ? (
                <img 
                  src={currentIntegration?.logoUrl} 
                  alt={`${currentIntegration?.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center text-3xl">
                  ⭐
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {currentIntegration?.name}
                </h3>
                <p className="text-muted-foreground">
                  {currentIntegration?.providerName}
                </p>
              </div>
            </div>

            <p className="text-foreground/80 mb-6 leading-relaxed">
              {currentIntegration?.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning fill-warning" />
                <span className="font-semibold text-foreground">
                  {currentIntegration?.rating}
                </span>
                <span className="text-muted-foreground">
                  ({currentIntegration?.reviewCount} avis)
                </span>
              </div>
              <div className="text-muted-foreground">
                {currentIntegration?.installationCount?.toLocaleString('fr-FR')} installations
              </div>
            </div>

            <button
              onClick={() => onConnect?.(currentIntegration)}
              className="
                px-6 py-3 bg-primary text-primary-foreground rounded-lg
                font-semibold hover:bg-primary/90 transition-colors
              "
            >
              Découvrir cette intégration
            </button>
          </div>

          <div className="hidden md:block">
            {currentIntegration?.features && Array.isArray(currentIntegration?.features) && (
              <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4">
                  Fonctionnalités principales
                </h4>
                <ul className="space-y-2">
                  {currentIntegration?.features?.slice(0, 4)?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {integrations?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'w-8 bg-primary' :'w-2 bg-primary/30 hover:bg-primary/50'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      {integrations?.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              p-2 bg-surface/80 backdrop-blur-sm rounded-full
              text-foreground hover:bg-surface transition-colors
              shadow-lg
            "
            aria-label="Previous integration"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              p-2 bg-surface/80 backdrop-blur-sm rounded-full
              text-foreground hover:bg-surface transition-colors
              shadow-lg
            "
            aria-label="Next integration"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default FeaturedCarousel;