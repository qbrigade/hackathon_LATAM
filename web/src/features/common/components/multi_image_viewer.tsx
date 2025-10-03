import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { Modal } from './modal';

interface MultiImageViewerProps {
  images: string | string[];
  alt?: string;
  className?: string;
  fallbackImage?: string;
  height?: number;
}

export function MultiImageViewer({
  images,
  alt = 'Image',
  className = '',
  fallbackImage = '/src/assets/images/no_image.jpg',
  height = 400
}: MultiImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Normalize images to array and filter out null/undefined images
  const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
  const validImages = imageArray.filter(Boolean);
  const hasMultipleImages = validImages.length > 1;
  const currentImage = validImages[currentIndex] || fallbackImage;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const goToNextModal = () => {
    setModalImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToPreviousModal = () => {
    setModalImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  // Handle keyboard navigation in modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToNextModal();
    } else if (e.key === 'ArrowLeft') {
      goToPreviousModal();
    } else if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  if (validImages.length === 0) {
    return (
      <div className={`relative bg-black rounded-md flex items-center justify-center ${className}`} style={{ height: `${height}px` }}>
        <img
          src={fallbackImage}
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <>
      {/* Main Image Viewer */}
      <div className={`relative group ${className}`}>
        {/* Main Image */}
        <div className="relative bg-black rounded-md flex items-center justify-center" style={{ height: `${height}px` }}>
          <img
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={() => openModal(currentIndex)}
          />

          {/* Expand Icon Overlay */}
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => openModal(currentIndex)}>
            <Expand size={16} className="text-white" />
          </div>
        </div>

        {/* Navigation Controls - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}

        {/* Thumbnail Navigation - Only show if multiple images */}
        {hasMultipleImages && validImages.length <= 5 && (
          <div className="flex gap-2 mt-3 justify-center">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 rounded border-2 overflow-hidden transition-all ${index === currentIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Dot Indicators for many images */}
        {hasMultipleImages && validImages.length > 5 && (
          <div className="flex gap-2 mt-3 justify-center">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full-Screen View */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onKeyDown={handleModalKeyDown}
          tabIndex={-1}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-10"
          >
            <X size={24} />
          </button>

          {/* Modal Image Container */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={validImages[modalImageIndex]}
              alt={`${alt} ${modalImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Modal Navigation - Only show if multiple images */}
          {hasMultipleImages && (
            <>
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousModal();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextModal();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
              >
                <ChevronRight size={24} />
              </button>

              {/* Modal Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
                {modalImageIndex + 1} / {validImages.length}
              </div>

              {/* Modal Thumbnail Navigation */}
              {validImages.length <= 10 && (
                <div
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`w-12 h-12 rounded border overflow-hidden transition-all ${index === modalImageIndex
                          ? 'border-white ring-2 ring-white/50'
                          : 'border-white/50 hover:border-white'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
