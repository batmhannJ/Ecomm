import React, { useState } from "react";
import "./Terms.css";

const Terms = () => {
  const [activeTab, setActiveTab] = useState('terms_of_use');

  // Define the content for each section
  const content = {
    terms_of_use: {
      title: 'Terms of Use',
      description: `Welcome to Tienda! By accessing or using our website, you agree to comply with and be bound by these Terms of Service. Please read them carefully. By using Tienda’s platform, you agree to these Terms of Service, which govern your use of our website, including all content, features, and services offered on or through the site.`
    },
    user_eligibility: {
      title: 'User Accounts',
      description: `
        <ul style="text-align: justify; list-style-type: none; padding-left: 0;">
          <li><strong>To use certain features on Tienda, you may be required to create an account. By doing so, you agree to:
          </li>
          <li><strong>Provide accurate, current, and complete information about yourself.</li>
          <li><strong>Keep your account details confidential and secure.
          </li>
          <li><strong>Be responsible for all activities under your account.</li>
        </ul>`
    },
    // Add other sections as needed...
  };

  const handleTabClick = (tabId) => {
    if (content[tabId]) { // Check if the tab content exists
      setActiveTab(tabId);
    }
  };

  return (
    <section id="terms" className="section__container location__container">
      <h2 className="section__header">Terms of Service</h2>
      <div className="terms">
        <div className="terms-container">
          <div className="sidebar">
            {['terms_of_use', 'user_accounts', 'account_security', 'rights_responsibilities', 'privacy_data_protection', 'code_of_conduct', 'restrictions_on_use', 'liability', 'suspension_termination', 'contact_info'].map(tab => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
{tab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            ))}
          </div>

          <div className="content">
            <h3>{content[activeTab]?.title}</h3>
            {content[activeTab]?.description ? (
              <div dangerouslySetInnerHTML={{ __html: content[activeTab]?.description }}></div>
            ) : (
              <p>No content available for this section.</p> // Error handling for missing content
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;
