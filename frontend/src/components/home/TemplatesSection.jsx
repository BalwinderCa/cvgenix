import React from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiEye } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const TemplatesSection = () => {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      category: 'Professional',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=500&fit=crop&crop=center',
      isPopular: true,
      isNew: false
    },
    {
      id: 'creative',
      name: 'Creative',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: true
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      category: 'Clean',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: false
    },
    {
      id: 'executive',
      name: 'Executive',
      category: 'Senior',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=500&fit=crop&crop=center',
      isPopular: true,
      isNew: false
    },
    {
      id: 'startup',
      name: 'Startup',
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: false
    },
    {
      id: 'classic',
      name: 'Classic',
      category: 'Traditional',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: false
    },
    {
      id: 'elegant',
      name: 'Elegant',
      category: 'Premium',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: false
    },
    {
      id: 'bold',
      name: 'Bold',
      category: 'Creative',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: true
    },
    {
      id: 'simple',
      name: 'Simple',
      category: 'Clean',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop&crop=center',
      isPopular: false,
      isNew: false
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional{' '}
            <span className="gradient-text">Templates</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our collection of 50+ professionally designed templates 
            that are optimized for ATS systems and designed to impress recruiters.
          </p>
        </motion.div>
      </div>

      {/* Carousel Container - Full Width */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative mb-8 px-4"
      >
        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={5}
          loop={true}
          loopFillGroupWithBlank={false}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 14,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
          }}
          className="templates-swiper"
        >
          {templates.map((template) => (
            <SwiperSlide key={template.id}>
              <motion.div variants={itemVariants}>
                <div className="group">
                  <div className="bg-white rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
                    {/* Template Image */}
                    <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {/* Actual template image */}
                      <img 
                        src={template.image} 
                        alt={`${template.name} template`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link
                          to={`/template-edit/${template.id}`}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg border border-orange-400"
                        >
                          Edit this template
                        </Link>
                      </div>

                      {/* Badges */}
                      {template.isPopular && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-semibold px-1 py-0.5 rounded-full">
                          P
                        </div>
                      )}
                      {template.isNew && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-semibold px-1 py-0.5 rounded-full">
                          N
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-50 hover:shadow-xl transition-all duration-200 border-2 border-orange-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl transition-all duration-200 border-2 border-orange-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Custom Pagination */}
        <div className="swiper-pagination flex justify-center mt-10 space-x-2"></div>
      </motion.div>

      {/* View All Templates CTA */}
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/templates"
            className="inline-flex items-center btn-gradient text-lg px-8 py-4 group"
          >
            View All Templates
            <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <style>{`
        .templates-swiper {
          padding: 0 60px;
        }
        
        .swiper-button-prev,
        .swiper-button-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .swiper-button-prev {
          left: 0;
        }
        
        .swiper-button-next {
          right: 0;
        }
        
        .swiper-button-prev:after,
        .swiper-button-next:after {
          display: none;
        }
        
        .swiper-pagination {
          position: relative;
          margin-top: 2rem;
        }
        
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.2s;
        }
        
        .swiper-pagination-bullet-active {
          background: #f97316;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  )
}

export default TemplatesSection
