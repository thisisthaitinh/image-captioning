import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
    >
      <FontAwesomeIcon icon={faAnglesUp} />
    </button>
  );
};

export default BackToTopButton;