import React, { useState } from "react";
import "./Terms.css";

const Terms = () => {
  const [activeTab, setActiveTab] = useState('terms_of_use');

  const content = {
    terms_of_use: {
      title: 'Terms of use',
      description: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. At fugit praesentium reiciendis aut debitis minima earum fugiat quam aspernatur qui.`
    },
    user_eligibility: {
      title: 'User Eligibility',
      description: `
        <ul style="text-align: justify; list-style-type: none; padding-left: 0;">
          <li><strong>Registered Members:</strong> Only current students of OLSHCO with an active account on vosys.org are eligible to vote.</li>
          <li><strong>Eligibility Verification:</strong> Users must meet specific eligibility criteria, such as enrollment status, as determined by OLSHCO.</li>
          <li><strong>Active Account:</strong> Users must have a verified account with valid login credentials and email.</li>
          <li><strong>Fraudulent Activities:</strong> vosys.org reserves the right to revoke or suspend voting rights for fraudulent activities.</li>
        </ul>`
    },
    // Add other tabs content similarly...
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <section id="terms" className="section__container location__container">
      <h2 className="section__header">Terms of Service</h2>
      <div className="terms">
        <div className="terms-container">
          <div className="sidebar">
            {['terms_of_use', 'user_eligibility', 'account_security', 'rights_responsibilities', 'privacy_data_protection', 'code_of_conduct', 'restrictions_on_use', 'liability', 'suspension_termination', 'contact_info'].map(tab => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
              </div>
            ))}
          </div>

          <div className="content">
            <h3>{content[activeTab]?.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: content[activeTab]?.description }}></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;
