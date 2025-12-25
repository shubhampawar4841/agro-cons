'use client';

import { useEffect, useState } from 'react';

export default function Loader() {
  const [showLoader, setShowLoader] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Hide loader after page loads
    const timer = setTimeout(() => {
      setShowLoader(false);
      // Remove from DOM after fade out
      setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
          loader.style.display = 'none';
        }
      }, 300);
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !showLoader) return null;

  return (
    <div 
      id="initial-loader"
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-[#2d5016] to-[#1f3509] flex flex-col items-center justify-center transition-opacity duration-300 ${!showLoader ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="loader w-fit h-fit flex flex-col items-center justify-center">
        {/* Quote Section */}
        <div className="mb-8 text-center px-4 animate-fade-in">
          <p className="text-white text-lg md:text-xl font-heading font-semibold mb-2 italic">
            "Nurturing Nature, Nourishing Lives"
          </p>
          <p className="text-white/80 text-sm md:text-base">
            Your trusted source for pure, organic agro products
          </p>
        </div>

        {/* Truck Animation */}
        <div className="truckWrapper w-[200px] h-[100px] flex flex-col relative items-center justify-end overflow-x-hidden">
          {/* Truck Body */}
          <div className="truckBody w-[130px] h-fit mb-1.5 animate-truck-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" className="w-full h-auto">
              <path 
                strokeWidth={3} 
                stroke="#1f3509" 
                fill="#2d5016" 
                d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z" 
              />
              <path 
                strokeWidth={3} 
                stroke="#1f3509" 
                fill="#4a7c2a" 
                d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z" 
              />
              <path 
                strokeWidth={2} 
                stroke="#1f3509" 
                fill="#1f3509" 
                d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z" 
              />
              <rect 
                strokeWidth={2} 
                stroke="#1f3509" 
                fill="#f4d03f" 
                rx={1} 
                height={7} 
                width={5} 
                y={63} 
                x={187} 
              />
              <rect 
                strokeWidth={2} 
                stroke="#1f3509" 
                fill="#1f3509" 
                rx={1} 
                height={11} 
                width={4} 
                y={81} 
                x={193} 
              />
              <rect 
                strokeWidth={3} 
                stroke="#1f3509" 
                fill="#DFDFDF" 
                rx="2.5" 
                height={90} 
                width={121} 
                y="1.5" 
                x="6.5" 
              />
              <rect 
                strokeWidth={2} 
                stroke="#1f3509" 
                fill="#DFDFDF" 
                rx={2} 
                height={4} 
                width={6} 
                y={84} 
                x={1} 
              />
            </svg>
          </div>

          {/* Truck Tires */}
          <div className="truckTires w-[130px] h-fit flex items-center justify-between px-[10px] pl-[15px] absolute bottom-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="w-6 h-6">
              <circle strokeWidth={3} stroke="#1f3509" fill="#1f3509" r="13.5" cy={15} cx={15} />
              <circle fill="#DFDFDF" r={7} cy={15} cx={15} />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="w-6 h-6">
              <circle strokeWidth={3} stroke="#1f3509" fill="#1f3509" r="13.5" cy={15} cx={15} />
              <circle fill="#DFDFDF" r={7} cy={15} cx={15} />
            </svg>
          </div>

          {/* Road */}
          <div className="road w-full h-[1.5px] bg-[#1f3509] relative bottom-0 self-end rounded-sm overflow-hidden">
            <div className="road-line absolute w-5 h-full bg-[#1f3509] -right-[50%] rounded-sm border-l-[10px] border-white animate-road-move"></div>
            <div className="road-line-small absolute w-[10px] h-full bg-[#1f3509] -right-[65%] rounded-sm border-l-[4px] border-white animate-road-move"></div>
          </div>

          {/* Lamp Post */}
          <svg 
            xmlSpace="preserve" 
            viewBox="0 0 453.459 453.459" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
            xmlns="http://www.w3.org/2000/svg" 
            className="lampPost absolute bottom-0 -right-[90%] h-[90px] animate-road-move fill-[#1f3509]"
          >
            <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
      c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
      c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
      c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
      h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
      v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
      V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
      M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
      h78.747C231.693,100.736,232.77,106.162,232.77,111.694z" 
            />
          </svg>
        </div>

        {/* Loading Text */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm animate-pulse">Loading AGRICORNS...</p>
        </div>
      </div>
    </div>
  );
}

