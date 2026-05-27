import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import "@testing-library/jest-dom";
import { sendContactPageEmail } from "@/lib/actions";
import { Toaster } from "sonner";
import env from "@/config/env";
import { COMPANY_NAME } from "@/lib/constants";

// Mock the server action
jest.mock("@/lib/actions", () => ({
  sendContactPageEmail: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockCmsData = {
  nameLabel: "Name",
  namePlaceholder: "Enter your name",
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",
  messageLabel: "Message",
  messagePlaceholder: "Enter your message",
  sendButtonText: "Send",
  sendingButtonText: "Sending...",
  successMessage: "Message sent successfully!",
  errorMessage: "Failed to send message.",
  nameRequiredError: "Name is required.",
  emailRequiredError: "Email is required.",
  emailInvalidError: "Invalid email address.",
  messageRequiredError: "Message is required.",
};

describe("ContactForm", () => {
  const fromEmail = `${COMPANY_NAME} <${env.NEXT_PUBLIC_CONTACT_FORM_SENDER_EMAIL}>`;
  const toEmail = env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithToaster = (component: React.ReactElement) => {
    return render(
      <>
        {component}
        <Toaster />
      </>
    );
  };

  it("renders the form correctly", () => {
    renderWithToaster(<ContactForm cmsData={mockCmsData} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    renderWithToaster(<ContactForm cmsData={mockCmsData} />);

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(await screen.findByText("Message is required.")).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    (sendContactPageEmail as jest.Mock).mockResolvedValue({ success: true });

    renderWithToaster(<ContactForm cmsData={mockCmsData} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "This is a test message." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(sendContactPageEmail).toHaveBeenCalledWith({
        from: fromEmail,
        to: toEmail,
        subject: "New Contact Form Submission",
        contactData: {
          name: "John Doe",
          email: "john.doe@example.com",
          message: "This is a test message.",
        },
      });
    });

    expect(
      await screen.findByText("Message sent successfully!")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("");
    expect(screen.getByLabelText(/Message/i)).toHaveValue("");
  });

  it("shows an error message if submission fails", async () => {
    // Mock console.error to avoid cluttering the test output
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (sendContactPageEmail as jest.Mock).mockResolvedValue({
      error: "Something went wrong",
    });

    renderWithToaster(<ContactForm cmsData={mockCmsData} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "jane.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Another test message." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(
      await screen.findByText("Failed to send message.")
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore(); // Restore console.error after the test
  });

  it("shows a validation error for an invalid email", async () => {
    renderWithToaster(<ContactForm cmsData={mockCmsData} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "This is a test message." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(
      await screen.findByText("Invalid email address.")
    ).toBeInTheDocument();
  });
});
