import { Link } from 'react-router-dom'
import '../styles/InfoPages.css'

export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This includes:
• Personal Information: Name, email address, and other contact information you provide when signing up.
• Account Data: Username, profile information, and preferences.
• Usage Data: Information about how you use our services, including compilation history, features used, and time spent.
• Technical Data: IP address, browser type, operating system, and device information.`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send promotional communications (with your consent)
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions and other illegal activities
• Personalize and improve your experience`
    },
    {
      title: '3. How We Share Your Information',
      content: `We do not sell your personal information. We may share your information with:
• Service Providers: Third-party vendors who perform services on our behalf.
• Legal Requirements: When required by law, subpoena, or other legal process.
• Business Transfers: In connection with a merger, acquisition, or sale of assets.
• With Your Consent: When you explicitly authorize us to share information.
Note: Your code and compilation data are never shared with third parties without your explicit consent.`
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, destruction, or disclosure. This includes:
• Encryption of data in transit and at rest
• Regular security assessments and updates
• Access controls and authentication mechanisms
• Secure data centers with physical security measures
While we strive to protect your information, no method of transmission or storage is 100% secure.`
    },
    {
      title: '5. Data Retention',
      content: `We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account at any time, after which we will delete or anonymize your information within 30 days, except where retention is required for legal purposes.`
    },
    {
      title: '6. Your Rights',
      content: `Depending on your location, you may have the following rights:
• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate or incomplete data
• Deletion: Request deletion of your personal data
• Portability: Request a copy of your data in a machine-readable format
• Opt-out: Unsubscribe from promotional communications
To exercise these rights, contact us at privacy@humanerror.app`
    },
    {
      title: '7. Cookies and Tracking Technologies',
      content: `We use cookies and similar tracking technologies to:
• Remember your preferences and settings
• Analyze traffic and usage patterns
• Deliver personalized content and advertisements
• Improve our services
You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.`
    },
    {
      title: '8. Children\'s Privacy',
      content: `Human Error is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`
    },
    {
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We ensure appropriate safeguards are in place to protect your information.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:
• Posting the new policy on this page
• Sending you an email notification
• Displaying a notice in our app
We encourage you to review this policy periodically.`
    },
    {
      title: '11. Contact Us',
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:
Email: privacy@humanerror.app
Address: [Company Address]
We commit to responding to your inquiry within 30 days.`
    }
  ]

  return (
    <div className="info-page">
      <div className="info-hero privacy-hero">
        <div className="info-hero-content">
          <h1 className="gradient-text">Privacy Policy</h1>
          <p>How we protect and use your information</p>
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
            <h2>At a Glance</h2>
            <ul>
              <li>🔒 We never sell your personal information</li>
              <li>💻 Your code is yours alone - we do not share it</li>
              <li>🛡️ We use industry-standard security measures</li>
              <li>📊 You can access or delete your data anytime</li>
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

        {/* Contact CTA */}
        <section className="policy-contact">
          <div className="contact-card">
            <h3>Questions About Your Privacy?</h3>
            <p>Our privacy team is here to help you understand how we protect your data.</p>
            <a href="mailto:privacy@humanerror.app" className="contact-btn">
              📧 Contact Privacy Team
            </a>
          </div>
        </section>

        {/* Related Links */}
        <section className="related-links">
          <h3>Related Documents</h3>
          <div className="links-grid">
            <Link to="/terms" className="related-link card-hover">
              <span className="link-icon">📄</span>
              <span>Terms of Service</span>
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

