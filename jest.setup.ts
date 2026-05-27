import "@testing-library/jest-dom";
import failOnConsole from 'jest-fail-on-console';

failOnConsole({
  silenceMessage: (errorMessage) => {
    if (errorMessage.includes("Received `true` for a non-boolean attribute `fill`.") ||
        errorMessage.includes("React does not recognize the `objectFit` prop on a DOM element.")) {
      return true;
    }
    return false;
  },
});
