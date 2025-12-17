// app/page.tsx
'use client';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Share Your Stories with the World
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A platform for writers, thinkers, and storytellers to publish their ideas and connect with readers worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/blogs" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Writing
            </a>
            <a href="/blogs" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Read Blogs
            </a>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Publishing</h3>
            <p className="text-gray-600">Write and publish your blog posts with our intuitive editor in minutes</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rich Content</h3>
            <p className="text-gray-600">Discover diverse topics from technology to lifestyle, all in one place</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Global Community</h3>
            <p className="text-gray-600">Connect with readers and writers from around the world</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;