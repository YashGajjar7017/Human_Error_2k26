import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/InfoPages.css'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        { id: 'gs-1', title: 'How to create an account', preview: 'Learn how to sign up for Human Error and verify your email.' },
        { id: 'gs-2', title: 'Logging into your account', preview: 'Step-by-step guide to logging into your Human Error account.' },
        { id: 'gs-3', title: 'Dashboard overview', preview: 'Get familiar with the Human Error dashboard and its features.' }
      ]
    },
    {
      id: 'compiler',
      title: 'Code Compiler',
      icon: '💻',
      articles: [
        { id: 'c-1', title: 'Supported programming languages', preview: 'List of all programming languages supported by our compiler.' },
        { id: 'c-2', title: 'How to compile code', preview: 'Learn how to write, compile, and run your code.' },
        { id: 'c-3', title: 'Viewing output', preview: 'Understanding the compiler output and error messages.' }
      ]
    },
    {
      id: 'ml-features',
      title: 'ML Features',
      icon: '🤖',
      articles: [
        { id: 'ml-1', title: 'Code error prediction', preview: 'How our ML model helps predict and fix code errors.' },
        { id: 'ml-2', title: 'Code suggestions', preview: 'Getting intelligent suggestions while coding.' },
        { id: 'ml-3', title: 'Training the model', preview: 'How you can help improve our ML model with your data.' }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: '⚙️',
      articles: [
        { id: 'a-1', title: 'Resetting your password', preview: 'Forgot your password? Learn how to reset it.' },
        { id: 'a-2', title: 'Managing notifications', preview: 'Customize your notification preferences.' },
        { id: 'a-3', title: 'Profile settings', preview: 'How to update your profile information.' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        { id: 't-1', title: 'Common compilation errors', preview: 'Solutions to frequently encountered compilation errors.' },
        { id: 't-2', title: 'Login issues', preview: 'Troubleshoot login problems and account access.' },
        { id: 't-3', title: 'Performance tips', preview: 'Optimize your experience with these performance tips.' }
      ]
    }
  ]

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || activeCategory === 'all')

  const faqs = [
    {
      question: 'Is Human Error free to use?',
      answer: 'Yes, Human Error is completely free to use for all basic features. Premium features may be added in the future.'
    },
    {
      question: 'Which programming languages are supported?',
      answer: 'We support Python, JavaScript, Java, C, C++, C#, Go, Rust, TypeScript, and many more. Check our documentation for the complete list.'
    },
    {
      question: 'How does the ML code prediction work?',
      answer: 'Our machine learning model analyzes code patterns and common errors to provide suggestions and predictions. It learns from anonymized data to improve accuracy.'
    },
    {
      question: 'Is my code secure?',
      answer: 'Yes, we take security seriously. Your code is encrypted and stored securely. We never share your code with third parties.'
    },
    {
      question: 'Can I use Human Error offline?',
      answer: 'Some features require an internet connection, but basic compilation is available offline in our desktop app.'
    }
  ]

  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="info-page">
      <div className="info-hero">
        <div className="info-hero-content">
          <h1>Help Center</h1>
          <p>Find answers to your questions and learn how to use Human Error</p>
          
          <div className="help-search">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="help-search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="info-content">
        {/* Quick Links */}
        <section className="quick-links">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            <Link to="/about" className="quick-link-card card-hover">
              <span className="quick-link-icon">ℹ️</span>
              <span className="quick-link-text">About Us</span>
            </Link>
            <Link to="/privacy" className="quick-link-card card-hover">
              <span className="quick-link-icon">🔒</span>
              <span className="quick-link-text">Privacy Policy</span>
            </Link>
            <Link to="/terms" className="quick-link-card card-hover">
              <span className="quick-link-icon">📄</span>
              <span className="quick-link-text">Terms of Service</span>
            </Link>
            <a href="mailto:support@humanerror.app" className="quick-link-card card-hover">
              <span className="quick-link-icon">✉️</span>
              <span className="quick-link-text">Contact Support</span>
            </a>
          </div>
        </section>

        {/* Help Categories */}
        <section className="help-categories">
          <h2>Browse by Topic</h2>
          <div className="category-tabs">
            <button 
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Topics
            </button>
            {helpCategories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon} {category.title}
              </button>
            ))}
          </div>

          <div className="articles-grid">
            {(activeCategory === 'all' ? helpCategories : helpCategories.filter(c => c.id === activeCategory)).map(category => (
              <div key={category.id} className="article-category">
                <h3 className="category-title">
                  <span className="category-icon">{category.icon}</span>
                  {category.title}
                </h3>
                <div className="articles-list">
                  {category.articles.map(article => (
                    <div key={article.id} className="article-card card-hover">
                      <h4>{article.title}</h4>
                      <p>{article.preview}</p>
                      <span className="read-more">Read more →</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </div>
                {openFaq === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="contact-support">
          <div className="support-card">
            <h3>Still need help?</h3>
            <p>Our support team is here to assist you with any questions or issues.</p>
            <div className="support-actions">
              <a href="mailto:support@humanerror.app" className="support-btn primary">
                📧 Email Support
              </a>
              <a href="#" className="support-btn secondary">
                💬 Live Chat
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

