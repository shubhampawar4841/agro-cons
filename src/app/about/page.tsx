import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-[#2d5016] mb-8">
          About Us
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Welcome to AGRICORNS, your trusted source for organic agro products. 
            We are committed to bringing you the finest quality organic products sourced directly 
            from Indian farms.
          </p>
          
          <h2 className="font-heading text-2xl font-semibold text-[#2d5016] mt-8 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our mission is to make pure, organic, and healthy agro products accessible to everyone. 
            We believe in transparency, quality, and the power of nature to heal and nourish.
          </p>
          
          <h2 className="font-heading text-2xl font-semibold text-[#2d5016] mt-8 mb-4">
            Quality Assurance
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Every product in our collection is carefully selected to ensure purity, 
            quality, and safety. We work directly with certified organic farmers to bring you 
            products that are free from harmful chemicals and pesticides.
          </p>
          
          <h2 className="font-heading text-2xl font-semibold text-[#2d5016] mt-8 mb-4">
            Why Choose Us
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>100% Organic and Certified Products</li>
            <li>Premium Quality Assurance</li>
            <li>Direct from Indian Farms</li>
            <li>Fast and Reliable Delivery</li>
            <li>Transparent and Trustworthy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

