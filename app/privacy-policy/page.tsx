const page = () => {
  return (
    <div>
      <h1>Privacy Policy — Autobay</h1>
      <p>Effective Date: September 19, 2025</p>

      <p>
        Autobay (“Autobay”, “we”, “us”, or “our”) is a React application that integrates with the eBay Developer Program API.
        This Privacy Policy explains what data we collect, how we use it, how we share it, and your rights.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>
          Account &amp; Authentication: eBay User ID, OAuth tokens/refresh tokens, token metadata (scope, expiration).
        </li>
        <li>
          eBay Data You Authorize: listings, orders, inventory, shipping details, and related operational data strictly within granted scopes.
        </li>
        <li>
          Technical &amp; Usage Logs: API request/response metadata (timestamps, endpoints), device/browser information, IP, and error logs.
        </li>
        <li>
          Support Communications: email and message content you send to us.
        </li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>Authenticate and maintain your secure connection to eBay APIs.</li>
        <li>Provide core features: listing management, inventory sync, order workflows, and automation you enable.</li>
        <li>Monitor, troubleshoot, and improve performance, reliability, and security.</li>
        <li>Comply with legal obligations and eBay Developer Program requirements.</li>
      </ul>

      <h2>Legal Bases (EEA/UK)</h2>
      <ul>
        <li>Contract: to deliver the services you request.</li>
        <li>Legitimate Interests: app security, fraud prevention, and product improvement.</li>
        <li>Legal Obligation: record-keeping and compliance.</li>
        <li>Consent: where required (you may withdraw at any time).</li>
      </ul>

      <h2>Data Sharing</h2>
      <ul>
        <li>eBay: via official APIs per the permissions you grant.</li>
        <li>
          Service Providers: hosting, storage, logging, and operational support under confidentiality and data protection terms.
        </li>
        <li>Compliance &amp; Safety: if required by law or to protect rights, security, or integrity of our services.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>International Transfers</h2>
      <p>
        If data is transferred across borders, we use appropriate safeguards such as standard contractual clauses or equivalent mechanisms.
      </p>

      <h2>Retention</h2>
      <ul>
        <li>OAuth tokens: stored securely and retained only while your account remains connected.</li>
        <li>
          eBay operational data: cached or stored only as necessary for features you use and then deleted or anonymized.
        </li>
        <li>Logs: kept for a limited period for security and auditing, then deleted or aggregated.</li>
      </ul>

      <h2>Security</h2>
      <ul>
        <li>Encryption in transit, secure key management, and least-privilege access controls.</li>
        <li>Regular review of permissions, token scopes, and dependency updates.</li>
      </ul>

      <h2>Your Choices &amp; Rights</h2>
      <ul>
        <li>Disconnect Autobay from eBay at any time to revoke access.</li>
        <li>Request access, correction, export, or deletion of your data.</li>
        <li>Object to or restrict certain processing where applicable by law.</li>
      </ul>

      <h2>Children’s Privacy</h2>
      <p>Autobay is not intended for individuals under 18. We do not knowingly collect data from minors.</p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy. The “Effective Date” above reflects the latest version. Material changes will be
        communicated within the app or by email when appropriate.
      </p>

      <h2>Contact</h2>
      <p>
        For questions or requests, contact: <a href="mailto:yosefisabag@gmail.com">yosefisabag@gmail.com</a>
      </p>

      <h2>Controller</h2>
      <p>
        For users in the EEA/UK, Autobay is the data controller for processing described here. Where we process eBay data
        on your behalf to operate your account workflows, we act as a processor to the extent applicable.
      </p>

      <h2>Additional Disclosures for California Residents</h2>
      <ul>
        <li>We collect identifiers, commercial information, and internet activity for the purposes described above.</li>
        <li>We do not sell or share personal information as defined by the CPRA.</li>
        <li>You may exercise CPRA rights by emailing the contact above. We will verify and respond as required by law.</li>
      </ul>

      <h2>eBay Compliance Notes</h2>
      <ul>
        <li>Use of data is limited to the scopes you grant via eBay OAuth and the features you use.</li>
        <li>We promptly revoke and delete tokens upon disconnect or prolonged inactivity.</li>
        <li>We do not use data for advertising or profiling unrelated to your app functionality.</li>
      </ul>
    </div>
  );
};

export default page;
