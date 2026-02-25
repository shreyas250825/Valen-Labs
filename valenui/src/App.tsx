import { handleBetaSubmit } from './utils/api';
import { Navbar } from './components/ui/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ScrollAnimationSection } from './components/sections/ScrollAnimationSection';
import { ProductSection } from './components/sections/ProductSection';
import { BetaSection } from './components/sections/BetaSection';
import { Footer } from './components/sections/Footer';

function App() {
  const handleCTAClick = (action: 'beta' | 'learn') => {
    if (action === 'beta') {
      document.querySelector('#beta')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (email: string) => {
    await handleBetaSubmit(email);
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black -z-10" />
      
      <Navbar />
      
      <HeroSection onCTAClick={handleCTAClick} />
      
      <div id="features">
        <ScrollAnimationSection />
      </div>
      
      <div id="products">
        <ProductSection />
      </div>
      
      <div id="beta">
        <BetaSection onSubmit={handleSubmit} />
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
