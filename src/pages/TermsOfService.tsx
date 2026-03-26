import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-24 animate-slide-in-right">
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6 font-montserrat">Terms of Service</span>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 font-jakarta text-sm text-black/80 leading-relaxed">
        <p className="text-xs text-black/40">Last updated: March 26, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">1. Agreement to Terms</h2>
          <p>By accessing or using the Jarla platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">2. Description of Service</h2>
          <p>Jarla is a platform that connects brands with content creators for advertising campaigns on TikTok. Brands can create campaigns, deals, and reward-based promotions. Creators can discover opportunities, submit content, and earn compensation based on video performance.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">3. Eligibility</h2>
          <p>You must be at least 16 years old to use the Service. By creating an account, you represent that you meet this age requirement. Users under 18 may need parental or guardian consent depending on local jurisdiction.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">4. Account Registration</h2>
          <p>To use certain features, you must create an account. You agree to provide accurate, current, and complete information and to keep your account credentials secure. You are responsible for all activity under your account.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">5. Creator Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must own or have the rights to all content you submit.</li>
            <li>Submitted content must comply with the campaign brief and guidelines.</li>
            <li>You must not use bots, purchased views, or any artificial means to inflate video metrics.</li>
            <li>You are responsible for complying with TikTok's Community Guidelines and Terms of Service.</li>
            <li>Earnings are based on verified organic video performance and are subject to review.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">6. Business Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Campaign briefs must be accurate and not misleading.</li>
            <li>Budgets must be funded before campaigns go live.</li>
            <li>Businesses must review submissions in a timely manner.</li>
            <li>Businesses may not request personal information from creators outside the platform.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">7. Payments & Payouts</h2>
          <p>Creator earnings are calculated based on verified video views according to the campaign's rate structure. Payouts are processed through Stripe Connect. Jarla reserves the right to withhold payment if fraudulent activity is detected. Minimum payout thresholds may apply.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">8. Content & Intellectual Property</h2>
          <p>Creators retain ownership of their content. By submitting content to a campaign, you grant Jarla and the associated brand a non-exclusive, royalty-free license to use the content for the purposes outlined in the campaign brief. This license does not transfer ownership.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">9. Prohibited Conduct</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Impersonating another person or entity.</li>
            <li>Attempting to manipulate video metrics or earnings.</li>
            <li>Uploading harmful, illegal, or inappropriate content.</li>
            <li>Reverse-engineering or scraping the platform.</li>
            <li>Harassing other users or Jarla staff.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">10. Termination</h2>
          <p>We may suspend or terminate your account at any time for violations of these terms or for any conduct we deem harmful to the platform. You may also delete your account at any time through the app settings.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">11. Disclaimers</h2>
          <p>The Service is provided "as is" without warranties of any kind. Jarla does not guarantee specific earnings, campaign availability, or uninterrupted service. We are not liable for any third-party content or actions on external platforms like TikTok.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">12. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Jarla shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">13. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of significant changes via the app or email. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-black font-montserrat">14. Contact</h2>
          <p>If you have questions about these terms, contact us through the in-app support page or email us at support@jarla.org.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
