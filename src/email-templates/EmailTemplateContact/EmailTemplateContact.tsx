import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Link,
  Preview,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { COMPANY_NAME, CONTACT_FORM_EMAIL_TITLE } from "@/lib/constants";

const TEXTS = {
  hr: {
    sender: "Pošiljatelj",
    emailAddress: "Email adresa",
    phone: "Telefon",
    message: "Poruka",
    footer: "Ovaj email poslan je s Vaše kontakt forme.",
  },
  en: {
    sender: "Sender",
    emailAddress: "Email address",
    phone: "Phone",
    message: "Message",
    footer: "This email was sent from your contact form.",
  },
} as const;

interface EmailTemplateContactProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const EmailTemplateContact: React.FC<
  Readonly<EmailTemplateContactProps>
> = ({ name, email, phone, message }) => {
  // Change this to client's preferred language and change CONTACT_FORM_EMAIL_TITLE in contants.ts accordingly
  const lang = "hr";

  return (
    <Html>
      <Head />
      <Preview>{name}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#21316B", // Change this to client's brand color
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] font-sans py-10">
          <Container className="mx-auto bg-white border border-[#eeeeee] rounded-none shadow-sm overflow-hidden">
            {/* Header with Logo Area */}
            <Section className="bg-brand p-8 text-center">
              <Text className="text-white text-2xl font-bold m-0 uppercase tracking-wider">
                {COMPANY_NAME}
              </Text>
            </Section>

            <Section className="px-10 py-8">
              <Text className="text-brand text-xl font-bold mb-6">
                {CONTACT_FORM_EMAIL_TITLE}
              </Text>

              <Section className="mb-6">
                <Row className="mb-2">
                  <Column>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest m-0">
                      {TEXTS[lang].sender}
                    </Text>
                    <Text className="text-gray-900 text-base font-bold m-0">
                      {name}
                    </Text>
                  </Column>
                </Row>
                <Row className="mb-2">
                  <Column>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest m-0">
                      {TEXTS[lang].emailAddress}
                    </Text>
                    <Link
                      href={`mailto:${email}`}
                      className="text-brand text-base font-medium underline"
                    >
                      {email}
                    </Link>
                  </Column>
                </Row>
                {phone && (
                  <Row className="mb-2">
                    <Column>
                      <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest m-0">
                        {TEXTS[lang].phone}
                      </Text>
                      <Link
                        href={`tel:${phone}`}
                        className="text-brand text-base font-medium underline"
                      >
                        {phone}
                      </Link>
                    </Column>
                  </Row>
                )}
              </Section>

              <Hr className="border-gray-200 my-6" />

              <Section>
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                  {TEXTS[lang].message}
                </Text>
                <Text className="text-gray-800 text-base leading-relaxed bg-gray-50 p-6 border-l-4 border-brand italic">
                  {message}
                </Text>
              </Section>
            </Section>

            <Section className="bg-gray-50 px-10 py-6 text-center border-t border-gray-100">
              <Text className="text-gray-400 text-xs m-0">
                {TEXTS[lang].footer}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
