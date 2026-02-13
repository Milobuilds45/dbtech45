'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-[#f59e0b] hover:underline text-sm font-mono">
            ← Back to Home
          </a>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 font-mono">Privacy Policy</h1>
        <p className="text-[#71717a] text-sm mb-12 font-mono">Last updated: February 12, 2026</p>
        
        <div className="space-y-8 text-[#a1a1aa] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">1. Introduction</h2>
            <p>
              DBTech45 ("we," "our," or "us") respects your privacy and is committed to protecting your 
              personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our websites, applications, and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-[#fafafa] mb-2 mt-4">Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Email address (when subscribing to newsletters or creating accounts)</li>
              <li>Name (if provided)</li>
              <li>Messages sent through contact forms</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
            </ul>

            <h3 className="text-lg font-medium text-[#fafafa] mb-2">Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our Services</li>
              <li>Send newsletters and updates you've subscribed to</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Process transactions</li>
              <li>Improve our websites and services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">4. Information Sharing</h2>
            <p className="mb-4">We do NOT sell your personal information. We may share information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate our services (email delivery, hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">5. Cookies & Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your experience. These include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect 
              some functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">7. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us through the contact form on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">8. California Residents (CCPA)</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA), 
              including the right to know what personal information is collected, request deletion, and 
              opt-out of the sale of personal information. We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">9. International Users (GDPR)</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have rights under the General 
              Data Protection Regulation (GDPR). Our legal basis for processing is your consent (for 
              newsletters) and legitimate interests (for site operation and security).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">10. Children's Privacy</h2>
            <p>
              Our Services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">11. Third-Party Links</h2>
            <p>
              Our Services may contain links to third-party websites. We are not responsible for the 
              privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page 
              with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">13. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or our data practices, please contact us through 
              the contact form on our website.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#27272a] text-center">
          <p className="text-[#71717a] text-sm font-mono">
            DBTech45 — Imagination → Implementation
          </p>
        </div>
      </div>
    </div>
  );
}
