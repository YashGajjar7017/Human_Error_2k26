import { Link } from 'react-router-dom'
import '../styles/InfoPages.css'

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using Human Error's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.`
    },
    {
      title: '2. Description of Service',
      content: `Human Error provides a code compilation and learning platform, including:
• Online code compiler supporting multiple programming languages
• Machine learning-powered code analysis and suggestions
• User account management and profile features
• Related services and features we may add from time to time`
    },
    {
      title: '3. User Accounts',
      content: `To use certain features of our service, you must create an account. You agree to:
• Provide accurate, current, and complete information
• Maintain the security of your password and account
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      title: '4. Acceptable Use',
      content: `You agree not to:
• Use the service for any illegal or unauthorized purpose
• Interfere with or disrupt the service or servers
• Attempt to gain unauthorized access to any system or network
• Transmit viruses, malware, or other harmful code
• Use automated systems to access the service without permission
• Harass, threaten, or violate the rights of other users
• Post or share content that is illegal, harmful, or inappropriate

Violations may result in immediate account termination.`
    },
    {
      title: '5. Your Content',
      content: `You retain ownership of code and content you submit to our platform. By submitting content, you:
• Grant us a license to use, store, and process your content to provide our services
• Confirm you have the right to share this content
• Understand that backups of your data may exist even after deletion

We do not claim ownership of your code or use it for purposes beyond providing our services.`
    },
    {
      title: '6. Intellectual Property',
      content: `The Human Error platform, including its design, logos, trademarks, and technology, are owned by us or our licensors. You may not:
• Copy, modify, or distribute our trademarks without permission
• Reverse engineer or attempt to derive our source code
• Use our trademarks in a way that suggests endorsement

Open-source components used in our service are governed by their respective licenses.`
    },
    {
      title: '7. Subscription and Payments',
      content: `Some features may require payment. By subscribing:
• You agree to pay all fees associated with your chosen plan
• Subscriptions automatically renew unless cancelled before the renewal date
• Refunds are provided according to our refund policy
• We may change prices with 30 days notice

Free features remain free unless explicitly stated otherwise.`
    },
    {
      title: '8. Disclaimer of Warranties',
      content: `OUR SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
• The service will be uninterrupted or error-free
• Results from the service will meet your requirements
• The service will be available at all times or locations

You use the service at your own risk.`
    },
    {
      title: '9. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, HUMAN ERROR SHALL NOT BE LIABLE FOR:
• Any indirect, incidental, special, or consequential damages
• Loss of profits, data, or business opportunities
• Service interruptions or data loss

Our total liability shall not exceed the amount you paid us in the past 12 months.`
    },
    {
      title: '10. Indemnification',
      content: `You agree to indemnify and hold harmless Human Error and its officers, employees, and agents from any claims, damages, losses, or expenses arising from:
• Your use of the service
• Your violation of these terms
• Your violation of any third-party rights`
    },
    {
      title: '11. Termination',
      content: `Either party may terminate this agreement:
• You may delete your account at any time
• We may terminate or suspend your account for violations of these terms
• Upon termination, your right to use the service ceases immediately

Provisions that should survive termination include: intellectual property, disclaimer of warranties, and limitation of liability.`
    },
    {
      title: '12. Changes to Terms',
      content: `We may modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use after changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.`
    },
    {
      title: '13. Governing Law',
      content: `These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes shall be resolved in the courts of the applicable jurisdiction.`
    },
    {
      title: '14. Contact Information',
      content: `If you have questions about these Terms of Service, please contact us:
Email: legal@humanerror.app
Address: [Company Address]

We will respond to your inquiry within 30 days.`
    }
  ]

  return (
    <div className="info-page">
      <div className="info-hero terms-hero">
        <div className="info-hero-content">
          <h1 className="gradient-text">Terms of Service</h1>
          <p>Rules and guidelines for using Human Error</p>
        </div>
      </div>

      <div className="info-content">
        {/* Last Updated */}
        <div className="policy-meta">
          <span>Last Updated: January 2025</span>
        </div>

        {/* Quick Summary */}
        <section className="policy-summary">
          <div className="summary-card">
            <h2>Key Points</h2>
            <ul>
              <li>✅ Use our service responsibly and legally</li>
              <li>🔒 Your code remains your property</li>
              <li>💳 Subscriptions auto-renew (cancel anytime)</li>
              <li>⚠️ Use at your own risk - no warranties</li>
            </ul>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="policy-sections">
          {sections.map((section, index) => (
            <div key={index} className="policy-section card-hover">
              <h3>{section.title}</h3>
              <div className="policy-content">
                {section.content.split('\n').map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Agreement Box */}
        <section className="terms-agreement">
          <div className="agreement-card">
            <h3>Agreement to Terms</h3>
            <p>By creating an account or using Human Error, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </div>
        </section>

        {/* Related Links */}
        <section className="related-links">
          <h3>Related Documents</h3>
          <div className="links-grid">
            <Link to="/privacy" className="related-link card-hover">
              <span className="link-icon">🔒</span>
              <span>Privacy Policy</span>
            </Link>
            <Link to="/help" className="related-link card-hover">
              <span className="link-icon">❓</span>
              <span>Help Center</span>
            </Link>
            <Link to="/about" className="related-link card-hover">
              <span className="link-icon">ℹ️</span>
              <span>About Us</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

