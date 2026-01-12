import { Link } from 'react-router-dom'
import '../styles/InfoPages.css'

export default function About() {
  const features = [
    {
      icon: '💻',
      title: 'Code Compiler',
      description: 'A powerful code compiler supporting multiple programming languages with real-time execution and detailed output.'
    },
    {
      icon: '🤖',
      title: 'ML-Powered Insights',
      description: 'Machine learning algorithms that analyze your code patterns and provide intelligent suggestions and error predictions.'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Track your coding progress with detailed analytics and insights to help you improve faster.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your code and data are protected with enterprise-grade security measures and encryption.'
    },
    {
      icon: '🌐',
      title: 'Cross-Platform',
      description: 'Access Human Error from anywhere with our web and desktop applications.'
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Join a community of developers learning and growing together.'
    }
  ]

  const team = [
    {
      name: 'Alex Chen',
      role: 'Lead Developer',
      avatar: 'AC'
    },
    {
      name: 'Sarah Johnson',
      role: 'ML Engineer',
      avatar: 'SJ'
    },
    {
      name: 'Michael Brown',
      role: 'UI/UX Designer',
      avatar: 'MB'
    },
    {
      name: 'Emily Davis',
      role: 'Backend Engineer',
      avatar: 'ED'
    }
  ]

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '10M+', label: 'Lines Compiled' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ]

  const timeline = [
    { year: '2023', event: 'Human Error project started' },
    { year: '2024 Q1', event: 'First public beta release' },
    { year: '2024 Q2', event: 'ML features integrated' },
    { year: '2024 Q3', event: 'Desktop app launched' },
    { year: '2025 Q1', event: '50,000 users milestone' }
  ]

  return (
    <div className="info-page">
      <div className="info-hero about-hero">
        <div className="info-hero-content">
          <h1 className="gradient-text">About Human Error</h1>
          <p>Empowering developers to learn, code, and grow with AI-powered tools</p>
        </div>
      </div>

      <div className="info-content">
        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-card">
            <h2>Our Mission</h2>
            <p>
              At Human Error, we believe everyone can learn to code. Our platform is designed 
              to make coding education accessible, engaging, and effective for developers of 
              all skill levels. By combining powerful compilation tools with intelligent 
              machine learning assistance, we're helping the next generation of developers 
              write better code, faster.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card card-hover">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card-hover">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h2>Our Journey</h2>
          <div className="timeline">
            {timeline.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <p>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2>Meet the Team</h2>
          <p className="team-intro">A passionate team of developers, designers, and educators working together to build the best coding learning platform.</p>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card card-hover">
                <div className="team-avatar">{member.avatar}</div>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card card-hover">
              <span className="value-icon">💡</span>
              <h3>Innovation</h3>
              <p>Constantly pushing boundaries to provide the best coding education experience.</p>
            </div>
            <div className="value-card card-hover">
              <span className="value-icon">🤝</span>
              <h3>Community</h3>
              <p>Building a supportive environment where developers learn and grow together.</p>
            </div>
            <div className="value-card card-hover">
              <span className="value-icon">🎯</span>
              <h3>Excellence</h3>
              <p>Committed to quality in everything we do, from code to customer support.</p>
            </div>
            <div className="value-card card-hover">
              <span className="value-icon">🔓</span>
              <h3>Accessibility</h3>
              <p>Making coding education available to everyone, regardless of background.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h3>Ready to Start Your Coding Journey?</h3>
            <p>Join thousands of developers who are already learning and growing with Human Error.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-btn primary">Get Started Free</Link>
              <Link to="/help" className="cta-btn secondary">Learn More</Link>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="quick-links-footer">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="separator">•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="separator">•</span>
            <Link to="/help">Contact Support</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

