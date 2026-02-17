'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-[#f59e0b] hover:underline text-sm font-mono">
            ← Back to Home
          </a>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 font-mono">Terms of Service</h1>
        <p className="text-[#71717a] text-sm mb-12 font-mono">Last updated: February 12, 2026</p>
        
        <div className="space-y-8 text-[#a1a1aa] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using DBTech45 ("we," "our," or "us") websites, applications, tools, 
              or services (collectively, the "Services"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">2. Description of Services</h2>
            <p className="mb-4">DBTech45 provides various digital products and services including but not limited to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Web-based tools and applications (TipSplit Pro, Sunday Squares, etc.)</li>
              <li>Email newsletters (Signal & Noise, The Operator, Dad Stack)</li>
              <li>Trading and market-related content and analysis</li>
              <li>Software products and digital downloads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">3. User Responsibilities</h2>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate information when creating accounts or subscribing to services</li>
              <li>Use the Services only for lawful purposes</li>
              <li>Not attempt to reverse engineer, copy, or redistribute our software or tools</li>
              <li>Not use automated systems to access the Services without permission</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">4. Intellectual Property</h2>
            <p>
              All content, code, designs, trademarks, and intellectual property associated with DBTech45 
              and its Services are owned by DBTech45 or its licensors. You may not copy, modify, distribute, 
              sell, or lease any part of our Services or included software without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">5. Financial Disclaimer</h2>
            <p>
              <strong className="text-[#f59e0b]">IMPORTANT:</strong> Content related to trading, markets, 
              or financial topics is for informational and educational purposes only. Nothing on this site 
              constitutes financial advice, investment recommendations, or solicitation to buy or sell 
              securities. Trading involves substantial risk of loss. Past performance does not guarantee 
              future results. Always consult a qualified financial advisor before making investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">6. Newsletter & Communications</h2>
            <p>
              By subscribing to our newsletters, you consent to receive periodic emails from DBTech45. 
              You may unsubscribe at any time using the link provided in each email. We will not sell 
              or share your email address with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, DBTech45 shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, 
              or other intangible losses resulting from your use of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">8. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page 
              with an updated revision date. Continued use of the Services after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your access to the Services at our sole discretion, without 
              prior notice, for conduct that we believe violates these Terms or is harmful to other users, 
              us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              New Hampshire, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-4">11. Contact</h2>
            <p>
              For questions about these Terms, please contact us through the contact form on our website.
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
