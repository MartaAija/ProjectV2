import React from "react";
import "../App.css"; // Import the CSS file
import logo from "../images/logo.PNG"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFeatherPointed,  // A more elegant, pointed feather
  // faQuill,        // A quill feather
  // faFeatherAlt,   // Alternative feather style
  // faFeather       // Original feather
} from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  return (
    <div className="home-container animated-home"> 
     <div className="logo-section">
        <div className="feathers-left">
          <FontAwesomeIcon 
            icon={faFeatherPointed} 
            className="leaf left-leaf floating" 
            style={{ color: '#00d4ff', fontSize: '3.5rem' }}
          />
          <FontAwesomeIcon 
            icon={faFeatherPointed} 
            className="leaf left-leaf floating-delayed" 
            style={{ color: '#0088b3', fontSize: '3rem', marginLeft: '-20px' }}
          />
        </div>
        <img src={logo} alt="CyberSageX Logo" className="logo" />
        <div className="feathers-right">
          <FontAwesomeIcon 
            icon={faFeatherPointed} 
            className="leaf right-leaf floating" 
            style={{ color: '#00d4ff', fontSize: '3.5rem' }}
          />
          <FontAwesomeIcon 
            icon={faFeatherPointed} 
            className="leaf right-leaf floating-delayed" 
            style={{ color: '#0088b3', fontSize: '3rem', marginRight: '-20px' }}
          />
        </div>
      </div>
      <h1>Welcome to CyberSageX: Redefining Cybersecurity Response with AI</h1>
      <p>
        In a world of evolving cyber threats, CyberSageX is your trusted partner in safeguarding digital environments. Designed for cybersecurity teams and professionals, our AI-driven incident response platform empowers you to detect and mitigate security threats with precision, speed, and clarity.
      </p>
      <h2>What is CyberSageX?</h2>
      <p>
        CyberSageX is an AI-powered threat detection and response system that harnesses advanced machine learning and Explainable AI (XAI) to provide actionable insights into security incidents. By simulating real-time network activity, CyberSageX enables analysts to:
      </p>
      <ul>
        <li>Detect High-Priority Threats: Accurately identify brute force attacks, DoS/DDoS, and web-based attacks such as SQL injections and XSS.</li>
        <li>Receive Actionable Recommendations: Get step-by-step guidance on mitigating risks, isolating compromised systems, or blocking malicious sources.</li>
        <li>Understand AI Decisions: Gain trust and transparency with clear explanations behind every AI-generated alert or recommendation.</li>
        <li>Streamline Threat Monitoring: Simulate continuous network activity for testing and refining incident response strategies.</li>
      </ul>
      <h2>Why Choose CyberSageX?</h2>
      <ul>
        <li>
          Explainability at Its Core: With advanced XAI techniques like SHAP, CyberSageX delivers transparent reasoning for every alert and recommendation.
        </li>
        <li>
          Simulated Real-Time Analysis: Test, validate, and refine your incident response strategy in a controlled yet realistic environment.
        </li>
        <li>
          User-Friendly Interface: A secure and intuitive dashboard lets you monitor threats, save recommendations, and review past incidents seamlessly.
        </li>
        <li>
          Data-Driven Precision: Powered by industry-standard datasets like CICIDS 2017, our AI models are optimized to detect and classify threats effectively.
        </li>
      </ul>
      <h2>Cybersecurity Simplified</h2>
      <p>
        Whether you're responding to a brute force attack or safeguarding against a DDoS assault, CyberSageX ensures you have the tools and insights you need to stay ahead of cyber threats.
      </p>
      <p>
        Start your journey toward smarter, faster, and more explainable incident response today with CyberSageX.
      </p>
    </div>
  );
};

export default Home;
