import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false) // Default to false (light mode)

  useEffect(() => {
    // Check for saved user preference (default to light mode if not set)
    const savedMode = localStorage.getItem('darkMode')
    const isDark = savedMode ? savedMode === 'true' : false
    
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode)
    document.documentElement.classList.toggle('dark', newMode)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full focus:outline-none"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <FontAwesomeIcon icon={faSun} className="text-yellow-400 text-lg" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="text-gray-700 text-lg" />
      )}
    </button>
  )
}