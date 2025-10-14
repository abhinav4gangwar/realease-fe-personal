import { ShieldAlert } from 'lucide-react'

const PrivacyPolicyPage = () => {
  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <ShieldAlert className="text-primary" />
        <h1 className="text-lg">Privacy Policy</h1>
      </div>

      <div className="flex items-center justify-between bg-white p-5">
        <div className="flex flex-col space-y-3">
          <h1 className="text-primary text-lg">RealEase Technologies LLP</h1>

          <h2>Information We Collect</h2>
          <div className="flex flex-col space-y-3">
            <p>
              We may collect a variety of information to provide and improve our
              services.{' '}
            </p>
            <p>(a) Information You Provide to Us:</p>
            <p className="text-sm text-[#4E4F54]">
              Account & Profile Information: Your full name, email address,
              password (stored in a secure, hashed format), phone number,
              profile photograph, and company details. Billing Information: Your
              billing name and address, payment method details (processed by
              secure third-party payment processors), tax identification
              information, and transaction history. Asset Management Data: Asset
              descriptions, uploaded documents and files, property addresses,
              legal status details, notes, comments, search queries, and related
              preferences.
            </p>

            <p>(b) Information We Collect Automatically: </p>
            <p className="text-sm text-[#4E4F54]">
              Usage Data: Information about your interaction with our platform,
              such as features used, pages visited, time spent, and error logs.
              Device and Technical Information: Your IP address, browser type,
              operating system, device identifiers, and data from cookies and
              similar technologies. Analytics Information: Aggregated data on
              platform performance, user engagement, and feature effectiveness.
            </p>
          </div>

          <h2>How We Use Your Information</h2>

          <div className="flex flex-col space-y-3">
            <p>
              We use your information for legitimate business purposes only:
            </p>
            <p>(a) To Provide Our Service: </p>
            <p className="text-sm text-[#4E4F54]">
              To create and maintain your account, provide secure access, store
              your documents, and deliver AI-powered analytics and other
              features.
            </p>

            <p>(b) To Communicate with You: </p>
            <p className="text-sm text-[#4E4F54]">
              To send service notifications, security alerts, billing
              statements, and respond to your support inquiries.
            </p>

            <p>(c) To Improve Our Platform: </p>
            <p className="text-sm text-[#4E4F54]">
              To analyze usage patterns, develop new features, and enhance the
              user experience.
            </p>

            <p>(d) For Legal and Security Reasons: </p>
            <p className="text-sm text-[#4E4F54]">
              To comply with Indian law (including the Information Technology
              Act, 2000), prevent fraud, enforce our Terms of Service, and
              respond to valid legal requests.
            </p>
          </div>

          <h2>How We Share Your Information </h2>

          <div className="flex flex-col space-y-3">
            <p>
              We do not sell your personal information. We may share it under
              these limited circumstances:
            </p>

            <p>(a) With Service Providers: </p>
            <p className="text-sm text-[#4E4F54]">
              We use trusted third-party providers for services like cloud
              hosting (e.g., AWS), payment processing, and customer support.
              They are bound by strict confidentiality and data protection
              obligations.
            </p>

            <p>(b) For Legal Requirements: </p>
            <p className="text-sm text-[#4E4F54]">
              We may disclose information if required by Indian law, a court
              order, or to protect our legal rights.
            </p>

            <p>(c) During Business Transfers: </p>
            <p className="text-sm text-[#4E4F54]">
              If we are involved in a merger or acquisition, your information
              may be transferred to the new entity under the same privacy
              protections.
            </p>

            <p>(d) With Your Consent: </p>
            <p className="text-sm text-[#4E4F54]">
              We may share information with third parties when you give us your
              explicit consent, such as when you use a third-party integration.
            </p>
          </div>

          <h2>Protection and Storage of Your Information</h2>

          <p className="text-sm text-[#4E4F54]">
            We implement robust technical and organizational safeguards like
            encryption (in transit and at rest) and secure access controls to
            protect your data. Your information is primarily stored on secure
            servers in India. While no system is 100% secure, we are committed
            to taking all reasonable measures to safeguard your information in
            compliance with Indian law.
          </p>

          <h2>Your Privacy Rights</h2>

          <p className="text-sm text-[#4E4F54]">
            You have the following rights regarding your personal information:
            (a) Access: To request access to the personal information we hold
            about you. (b) Correction: To request that we correct any inaccurate
            or incomplete information. (c) Deletion: To request the deletion of
            your personal information, subject to our legal obligations. (d)
            Withdrawal of Consent: To withdraw your consent for processing at
            any time (where consent is the basis for processing).
          </p>

          <p>
            To exercise these rights, please contact us at info@realeasetech.in.
          </p>

          <h2>Data Retention</h2>
          <p className="text-sm text-[#4E4F54]">
            We retain your personal information only as long as necessary to
            provide our services, comply with legal obligations, and resolve
            disputes. Afterward, we securely delete or anonymize it.{' '}
          </p>

          <h2>Changes to This Privacy Statement </h2>
          <p className="text-sm text-[#4E4F54]">
            We may update this Privacy Statement from time to time. If we make
            material changes, we will notify you by email or through a notice on
            our platform. We encourage you to review it periodically.{' '}
          </p>

          <p className="text-sm text-[#4E4F54]">
            Contact Information and Grievance Officer In accordance with the
            Information Technology Act, 2000 and the rules made thereunder, the
            name and contact details of the Grievance Officer are provided
            below.{' '}
          </p>

          <p>
            For any questions, grievances, or concerns regarding this Privacy
            Statement or our privacy practices, please contact:{' '}
          </p>

          <div className="flex flex-col gap-2 py-2">
            <p>Name: Labdhi Kothari </p>
            <p>Title: Grievance Officer RealEase Technologies LLP </p>
            <p>Email: info@realeasetech.in </p>
            <p>
              Address: Suite 4A, 4th Floor, Silver Cloud, Raidurg, Hyderabad -
              500081, Telangana, India
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
