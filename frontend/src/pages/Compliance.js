import React from "react";
import "../App.css"; // Import the CSS file

const Compliance = () => {
  return (
    <div className="compliance-container"> 
      <h1>Compliance & Ethics</h1>
      <div className="compliance-card">
        <p>
          At <strong>CyberSageX</strong>, we are committed to maintaining the highest standards of legal compliance and ethical integrity. Our mission is to empower organizations with cutting-edge AI-driven cybersecurity solutions while respecting privacy, transparency, and fairness.
        </p>
      </div>

      <div className="compliance-card">
        <h2>Privacy and Data Security</h2>
        <p>
          <strong>CyberSageX</strong> prioritizes the protection of sensitive data. All data processed by our system is handled with the utmost confidentiality, ensuring compliance with global data protection regulations such as GDPR and CCPA. We use state-of-the-art encryption techniques to safeguard user information and prevent unauthorized access.
        </p>
      </div>

      <div className="compliance-card">
        <h2>Ethical AI Practices</h2>
        <p>
          Our AI models are designed to detect and respond to cybersecurity threats in a transparent and explainable manner. We utilize Explainable AI (XAI) to ensure that users can understand the reasoning behind every decision made by the system. We are dedicated to avoiding bias in our algorithms and ensuring equitable outcomes for all users.
        </p>
      </div>

      <div className="compliance-card">
        <h2>Legal Compliance</h2>
        <p>
          <strong>CyberSageX</strong> adheres to all applicable laws and regulations regarding cybersecurity and data protection. Our system is built to align with industry standards such as ISO 27001 and NIST Cybersecurity Framework, providing users with a robust and compliant solution for threat detection and response.
        </p>
      </div>

      <div className="compliance-card">
        <h2>Responsible Use</h2>
        <p>
          Users of <strong>CyberSageX</strong> are expected to operate the system responsibly and in accordance with local laws and ethical guidelines. Misuse of the system, including unauthorized monitoring or data misuse, is strictly prohibited and may result in account suspension or legal action.
        </p>
      </div>

      <div className="compliance-card">
        <h2>Commitment to Improvement</h2>
        <p>
          As cybersecurity threats evolve, so do our systems and policies. We are committed to continuously improving <strong>CyberSageX</strong> to meet emerging legal, ethical, and technological challenges. Your feedback is invaluable in helping us achieve this goal.
        </p>
      </div>

      <div className="compliance-card">
        <p>
          For further information or inquiries about our compliance and ethical practices, please contact us at <a href="mailto:support@cybersagex.com">support@cybersagex.com</a>.
        </p>
      </div>
    </div>
  );
};

export default Compliance;
