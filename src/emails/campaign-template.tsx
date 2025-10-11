
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
    <Head />
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
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const header = {
  padding: '20px',
  borderBottom: '1px solid #f0f0f0',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#212529',
};

const contentSection = {
  padding: '20px 30px',
  color: '#343a40',
  lineHeight: '1.6',
};

const hr = {
  borderColor: '#f0f0f0',
  margin: '20px 0',
};

const footer = {
  padding: '0 30px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#868e96',
  fontSize: '12px',
  lineHeight: '16px',
};

const footerLink = {
  color: '#5c5f62',
  fontSize: '12px',
  textDecoration: 'underline',
};
