const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

// Ensure DOM is cleared after each test
afterEach(() => {
  document.body.innerHTML = '';
});