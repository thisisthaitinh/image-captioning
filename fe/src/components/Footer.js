import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGithub, 
  faTwitter, 
  faFacebook, 
  faLinkedin,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright Section */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {currentYear} Image Captioning App. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by React, Tailwind CSS, and Hugging Face AI
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            <a 
              href="https://github.com/thisisthaitinh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
            <a 
              href="https://twitter.com/yourhandle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a 
              href="https://facebook.com/thisisthaitinh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </a>
            <a 
              href="https://linkedin.com/in/yourprofile" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </a>
            <a 
              href="https://instagram.com/thisisthaitinh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
          </div>
        </div>

        {/* Additional Links
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white text-sm">
              Contact Us
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Version 1.0.0
          </p>
        </div> */}
      </div>
    </footer>
  );
}