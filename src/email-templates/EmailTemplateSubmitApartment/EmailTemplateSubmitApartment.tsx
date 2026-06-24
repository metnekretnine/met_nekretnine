import * as React from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { COMPANY_NAME, SUBMIT_APARTMENT_EMAIL_TITLE } from "@/lib/constants";

interface EmailTemplateSubmitApartmentProps {
  name: string;
  phone: string;
  email: string;
  district: string;
  area: string;
  rooms: string;
  rentPrice: string;
  description: string;
  attachmentCount: number;
  inquiryUrl?: string;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Row className="mb-4">
    <Column>
      <Text className="m-0 text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </Text>
      <Text className="m-0 mt-1 text-base font-semibold text-gray-900">
        {value}
      </Text>
    </Column>
  </Row>
);

export const EmailTemplateSubmitApartment: React.FC<
  Readonly<EmailTemplateSubmitApartmentProps>
> = ({
  name,
  phone,
  email,
  district,
  area,
  rooms,
  rentPrice,
  description,
  attachmentCount,
  inquiryUrl,
}) => (
  <Html>
    <Head />
    <Preview>{SUBMIT_APARTMENT_EMAIL_TITLE}</Preview>
    <Tailwind>
      <Body className="bg-[#f6f7f8] py-10 font-sans">
        <Container className="mx-auto overflow-hidden rounded-none border border-[#eeeeee] bg-white shadow-sm">
          <Section className="bg-[#101114] p-8 text-center">
            <Text className="m-0 text-2xl font-bold uppercase tracking-wider text-white">
              {COMPANY_NAME}
            </Text>
          </Section>
          <Section className="px-10 py-8">
            <Text className="mb-6 text-xl font-bold text-[#101114]">
              {SUBMIT_APARTMENT_EMAIL_TITLE}
            </Text>
            <DetailRow label="Ime i prezime" value={name} />
            <DetailRow label="Telefon" value={phone} />
            <DetailRow label="Email" value={email} />
            <DetailRow label="Lokacija / kvart" value={district} />
            <DetailRow label="Površina stana" value={area} />
            <DetailRow label="Broj soba" value={rooms} />
            <DetailRow label="Okvirna cijena najma" value={rentPrice} />
            <DetailRow
              label="Fotografije"
              value={`${attachmentCount} spremljenih fotografija`}
            />
            {inquiryUrl && (
              <Row className="mb-4">
                <Column>
                  <Text className="m-0 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Sanity zapis
                  </Text>
                  <Link
                    href={inquiryUrl}
                    className="mt-1 block text-base font-semibold text-[#101114] underline"
                  >
                    Otvori upit u adminu
                  </Link>
                </Column>
              </Row>
            )}
            <Hr className="my-6 border-gray-200" />
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              Kratak opis
            </Text>
            <Text className="bg-gray-50 p-6 text-base leading-relaxed text-gray-800">
              {description}
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
