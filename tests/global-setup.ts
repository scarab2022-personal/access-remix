// https://github.com/testing-library/jest-dom#usage
// use extend-expect
import "@testing-library/jest-dom/extend-expect";

// https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest/
// import matchers from '@testing-library/jest-dom/matchers';
// import { expect } from 'vitest';
// expect.extend(matchers);

// afterEach unnecessary for react testing library cleanup
// https://testing-library.com/docs/react-testing-library/api/#cleanup
// https://testing-library.com/docs/react-testing-library/setup#skipping-auto-cleanup
// globals must be true in vitest config.

// Blues stack:
// import { installGlobals } from "@remix-run/node";
// installGlobals();
