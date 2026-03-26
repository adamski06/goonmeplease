import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6 font-montserrat">Privacy Policy</span>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 font-jakarta text-sm text-black/80 leading-relaxed">
        <p className="text-xs text-black/40">Last updated: March 26, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">1. Introduction</h2>
          <p>Jarla ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform and services.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">2. Information We Collect</h2>
          <h3 className="text-sm font-semibold text-black/70 mt-3">Account Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full name and username</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Profile photo</li>
            <li>Date of birth (for age verification)</li>
          </ul>
          <h3 className="text-sm font-semibold text-black/70 mt-3">TikTok Account Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>TikTok username and user ID</li>
            <li>Follower count</li>
            <li>Video performance metrics (views, likes, shares)</li>
          </ul>
          <h3 className="text-sm font-semibold text-black/70 mt-3">Payment Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stripe Connect account details for payouts</li>
            <li>Earnings and payout history</li>
          </ul>
          <h3 className="text-sm font-semibold text-black/70 mt-3">Usage Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Device information and browser type</li>
            <li>IP address</li>
            <li>Pages visited and features used</li>
            <li>Content submissions and interactions</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account</li>
            <li>To match creators with relevant campaigns</li>
            <li>To process payments and earnings</li>
            <li>To verify content submissions and video performance</li>
            <li>To send notifications about campaign status, approvals, and payouts</li>
            <li>To improve and personalize the Service</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">4. Information Sharing</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Brands/Businesses:</strong> Your public profile, username, and submitted content metrics are visible to brands whose campaigns you participate in.</li>
            <li><strong>Payment Processors:</strong> Stripe processes payout information on our behalf.</li>
            <li><strong>Service Providers:</strong> Third-party services that help us operate (hosting, analytics, AI review).</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">5. AI Content Review</h2>
          <p>We use AI technology to review submitted TikTok videos against campaign briefs. This automated review helps ensure content meets campaign requirements. AI reviews are advisory — final approval decisions are made by human administrators.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">6. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption and access controls. We use secure cloud infrastructure and follow best practices for data protection. However, no system is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. When you delete your account, we remove your personal data within 30 days, except where retention is required by law (e.g., financial records). Anonymized usage data may be retained for analytics purposes.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise these rights, contact us through the in-app support page.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">9. Cookies & Tracking</h2>
          <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies. Analytics data is collected to improve the Service and is not shared with advertisers.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">10. Children's Privacy</h2>
          <p>The Service is not intended for children under 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete it.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">11. International Data Transfers</h2>
          <p>Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. The "Last updated" date at the top reflects the most recent revision.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">13. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or your data, reach out through the in-app support page or email us at privacy@jarla.org.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
