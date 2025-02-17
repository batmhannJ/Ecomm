import React from "react";
import "./Terms.css";

const Terms = () => {
  // Define the content for the Terms of Service
  const content = {
    introduction: {
      title: 'Introduction',
      description: `
        Welcome to Tienda! By accessing or using our website, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
      `
    },
    user_eligibility: {
      title: 'User Eligibility',
      description: `
        <ul style="text-align: justify; list-style-type: none; padding-left: 0;">
          <li><strong>Registered Members:</strong> Only current students of OLSHCO with an active account on vosys.org are eligible to vote.</li>
          <li><strong>Eligibility Verification:</strong> Users must meet specific eligibility criteria, such as enrollment status, as determined by OLSHCO.</li>
          <li><strong>Active Account:</strong> Users must have a verified account with valid login credentials and email.</li>
          <li><strong>Fraudulent Activities:</strong> vosys.org reserves the right to revoke or suspend voting rights for fraudulent activities.</li>
        </ul>
      `
    },
    purchases_and_payments: {
      title: 'Purchases and Payments',
      description: `
        When you make a purchase on Tienda, you agree to pay the listed price, including applicable taxes and shipping fees. Payment will be processed through the selected payment gateway. All transactions are subject to Tienda’s payment processing terms.
      `
    },
    privacy_and_data_protection: {
      title: 'Privacy and Data Protection',
      description: `
        Tienda values your privacy. Personal information is collected only in accordance with our Privacy Policy and will not be shared with third parties unless necessary to fulfill a transaction or as required by law.
      `
    },
    return_and_refund_policy: {
      title: 'Return and Refund Policy',
      description: `
        We strive to ensure you are satisfied with your purchase. In the case of faulty or damaged products, you may return them for a refund or replacement within [X] days of receipt. Returns must be made in accordance with the specific seller’s return policy.
      `
    },
    liability: {
      title: 'Limitation of Liability',
      description: `
        Tienda is not liable for any damages, losses, or expenses resulting from the use of our website, products, or services. We do not guarantee that the website will always be free from errors, interruptions, or viruses.
      `
    },
    contact_info: {
      title: 'Contact Information',
      description: `
        For questions or concerns regarding these Terms of Service, please contact us at:
        - Email: support@tienda.com
        - Phone: [Your Phone Number]
        - Address: [Your Office Address]
      `
    },
  };

  return (
    <section id="terms" className="section__container location__container">
      <h2 className="section__header">Terms of Service</h2>
      <div className="terms">
        <div className="terms-container">
          {Object.entries(content).map(([key, { title, description }]) => (
            <div key={key} className="terms-section">
              <h3>{title}</h3>
              <div dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Terms;
