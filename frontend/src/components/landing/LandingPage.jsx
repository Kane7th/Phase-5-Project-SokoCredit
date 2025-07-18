import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  Star,
  Heart,
  Target
} from 'lucide-react'
import '../../styles/landing.css'

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: "Customer Management",
      description: "Easily manage mama mboga profiles, track business performance, and build lasting relationships."
    },
    {
      icon: DollarSign,
      title: "Smart Loan Processing",
      description: "Streamlined loan applications with automated risk assessment and flexible repayment schedules."
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Help small traders expand their businesses with data-driven insights and financial support."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with automated payment tracking and comprehensive audit trails."
    }
  ]

  const stats = [
    { number: "2,500+", label: "Mama Mbogas Served" },
    { number: "KSH 45M+", label: "Loans Disbursed" },
    { number: "94%", label: "Repayment Rate" },
    { number: "150+", label: "Markets Covered" }
  ]

  const testimonials = [
    {
      name: "Mary Wanjiku",
      business: "Vegetable Vendor, Kawangware Market",
      quote: "SokoCredit helped me expand my business. Now I can stock more vegetables and serve more customers!",
      rating: 5
    },
    {
      name: "Grace Akinyi", 
      business: "Fruit Seller, Kisumu Central",
      quote: "The loan process was so simple and fast. I got the money I needed within 2 days.",
      rating: 5
    },
    {
      name: "Susan Nyakio",
      business: "General Store, Nakuru",
      quote: "My loan officer visits regularly and helps me manage my finances better. Very supportive!",
      rating: 5
    }
  ]

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">💰</div>
            <span className="logo-text">SokoCredit</span>
          </div>
          
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              I have an account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <img 
            src="https://pfst.cf2.poecdn.net/base/image/a231721daa2a5abe0dcf841af17986b50cc55f22c24b8755aca4ce73a642e1b4?w=1920&h=1440" 
            alt="Mama Mboga at work"
            className="hero-image"
          />
        </div>
        
        <div className="hero-content">
          <div className="hero-container">
            <div className="hero-text">
              <h1 className="hero-title">
                Empowering <span className="text-highlight">Mama Mbogas</span>
                <br />
                Through Microfinance
              </h1>
              
              <p className="hero-subtitle">
                Join our mission to provide accessible financial services to small-scale traders 
                across Kenya. Help mama mbogas grow their businesses and improve their livelihoods.
              </p>
              
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary hero-btn-primary">
                  <span>Get Started</span>
                  <ArrowRight size={20} />
                </Link>
                
                <Link to="/login" className="btn btn-secondary hero-btn-secondary">
                  Sign In
                </Link>
              </div>
              
              <div className="hero-trust">
                <div className="trust-item">
                  <Heart className="trust-icon" size={16} />
                  <span>Trusted by 2,500+ traders</span>
                </div>
                <div className="trust-item">
                  <Shield className="trust-icon" size={16} />
                  <span>Bank-grade security</span>
                </div>
                <div className="trust-item">
                  <Star className="trust-icon" size={16} />
                  <span>94% success rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">
              Everything you need to manage microfinance operations
            </h2>
            <p className="section-subtitle">
              Comprehensive tools designed specifically for serving mama mbogas and small-scale traders
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-title">How SokoCredit Works</h2>
            <p className="section-subtitle">
              Simple steps to start helping mama mbogas grow their businesses
            </p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Register & Get Approved</h3>
              <p className="step-description">
                Complete your registration with business details and required documents. 
                Our team will review and approve your application.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Onboard Customers</h3>
              <p className="step-description">
                Visit markets and register mama mbogas. Capture their business information, 
                assess their needs, and build trust in the community.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Process Loans</h3>
              <p className="step-description">
                Create loan applications, conduct risk assessments, and disburse funds. 
                Set up flexible repayment schedules that work for their business cycles.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Track & Collect</h3>
              <p className="step-description">
                Monitor loan performance, collect payments, and provide ongoing support. 
                Build long-term relationships and help businesses grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">Stories from our community</h2>
            <p className="section-subtitle">
              Hear from mama mbogas whose lives have been transformed through microfinance
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="star-filled" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "{testimonial.quote}"
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-business">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to make a difference?
            </h2>
            <p className="cta-subtitle">
              Join hundreds of loan officers who are empowering mama mbogas across Kenya
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary cta-btn-primary">
                <span>Start Your Journey</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-outline cta-btn-outline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">💰</div>
                <span className="logo-text">SokoCredit</span>
              </div>
              <p className="footer-description">
                Empowering mama mbogas through accessible microfinance solutions.
                Building stronger communities, one loan at a time.
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">For Lenders</h4>
              <ul className="footer-links">
                <li><Link to="/register">Get Started</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Training</a></li>
                <li><a href="#">Resources</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 SokoCredit. All rights reserved. Built with ❤️ for mama mbogas.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage