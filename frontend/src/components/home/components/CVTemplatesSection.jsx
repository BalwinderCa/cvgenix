import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CVTemplatesSection = () => {
  const swiperRef = useRef(null);

  // Sample template data with placeholder images
  const templates = [
    {
      id: 1,
      title: "Executive Professional",
      category: "Executive",
      image: "https://www.myperfectresume.com/wp-content/uploads/2025/06/dishwasher-resume-template-modern-blue.svg",
    },
    {
      id: 2,
      title: "Healthcare Professional",
      category: "Healthcare",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/medical-assistant-resume-template.svg",
    },
    {
      id: 3,
      title: "Tech Developer",
      category: "Technology",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/java-developer-resume-template.svg",
    },
    {
      id: 4,
      title: "Administrative Pro",
      category: "Administrative",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/administrative-assistant-resume-template.svg",
    },
    {
      id: 5,
      title: "Brand Manager",
      category: "Marketing",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/brand-manager-resume-template.svg",
    },

  ];

  return (
    <section className="py-16 md:py-20 bg-background" id='templates'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
            <Icon name="FileText" size={20} color="var(--color-accent)" />
            <span className="text-accent font-semibold text-sm uppercase tracking-wide">
              Professional Templates
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Choose from <span className="text-gradient">200+ Expert Designs</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Browse our collection of expertly designed resume templates. Each template is ATS-friendly
            and crafted by professional designers to help you stand out from the competition.
          </p>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            pagination={{
              el: '.swiper-pagination-custom',
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} w-3 h-3 bg-muted-foreground/30 rounded-full cursor-pointer transition-all duration-300 hover:bg-primary"></span>`;
              },
            }}
            className="pb-12"
          >
            {templates.map((template) => (
              <SwiperSlide key={template.id}>
                <div className="group cursor-pointer">
                  <div className="bg-surface rounded-2xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300 transform group-hover:scale-105 border border-border/50 hover:border-primary/20">
                    <div className="aspect-[3/4] bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
                        <Icon name="Star" size={12} />
                        <span>{template.category}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">{template.title}</h3>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button
            className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-background rounded-full shadow-brand hover:shadow-brand-lg transition-all duration-300 hover:bg-surface border border-border group"
            onClick={() => swiperRef.current?.swiper.slidePrev()}
          >
            <Icon
              name="ChevronLeft"
              size={20}
              color="black"
              className="group-hover:text-primary transition-colors duration-200 mx-auto"
            />
          </button>

          <button
            className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-background rounded-full shadow-brand hover:shadow-brand-lg transition-all duration-300 hover:bg-surface border border-border group"
            onClick={() => swiperRef.current?.swiper.slideNext()}
          >
            <Icon
              name="ChevronRight"
              size={20}
              color="black"
              className="group-hover:text-primary transition-colors duration-200 mx-auto"
            />
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination-custom flex justify-center space-x-2 mt-8"></div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button
            variant="default"
            size="lg"
            className="font-semibold classic-border group"
          >
            <Icon name="Eye" size={18} className="mr-2" />
            See All Templates
            <Icon name="ChevronRight" size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
          <p className="mt-4 text-muted-foreground">
            Explore our complete collection of 200+ professional templates designed by experts
          </p>
        </div>
      </div>

      {/* Custom CSS for Swiper styling */}
      <style jsx>{`
        .swiper-pagination-bullet-active {
          background-color: var(--color-primary) !important;
          transform: scale(1.2);
        }
        
        .swiper-pagination-bullet {
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet:hover {
          background-color: var(--color-primary) !important;
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
};

export default CVTemplatesSection;
