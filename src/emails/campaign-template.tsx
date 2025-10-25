
import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface CampaignTemplateProps {
  siteName: string;
  subject: string;
  content: string;
  unsubscribeUrl: string;
}

export const CampaignTemplate: React.FC<Readonly<CampaignTemplateProps>> = ({
  siteName,
  subject,
  content,
  unsubscribeUrl,
}) => (
  <Html>
    <Head>
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Poppins:wght@600;700&display=swap');
                
                body {
                    font-family: 'Lato', sans-serif;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                }
                img {
                    max-width: 100%;
                    border-radius: 8px;
                }
                p {
                    margin: 16px 0;
                }
                a {
                    color: #FACC15; /* A color close to the primary theme color */
                    text-decoration: none;
                }
                ul, ol {
                    padding-left: 24px;
                }
            `}
        </style>
    </Head>
    <Preview>{subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={heading}>{siteName}</Text>
        </Section>
        <Section style={contentSection}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Section>
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            You are receiving this email because you subscribed to updates from {siteName}.
          </Text>
          <Link href={unsubscribeUrl} style={footerLink}>
            Unsubscribe
          </Link>
          <Text style={footerText}>
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default CampaignTemplate;

// Styles for the email template
const main = {
  backgroundColor: '#f1f5f9', // A slightly cooler light gray
  fontFamily: "'Lato', sans-serif",
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  borderRadius: '12px',
  maxWidth: '600px',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

const header = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#FDE68A', // A soft yellow from the theme
  color: '#422006',
};

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  fontFamily: "'Poppins', sans-serif",
  margin: '0',
};

const contentSection = {
  padding: '20px 30px 30px 30px',
  color: '#334155',
  lineHeight: '1.7',
  fontSize: '16px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
};

const footer = {
  padding: '0 30px 30px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '18px',
};

const footerLink = {
  color: '#475569',
  fontSize: '12px',
  textDecoration: 'underline',
};
