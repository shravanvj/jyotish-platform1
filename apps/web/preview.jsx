import React, { useState } from 'react';

// Jyotish Platform UI Preview
export default function JyotishPreview() {
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(false);

  const pages = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'chart', name: 'Birth Chart', icon: '☉' },
    { id: 'panchang', name: 'Panchang', icon: '📅' },
    { id: 'horoscope', name: 'Horoscope', icon: '♈' },
    { id: 'matchmaking', name: 'Matchmaking', icon: '💑' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'pricing', name: 'Pricing', icon: '💳' },
  ];

  const bgColor = darkMode ? 'bg-stone-900' : 'bg-amber-50';
  const textColor = darkMode ? 'text-amber-100' : 'text-stone-800';
  const cardBg = darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-amber-200';
  const mutedText = darkMode ? 'text-stone-400' : 'text-stone-500';

  // Header Component
  const Header = () => (
    <header className={`${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-amber-200'} border-b px-4 py-3`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            ॐ
          </div>
          <span className={`font-semibold ${textColor}`}>Jyotish</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {['Chart', 'Panchang', 'Horoscope', 'Matchmaking', 'API'].map(item => (
            <button key={item} className={`${mutedText} hover:${textColor} transition-colors`}>
              {item}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-stone-700' : 'bg-amber-100'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );

  // Home Page
  const HomePage = () => (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <div className="text-6xl mb-4">🕉️</div>
        <h1 className={`text-4xl md:text-5xl font-bold ${textColor} mb-4`}>
          Vedic Astrology
          <span className="text-amber-600"> API & Platform</span>
        </h1>
        <p className={`text-lg ${mutedText} max-w-2xl mx-auto mb-8`}>
          Authentic Jyotish calculations powered by Swiss Ephemeris. 
          Generate birth charts, Kundali matching, Panchang, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
            Get Started Free
          </button>
          <button className={`px-6 py-3 border ${darkMode ? 'border-stone-600' : 'border-amber-300'} rounded-lg font-medium ${textColor}`}>
            View API Docs
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { icon: '☉', title: 'Birth Charts', desc: 'Accurate Vedic Kundli with planetary positions, houses, and aspects' },
          { icon: '📅', title: 'Panchang', desc: 'Daily Hindu calendar with Tithi, Nakshatra, Yoga, Karana' },
          { icon: '💑', title: 'Matchmaking', desc: 'Kundali Milan with Ashtakoot scoring system' },
          { icon: '⏰', title: 'Muhurat', desc: 'Find auspicious times for important events' },
          { icon: '♈', title: 'Horoscopes', desc: 'Daily, weekly, monthly predictions for all rashis' },
          { icon: '🔌', title: 'API Access', desc: 'RESTful API for developers and businesses' },
        ].map((feature, i) => (
          <div key={i} className={`${cardBg} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className={`font-semibold ${textColor} mb-2`}>{feature.title}</h3>
            <p className={`text-sm ${mutedText}`}>{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className={`${cardBg} border rounded-xl p-8`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1M+', label: 'Charts Generated' },
            { value: '50K+', label: 'Happy Users' },
            { value: '99.9%', label: 'Accuracy' },
            { value: '24/7', label: 'API Uptime' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-amber-600">{stat.value}</div>
              <div className={`text-sm ${mutedText}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // Birth Chart Page
  const ChartPage = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <h2 className={`text-xl font-semibold ${textColor} mb-6`}>Generate Birth Chart</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name"
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Birth Date</label>
              <input 
                type="date" 
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Birth Time</label>
              <input 
                type="time" 
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Birth Place</label>
            <input 
              type="text" 
              placeholder="City, Country"
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Ayanamsa</label>
              <select className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}>
                <option>Lahiri</option>
                <option>Raman</option>
                <option>KP</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Chart Style</label>
              <select className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}>
                <option>South Indian</option>
                <option>North Indian</option>
              </select>
            </div>
          </div>
          <button className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
            Generate Chart
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <h2 className={`text-xl font-semibold ${textColor} mb-6`}>Rashi Chart (D1)</h2>
        {/* South Indian Chart */}
        <div className="aspect-square max-w-sm mx-auto">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect x="0" y="0" width="400" height="400" fill={darkMode ? '#292524' : '#fef3c7'} stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="2"/>
            {/* Grid lines */}
            <line x1="100" y1="0" x2="100" y2="400" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            <line x1="200" y1="0" x2="200" y2="400" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            <line x1="300" y1="0" x2="300" y2="400" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            <line x1="0" y1="100" x2="400" y2="100" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            <line x1="0" y1="200" x2="400" y2="200" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            <line x1="0" y1="300" x2="400" y2="300" stroke={darkMode ? '#78716c' : '#d97706'} strokeWidth="1"/>
            {/* Center box */}
            <rect x="100" y="100" width="200" height="200" fill={darkMode ? '#1c1917' : '#fff7ed'}/>
            {/* Rashi labels */}
            {[
              { x: 150, y: 55, label: 'Pi', planets: 'Mo' },
              { x: 250, y: 55, label: 'Ar', planets: '' },
              { x: 350, y: 55, label: 'Ta', planets: 'Ra' },
              { x: 350, y: 155, label: 'Ge', planets: '' },
              { x: 350, y: 255, label: 'Ca', planets: 'Ma' },
              { x: 350, y: 355, label: 'Le', planets: '' },
              { x: 250, y: 355, label: 'Vi', planets: 'Ju' },
              { x: 150, y: 355, label: 'Li', planets: '' },
              { x: 50, y: 355, label: 'Sc', planets: 'Sa,Ke' },
              { x: 50, y: 255, label: 'Sg', planets: '' },
              { x: 50, y: 155, label: 'Cp', planets: 'Su,Me,Ve' },
              { x: 50, y: 55, label: 'Aq', planets: '' },
            ].map((cell, i) => (
              <g key={i}>
                <text x={cell.x} y={cell.y - 15} textAnchor="middle" fill={darkMode ? '#a8a29e' : '#78716c'} fontSize="12">{cell.label}</text>
                <text x={cell.x} y={cell.y + 10} textAnchor="middle" fill={darkMode ? '#fbbf24' : '#d97706'} fontSize="14" fontWeight="bold">{cell.planets}</text>
              </g>
            ))}
            {/* Center label */}
            <text x="200" y="190" textAnchor="middle" fill={darkMode ? '#fbbf24' : '#92400e'} fontSize="14" fontWeight="bold">Lagna: Capricorn</text>
            <text x="200" y="210" textAnchor="middle" fill={darkMode ? '#a8a29e' : '#78716c'} fontSize="12">Rashi Chart</text>
          </svg>
        </div>
        
        {/* Planet Details */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
          {[
            { planet: 'Sun', sign: 'Capricorn', deg: '15°23\'' },
            { planet: 'Moon', sign: 'Pisces', deg: '22°45\'' },
            { planet: 'Mars', sign: 'Cancer', deg: '08°12\'' },
            { planet: 'Mercury', sign: 'Capricorn', deg: '28°30\'' },
            { planet: 'Jupiter', sign: 'Virgo', deg: '11°55\'' },
            { planet: 'Venus', sign: 'Capricorn', deg: '03°18\'' },
          ].map((p, i) => (
            <div key={i} className={`p-2 rounded ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}>
              <div className={`font-medium ${textColor}`}>{p.planet}</div>
              <div className={`text-xs ${mutedText}`}>{p.sign} {p.deg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Panchang Page
  const PanchangPage = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${textColor}`}>Today's Panchang</h1>
        <p className={`${mutedText} mt-2`}>Saturday, February 1, 2025 • Tiruppur, Tamil Nadu</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Tithi', value: 'Shukla Tritiya', icon: '🌙', sub: 'Until 14:32' },
          { title: 'Nakshatra', value: 'Uttara Bhadrapada', icon: '⭐', sub: 'Until 18:45' },
          { title: 'Yoga', value: 'Shubha', icon: '🔮', sub: 'Until 12:15' },
          { title: 'Karana', value: 'Bava', icon: '📿', sub: 'Until 14:32' },
          { title: 'Vara', value: 'Shanivar (Saturday)', icon: '📅', sub: 'Lord: Shani' },
          { title: 'Paksha', value: 'Shukla (Waxing)', icon: '🌓', sub: 'Bright Half' },
        ].map((item, i) => (
          <div key={i} className={`${cardBg} border rounded-xl p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm ${mutedText}`}>{item.title}</p>
                <p className={`text-lg font-semibold ${textColor} mt-1`}>{item.value}</p>
                <p className={`text-xs ${mutedText} mt-1`}>{item.sub}</p>
              </div>
              <span className="text-2xl">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sun/Moon Times */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <h3 className={`font-semibold ${textColor} mb-4`}>Sun & Moon Timings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Sunrise', time: '06:42 AM', icon: '🌅' },
            { label: 'Sunset', time: '06:15 PM', icon: '🌇' },
            { label: 'Moonrise', time: '08:23 AM', icon: '🌙' },
            { label: 'Moonset', time: '09:12 PM', icon: '🌑' },
          ].map((t, i) => (
            <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className={`text-sm ${mutedText}`}>{t.label}</div>
              <div className={`font-semibold ${textColor}`}>{t.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auspicious Times */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <h3 className={`font-semibold ${textColor} mb-4`}>Auspicious & Inauspicious Timings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-600 font-medium mb-2">✅ Auspicious</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${textColor}`}>
                <span>Abhijit Muhurat</span>
                <span>12:02 - 12:48 PM</span>
              </div>
              <div className={`flex justify-between ${textColor}`}>
                <span>Amrit Kaal</span>
                <span>02:15 - 03:45 PM</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-red-600 font-medium mb-2">❌ Inauspicious</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${textColor}`}>
                <span>Rahu Kaal</span>
                <span>09:00 - 10:30 AM</span>
              </div>
              <div className={`flex justify-between ${textColor}`}>
                <span>Yamaganda</span>
                <span>01:30 - 03:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Horoscope Page
  const HoroscopePage = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${textColor}`}>Daily Horoscope</h1>
        <p className={`${mutedText} mt-2`}>February 1, 2025</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { sign: 'Mesha', symbol: '♈', name: 'Aries' },
          { sign: 'Vrishabha', symbol: '♉', name: 'Taurus' },
          { sign: 'Mithuna', symbol: '♊', name: 'Gemini' },
          { sign: 'Karka', symbol: '♋', name: 'Cancer' },
          { sign: 'Simha', symbol: '♌', name: 'Leo' },
          { sign: 'Kanya', symbol: '♍', name: 'Virgo' },
          { sign: 'Tula', symbol: '♎', name: 'Libra' },
          { sign: 'Vrishchika', symbol: '♏', name: 'Scorpio' },
          { sign: 'Dhanu', symbol: '♐', name: 'Sagittarius' },
          { sign: 'Makara', symbol: '♑', name: 'Capricorn' },
          { sign: 'Kumbha', symbol: '♒', name: 'Aquarius' },
          { sign: 'Meena', symbol: '♓', name: 'Pisces' },
        ].map((r, i) => (
          <button 
            key={i} 
            className={`p-3 rounded-xl border text-center transition-all ${i === 0 ? 'bg-amber-600 border-amber-600 text-white' : `${cardBg} hover:border-amber-400`}`}
          >
            <div className="text-2xl">{r.symbol}</div>
            <div className={`text-xs mt-1 ${i === 0 ? 'text-white' : mutedText}`}>{r.name}</div>
          </button>
        ))}
      </div>

      {/* Selected Horoscope */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-3xl text-white">
            ♈
          </div>
          <div>
            <h2 className={`text-xl font-bold ${textColor}`}>Mesha (Aries)</h2>
            <p className={`${mutedText}`}>March 21 - April 19</p>
          </div>
        </div>

        <p className={`${textColor} mb-6 leading-relaxed`}>
          Today brings exciting opportunities for personal growth. The Sun's favorable position enhances your 
          confidence and leadership abilities. Financial matters look promising, with potential gains from 
          unexpected sources. In relationships, open communication will strengthen bonds. Health-wise, 
          focus on maintaining a balanced routine. Avoid hasty decisions in the afternoon.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lucky Number', value: '7', color: 'text-purple-500' },
            { label: 'Lucky Color', value: 'Red', color: 'text-red-500' },
            { label: 'Compatibility', value: 'Leo', color: 'text-amber-500' },
            { label: 'Overall Rating', value: '⭐⭐⭐⭐', color: 'text-yellow-500' },
          ].map((item, i) => (
            <div key={i} className={`text-center p-3 rounded-lg ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}>
              <div className={`text-sm ${mutedText}`}>{item.label}</div>
              <div className={`font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Matchmaking Page
  const MatchmakingPage = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${textColor}`}>Kundli Matching</h1>
        <p className={`${mutedText} mt-2`}>Ashtakoot Gun Milan for Marriage Compatibility</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Partner 1 */}
        <div className={`${cardBg} border rounded-xl p-6`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <span className="text-blue-500">👤</span> Groom Details
          </h3>
          <div className="space-y-3">
            <input placeholder="Name" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
              <input type="time" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
            </div>
            <input placeholder="Birth Place" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
          </div>
        </div>

        {/* Partner 2 */}
        <div className={`${cardBg} border rounded-xl p-6`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <span className="text-pink-500">👤</span> Bride Details
          </h3>
          <div className="space-y-3">
            <input placeholder="Name" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
              <input type="time" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
            </div>
            <input placeholder="Birth Place" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-amber-200'}`}/>
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90">
        💑 Check Compatibility
      </button>

      {/* Sample Result */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white text-3xl font-bold mb-3">
            28/36
          </div>
          <h3 className={`text-xl font-bold ${textColor}`}>Excellent Match!</h3>
          <p className={`${mutedText}`}>This is a highly compatible match</p>
        </div>

        <div className="space-y-3">
          {[
            { koot: 'Varna', points: '1/1', desc: 'Spiritual compatibility' },
            { koot: 'Vashya', points: '2/2', desc: 'Mutual attraction' },
            { koot: 'Tara', points: '3/3', desc: 'Destiny compatibility' },
            { koot: 'Yoni', points: '4/4', desc: 'Physical compatibility' },
            { koot: 'Graha Maitri', points: '5/5', desc: 'Mental compatibility' },
            { koot: 'Gana', points: '4/6', desc: 'Temperament match' },
            { koot: 'Bhakoot', points: '5/7', desc: 'Love compatibility' },
            { koot: 'Nadi', points: '4/8', desc: 'Health compatibility' },
          ].map((k, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${textColor}`}>{k.koot}</span>
                <span className={`text-sm ${mutedText} ml-2`}>({k.desc})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(parseInt(k.points) / parseInt(k.points.split('/')[1])) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${textColor} w-12`}>{k.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Dashboard Page
  const DashboardPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textColor}`}>Welcome back, Shravan! 👋</h1>
          <p className={`${mutedText}`}>Here's your astrology dashboard</p>
        </div>
        <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">Pro Plan</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Charts Generated', value: '24', icon: '☉', change: '+3 this week' },
          { label: 'Matches Checked', value: '8', icon: '💑', change: '+2 this week' },
          { label: 'Reports Created', value: '12', icon: '📄', change: '+1 this week' },
          { label: 'API Calls', value: '2,415', icon: '🔌', change: '24% of limit' },
        ].map((stat, i) => (
          <div key={i} className={`${cardBg} border rounded-xl p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm ${mutedText}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${textColor} mt-1`}>{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Saved Profiles */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${cardBg} border rounded-xl p-6`}>
          <h3 className={`font-semibold ${textColor} mb-4`}>Saved Profiles</h3>
          <div className="space-y-3">
            {[
              { name: 'Self', dob: 'Jan 15, 1995', primary: true },
              { name: 'Spouse', dob: 'Mar 22, 1997', primary: false },
              { name: 'Child', dob: 'Dec 10, 2020', primary: false },
            ].map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                    {p.name[0]}
                  </div>
                  <div>
                    <p className={`font-medium ${textColor}`}>{p.name}</p>
                    <p className={`text-xs ${mutedText}`}>{p.dob}</p>
                  </div>
                </div>
                {p.primary && <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">Primary</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardBg} border rounded-xl p-6`}>
          <h3 className={`font-semibold ${textColor} mb-4`}>Recent Reports</h3>
          <div className="space-y-3">
            {[
              { name: 'Birth Chart Report', date: 'Jan 28, 2025', status: 'Ready' },
              { name: 'Annual Prediction 2025', date: 'Jan 25, 2025', status: 'Ready' },
              { name: 'Compatibility Report', date: 'Jan 20, 2025', status: 'Ready' },
            ].map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}>
                <div>
                  <p className={`font-medium ${textColor}`}>{r.name}</p>
                  <p className={`text-xs ${mutedText}`}>{r.date}</p>
                </div>
                <button className="text-xs text-amber-600 hover:underline">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Pricing Page
  const PricingPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>Simple, Transparent Pricing</h1>
        <p className={`${mutedText} mt-2`}>Choose the plan that fits your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: 'Free',
            price: '$0',
            desc: 'For personal use',
            features: ['10 charts/month', '5 matches/month', '100 API calls', 'Basic support'],
            cta: 'Get Started',
            popular: false,
          },
          {
            name: 'Pro',
            price: '$29',
            desc: 'For professionals',
            features: ['Unlimited charts', 'Unlimited matches', '10,000 API calls', 'Priority support', 'PDF reports', 'Custom branding'],
            cta: 'Upgrade to Pro',
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            desc: 'For businesses',
            features: ['Everything in Pro', 'Unlimited API calls', 'SLA guarantee', 'Dedicated support', 'On-premise option', 'Custom features'],
            cta: 'Contact Sales',
            popular: false,
          },
        ].map((plan, i) => (
          <div 
            key={i} 
            className={`${cardBg} border rounded-xl p-6 relative ${plan.popular ? 'border-amber-500 ring-2 ring-amber-500' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                Most Popular
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold ${textColor}`}>{plan.name}</h3>
              <div className={`text-3xl font-bold ${textColor} mt-2`}>
                {plan.price}
                {plan.price !== 'Custom' && <span className="text-sm font-normal">/month</span>}
              </div>
              <p className={`text-sm ${mutedText}`}>{plan.desc}</p>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className={`flex items-center gap-2 text-sm ${textColor}`}>
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg font-medium ${plan.popular ? 'bg-amber-600 text-white' : `border ${darkMode ? 'border-stone-600' : 'border-amber-300'} ${textColor}`}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'chart': return <ChartPage />;
      case 'panchang': return <PanchangPage />;
      case 'horoscope': return <HoroscopePage />;
      case 'matchmaking': return <MatchmakingPage />;
      case 'dashboard': return <DashboardPage />;
      case 'pricing': return <PricingPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      <Header />
      
      {/* Page Navigation */}
      <div className={`border-b ${darkMode ? 'border-stone-700 bg-stone-800/50' : 'border-amber-200 bg-amber-50/50'} sticky top-0 z-10 backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  currentPage === page.id
                    ? 'bg-amber-600 text-white'
                    : `${textColor} hover:bg-amber-100 dark:hover:bg-stone-700`
                }`}
              >
                {page.icon} {page.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className={`border-t ${darkMode ? 'border-stone-700' : 'border-amber-200'} py-8 mt-12`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              ॐ
            </div>
            <span className={`font-semibold ${textColor}`}>Jyotish Platform</span>
          </div>
          <p className={`text-sm ${mutedText}`}>
            © 2025 Jyotish Platform. Built with 🕉️ for cosmic seekers.
          </p>
        </div>
      </footer>
    </div>
  );
}
