import { useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTrashAlt,
  faSpinner,
  faMagic,
  faLanguage,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Footer from './components/Footer'
import ThemeToggle from './components/themeToggle';
import BackToTopButton from './components/backToTop';
import TranslationProgressBar from './components/progressBar'
// import keyPress from './hooks/keyPress';

function App() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [translationProgress, setTranslationProgress] = useState({});


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please select only image files');
      return;
    }

    const newPreviews = imageFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      translation: ''
    }));

    setPreviews([...previews, ...newPreviews]);
    setImages([...images, ...imageFiles]);
    setError('');
  };

  const handleDeleteImage = (id) => {
    // Find the image to delete
    const previewToDelete = previews.find(p => p.id === id);

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewToDelete.preview);

    // Remove from previews state
    const newPreviews = previews.filter(preview => preview.id !== id);
    setPreviews(newPreviews);

    // Remove from images state
    const newImages = images.filter((_, index) =>
      previews.findIndex(p => p.id === id) !== index
    );
    setImages(newImages);

    // Clear the file input if no images left
    if (newImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFullScreen = (preview) => {
    setFullscreenImage(preview);
    document.body.style.overflow = 'hidden'
  }

  const closeFullScreen = (preview) => {
    setFullscreenImage(null);
    document.body.style.overflow = 'auto'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previews.length === 0) {
      setError('Please select at least one image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const results = [];

      for (const preview of previews) {
        const formData = new FormData();
        formData.append('image', preview.file);

        const response = await axios.post('http://localhost:5000/caption', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        results.push({
          ...preview,
          caption: response.data.caption
        });
      }

      setPreviews(results);
    } catch (err) {
      setError('Failed to generate captions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (index) => {
    setIsTranslating(prev => ({ ...prev, [index]: true }));
    setTranslationProgress(prev => ({ ...prev, [index]: 0 }));

    try {
      const formData = new FormData();
      formData.append('image', previews[index].file);
      formData.append('translate', 'true');

      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => ({
          ...prev,
          [index]: Math.min(prev[index] + 10, 100)
        }));
      }, 300);

      const response = await axios.post('http://localhost:5000/caption', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setTranslationProgress(prev => ({ ...prev, [index]: percent }));
        }
      });

      clearInterval(progressInterval);
      setTranslationProgress(prev => ({ ...prev, [index]: 100 }));

      setPreviews(prev => prev.map((item, i) =>
        i === index
          ? { ...item, translation: response.data.translation }
          : item
      ));
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error("Translation error:", err);
    } finally {
      setTimeout(() => {
        setIsTranslating(prev => ({ ...prev, [index]: false }));
        setTranslationProgress(prev => ({ ...prev, [index]: 0 }));
      }, 500)
    }
  };

  const handleClearAll = () => {
    previews.forEach(preview => URL.revokeObjectURL(preview.preview));
    setImages([]);
    setPreviews([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setShowClearConfirmation(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Main Content - takes full available height */}
      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white uppercase font-heading">
              Image caption generator
            </h1>
            <ThemeToggle />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Tải lên một/nhiều ảnh để tạo chú thích.
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-100
                dark:hover:file:bg-blue-800"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer">
                    {/* Image container - displays original size */}
                    <div className="flex justify-center items-center p-4 relative group" onClick={() => openFullScreen(preview)}>
                      <img
                        src={preview.preview}
                        alt={`Preview ${index}`}
                        className="max-h-64 max-w-full object-contain"
                      />
                      {/* Delete button - only shows on image hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                        {/* Top-right delete button (X icon) */}
                        <button
                          onClick={(e) => handleDeleteImage(preview.id, e)}
                          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-opacity-80 transition-all"
                          aria-label="Delete image"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>

                    {/* Caption and translation container */}
                    <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                      {preview.caption && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chú thích:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{preview.caption}"</p>
                        </div>
                      )}

                      {preview.translation ? (
                        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bản dịch tiếng Việt:</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">"{preview.translation}"</p>
                        </div>
                      ) : preview.caption && (
                        <button
                          onClick={() => handleTranslate(index)}
                          disabled={isTranslating[index]}
                          className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-xs rounded transition-colors ${isTranslating[index]
                            ? 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-800'
                            }`}
                        >
                          {isTranslating[index] ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} spin />
                              Đang dịch... ({translationProgress[index]}%)
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faLanguage} />
                              Dịch sang tiếng Việt
                            </>
                          )}
                        </button>
                      )}
                      {isTranslating[index] && (
                        <TranslationProgressBar progress={translationProgress[index]} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowClearConfirmation(true)}
                disabled={previews.length === 0 || isLoading}
                className={`flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors ${previews.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                Xóa tất cả
              </button>
              <button
                type="submit"
                disabled={isLoading || previews.length === 0}
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors ${isLoading || previews.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="w-4 h-4" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMagic} className="w-4 h-4" />
                    Tạo chú thích
                  </>
                )}
              </button>
            </div>
          </form>
          {/* Clear all confirmation Dialog */}
          {showClearConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Bạn chắc chắn muốn xóa tất cả ảnh và chú thích?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Hành động này sẽ xóa vĩnh viễn ảnh và chú thích vừa tạo.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowClearConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded">
              {error}
            </div>
          )}

          {fullscreenImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center fade-in"
              onClick={closeFullScreen}
              tabIndex={0}
            >
              <div className="relative max-w-full max-h-full zoom-in" onClick={(e) => e.stopPropagation()}>
                <img
                  src={fullscreenImage.preview}
                  alt="Fullscreen preview"
                  className="max-w-full max-h-screen object-contain"
                />

                {/* Close button in fullscreen view */}
                <button
                  className="absolute w-9 h-9 top-3 right-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                  onClick={closeFullScreen}
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>
            </div>
          )}
        </div>
        <BackToTopButton />
      </main>

      <Footer />
    </div>
  );
}

export default App;