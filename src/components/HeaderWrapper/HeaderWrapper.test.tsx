import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderWrapper } from "./HeaderWrapper";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components"; // Import Navigation directly

// Mock the next/navigation usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock child components
jest.mock("@/components", () => ({
  Navigation: jest.fn(() => <div data-testid="mock-navigation" />),
  NotificationBar: jest.fn(({ message, setIsVisible }) => (
    <div data-testid="mock-notification-bar">
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)}>Close</button>
    </div>
  )),
}));

describe("HeaderWrapper", () => {
  const mockNavigationCms = {
    _id: "nav1",
    _type: "navigation",
    menuItems: [],
    links: [],
    ctaButton: {
      _type: "ctaButton",
      text: "Test CTA",
      link: "/test",
      title: "Test Title",
      href: "/test-href",
    },
  };
  const mockNotificationBarCms = {
    _id: "notif1",
    _type: "notificationBar",
    isEnabled: true,
    message: "Test Notification",
  };

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
    jest.clearAllMocks();
  });

  it("renders NotificationBar and Navigation when notification bar is visible", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={mockNotificationBarCms}
      />
    );

    expect(screen.getByTestId("mock-notification-bar")).toBeInTheDocument();
    expect(screen.getByText("Test Notification")).toBeInTheDocument();
    expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
  });

  it("does not render NotificationBar when it's disabled", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={{ ...mockNotificationBarCms, isEnabled: false }}
      />
    );

    expect(screen.queryByTestId("mock-notification-bar")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
  });

  it("does not render NotificationBar when message is empty", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={{ ...mockNotificationBarCms, message: "" }}
      />
    );

    expect(screen.queryByTestId("mock-notification-bar")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
  });

  it("passes correct notificationBarHeight to Navigation when visible", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={mockNotificationBarCms}
      />
    );

    expect(Navigation).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsData: mockNavigationCms,
        notificationBarHeight: 48,
      }),
      undefined
    );
  });

  it("passes correct notificationBarHeight to Navigation when not visible", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={{ ...mockNotificationBarCms, isEnabled: false }}
      />
    );

    expect(Navigation).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsData: mockNavigationCms,
        notificationBarHeight: 0,
      }),
      undefined
    );
  });

  it("does not render HeaderWrapper on excluded paths", () => {
    (usePathname as jest.Mock).mockReturnValue("/admin/dashboard");
    const { container } = render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={mockNotificationBarCms}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("hides notification bar when close button is clicked", () => {
    render(
      <HeaderWrapper
        navigationCms={mockNavigationCms}
        notificationBarCms={mockNotificationBarCms}
      />
    );

    expect(screen.getByTestId("mock-notification-bar")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("mock-notification-bar")).not.toBeInTheDocument();
  });
});
