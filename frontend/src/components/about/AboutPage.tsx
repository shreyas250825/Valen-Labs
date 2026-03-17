import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import { 
  Sparkles, Rocket, Heart, Shield, PlayCircle
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-[#020617] text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-black uppercase tracking-widest text-purple-300">Our Story</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Empowering Careers Through
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-sky-500 bg-clip-text text-transparent">
                AI Innovation
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              We're on a mission to democratize interview preparation and help everyone succeed in their career journey.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Rocket,
                  title: "Our Mission",
                  description: "To make world-class interview preparation accessible to everyone, regardless of their background or resources.",
                  gradient: "from-sky-400 to-cyan-400"
                },
                {
                  icon: Heart,
                  title: "Our Values",
                  description: "We believe in empowerment, innovation, and creating technology that genuinely helps people succeed.",
                  gradient: "from-cyan-400 to-blue-400"
                },
                {
                  icon: Shield,
                  title: "Our Promise",
                  description: "Your privacy and success are our top priorities. We're committed to providing a safe, effective learning environment.",
                  gradient: "from-blue-400 to-purple-500"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                  <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                    <div className={`inline-flex p-4 bg-gradient-to-r ${item.gradient} rounded-xl mb-4 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="relative py-20 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Meet the Team
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A passionate group of engineers, designers, and career coaches dedicated to your success.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { name: "Shreyas Salian", role: "Founder & CFO", icon: "SS" },
                { name: "Siddhi Tiwari", role: "Co-Founder and CEO", icon: "ST" },
                { name: "Sachin R Shenoy", role: "CTO", icon: "SS" },
                { name: "Mohana V", role: "COO", icon: "MV" }
              ].map((member, index) => (
                <div key={index} className="relative group text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform group-hover:scale-105 transition-all duration-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                      {member.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-sky-400 text-sm">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '1M+', label: 'Interviews Practiced' },
                { value: '95%', label: 'Success Rate' },
                { value: '150+', label: 'Countries' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
                Join us in revolutionizing interview prep
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Start your journey to career success today.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <PlayCircle className="w-6 h-6" />
                <span>Get Started Free</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;

