import { render, screen } from "@testing-library/react";
import { EPotpisSessionSync } from "./EPotpisSessionSync";
const mockRefresh = jest.fn();
const mockRouter = { refresh: mockRefresh };
let mockAuth: { isLoaded: boolean; sessionId: string | null };
jest.mock("@clerk/nextjs", () => ({ useAuth: () => mockAuth }));
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
beforeEach(() => { mockRefresh.mockReset(); mockAuth = { isLoaded: true, sessionId: null }; });
const view = (id: string | null, label = "Prijava") => <EPotpisSessionSync serverSessionId={id} loadingLabel="Učitavanje…"><p>{label}</p></EPotpisSessionSync>;
test("successful login on the same URL refreshes server access once, then shows the authorized page", () => {
  const result = render(view(null));
  expect(mockRefresh).not.toHaveBeenCalled();
  mockAuth.sessionId = "session_maja";
  result.rerender(view(null));
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Prijava")).not.toBeVisible();
  result.rerender(view(null));
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  result.rerender(view("session_maja", "Pregled ugovora"));
  expect(screen.getByText("Pregled ugovora")).toBeVisible();
});
test("logout returns to the login form after the server validates the session change", () => {
  mockAuth.sessionId = "session_maja";
  const result = render(view("session_maja", "Pregled ugovora"));
  mockAuth.sessionId = null;
  result.rerender(view("session_maja", "Pregled ugovora"));
  expect(screen.getByText("Pregled ugovora")).not.toBeVisible();
  result.rerender(view(null));
  expect(screen.getByText("Prijava")).toBeVisible();
  expect(mockRefresh).toHaveBeenCalledTimes(1);
});
test.each([null, "session_filip"])("logout or account switching hides stale content and refreshes: %s", sessionId => {
  mockAuth.sessionId = "session_maja";
  const result = render(view("session_maja", "Pregled ugovora"));
  mockAuth.sessionId = sessionId;
  result.rerender(view("session_maja", "Pregled ugovora"));
  expect(screen.getByText("Pregled ugovora")).not.toBeVisible();
  expect(mockRefresh).toHaveBeenCalledTimes(1);
});
test("Clerk initialization does not trigger a spurious refresh", () => {
  mockAuth.isLoaded = false;
  render(view("session_maja"));
  expect(mockRefresh).not.toHaveBeenCalled();
});

test("keeps the sign-in component mounted while Clerk finishes activating the session", () => {
  const result = render(view(null));
  const login = screen.getByText("Prijava");
  mockAuth.sessionId = "session_maja";
  result.rerender(view(null));
  expect(screen.getByText("Prijava")).toBe(login);
  expect(login).not.toBeVisible();
});
test("schedules a full reload fallback and cancels it when the server catches up", () => {
  jest.useFakeTimers();
  const timeout = jest.spyOn(window, "setTimeout");
  const clear = jest.spyOn(window, "clearTimeout");
  mockAuth.sessionId = "session_maja";
  const result = render(view(null));
  expect(timeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  const timerId = timeout.mock.results.at(-1)?.value;
  result.rerender(view("session_maja", "Pregled ugovora"));
  expect(clear).toHaveBeenCalledWith(timerId);
  result.unmount();
  timeout.mockRestore();
  clear.mockRestore();
  jest.useRealTimers();
});
