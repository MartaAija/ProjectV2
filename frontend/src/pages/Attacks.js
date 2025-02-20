import React, { useEffect } from "react";
import "../App.css"; // Import CSS file for styling

const AttackInformation = () => {
  // Array of attack objects containing details about different cyber attacks
  const attacks = [
    {
      name: "DoS",
      description: "A Denial of Service (DoS) attack aims to make a server or network resource unavailable by overwhelming it with a flood of illegitimate requests. This can be achieved through various methods such as sending malformed packets, exploiting vulnerabilities, or simply overwhelming the server with traffic.",
      occurrence: "Attackers often use automated tools or botnets to send a massive number of requests to a target server, exhausting its resources and causing legitimate requests to be denied.",
      weakPoints: "Systems without rate limiting, inadequate server resources, and lack of redundancy are particularly vulnerable to DoS attacks.",
      consequences: [
        "Service downtime, affecting user access",
        "Loss of customer trust due to unavailability",
        "Potential revenue loss from service disruptions"
      ],
      protections: [
        "Implement rate limiting to control request flow",
        "Use traffic filtering solutions like firewalls",
        "Deploy redundant systems to handle excess load"
      ]
    },
    {
      name: "DDoS",
      description: "A Distributed Denial of Service (DDoS) attack involves multiple compromised systems, often part of a botnet, attacking a single target to cause a denial of service. This type of attack is more difficult to mitigate due to its distributed nature.",
      occurrence: "Attackers control a network of compromised devices to send overwhelming traffic to the target, making it inaccessible to legitimate users.",
      weakPoints: "Insufficient bandwidth, lack of DDoS protection services, and single points of failure in network architecture.",
      consequences: [
        "Extended downtime, severely impacting operations",
        "Significant financial losses due to service unavailability",
        "Damage to brand reputation and customer relationships"
      ],
      protections: [
        "Utilize DDoS protection services to absorb attack traffic",
        "Increase network bandwidth to handle large volumes",
        "Implement network redundancy to distribute traffic"
      ]
    },
    {
      name: "Port Scan",
      description: "A port scan is a technique used by attackers to identify open ports and services running on a server. This information can be used to exploit vulnerabilities in those services.",
      occurrence: "Attackers use scanning tools to probe a server for open ports, which can reveal potential entry points for attacks.",
      weakPoints: "Unsecured open ports, lack of monitoring, and outdated software can make systems vulnerable to exploitation.",
      consequences: [
        "Unauthorized access to sensitive data",
        "Data breaches resulting in information theft",
        "Exploitation of vulnerabilities leading to further attacks"
      ],
      protections: [
        "Configure firewalls to block unauthorized access to ports",
        "Use intrusion detection systems to monitor scanning activity",
        "Regularly update and patch systems to fix vulnerabilities"
      ]
    },
    {
      name: "Brute Force",
      description: "A brute force attack involves systematically trying all possible combinations of passwords until the correct one is found. This method is often used to gain unauthorized access to accounts.",
      occurrence: "Attackers use automated tools to guess passwords by trying numerous combinations, exploiting weak password policies.",
      weakPoints: "Weak password policies, lack of account lockout mechanisms, and absence of multi-factor authentication.",
      consequences: [
        "Compromised accounts leading to unauthorized access",
        "Unauthorized data access and potential data loss",
        "Increased risk of further attacks using compromised credentials"
      ],
      protections: [
        "Enforce strong password policies with complexity requirements",
        "Implement account lockout mechanisms after failed attempts",
        "Use multi-factor authentication to add an extra layer of security"
      ]
    },
    {
      name: "Bot",
      description: "Bot attacks involve automated scripts or programs that perform tasks at a much higher rate than a human. These can be used for various malicious activities such as scraping data, spamming, or launching DDoS attacks.",
      occurrence: "Attackers deploy bots to perform repetitive tasks, often using compromised devices to form a botnet.",
      weakPoints: "Lack of monitoring and detection systems, and insufficient security measures to block automated traffic.",
      consequences: [
        "Increased server load and potential downtime",
        "Data theft and privacy breaches",
        "Reputation damage due to spam or malicious activities"
      ],
      protections: [
        "Implement CAPTCHA to distinguish between humans and bots",
        "Use rate limiting to control request frequency",
        "Deploy bot management solutions to detect and block malicious bots"
      ]
    },
    {
      name: "Web Attack",
      description: "Web attacks target websites and web applications to exploit vulnerabilities. Common types include SQL injection, cross-site scripting (XSS), and cross-site request forgery (CSRF).",
      occurrence: "Attackers exploit vulnerabilities in web applications to gain unauthorized access, steal data, or disrupt services.",
      weakPoints: "Unpatched software, insecure coding practices, and lack of input validation.",
      consequences: [
        "Data breaches and information theft",
        "Website defacement and loss of user trust",
        "Service disruptions and potential financial losses"
      ],
      protections: [
        "Regularly update and patch web applications",
        "Implement input validation and sanitization",
        "Use web application firewalls to block malicious traffic"
      ]
    }
  ];

  // useEffect to handle scroll animations for attack cards
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.attack-card');
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        // Add 'visible' class if the element is in the viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add('visible');
        } else {
          element.classList.remove('visible');
        }
      });
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on component mount

    // Cleanup: Remove scroll event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="attack-container">
      <h1>Cyber Attack Information</h1>
      {/* Map through the attacks array and render each attack as a card */}
      {attacks.map((attack, index) => (
        <div key={index} className="attack-card">
          <h2>{attack.name}</h2>
          <p><strong>Description:</strong> {attack.description}</p>
          <p><strong>How They Occur:</strong> {attack.occurrence}</p>
          <p><strong>Weak Points:</strong> {attack.weakPoints}</p>
          <h3>Consequences</h3>
          <ul className="attack-list">
            {/* Render consequences as list items */}
            {attack.consequences.map((consequence, idx) => (
              <li key={idx} className="attack-list-item">{consequence}</li>
            ))}
          </ul>
          <h3>Protection Measures</h3>
          <ul className="attack-list">
            {/* Render protection measures as list items */}
            {attack.protections.map((protection, idx) => (
              <li key={idx} className="attack-list-item">{protection}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AttackInformation;

