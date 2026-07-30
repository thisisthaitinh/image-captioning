const TranslationProgressBar = ({ progress }) => {
     return (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
               <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
               ></div>
          </div>
     );
};

export default TranslationProgressBar;