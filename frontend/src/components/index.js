// Simple Header component
export const Header = ({ currentTime }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Science Digest News</h1>
          <div className="text-sm text-gray-500">
            {currentTime?.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
};

// Simple Footer component
export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p>&copy; 2025 Science Digest News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Skip to content for accessibility
export const SkipToContent = () => {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
    >
      Skip to main content
    </a>
  );
};