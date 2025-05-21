import React from 'react';
import { useNavigate } from 'react-router-dom';
import frontLogo from '../shared/Images/frontlogo.png';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#a6192e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 4v4a4 4 0 004 4h4" /></svg>
    ),
    title: 'Easy Booking',
    desc: 'Book rooms and spaces with just a few clicks',
    delay: '0',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#15396a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    ),
    title: 'Real-time Availability',
    desc: 'Check room availability instantly',
    delay: '100',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#a6192e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 00-4-4H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-4a4 4 0 00-4 4z" /></svg>
    ),
    title: 'Manage Bookings',
    desc: 'View and manage your bookings in one place',
    delay: '200',
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-t from-[#c3cfe2] via-white to-[#f5f7fa] overflow-x-hidden">
      {/* Top Logo Card */}
      <div className="flex justify-center pt-16 md:pt-24">
        <div className="bg-white rounded-full shadow-xl p-4 md:p-6 flex items-center justify-center border-4 border-[#a6192e] animate-fade-in-down">
          <img src={frontLogo} alt="Detroit Mercy Logo" className="h-20 w-20 md:h-28 md:w-28 object-contain" />
        </div>
      </div>
      {/* Main Content Card */}
      <div className="relative z-10 max-w-3xl mx-auto mt-8 mb-16 px-6 py-10 bg-white/90 rounded-3xl shadow-2xl border border-white/60 text-center animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#15396a] mb-2 font-serif">University of <span className="text-[#a6192e]">Detroit Mercy</span></h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#a6192e] mb-6 font-serif">Room Booking System</h2>
        <p className="text-lg md:text-xl text-[#15396a] mb-10 font-medium">Your one-stop solution for managing campus spaces</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 border-t-4 border-[#a6192e] hover:scale-105 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-[#a6192e] mb-1 font-serif">{feature.title}</h3>
              <p className="text-[#15396a] text-base font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
        <button
          className="bg-[#a6192e] hover:bg-[#15396a] text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-all duration-300 relative overflow-hidden group"
          onClick={handleLoginClick}
        >
          <span className="relative z-10">Get Started</span>
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full" />
        </button>
      </div>
      {/* SVG Wave at Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none -z-10">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-40 md:h-64">
          <path fill="#a6192e" fillOpacity="0.18" d="M0,224L48,202.7C96,181,192,139,288,128C384,117,480,139,576,170.7C672,203,768,245,864,240C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          <path fill="#15396a" fillOpacity="0.13" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,154.7C672,160,768,192,864,197.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default Home;
